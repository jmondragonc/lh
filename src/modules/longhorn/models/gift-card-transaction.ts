import { model } from "@medusajs/framework/utils"

/**
 * Tipos de transacciones para Gift Cards
 */
export const GIFT_CARD_TRANSACTION_TYPES = {
  PURCHASE: "purchase", // Compra/creación de la gift card
  REDEMPTION: "redemption", // Uso/canje de la gift card
  REFUND: "refund", // Reembolso/devolución
  ADJUSTMENT: "adjustment", // Ajuste manual
  EXPIRATION: "expiration", // Expiración
  TRANSFER: "transfer" // Transferencia a otro usuario
} as const

export type GiftCardTransactionType = typeof GIFT_CARD_TRANSACTION_TYPES[keyof typeof GIFT_CARD_TRANSACTION_TYPES]

/**
 * Modelo de transacciones de Gift Card para el sistema Longhorn
 * Registra todo el historial de uso de cada gift card
 */
const LonghornGiftCardTransaction = model.define("LonghornGiftCardTransaction", {
  id: model.id().primaryKey(),
  
  // Relación con la gift card
  gift_card_id: model.text(), // ID de la gift card
  
  // Información de la transacción
  transaction_type: model.enum(GIFT_CARD_TRANSACTION_TYPES),
  amount: model.bigNumber(), // Monto de la transacción (positivo o negativo)
  balance_before: model.bigNumber(), // Saldo antes de la transacción
  balance_after: model.bigNumber(), // Saldo después de la transacción
  
  // Relaciones opcionales
  user_id: model.text().nullable(), // Usuario que realizó la transacción
  order_id: model.text().nullable(), // Pedido relacionado
  customer_id: model.text().nullable(), // Cliente relacionado
  
  // Información adicional
  reference_id: model.text().nullable(), // ID de referencia externa
  description: model.text().nullable(), // Descripción de la transacción
  notes: model.text().nullable(), // Notas internas
  
  // Fechas
  processed_at: model.dateTime().nullable(), // Cuándo fue procesada
  // Nota: created_at y updated_at se agregan automáticamente por MedusaJS
  
  // Metadata para extensibilidad
  metadata: model.json().nullable(),
})

export default LonghornGiftCardTransaction
