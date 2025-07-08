import { 
  MedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"

/**
 * GET /store/longhorn/gift-cards/{code}/validate
 * Valida si una gift card existe y está activa
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    console.log('=== GET /store/longhorn/gift-cards/[code]/validate ===')
    
    const { code } = req.params
    
    if (!code) {
      return res.status(400).json({
        message: "Gift card code is required"
      })
    }
    
    // Buscar gift card por código
    const { Client } = require('pg')
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })
    
    await client.connect()
    
    const query = `
      SELECT 
        id, code, initial_value, balance, currency, 
        is_active, is_redeemed, expiration_date,
        recipient_name, recipient_email, sender_name,
        created_at, purchase_source
      FROM longhorn_gift_card 
      WHERE code = $1 AND deleted_at IS NULL
    `
    
    const result = await client.query(query, [code.toUpperCase()])
    await client.end()
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        valid: false,
        message: "Gift card not found"
      })
    }
    
    const giftCard = result.rows[0]
    
    // Validar estado de la gift card
    const now = new Date()
    const expirationDate = giftCard.expiration_date ? new Date(giftCard.expiration_date) : null
    
    let isValid = true
    let validationMessage = "Gift card is valid"
    
    if (!giftCard.is_active) {
      isValid = false
      validationMessage = "Gift card is not active"
    } else if (giftCard.is_redeemed) {
      isValid = false
      validationMessage = "Gift card has been fully redeemed"
    } else if (giftCard.balance <= 0) {
      isValid = false
      validationMessage = "Gift card has no remaining balance"
    } else if (expirationDate && now > expirationDate) {
      isValid = false
      validationMessage = "Gift card has expired"
    }
    
    res.json({
      valid: isValid,
      message: validationMessage,
      gift_card: {
        code: giftCard.code,
        balance: parseFloat(giftCard.balance),
        currency: giftCard.currency,
        is_active: giftCard.is_active,
        is_redeemed: giftCard.is_redeemed,
        expires_at: giftCard.expiration_date,
        recipient_name: giftCard.recipient_name,
        created_at: giftCard.created_at
      }
    })
    
  } catch (error) {
    console.error('Error validating gift card:', error)
    res.status(500).json({
      valid: false,
      message: "Failed to validate gift card",
      error: error.message
    })
  }
}
