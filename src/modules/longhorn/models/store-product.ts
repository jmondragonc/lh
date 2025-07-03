import { model } from "@medusajs/framework/utils"

const LonghornStoreProduct = model.define("LonghornStoreProduct", {
  id: model.id().primaryKey(),
  store_id: model.text(),
  product_id: model.text(),
  is_available: model.boolean().default(true),
  is_visible: model.boolean().default(true),
  store_specific_settings: model.json().nullable(),
  metadata: model.json().nullable(),
}).cascades({
  delete: ["longhornStore"]
})

export default LonghornStoreProduct
