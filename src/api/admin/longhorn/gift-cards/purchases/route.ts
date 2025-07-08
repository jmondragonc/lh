import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import type { LonghornAuthenticatedRequest } from "../../../../types/longhorn-auth"

/**
 * GET /admin/longhorn/gift-cards/purchases
 * Lista todas las compras de gift cards realizadas desde el frontend
 */
export const GET = async (
  req: LonghornAuthenticatedRequest,
  res: MedusaResponse
) => {
  try {
    console.log('=== GET /admin/longhorn/gift-cards/purchases ===')
    
    const { 
      start_date, 
      end_date, 
      status, 
      limit = "50", 
      offset = "0" 
    } = req.query
    
    // Construir filtros
    const filters = []
    const values = []
    let paramIndex = 1
    
    // Filtros de fecha
    if (start_date) {
      filters.push(`p.created_at >= $${paramIndex}`)
      values.push(new Date(start_date as string).toISOString())
      paramIndex++
    }
    
    if (end_date) {
      filters.push(`p.created_at <= $${paramIndex}`)
      values.push(new Date(end_date as string).toISOString())
      paramIndex++
    }
    
    // Filtros de estado
    if (status) {
      filters.push(`p.payment_status = $${paramIndex}`)
      values.push(status as string)
      paramIndex++
    }
    
    // Agregar filtro para compras no eliminadas
    filters.push(`p.deleted_at IS NULL`)
    
    // Construir WHERE clause
    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''
    
    const { Client } = require('pg')
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })
    
    await client.connect()
    
    // Query principal para las compras
    const query = `
      SELECT 
        p.id as purchase_id,
        p.customer_email,
        p.customer_name,
        p.customer_phone,
        p.payment_method,
        p.payment_intent_id,
        p.payment_status,
        p.purchase_amount,
        p.currency,
        p.sender_name,
        p.sender_email,
        p.recipient_name,
        p.recipient_email,
        p.delivery_date,
        p.delivery_status,
        p.created_at as purchased_at,
        g.id as gift_card_id,
        g.code as gift_card_code,
        g.balance as gift_card_balance,
        g.is_active as gift_card_active,
        g.is_redeemed as gift_card_redeemed
      FROM longhorn_gift_card_purchase p
      LEFT JOIN longhorn_gift_card g ON p.gift_card_id = g.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    
    values.push(parseInt(limit as string), parseInt(offset as string))
    
    const result = await client.query(query, values)
    
    // Query para estadísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as total_purchases,
        SUM(purchase_amount) as total_revenue,
        COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_purchases,
        COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_purchases,
        COUNT(CASE WHEN delivery_status = 'pending' THEN 1 END) as pending_deliveries
      FROM longhorn_gift_card_purchase
      WHERE deleted_at IS NULL
    `
    
    const statsResult = await client.query(statsQuery)
    const stats = statsResult.rows[0]
    
    await client.end()
    
    // Formatear respuesta
    const purchases = result.rows.map(row => ({
      id: row.purchase_id,
      gift_card: {
        id: row.gift_card_id,
        code: row.gift_card_code,
        amount: parseFloat(row.purchase_amount),
        balance: row.gift_card_balance ? parseFloat(row.gift_card_balance) : 0,
        status: row.gift_card_active ? (row.gift_card_redeemed ? 'redeemed' : 'active') : 'inactive'
      },
      customer: {
        name: row.customer_name,
        email: row.customer_email,
        phone: row.customer_phone
      },
      sender: {
        name: row.sender_name,
        email: row.sender_email
      },
      recipient: {
        name: row.recipient_name,
        email: row.recipient_email
      },
      payment: {
        method: row.payment_method,
        status: row.payment_status,
        amount: parseFloat(row.purchase_amount),
        currency: row.currency,
        payment_intent_id: row.payment_intent_id
      },
      delivery: {
        status: row.delivery_status,
        scheduled_date: row.delivery_date
      },
      purchased_at: row.purchased_at
    }))
    
    res.json({
      purchases,
      total: result.rows.length,
      stats: {
        total_purchases: parseInt(stats.total_purchases),
        total_revenue: stats.total_revenue ? parseFloat(stats.total_revenue) : 0,
        pending_purchases: parseInt(stats.pending_purchases),
        completed_purchases: parseInt(stats.completed_purchases),
        pending_deliveries: parseInt(stats.pending_deliveries)
      },
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        has_more: result.rows.length === parseInt(limit as string)
      }
    })
    
  } catch (error) {
    console.error('Error fetching gift card purchases:', error)
    res.status(500).json({
      message: "Failed to fetch gift card purchases",
      error: error.message
    })
  }
}
