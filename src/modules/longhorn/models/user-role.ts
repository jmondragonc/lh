import { model } from "@medusajs/framework/utils"

const LonghornUserRole = model.define("LonghornUserRole", {
  id: model.id().primaryKey(),
  user_id: model.text(),
  role_id: model.text(),
  store_id: model.text().nullable(),
  is_active: model.boolean().default(true),
  metadata: model.json().nullable(),
}).cascades({
  // delete: ["longhornRole", "longhornStore"] // Comentado hasta resolver relaciones
})

export default LonghornUserRole
