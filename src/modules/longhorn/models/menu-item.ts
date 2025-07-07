import { model } from "@medusajs/framework/utils"

export const DISH_TYPES = {
  INDIVIDUAL: "INDIVIDUAL",
  COMPARTIR: "COMPARTIR", 
  PARRILLA: "PARRILLA",
  ESPECIALIDAD: "ESPECIALIDAD"
} as const

export const COOKING_POINTS = {
  CRUDO: "CRUDO",
  VUELTA_Y_VUELTA: "VUELTA_Y_VUELTA",
  JUGOSO: "JUGOSO", 
  A_PUNTO: "A_PUNTO",
  TRES_CUARTOS: "TRES_CUARTOS",
  BIEN_COCIDO: "BIEN_COCIDO"
} as const

export const SPICE_LEVELS = {
  SIN_PICANTE: "SIN_PICANTE",
  SUAVE: "SUAVE",
  MEDIO: "MEDIO", 
  PICANTE: "PICANTE",
  MUY_PICANTE: "MUY_PICANTE"
} as const

const LonghornMenuItem = model.define("LonghornMenuItem", {
  id: model.id().primaryKey(),
  // Información básica
  name: model.text(),
  description: model.text().nullable(),
  short_description: model.text().nullable(),
  
  // Categorización
  menu_category_id: model.text(),
  dish_type: model.enum(Object.values(DISH_TYPES)),
  
  // Información culinaria
  ingredients: model.json().nullable(), // Array de ingredientes
  allergens: model.json().nullable(), // Array de alérgenos
  cooking_points_available: model.json().nullable(), // Array de COOKING_POINTS disponibles
  spice_level: model.enum(Object.values(SPICE_LEVELS)).default("SIN_PICANTE"),
  
  // Información nutricional (opcional)
  calories: model.number().nullable(),
  proteins: model.number().nullable(), // gramos
  carbs: model.number().nullable(), // gramos 
  fats: model.number().nullable(), // gramos
  weight: model.number().nullable(), // gramos
  
  // Precios y disponibilidad
  base_price: model.bigNumber(), // Precio base en céntimos
  preparation_time: model.number().default(15), // minutos
  
  // Media
  image_url: model.text().nullable(),
  gallery_urls: model.json().nullable(), // Array de URLs adicionales
  
  // Estado
  is_active: model.boolean().default(true),
  is_popular: model.boolean().default(false),
  is_new: model.boolean().default(false),
  is_spicy: model.boolean().default(false),
  is_vegetarian: model.boolean().default(false),
  is_vegan: model.boolean().default(false),
  is_gluten_free: model.boolean().default(false),
  
  // Configuración
  display_order: model.number().default(0),
  min_age_required: model.number().nullable(), // Para bebidas alcohólicas
  
  metadata: model.json().nullable(),
})

export default LonghornMenuItem
