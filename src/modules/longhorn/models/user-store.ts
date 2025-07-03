import { model } from "@medusajs/framework/utils"

const LonghornUserStore = model.define("LonghornUserStore", {
  id: model.id().primaryKey(),
  user_id: model.text(),
  store_id: model.text(),
  is_active: model.boolean().default(true),
  metadata: model.json().nullable(),
}).cascades({
  delete: ["longhornStore"]
})

export default LonghornUserStore
