import { model } from "@medusajs/framework/utils"

/**
 * Estados de delivery para Gift Cards
 */
export const GIFT_CARD_DELIVERY_STATUS = {
  PENDING: "pending",
  SENT: "sent", 
  FAILED: "failed",
  DELIVERED: "delivered"
} as const

export type GiftCardDeliveryStatus = typeof GIFT_CARD_DELIVERY_STATUS[keyof typeof GIFT_CARD_DELIVERY_STATUS]

/**
 * Modelo de Gift Card para el sistema Longhorn
 * Permite la gestión completa de tarjetas de regalo con funcionalidades avanzadas
 */
const LonghornGiftCard = model.define("LonghornGiftCard", {
  id: model.id().primaryKey(),
  
  // Identificación y relaciones
  user_id: model.text().nullable(), // Usuario del sistema que creó la gift card
  code: model.text().unique().searchable(), // Código único de la gift card
  
  // Valores monetarios
  initial_value: model.bigNumber(), // Valor inicial asignado
  balance: model.bigNumber(), // Saldo restante
  currency: model.text().default("PEN"), // Moneda (PEN para Perú)
  
  // Estados
  is_active: model.boolean().default(true), // Activa o no
  is_redeemed: model.boolean().default(false), // Si ya fue usada completamente
  
  // Fechas
  expiration_date: model.dateTime().nullable(), // Fecha de vencimiento
  used_at: model.dateTime().nullable(), // Cuándo fue canjeada
  // Nota: created_at y updated_at se agregan automáticamente por MedusaJS
  
  // Relaciones opcionales
  customer_id: model.text().nullable(), // Cliente que la compró o recibió
  order_id: model.text().nullable(), // Pedido con el que se generó
  
  // Información adicional
  notes: model.text().nullable(), // Observaciones internas
  sender_name: model.text().nullable(), // Nombre del remitente si es regalo
  recipient_name: model.text().nullable(), // Nombre del destinatario
  recipient_email: model.text().nullable(), // Para envío digital
  message: model.text().nullable(), // Mensaje personalizado
  delivery_status: model.enum(GIFT_CARD_DELIVERY_STATUS).default("pending"), // Estado de envío
  
  // Metadata para extensibilidad
  metadata: model.json().nullable(),
})

export default LonghornGiftCard
