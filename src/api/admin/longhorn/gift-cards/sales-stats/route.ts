import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import type { LonghornAuthenticatedRequest } from "../../../../types/longhorn-auth"

/**
 * GET /admin/longhorn/gift-cards/sales-stats
 * Obtiene estadísticas de ventas de gift cards
 */
export const GET = async (
  req: LonghornAuthenticatedRequest,
  res: MedusaResponse
) => {
  try {
    console.log('=== GET /admin/longhorn/gift-cards/sales-stats ===')
    
    const { period = "last_30_days" } = req.query
    
    // Calcular fechas según el período
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case "last_7_days":
        startDate.setDate(now.getDate() - 7)
        break
      case "last_30_days":
        startDate.setDate(now.getDate() - 30)
        break
      case "last_90_days":
        startDate.setDate(now.getDate() - 90)
        break
      case "last_year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }
    
    const { Client } = require('pg')
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })
    
    await client.connect()
    
    // Query para estadísticas generales
    const generalStatsQuery = `
      SELECT 
        COUNT(*) as total_sales,
        SUM(purchase_amount) as total_revenue,
        AVG(purchase_amount) as average_value,
        COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_sales
      FROM longhorn_gift_card_purchase
      WHERE created_at >= $1 
        AND created_at <= $2 
        AND deleted_at IS NULL
        AND payment_status = 'completed'
    `
    
    const generalStatsResult = await client.query(generalStatsQuery, [
      startDate.toISOString(),
      now.toISOString()
    ])
    
    const generalStats = generalStatsResult.rows[0]
    
    // Query para estadísticas por día
    const dailyStatsQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as units,
        SUM(purchase_amount) as sales
      FROM longhorn_gift_card_purchase
      WHERE created_at >= $1 
        AND created_at <= $2 
        AND deleted_at IS NULL
        AND payment_status = 'completed'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `
    
    const dailyStatsResult = await client.query(dailyStatsQuery, [
      startDate.toISOString(),
      now.toISOString()
    ])
    
    // Query para métodos de pago
    const paymentMethodsQuery = `
      SELECT 
        payment_method,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
      FROM longhorn_gift_card_purchase
      WHERE created_at >= $1 
        AND created_at <= $2 
        AND deleted_at IS NULL
        AND payment_status = 'completed'
      GROUP BY payment_method
      ORDER BY count DESC
    `
    
    const paymentMethodsResult = await client.query(paymentMethodsQuery, [
      startDate.toISOString(),
      now.toISOString()
    ])
    
    // Query para valores más populares
    const popularValuesQuery = `
      SELECT 
        purchase_amount,
        COUNT(*) as count
      FROM longhorn_gift_card_purchase
      WHERE created_at >= $1 
        AND created_at <= $2 
        AND deleted_at IS NULL
        AND payment_status = 'completed'
      GROUP BY purchase_amount
      ORDER BY count DESC
      LIMIT 5
    `
    
    const popularValuesResult = await client.query(popularValuesQuery, [
      startDate.toISOString(),
      now.toISOString()
    ])
    
    // Calcular crecimiento (comparar con período anterior)
    const previousStartDate = new Date(startDate)
    const periodDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    previousStartDate.setDate(startDate.getDate() - periodDays)
    
    const previousPeriodQuery = `
      SELECT 
        COUNT(*) as prev_total_sales,
        SUM(purchase_amount) as prev_total_revenue
      FROM longhorn_gift_card_purchase
      WHERE created_at >= $1 
        AND created_at < $2 
        AND deleted_at IS NULL
        AND payment_status = 'completed'
    `
    
    const previousPeriodResult = await client.query(previousPeriodQuery, [
      previousStartDate.toISOString(),
      startDate.toISOString()
    ])
    
    const previousStats = previousPeriodResult.rows[0]
    
    await client.end()
    
    // Calcular tasas de crecimiento
    const currentRevenue = parseFloat(generalStats.total_revenue || 0)
    const previousRevenue = parseFloat(previousStats.prev_total_revenue || 0)
    const growthRate = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0
    
    // Formatear métodos de pago
    const paymentMethods = {}
    paymentMethodsResult.rows.forEach(row => {
      paymentMethods[row.payment_method] = parseFloat(row.percentage)
    })
    
    // Formatear respuesta
    res.json({
      period,
      date_range: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      total_sales: currentRevenue,
      total_units: parseInt(generalStats.total_sales || 0),
      average_value: parseFloat(generalStats.average_value || 0),
      growth_rate: parseFloat(growthRate.toFixed(2)),
      completed_sales: parseInt(generalStats.completed_sales || 0),
      by_day: dailyStatsResult.rows.map(row => ({
        date: row.date,
        sales: parseFloat(row.sales),
        units: parseInt(row.units)
      })),
      payment_methods: paymentMethods,
      popular_values: popularValuesResult.rows.map(row => ({
        amount: parseFloat(row.purchase_amount),
        count: parseInt(row.count)
      })),
      comparison: {
        previous_period: {
          total_sales: parseFloat(previousStats.prev_total_revenue || 0),
          total_units: parseInt(previousStats.prev_total_sales || 0)
        },
        growth: {
          revenue_growth: growthRate,
          units_growth: previousStats.prev_total_sales > 0 
            ? (((generalStats.total_sales - previousStats.prev_total_sales) / previousStats.prev_total_sales) * 100)
            : 0
        }
      }
    })
    
  } catch (error) {
    console.error('Error fetching sales stats:', error)
    res.status(500).json({
      message: "Failed to fetch sales statistics",
      error: error.message
    })
  }
}
