import { 
  MedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"

/**
 * GET /store/longhorn/gift-cards/purchase-options
 * Obtiene opciones de compra disponibles para gift cards
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    console.log('=== GET /store/longhorn/gift-cards/purchase-options ===')
    
    // Configuración de opciones de compra
    const purchaseOptions = {
      currency: "PEN",
      predefined_amounts: [
        { value: 50, label: "S/ 50", popular: false },
        { value: 100, label: "S/ 100", popular: true },
        { value: 150, label: "S/ 150", popular: false },
        { value: 200, label: "S/ 200", popular: true },
        { value: 300, label: "S/ 300", popular: false },
        { value: 500, label: "S/ 500", popular: true }
      ],
      custom_amount: {
        enabled: true,
        min_value: 10,
        max_value: 1000,
        step: 5
      },
      payment_methods: [
        {
          id: "stripe",
          name: "Tarjeta de Crédito/Débito",
          description: "Visa, Mastercard, American Express",
          enabled: true,
          icon: "credit-card"
        },
        {
          id: "paypal",
          name: "PayPal",
          description: "Paga con tu cuenta PayPal",
          enabled: false, // Deshabilitado por ahora
          icon: "paypal"
        }
      ],
      delivery_options: [
        {
          id: "immediate",
          name: "Entrega Inmediata",
          description: "Enviar la gift card inmediatamente después del pago",
          delay_minutes: 0,
          selected: true
        },
        {
          id: "scheduled",
          name: "Entrega Programada",
          description: "Programar la entrega para una fecha específica",
          delay_minutes: null,
          selected: false,
          max_days_ahead: 365
        }
      ],
      terms_and_conditions: {
        expiration_months: 12,
        refund_policy: "Las gift cards no son reembolsables",
        usage_policy: "Válidas solo en restaurantes Longhorn participantes",
        transfer_policy: "Las gift cards son transferibles"
      },
      design_options: [
        {
          id: "default",
          name: "Diseño Clásico",
          description: "Diseño tradicional de Longhorn",
          preview_url: "/images/gift-cards/classic.png",
          selected: true
        },
        {
          id: "birthday",
          name: "Cumpleaños",
          description: "Diseño especial para cumpleaños",
          preview_url: "/images/gift-cards/birthday.png",
          selected: false
        },
        {
          id: "holiday",
          name: "Fiestas",
          description: "Diseño festivo para ocasiones especiales",
          preview_url: "/images/gift-cards/holiday.png",
          selected: false
        }
      ],
      validation_rules: {
        email_required: true,
        name_required: true,
        message_max_length: 500,
        valid_email_domains: [], // Empty = allow all domains
        blocked_email_domains: [
          "10minutemail.com",
          "tempmail.org",
          "guerrillamail.com"
        ]
      },
      business_info: {
        company_name: "Longhorn Steakhouse Perú",
        support_email: "soporte@longhorn.pe",
        support_phone: "+51 1 234-5678",
        website: "https://longhorn.pe",
        terms_url: "https://longhorn.pe/terminos",
        privacy_url: "https://longhorn.pe/privacidad"
      }
    }
    
    // Obtener estadísticas de uso para mostrar popularidad
    const { Client } = require('pg')
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })
    
    try {
      await client.connect()
      
      // Query para montos más populares
      const popularAmountsQuery = `
        SELECT 
          purchase_amount,
          COUNT(*) as purchase_count
        FROM longhorn_gift_card_purchase
        WHERE created_at >= NOW() - INTERVAL '30 days'
          AND payment_status = 'completed'
          AND deleted_at IS NULL
        GROUP BY purchase_amount
        ORDER BY purchase_count DESC
        LIMIT 3
      `
      
      const popularAmountsResult = await client.query(popularAmountsQuery)
      
      // Actualizar popularidad basada en datos reales
      const popularAmounts = popularAmountsResult.rows.map(row => parseFloat(row.purchase_amount))
      
      purchaseOptions.predefined_amounts = purchaseOptions.predefined_amounts.map(option => ({
        ...option,
        popular: popularAmounts.includes(option.value),
        purchase_count: popularAmountsResult.rows.find(row => 
          parseFloat(row.purchase_amount) === option.value
        )?.purchase_count || 0
      }))
      
    } catch (dbError) {
      console.warn('Could not fetch popularity data:', dbError.message)
      // Continue without popularity data
    } finally {
      await client.end()
    }
    
    res.json({
      success: true,
      options: purchaseOptions,
      metadata: {
        last_updated: new Date().toISOString(),
        version: "1.0",
        supported_currencies: ["PEN"],
        supported_locales: ["es-PE", "en-US"]
      }
    })
    
  } catch (error) {
    console.error('Error fetching purchase options:', error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase options",
      error: error.message
    })
  }
}
