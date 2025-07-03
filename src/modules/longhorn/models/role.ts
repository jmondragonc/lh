import { model } from "@medusajs/framework/utils"

/**
 * Roles jerárquicos para el sistema Longhorn
 * - SUPER_ADMIN: Administrador principal de todo el ecommerce
 * - STORE_MANAGER: Gerente de un local específico
 * - STORE_STAFF: Personal de un local específico
 */
export const ROLE_TYPES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  STORE_MANAGER: "STORE_MANAGER", 
  STORE_STAFF: "STORE_STAFF"
} as const

export type RoleType = typeof ROLE_TYPES[keyof typeof ROLE_TYPES]

const LonghornRole = model.define("LonghornRole", {
  id: model.id().primaryKey(),
  name: model.text().searchable(),
  type: model.enum(ROLE_TYPES),
  description: model.text().nullable(),
  permissions: model.json().nullable(),
  is_active: model.boolean().default(true),
  metadata: model.json().nullable(),
})

export default LonghornRole
