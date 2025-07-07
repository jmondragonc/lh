import { model } from "@medusajs/framework/utils"

export const MENU_CATEGORY_TYPES = {
  ENTRADA: "ENTRADA",
  CARNE: "CARNE", 
  POLLO: "POLLO",
  CERDO: "CERDO",
  MARISCOS: "MARISCOS",
  ACOMPAÑAMIENTO: "ACOMPAÑAMIENTO",
  ENSALADA: "ENSALADA",
  POSTRE: "POSTRE",
  BEBIDA: "BEBIDA",
  COCTEL: "COCTEL",
  VINO: "VINO"
} as const

const LonghornMenuCategory = model.define("LonghornMenuCategory", {
  id: model.id().primaryKey(),
  name: model.text(),
  description: model.text().nullable(),
  type: model.enum(Object.values(MENU_CATEGORY_TYPES)),
  display_order: model.number().default(0),
  icon_url: model.text().nullable(),
  is_active: model.boolean().default(true),
  parent_category_id: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default LonghornMenuCategory
