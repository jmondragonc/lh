import { model } from "@medusajs/framework/utils"

const LonghornStore = model.define("LonghornStore", {
  id: model.id().primaryKey(),
  name: model.text().searchable(),
  code: model.text().searchable(),
  description: model.text().nullable(),
  address: model.text().nullable(),
  phone: model.text().nullable(),
  email: model.text().nullable(),
  is_active: model.boolean().default(true),
  business_hours: model.json().nullable(),
  delivery_settings: model.json().nullable(),
  metadata: model.json().nullable(),
})

export default LonghornStore
