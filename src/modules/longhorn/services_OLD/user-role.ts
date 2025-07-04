import { MedusaService } from "@medusajs/framework/utils"
import { ROLE_TYPES } from "../models/role"

type CreateUserRoleInput = {
  user_id: string
  role_id: string
  store_id?: string
  metadata?: Record<string, any>
}

class LonghornUserRoleService extends MedusaService({}) {
  protected readonly longhornModuleService_: any

  constructor(container: any) {
    super(...arguments)
    this.longhornModuleService_ = container.longhornModuleService
  }

  async assignRole(data: CreateUserRoleInput) {
    return await this.longhornModuleService_.assignRole(data)
  }

  async getUserRoles(user_id: string, store_id?: string) {
    return await this.longhornModuleService_.getUserRoles(user_id, store_id)
  }

  async getUsersByRole(role_id: string, store_id?: string) {
    const userRoles = await this.longhornModuleService_.listLonghornUserRoles({
      role_id,
      store_id: store_id || null,
      is_active: true,
      deleted_at: null
    })
    return userRoles
  }

  async removeUserRole(user_id: string, role_id: string, store_id?: string) {
    return await this.longhornModuleService_.removeUserRole(user_id, role_id, store_id)
  }

  async deactivateUserRole(user_id: string, role_id: string, store_id?: string) {
    return await this.longhornModuleService_.deactivateUserRole(user_id, role_id, store_id)
  }

  async hasPermission(user_id: string, permission: string, store_id?: string): Promise<boolean> {
    return await this.longhornModuleService_.hasPermission(user_id, permission, store_id)
  }

  async isSuperAdmin(user_id: string): Promise<boolean> {
    return await this.longhornModuleService_.isSuperAdmin(user_id)
  }

  async isStoreManager(user_id: string, store_id: string): Promise<boolean> {
    return await this.longhornModuleService_.isStoreManager(user_id, store_id)
  }

  async isManagerOfOtherStore(user_id: string, excludeStoreId: string): Promise<boolean> {
    const userRoles = await this.longhornModuleService_.listLonghornUserRoles({
      user_id,
      is_active: true,
      deleted_at: null
    })
    
    // Hacer JOIN manual con roles para verificar tipo
    for (const userRole of userRoles) {
      const roles = await this.longhornModuleService_.listLonghornRoles({ id: userRole.role_id })
      const role = roles[0]
      
      if (role?.type === ROLE_TYPES.STORE_MANAGER && 
          userRole.store_id && 
          userRole.store_id !== excludeStoreId) {
        return true
      }
    }
    
    return false
  }

  async canManageUser(manager_user_id: string, target_user_id: string, store_id?: string): Promise<boolean> {
    // Super admin puede gestionar a cualquiera (excepto otros Super Admins)
    const isManagerSuperAdmin = await this.isSuperAdmin(manager_user_id)
    const isTargetSuperAdmin = await this.isSuperAdmin(target_user_id)
    
    if (isManagerSuperAdmin && !isTargetSuperAdmin) {
      return true
    }

    // Store manager puede gestionar staff de su tienda (no Super Admins ni otros Managers)
    if (store_id && await this.isStoreManager(manager_user_id, store_id)) {
      // No puede gestionar Super Admins
      if (isTargetSuperAdmin) {
        return false
      }
      
      // No puede gestionar managers de otras tiendas
      const isTargetManagerElsewhere = await this.isManagerOfOtherStore(target_user_id, store_id)
      if (isTargetManagerElsewhere) {
        return false
      }
      
      // Puede gestionar staff de su tienda
      const targetRoles = await this.getUserRoles(target_user_id, store_id)
      return targetRoles.length > 0
    }

    return false
  }
}

export default LonghornUserRoleService