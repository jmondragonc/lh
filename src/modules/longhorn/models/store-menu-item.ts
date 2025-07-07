import { model } from "@medusajs/framework/utils"

const LonghornStoreMenuItem = model.define("LonghornStoreMenuItem", {
  id: model.id().primaryKey(),
  store_id: model.text(),
  menu_item_id: model.text(),
  
  // Disponibilidad por tienda
  is_available: model.boolean().default(true),
  is_visible_in_menu: model.boolean().default(true),
  
  // Precios específicos por tienda
  store_price: model.bigNumber().nullable(), // Si es diferente al precio base
  discount_percentage: model.number().nullable(), // Descuento específico de tienda
  
  // Personalización por tienda
  store_name: model.text().nullable(), // Nombre alternativo en esta tienda
  store_description: model.text().nullable(), // Descripción específica de tienda
  store_image_url: model.text().nullable(), // Imagen específica de tienda
  
  // Inventario y preparación
  daily_limit: model.number().nullable(), // Límite diario de este producto
  current_stock: model.number().nullable(), // Stock actual (si aplica)
  estimated_prep_time: model.number().nullable(), // Tiempo prep específico de tienda
  
  // Horarios de disponibilidad
  available_hours: model.json().nullable(), // Horarios específicos disponibles
  unavailable_dates: model.json().nullable(), // Fechas específicas no disponibles
  
  // Configuración de tienda
  display_order: model.number().nullable(), // Orden específico en esta tienda
  is_featured: model.boolean().default(false), // Destacado en esta tienda
  promotion_text: model.text().nullable(), // Texto promocional específico
  
  // Métricas por tienda
  times_ordered: model.number().default(0), // Veces pedido en esta tienda
  rating: model.number().nullable(), // Rating promedio en esta tienda
  last_ordered_at: model.dateTime().nullable(),
  
  metadata: model.json().nullable(),
})

export default LonghornStoreMenuItem
