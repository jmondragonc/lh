import { 
  MedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import { GIFT_CARD_DELIVERY_STATUS, GIFT_CARD_TRANSACTION_TYPES } from "../../../../../modules/longhorn/models"

/**
 * POST /store/longhorn/gift-cards/purchase
 * Permite a los usuarios del frontend comprar gift cards
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    console.log('=== POST /store/longhorn/gift-cards/purchase ===')
    console.log('Request body:', req.body)
    
    const longhornService = req.scope.resolve("longhorn")
    
    const {
      amount,
      currency = "PEN",
      recipient_email,
      recipient_name,
      sender_name,
      sender_email,
      message,
      delivery_date,
      payment_method,
      customer_info
    } = req.body
    
    // Validaciones básicas
    if (!amount || !recipient_email || !sender_name || !sender_email) {
      return res.status(400).json({
        message: "Required fields: amount, recipient_email, sender_name, sender_email"
      })
    }
    
    if (amount < 10 || amount > 1000) {
      return res.status(400).json({
        message: "Amount must be between 10 and 1000 PEN"
      })
    }
    
    // Generar código único para la gift card
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
    const giftCardCode = `LH-${timestamp.toString().slice(-6)}-${randomStr}`
    
    // Crear ID único para la compra
    const purchaseId = `gcp_${timestamp}_${Math.random().toString(36).substring(2, 8)}`
    
    // Crear gift card con estado pendiente de pago
    const giftCardId = `gc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    
    // Calcular fecha de expiración (1 año desde compra)
    const expirationDate = new Date()
    expirationDate.setFullYear(expirationDate.getFullYear() + 1)
    
    // Crear gift card con SQL directo
    const { Client } = require('pg')
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })
    
    await client.connect()
    
    try {
      // Iniciar transacción
      await client.query('BEGIN')
      
      // 1. Crear la gift card
      const giftCardQuery = `
        INSERT INTO longhorn_gift_card (
          id, code, initial_value, balance, currency, 
          is_active, is_redeemed, expiration_date,
          sender_name, sender_email, recipient_name, recipient_email, 
          message, delivery_status, purchase_source,
          delivery_date, metadata, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        ) RETURNING *
      `
      
      const giftCardValues = [
        giftCardId,
        giftCardCode,
        amount,
        amount, // balance = initial_value
        currency,
        false, // is_active - será activada después del pago
        false, // is_redeemed
        expirationDate.toISOString(),
        sender_name,
        sender_email,
        recipient_name,
        recipient_email,
        message || null,
        GIFT_CARD_DELIVERY_STATUS.PENDING,
        'online_store',
        delivery_date ? new Date(delivery_date).toISOString() : null,
        JSON.stringify({
          purchase_id: purchaseId,
          customer_info,
          payment_method,
          created_from: 'store_api'
        }),
        new Date().toISOString(),
        new Date().toISOString()
      ]
      
      const giftCardResult = await client.query(giftCardQuery, giftCardValues)
      const createdGiftCard = giftCardResult.rows[0]
      
      // 2. Crear registro de compra
      const purchaseQuery = `
        INSERT INTO longhorn_gift_card_purchase (
          id, gift_card_id, customer_email, customer_name, customer_phone,
          payment_method, payment_status, purchase_amount, currency,
          sender_name, sender_email, recipient_name, recipient_email,
          delivery_date, metadata, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        ) RETURNING *
      `
      
      const purchaseValues = [
        purchaseId,
        giftCardId,
        sender_email,
        `${customer_info?.first_name || ''} ${customer_info?.last_name || ''}`.trim() || sender_name,
        customer_info?.phone || null,
        payment_method,
        'pending',
        amount,
        currency,
        sender_name,
        sender_email,
        recipient_name,
        recipient_email,
        delivery_date ? new Date(delivery_date).toISOString() : null,
        JSON.stringify({
          customer_info,
          message,
          payment_intent_id: null // Se actualizará después
        }),
        new Date().toISOString(),
        new Date().toISOString()
      ]
      
      const purchaseResult = await client.query(purchaseQuery, purchaseValues)
      const createdPurchase = purchaseResult.rows[0]
      
      // 3. Simular integración con servicio de pagos
      // En producción, aquí se integraría con Stripe, PayU, etc.
      let paymentIntentId = null
      let paymentStatus = 'pending'
      
      if (payment_method === 'stripe') {
        // Simular creación de payment intent
        paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
        paymentStatus = 'requires_payment_method'
      }
      
      // 4. Actualizar purchase con payment intent
      if (paymentIntentId) {
        await client.query(
          'UPDATE longhorn_gift_card_purchase SET payment_intent_id = $1, metadata = $2 WHERE id = $3',
          [
            paymentIntentId,
            JSON.stringify({
              ...JSON.parse(purchaseResult.rows[0].metadata),
              payment_intent_id: paymentIntentId
            }),
            purchaseId
          ]
        )
      }
      
      // Confirmar transacción
      await client.query('COMMIT')
      
      console.log('Gift card purchase created successfully:', {
        purchaseId,
        giftCardId,
        code: giftCardCode
      })
      
      res.status(201).json({
        purchase_id: purchaseId,
        gift_card: {
          id: giftCardId,
          code: giftCardCode,
          amount: parseFloat(amount),
          currency,
          expires_at: expirationDate.toISOString(),
          status: 'pending_payment'
        },
        payment: {
          status: paymentStatus,
          payment_intent_id: paymentIntentId,
          amount: parseFloat(amount),
          currency,
          // En producción, incluir datos del payment provider
          client_secret: paymentIntentId ? `${paymentIntentId}_secret_${Math.random().toString(36).substring(2, 8)}` : null
        },
        delivery: {
          status: 'scheduled',
          delivery_date: delivery_date || null,
          recipient_email
        },
        next_steps: {
          action: 'complete_payment',
          description: 'Complete the payment using the provided payment_intent_id',
          webhook_url: '/store/longhorn/gift-cards/webhook/payment-completed'
        }
      })
      
    } catch (error) {
      // Rollback en caso de error
      await client.query('ROLLBACK')
      throw error
    } finally {
      await client.end()
    }
    
  } catch (error) {
    console.error('Error creating gift card purchase:', error)
    res.status(500).json({
      message: "Failed to create gift card purchase",
      error: error.message
    })
  }
}
