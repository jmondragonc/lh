import { MedusaService } from "@medusajs/framework/utils"
import LonghornUserRole from "../models/user-role"
import { ROLE_TYPES, RoleType } from "../models/role"

type CreateUserRoleInput = {
  user_id: string
  role_id: string
  store_id?: string
  metadata?: Record<string, any>
}

class LonghornUserRoleService extends MedusaService({
  LonghornUserRole,
}) {
  async assignRole(data: CreateUserRoleInput) {
    // Verificar que no exista ya una asignación activa
    const existingAssignment = await this.longhornUserRoleRepository_.findOne({
      where: {
        user_id: data.user_id,
        role_id: data.role_id,
        store_id: data.store_id || null,
        is_active: true,
        deleted_at: null
      }
    })

    if (existingAssignment) {
      throw new Error(`User already has this role assigned`)
    }

    return await this.longhornUserRoleRepository_.create(data)
  }

  async getUserRoles(user_id: string, store_id?: string) {
    const where: any = {
      user_id,
      is_active: true,
      deleted_at: null
    }

    if (store_id !== undefined) {
      where.store_id = store_id
    }

    return await this.longhornUserRoleRepository_.find({
      where
    })
  }

  async getUsersByRole(role_id: string, store_id?: string) {
    const where: any = {
      role_id,
      is_active: true,
      deleted_at: null
    }

    if (store_id !== undefined) {
      where.store_id = store_id
    }

    return await this.longhornUserRoleRepository_.find({
      where
    })
  }

  async removeUserRole(user_id: string, role_id: string, store_id?: string) {
    const userRole = await this.longhornUserRoleRepository_.findOne({
      where: {
        user_id,
        role_id,
        store_id: store_id || null,
        is_active: true,
        deleted_at: null
      }
    })

    if (!userRole) {
      throw new Error(`User role assignment not found`)
    }

    return await this.longhornUserRoleRepository_.delete(userRole.id)
  }

  async deactivateUserRole(user_id: string, role_id: string, store_id?: string) {
    const userRole = await this.longhornUserRoleRepository_.findOne({
      where: {
        user_id,
        role_id,
        store_id: store_id || null,
        is_active: true,
        deleted_at: null
      }
    })

    if (!userRole) {
      throw new Error(`User role assignment not found`)
    }

    return await this.longhornUserRoleRepository_.update(userRole.id, {
      is_active: false
    })
  }

  async hasPermission(user_id: string, permission: string, store_id?: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(user_id, store_id)
    
    // Por ahora retornamos true si tiene algún rol
    // TODO: Implementar lógica de permisos cuando tengamos los roles poblados
    return userRoles.length > 0
  }

  async isSuperAdmin(user_id: string): Promise<boolean> {
    const userRoles = await this.longhornUserRoleRepository_.find({
      where: {
        user_id,
        is_active: true,
        deleted_at: null
      },
      relations: ['role']
    })
    
    // Verificar si tiene un rol de tipo SUPER_ADMIN
    return userRoles.some(userRole => 
      userRole.role && userRole.role.type === ROLE_TYPES.SUPER_ADMIN
    )
  }

  async isStoreManager(user_id: string, store_id: string): Promise<boolean> {
    const userRoles = await this.longhornUserRoleRepository_.find({
      where: {
        user_id,
        store_id,
        is_active: true,
        deleted_at: null
      },
      relations: ['role']
    })
    
    // Verificar si tiene un rol de tipo STORE_MANAGER en esta tienda
    return userRoles.some(userRole => 
      userRole.role && userRole.role.type === ROLE_TYPES.STORE_MANAGER
    )
  }

  async isManagerOfOtherStore(user_id: string, excludeStoreId: string): Promise<boolean> {
    const userRoles = await this.longhornUserRoleRepository_.find({
      where: {
        user_id,
        is_active: true,
        deleted_at: null
      },
      relations: ['role']
    })
    
    // Verificar si es manager de alguna tienda que NO sea la excluida
    return userRoles.some(userRole => 
      userRole.role && 
      userRole.role.type === ROLE_TYPES.STORE_MANAGER &&
      userRole.store_id !== excludeStoreId
    )
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
