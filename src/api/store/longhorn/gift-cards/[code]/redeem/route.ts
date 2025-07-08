import { 
  MedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"

/**
 * POST /store/longhorn/gift-cards/{code}/redeem
 * Redime una gift card para aplicarla a una orden
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    console.log('=== POST /store/longhorn/gift-cards/[code]/redeem ===')
    
    const { code } = req.params
    const { amount, order_id, customer_email } = req.body
    
    if (!code || !amount || !order_id || !customer_email) {
      return res.status(400).json({
        message: "Required fields: code, amount, order_id, customer_email"
      })
    }
    
    // Buscar gift card por código
    const { Client } = require('pg')
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })
    
    await client.connect()
    
    try {
      // Iniciar transacción
      await client.query('BEGIN')
      
      const query = `
        SELECT 
          id, balance, is_active, is_redeemed, expiration_date
        FROM longhorn_gift_card 
        WHERE code = $1 AND deleted_at IS NULL
      `
      
      const result = await client.query(query, [code.toUpperCase()])
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Gift card not found"
        })
      }
      
      const giftCard = result.rows[0]
      const now = new Date()
      const expirationDate = giftCard.expiration_date ? new Date(giftCard.expiration_date) : null
      
      // Validar estado de la gift card
      if (!giftCard.is_active || giftCard.is_redeemed || giftCard.balance <= 0 || (expirationDate && now > expirationDate)) {
        return res.status(400).json({
          message: "Gift card is not valid for redemption"
        })
      }
      
      if (giftCard.balance < amount) {
        return res.status(400).json({
          message: "Insufficient balance on gift card"
        })
      }
      
      // Actualizar el balance de la gift card
      const newBalance = giftCard.balance - amount
      const updateQuery = `
        UPDATE longhorn_gift_card
        SET balance = $1, is_redeemed = CASE WHEN $2 <= 0 THEN TRUE ELSE FALSE END, updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `
      
      const updateResult = await client.query(updateQuery, [newBalance, newBalance, giftCard.id])
      const updatedGiftCard = updateResult.rows[0]
      
      // Crear transacción de redención
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
        updatedGiftCard.id,
        "redemption",
        amount,
        giftCard.balance,
        updatedGiftCard.balance,
        null, // user_id
        null, // customer_id
        order_id,
        "Redemption of gift card",
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      ]
      
      await client.query(transactionQuery, transactionValues)
      
      // Confirmar transacción
      await client.query('COMMIT')
      
      res.json({
        message: "Gift card redeemed successfully",
        remaining_balance: updatedGiftCard.balance
      })
      
    } catch (transactionError) {
      // Rollback en caso de error
      await client.query('ROLLBACK')
      throw transactionError
    } finally {
      await client.end()
    }
    
  } catch (error) {
    console.error('Error redeeming gift card:', error)
    res.status(500).json({
      message: "Failed to redeem gift card",
      error: error.message
    })
  }
}
