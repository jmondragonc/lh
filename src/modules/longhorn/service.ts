import { MedusaService } from "@medusajs/framework/utils"
import LonghornRole from "./models/role"
import LonghornStore from "./models/store"
import LonghornUserRole from "./models/user-role"
import LonghornUserStore from "./models/user-store"
import LonghornStoreProduct from "./models/store-product"
import { ROLE_TYPES, RoleType } from "./models/role"

/**
 * Servicio principal del módulo Longhorn
 * Este servicio maneja todos los modelos del sistema:
 * - Roles (LonghornRole)
 * - Tiendas/Locales (LonghornStore) 
 * - Asignación Usuario-Rol (LonghornUserRole)
 * - Asignación Usuario-Tienda (LonghornUserStore)
 * - Productos por Tienda (LonghornStoreProduct)
 */
class LonghornModuleService extends MedusaService({
  LonghornRole,
  LonghornStore,
  LonghornUserRole,
  LonghornUserStore,
  LonghornStoreProduct,
}) {

  // ======= MÉTODOS DE ROLES =======
  
  async createRole(data: {
    name: string
    type: RoleType
    description?: string
    permissions?: Record<string, any>
    metadata?: Record<string, any>
  }) {
    return await this.createLonghornRoles([data])
  }

  async getRolesByType(type: RoleType) {
    return await this.listLonghornRoles({
      type,
      deleted_at: null
    })
  }

  async getActiveRoles() {
    return await this.listLonghornRoles({
      is_active: true,
      deleted_at: null
    })
  }

  async getAllRoles() {
    return await this.listLonghornRoles({
      deleted_at: null
    })
  }

  async updateRole(id: string, data: {
    name?: string
    type?: RoleType
    description?: string
    permissions?: Record<string, any>
    metadata?: Record<string, any>
  }) {
    return await this.updateLonghornRoles([{ id, ...data }])
  }

  async deleteRole(id: string) {
    return await this.deleteLonghornRoles([id])
  }

  // ======= MÉTODOS DE TIENDAS =======

  async createStore(data: {
    name: string
    code: string
    description?: string
    address?: string
    phone?: string
    email?: string
    business_hours?: Record<string, any>
    delivery_settings?: Record<string, any>
    metadata?: Record<string, any>
  }) {
    // Verificar que el código sea único
    const existingStores = await this.listLonghornStores({
      code: data.code,
      deleted_at: null
    })

    if (existingStores.length > 0) {
      throw new Error(`Store with code ${data.code} already exists`)
    }

    const createdStores = await this.createLonghornStores([data])
    return createdStores[0]
  }

  async getActiveStores() {
    return await this.listLonghornStores({
      is_active: true,
      deleted_at: null
    })
  }

  async getStoreByCode(code: string) {
    const stores = await this.listLonghornStores({
      code,
      deleted_at: null
    })
    return stores[0] || null
  }

  async updateStore(id: string, data: {
    name?: string
    code?: string
    description?: string
    address?: string
    phone?: string
    email?: string
    business_hours?: Record<string, any>
    delivery_settings?: Record<string, any>
    metadata?: Record<string, any>
  }) {
    const updatedStores = await this.updateLonghornStores([{ id, ...data }])
    return updatedStores[0]
  }

  async deactivateStore(id: string) {
    const updatedStores = await this.updateLonghornStores([{
      id,
      is_active: false
    }])
    return updatedStores[0]
  }

  async deleteStore(id: string) {
    return await this.deleteLonghornStores([id])
  }

  // ======= MÉTODOS DE USUARIO-ROL =======

  async assignRole(data: {
    user_id: string
    role_id: string
    store_id?: string
    metadata?: Record<string, any>
  }) {
    // Verificar que no exista ya una asignación activa
    const existingAssignments = await this.listLonghornUserRoles({
      user_id: data.user_id,
      role_id: data.role_id,
      store_id: data.store_id || null,
      is_active: true,
      deleted_at: null
    })

    if (existingAssignments.length > 0) {
      throw new Error(`User already has this role assigned`)
    }

    const createdUserRoles = await this.createLonghornUserRoles([data])
    return createdUserRoles[0]
  }

  async getUserRoles(user_id: string, store_id?: string) {
    const filters: any = {
      user_id,
      is_active: true,
      deleted_at: null
    }

    if (store_id !== undefined) {
      filters.store_id = store_id
    }

    // Obtener user roles
    const userRoles = await this.listLonghornUserRoles(filters)
    
    // Hacer JOIN manual con roles
    const enrichedUserRoles = await Promise.all(
      userRoles.map(async (userRole) => {
        const roles = await this.listLonghornRoles({ id: userRole.role_id })
        const role = roles[0] || null
        
        return {
          ...userRole,
          role: role
        }
      })
    )

    return enrichedUserRoles
  }

  async getUsersByRoleType(role_type: RoleType, store_id?: string) {
    const filters: any = {
      is_active: true,
      deleted_at: null
    }

    if (store_id !== undefined) {
      filters.store_id = store_id
    }

    // Obtener user roles
    const userRoles = await this.listLonghornUserRoles(filters)
    
    // Hacer JOIN manual con roles y filtrar por tipo
    const enrichedUserRoles = await Promise.all(
      userRoles.map(async (userRole) => {
        const roles = await this.listLonghornRoles({ id: userRole.role_id })
        const role = roles[0] || null
        
        return {
          ...userRole,
          role: role
        }
      })
    )

    // Filtrar por tipo de rol
    return enrichedUserRoles.filter(userRole => userRole.role?.type === role_type)
  }

  async removeUserRole(user_id: string, role_id: string, store_id?: string) {
    const userRoles = await this.listLonghornUserRoles({
      user_id,
      role_id,
      store_id: store_id || null,
      is_active: true,
      deleted_at: null
    })

    if (userRoles.length === 0) {
      throw new Error(`User role assignment not found`)
    }

    return await this.deleteLonghornUserRoles([userRoles[0].id])
  }

  async deactivateUserRole(user_id: string, role_id: string, store_id?: string) {
    const userRoles = await this.listLonghornUserRoles({
      user_id,
      role_id,
      store_id: store_id || null,
      is_active: true,
      deleted_at: null
    })

    if (userRoles.length === 0) {
      throw new Error(`User role assignment not found`)
    }

    const updatedUserRoles = await this.updateLonghornUserRoles([{
      id: userRoles[0].id,
      is_active: false
    }])
    return updatedUserRoles[0]
  }

  // ======= MÉTODOS DE USUARIO-TIENDA =======

  async assignUserToStore(data: {
    user_id: string
    store_id: string
    metadata?: Record<string, any>
  }) {
    // Verificar que no exista ya una asignación activa
    const existingAssignments = await this.listLonghornUserStores({
      user_id: data.user_id,
      store_id: data.store_id,
      is_active: true,
      deleted_at: null
    })

    if (existingAssignments.length > 0) {
      throw new Error(`User is already assigned to this store`)
    }

    const createdUserStores = await this.createLonghornUserStores([data])
    return createdUserStores[0]
  }

  async getUserStores(user_id: string) {
    const userStores = await this.listLonghornUserStores({
      user_id,
      is_active: true,
      deleted_at: null
    })

    // Hacer JOIN manual con stores
    const enrichedUserStores = await Promise.all(
      userStores.map(async (userStore) => {
        const stores = await this.listLonghornStores({ id: userStore.store_id })
        const store = stores[0] || null
        
        return {
          ...userStore,
          store: store
        }
      })
    )

    return enrichedUserStores
  }

  async getStoreUsers(store_id: string) {
    return await this.listLonghornUserStores({
      store_id,
      is_active: true,
      deleted_at: null
    })
  }

  async removeUserFromStore(user_id: string, store_id: string) {
    const userStores = await this.listLonghornUserStores({
      user_id,
      store_id,
      is_active: true,
      deleted_at: null
    })

    if (userStores.length === 0) {
      throw new Error(`User store assignment not found`)
    }

    return await this.deleteLonghornUserStores([userStores[0].id])
  }

  async hasAccessToStore(user_id: string, store_id: string): Promise<boolean> {
    const userStores = await this.listLonghornUserStores({
      user_id,
      store_id,
      is_active: true,
      deleted_at: null
    })

    return userStores.length > 0
  }

  // ======= MÉTODOS DE PRODUCTOS POR TIENDA =======

  async assignProductToStore(data: {
    store_id: string
    product_id: string
    is_available?: boolean
    is_visible?: boolean
    store_specific_settings?: Record<string, any>
    metadata?: Record<string, any>
  }) {
    // Verificar que no exista ya una asignación
    const existingAssignments = await this.listLonghornStoreProducts({
      store_id: data.store_id,
      product_id: data.product_id,
      deleted_at: null
    })

    if (existingAssignments.length > 0) {
      throw new Error(`Product is already assigned to this store`)
    }

    const storeProductData = {
      is_available: true,
      is_visible: true,
      ...data
    }

    const createdStoreProducts = await this.createLonghornStoreProducts([storeProductData])
    return createdStoreProducts[0]
  }

  async getStoreProducts(store_id: string, options?: {
    available_only?: boolean
    visible_only?: boolean
  }) {
    const filters: any = {
      store_id,
      deleted_at: null
    }

    if (options?.available_only) {
      filters.is_available = true
    }

    if (options?.visible_only) {
      filters.is_visible = true
    }

    return await this.listLonghornStoreProducts(filters)
  }

  async getProductStores(product_id: string) {
    return await this.listLonghornStoreProducts({
      product_id,
      deleted_at: null
    })
  }

  async updateStoreProduct(store_id: string, product_id: string, data: {
    is_available?: boolean
    is_visible?: boolean
    store_specific_settings?: Record<string, any>
    metadata?: Record<string, any>
  }) {
    const storeProducts = await this.listLonghornStoreProducts({
      store_id,
      product_id,
      deleted_at: null
    })

    if (storeProducts.length === 0) {
      throw new Error(`Store product assignment not found`)
    }

    const updatedStoreProducts = await this.updateLonghornStoreProducts([{
      id: storeProducts[0].id,
      ...data
    }])
    return updatedStoreProducts[0]
  }

  async removeProductFromStore(store_id: string, product_id: string) {
    const storeProducts = await this.listLonghornStoreProducts({
      store_id,
      product_id,
      deleted_at: null
    })

    if (storeProducts.length === 0) {
      throw new Error(`Store product assignment not found`)
    }

    return await this.deleteLonghornStoreProducts([storeProducts[0].id])
  }

  async isProductAvailableInStore(store_id: string, product_id: string): Promise<boolean> {
    const storeProducts = await this.listLonghornStoreProducts({
      store_id,
      product_id,
      is_available: true,
      is_visible: true,
      deleted_at: null
    })

    return storeProducts.length > 0
  }

  async bulkAssignProducts(store_id: string, product_ids: string[]) {
    const assignments = []
    
    for (const product_id of product_ids) {
      try {
        const assignment = await this.assignProductToStore({
          store_id,
          product_id
        })
        assignments.push(assignment)
      } catch (error) {
        // Skip if already assigned
        console.warn(`Product ${product_id} already assigned to store ${store_id}`)
      }
    }

    return assignments
  }

  // ======= MÉTODOS DE PERMISOS Y LÓGICA DE NEGOCIO =======

  async hasPermission(user_id: string, permission: string, store_id?: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(user_id, store_id)
    
    // Por ahora retornamos true si tiene algún rol
    // TODO: Implementar lógica de permisos cuando tengamos los roles poblados
    return userRoles.length > 0
  }

  async isSuperAdmin(user_id: string): Promise<boolean> {
    const userRoles = await this.listLonghornUserRoles({
      user_id,
      is_active: true,
      deleted_at: null
    })
    
    // Verificar cada rol manualmente
    for (const userRole of userRoles) {
      const roles = await this.listLonghornRoles({ id: userRole.role_id })
      const role = roles[0]
      
      if (role?.type === ROLE_TYPES.SUPER_ADMIN) {
        return true
      }
    }
    
    return false
  }

  async isStoreManager(user_id: string, store_id: string): Promise<boolean> {
    const userRoles = await this.listLonghornUserRoles({
      user_id,
      store_id,
      is_active: true,
      deleted_at: null
    })
    
    // Verificar cada rol manualmente
    for (const userRole of userRoles) {
      const roles = await this.listLonghornRoles({ id: userRole.role_id })
      const role = roles[0]
      
      if (role?.type === ROLE_TYPES.STORE_MANAGER) {
        return true
      }
    }
    
    return false
  }

  async canManageUser(manager_user_id: string, target_user_id: string, store_id?: string): Promise<boolean> {
    // Super admin puede gestionar a cualquiera
    if (await this.isSuperAdmin(manager_user_id)) {
      return true
    }

    // Store manager puede gestionar staff de su tienda
    if (store_id && await this.isStoreManager(manager_user_id, store_id)) {
      // TODO: Verificar que el target user sea solo staff
      return true
    }

    return false
  }

  // ======= SEEDING DE DATOS INICIALES =======

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
      ]

      for (const roleData of defaultRoles) {
        await this.createRole(roleData)
      }

      return defaultRoles.length
    }

    return 0
  }

  async seedDefaultStores() {
    const existingStores = await this.getActiveStores()
    
    if (existingStores.length === 0) {
      const defaultStores = [
        {
          name: "Longhorn Steakhouse - Centro",
          code: "LH001",
          description: "Local principal en el centro de la ciudad",
          address: "Av. Principal 123, Centro",
          phone: "+51-1-234-5678",
          email: "centro@longhorn.pe",
          business_hours: {
            monday: { open: "11:00", close: "23:00" },
            tuesday: { open: "11:00", close: "23:00" },
            wednesday: { open: "11:00", close: "23:00" },
            thursday: { open: "11:00", close: "23:00" },
            friday: { open: "11:00", close: "24:00" },
            saturday: { open: "11:00", close: "24:00" },
            sunday: { open: "12:00", close: "22:00" }
          },
          delivery_settings: {
            enabled: true,
            delivery_radius: 5,
            min_order_amount: 50,
            delivery_fee: 10
          }
        },
        {
          name: "Longhorn Steakhouse - San Isidro",
          code: "LH002",
          description: "Local en el distrito financiero",
          address: "Av. Rivera Navarrete 456, San Isidro",
          phone: "+51-1-234-5679",
          email: "sanisidro@longhorn.pe",
          business_hours: {
            monday: { open: "11:00", close: "23:00" },
            tuesday: { open: "11:00", close: "23:00" },
            wednesday: { open: "11:00", close: "23:00" },
            thursday: { open: "11:00", close: "23:00" },
            friday: { open: "11:00", close: "24:00" },
            saturday: { open: "11:00", close: "24:00" },
            sunday: { open: "12:00", close: "22:00" }
          },
          delivery_settings: {
            enabled: true,
            delivery_radius: 8,
            min_order_amount: 60,
            delivery_fee: 12
          }
        }
      ]

      const createdStores = []
      for (const storeData of defaultStores) {
        const store = await this.createStore(storeData)
        createdStores.push(store)
      }

      return createdStores
    }

    return []
  }
}

export default LonghornModuleService