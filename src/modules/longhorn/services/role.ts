import { MedusaService } from "@medusajs/framework/utils"
import LonghornRole from "../models/role"
import { ROLE_TYPES, RoleType } from "../models/role"

type CreateRoleInput = {
  name: string
  type: RoleType
  description?: string
  permissions?: Record<string, any>
  metadata?: Record<string, any>
}

class LonghornRoleService extends MedusaService({
  LonghornRole,
}) {
  async createRole(data: CreateRoleInput) {
    return await this.longhornRoleRepository_.create(data)
  }

  async getRolesByType(type: RoleType) {
    return await this.longhornRoleRepository_.find({
      where: {
        type,
        deleted_at: null
      }
    })
  }

  async getActiveRoles() {
    return await this.longhornRoleRepository_.find({
      where: {
        is_active: true,
        deleted_at: null
      }
    })
  }

  async updateRole(id: string, data: Partial<CreateRoleInput>) {
    return await this.longhornRoleRepository_.update(id, data)
  }

  async deleteRole(id: string) {
    return await this.longhornRoleRepository_.delete(id)
  }

  async seedDefaultRoles() {
    const existingRoles = await this.getActiveRoles()
    
    if (existingRoles.length === 0) {
      const defaultRoles = [
        {
          name: "Super Administrador",
          type: ROLE_TYPES.SUPER_ADMIN,
          description: "Administrador principal con acceso completo al sistema",
          permissions: {
            manage_all_stores: true,
            manage_users: true,
            manage_roles: true,
            manage_general_menu: true,
            system_settings: true
          }
        },
        {
          name: "Gerente de Local",
          type: ROLE_TYPES.STORE_MANAGER,
          description: "Gerente con acceso completo a su local asignado",
          permissions: {
            manage_store_staff: true,
            manage_store_menu: true,
            view_store_analytics: true,
            manage_store_settings: true
          }
        },
        {
          name: "Personal de Local",
          type: ROLE_TYPES.STORE_STAFF,
          description: "Personal con acceso limitado a operaciones básicas",
          permissions: {
            view_store_orders: true,
            manage_order_status: true,
            view_store_menu: true
          }
        }
      ] as CreateRoleInput[]

      for (const roleData of defaultRoles) {
        await this.createRole(roleData)
      }

      return defaultRoles.length
    }

    return 0
  }
}

export default LonghornRoleService
