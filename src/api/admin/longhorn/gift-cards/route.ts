import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import type { LonghornAuthenticatedRequest } from "../../../types/longhorn-auth"
import { GIFT_CARD_DELIVERY_STATUS, GIFT_CARD_TRANSACTION_TYPES } from "../../../../modules/longhorn/models"

/**
 * GET /admin/longhorn/gift-cards
 * Lista todas las gift cards con filtros opcionales
 */
export const GET = async (
  req: LonghornAuthenticatedRequest,
  res: MedusaResponse
) => {
  try {
    console.log('=== GET /admin/longhorn/gift-cards ===')
    
    const longhornService = req.scope.resolve("longhorn")
    const { 
      user_id, 
      is_active, 
      is_redeemed, 
      delivery_status, 
      currency,
      limit = "50", 
      offset = "0" 
    } = req.query
    
    // Construir filtros
    const filters: any = {
      deleted_at: null
    }
    
    if (user_id) filters.user_id = user_id
    if (is_active !== undefined) filters.is_active = is_active === 'true'
    if (is_redeemed !== undefined) filters.is_redeemed = is_redeemed === 'true'
    if (delivery_status) filters.delivery_status = delivery_status
    if (currency) filters.currency = currency
    
    const giftCards = await longhornService.listLonghornGiftCards(filters)
    
    console.log('📊 Found gift cards:', giftCards.length)
    
    res.json({
      gift_cards: giftCards,
      count: giftCards.length
    })
    
  } catch (error) {
    console.error('Error fetching gift cards:', error)
    res.status(500).json({
      message: "Failed to fetch gift cards",
      error: error.message
    })
  }
}

/**
 * POST /admin/longhorn/gift-cards
 * Crea una nueva gift card
 */
export const POST = async (
  req: LonghornAuthenticatedRequest,
  res: MedusaResponse
) => {
  try {
    console.log('=== POST /admin/longhorn/gift-cards ===')
    console.log('Request body:', req.body)
    
    const longhornService = req.scope.resolve("longhorn")
    const currentUserId = req.longhornAuth.userId
    
    const {
      code,
      initial_value,
      currency = "PEN",
      expiration_date,
      customer_id,
      order_id,
      notes,
      sender_name,
      recipient_name,
      recipient_email,
      message,
      delivery_status = GIFT_CARD_DELIVERY_STATUS.PENDING,
      metadata
    } = req.body
    
    // Validaciones básicas
    if (!code || !initial_value) {
      return res.status(400).json({
        message: "Code and initial_value are required"
      })
    }
    
    // Verificar que el código sea único
    const existingGiftCard = await longhornService.listLonghornGiftCards({
      code,
      deleted_at: null
    })
    
    if (existingGiftCard.length > 0) {
      return res.status(400).json({
        message: "A gift card with this code already exists"
      })
    }
    
    // Crear gift card
    const giftCardData = {
      user_id: currentUserId,
      code,
      initial_value,
      balance: initial_value, // El balance inicial es igual al valor inicial
      currency,
      expiration_date,
      customer_id,
      order_id,
      notes,
      sender_name,
      recipient_name,
      recipient_email,
      message,
      delivery_status,
      metadata
    }
    
    // Crear gift card directamente con SQL para evitar problemas de mapeo del ORM
    const giftCardId = `gc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    
    // Ejecutar inserción SQL directa
    const query = `
      INSERT INTO longhorn_gift_card (
        id, user_id, code, initial_value, balance, currency, 
        is_active, is_redeemed, expiration_date, customer_id, order_id, 
        notes, sender_name, recipient_name, recipient_email, message, 
        delivery_status, metadata, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING *
    `
    
    const values = [
      giftCardId,
      currentUserId,
      code,
      initial_value,
      initial_value, // balance = initial_value
      currency,
      true, // is_active
      false, // is_redeemed
      expiration_date || null,
      customer_id || null,
      order_id || null,
      notes || null,
      sender_name || null,
      recipient_name || null,
      recipient_email || null,
      message || null,
      delivery_status,
      metadata ? JSON.stringify(metadata) : null,
      new Date().toISOString(),
      new Date().toISOString()
    ]
    
    // Usar una inserción manual para evitar el problema del ORM
    const { Client } = require('pg')
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })
    
    await client.connect()
    const result = await client.query(query, values)
    const createdGiftCard = result.rows[0]
    await client.end()
    
    // Crear transacción inicial de compra/creación directamente con SQL
    const transactionId = `gct_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    
    const transactionQuery = `
      INSERT INTO longhorn_gift_card_transaction (
        id, gift_card_id, transaction_type, amount, balance_before, 
        balance_after, user_id, customer_id, order_id, description, 
        processed_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
    `
    
    const transactionValues = [
      transactionId,
      createdGiftCard.id,
      GIFT_CARD_TRANSACTION_TYPES.PURCHASE,
      initial_value,
      0,
      initial_value,
      currentUserId,
      customer_id || null,
      order_id || null,
      "Gift card creation",
      new Date().toISOString(),
      new Date().toISOString(),
      new Date().toISOString()
    ]
    
    // Crear otra conexión para la transacción
    const client2 = new Client({
      connectionString: process.env.DATABASE_URL
    })
    
    await client2.connect()
    await client2.query(transactionQuery, transactionValues)
    await client2.end()
    
    console.log('Gift card created successfully:', createdGiftCard.id)
    
    res.status(201).json({
      gift_card: createdGiftCard,
      message: "Gift card created successfully"
    })
    
  } catch (error) {
    console.error('Error creating gift card:', error)
    res.status(500).json({
      message: "Failed to create gift card",
      error: error.message
    })
  }
}
