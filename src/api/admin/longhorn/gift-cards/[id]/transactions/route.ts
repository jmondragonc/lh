import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import type { LonghornAuthenticatedRequest } from "../../../../../types/longhorn-auth"
import { GIFT_CARD_TRANSACTION_TYPES } from "../../../../../../modules/longhorn/models"

/**
 * GET /admin/longhorn/gift-cards/[id]/transactions
 * Lista todas las transacciones de una gift card específica
 */
export const GET = async (
  req: LonghornAuthenticatedRequest,
  res: MedusaResponse
) => {
  try {
    console.log('=== GET /admin/longhorn/gift-cards/[id]/transactions ===')
    
    const longhornService = req.scope.resolve("longhorn")
    const { id } = req.params
    const { limit = "50", offset = "0", transaction_type } = req.query
    
    // Verificar que la gift card existe
    const giftCards = await longhornService.listLonghornGiftCards({
      id,
      deleted_at: null
    })
    
    if (giftCards.length === 0) {
      return res.status(404).json({
        message: "Gift card not found"
      })
    }
    
    // Construir filtros para transacciones
    const filters: any = {
      gift_card_id: id,
      deleted_at: null
    }
    
    if (transaction_type) {
      filters.transaction_type = transaction_type
    }
    
    const transactions = await longhornService.listLonghornGiftCardTransactions(filters)
    
    console.log('📊 Found transactions:', transactions.length)
    
    res.json({
      transactions,
      count: transactions.length,
      gift_card_id: id
    })
    
  } catch (error) {
    console.error('Error fetching gift card transactions:', error)
    res.status(500).json({
      message: "Failed to fetch transactions",
      error: error.message
    })
  }
}

/**
 * POST /admin/longhorn/gift-cards/[id]/transactions
 * Crea una nueva transacción para una gift card (redeem, adjust, etc.)
 */
export const POST = async (
  req: LonghornAuthenticatedRequest,
  res: MedusaResponse
) => {
  try {
    console.log('=== POST /admin/longhorn/gift-cards/[id]/transactions ===')
    console.log('Request body:', req.body)
    
    const longhornService = req.scope.resolve("longhorn")
    const { id } = req.params
    const currentUserId = req.longhornAuth.userId
    
    // Verificar que la gift card existe y está activa
    const giftCards = await longhornService.listLonghornGiftCards({
      id,
      deleted_at: null
    })
    
    if (giftCards.length === 0) {
      return res.status(404).json({
        message: "Gift card not found"
      })
    }
    
    const giftCard = giftCards[0]
    
    if (!giftCard.is_active) {
      return res.status(400).json({
        message: "Gift card is not active"
      })
    }
    
    const {
      transaction_type,
      amount,
      customer_id,
      order_id,
      reference_id,
      description,
      notes,
      metadata
    } = req.body
    
    // Validaciones básicas
    if (!transaction_type || amount === undefined) {
      return res.status(400).json({
        message: "transaction_type and amount are required"
      })
    }
    
    if (!Object.values(GIFT_CARD_TRANSACTION_TYPES).includes(transaction_type)) {
      return res.status(400).json({
        message: "Invalid transaction type"
      })
    }
    
    const currentBalance = parseFloat(giftCard.balance)
    const transactionAmount = parseFloat(amount)
    
    // Validar que hay suficiente saldo para redenciones
    if (transaction_type === GIFT_CARD_TRANSACTION_TYPES.REDEMPTION && transactionAmount > 0) {
      if (currentBalance < transactionAmount) {
        return res.status(400).json({
          message: "Insufficient balance on gift card"
        })
      }
    }
    
    // Calcular nuevo balance
    let newBalance = currentBalance
    if (transaction_type === GIFT_CARD_TRANSACTION_TYPES.REDEMPTION) {
      newBalance = currentBalance - transactionAmount
    } else if (transaction_type === GIFT_CARD_TRANSACTION_TYPES.REFUND) {
      newBalance = currentBalance + transactionAmount
    } else if (transaction_type === GIFT_CARD_TRANSACTION_TYPES.ADJUSTMENT) {
      newBalance = currentBalance + transactionAmount // Puede ser positivo o negativo
    }
    
    // Crear transacción
    const transactionData = {
      gift_card_id: id,
      transaction_type,
      amount: transactionAmount,
      balance_before: currentBalance,
      balance_after: newBalance,
      user_id: currentUserId,
      customer_id,
      order_id,
      reference_id,
      description,
      notes,
      processed_at: new Date(),
      metadata
    }
    
    const [createdTransaction] = await longhornService.createLonghornGiftCardTransactions([transactionData])
    
    // Actualizar balance de la gift card
    const giftCardUpdates: any = {
      balance: newBalance
    }
    
    // Marcar como redimida si el balance llega a 0
    if (newBalance <= 0) {
      giftCardUpdates.is_redeemed = true
      giftCardUpdates.used_at = new Date()
    }
    
    await longhornService.updateLonghornGiftCards([{
      id,
      ...giftCardUpdates
    }])
    
    console.log('Transaction created successfully:', createdTransaction.id)
    console.log('New balance:', newBalance)
    
    res.status(201).json({
      transaction: createdTransaction,
      new_balance: newBalance,
      message: "Transaction created successfully"
    })
    
  } catch (error) {
    console.error('Error creating transaction:', error)
    res.status(500).json({
      message: "Failed to create transaction",
      error: error.message
    })
  }
}
