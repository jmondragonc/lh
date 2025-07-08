-- Script para crear tabla de compras de gift cards
-- Fecha: 2025-07-08

-- Crear tabla longhorn_gift_card_purchase
CREATE TABLE IF NOT EXISTS longhorn_gift_card_purchase (
  id VARCHAR PRIMARY KEY,
  gift_card_id VARCHAR REFERENCES longhorn_gift_card(id),
  customer_email VARCHAR NOT NULL,
  customer_name VARCHAR NOT NULL,
  customer_phone VARCHAR,
  
  -- Información de pago
  payment_method VARCHAR NOT NULL,
  payment_intent_id VARCHAR,
  payment_status VARCHAR DEFAULT 'pending',
  purchase_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PEN',
  
  -- Información del remitente y destinatario
  sender_name VARCHAR,
  sender_email VARCHAR,
  recipient_name VARCHAR,
  recipient_email VARCHAR,
  
  -- Información de entrega
  delivery_date TIMESTAMP NULL,
  delivery_status VARCHAR DEFAULT 'pending',
  
  -- Metadatos
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- Agregar índices para optimizar búsquedas
CREATE INDEX idx_gift_card_purchase_gift_card_id ON longhorn_gift_card_purchase(gift_card_id);
CREATE INDEX idx_gift_card_purchase_customer_email ON longhorn_gift_card_purchase(customer_email);
CREATE INDEX idx_gift_card_purchase_payment_status ON longhorn_gift_card_purchase(payment_status);
CREATE INDEX idx_gift_card_purchase_created_at ON longhorn_gift_card_purchase(created_at);
CREATE INDEX idx_gift_card_purchase_deleted_at ON longhorn_gift_card_purchase(deleted_at) WHERE deleted_at IS NULL;

-- Extender tabla longhorn_gift_card con campos para compras online
ALTER TABLE longhorn_gift_card 
ADD COLUMN IF NOT EXISTS purchase_id VARCHAR,
ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS sender_email VARCHAR,
ADD COLUMN IF NOT EXISTS purchase_source VARCHAR DEFAULT 'admin';

-- Comentarios para documentación
COMMENT ON TABLE longhorn_gift_card_purchase IS 'Registra todas las compras de gift cards realizadas desde el frontend';
COMMENT ON COLUMN longhorn_gift_card_purchase.payment_status IS 'Estados: pending, completed, failed, cancelled';
COMMENT ON COLUMN longhorn_gift_card_purchase.delivery_status IS 'Estados: pending, sent, delivered, failed';
COMMENT ON COLUMN longhorn_gift_card.purchase_source IS 'Origen: admin, online_store, mobile_app';
