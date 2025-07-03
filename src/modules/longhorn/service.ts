import { MedusaService } from "@medusajs/framework/utils"
import { InferTypeOf, DAL } from "@medusajs/framework/types"
import LonghornRole from "./models/role"
import LonghornStore from "./models/store"
import LonghornUserRole from "./models/user-role"
import LonghornUserStore from "./models/user-store"
import LonghornStoreProduct from "./models/store-product"
import { ROLE_TYPES, RoleType } from "./models/role"

// Tipos para la inyección de dependencias
type LonghornRoleType = InferTypeOf<typeof LonghornRole>
type LonghornStoreType = InferTypeOf<typeof LonghornStore>
type LonghornUserRoleType = InferTypeOf<typeof LonghornUserRole>
type LonghornUserStoreType = InferTypeOf<typeof LonghornUserStore>
type LonghornStoreProductType = InferTypeOf<typeof LonghornStoreProduct>

type InjectedDependencies = {
  longhornRoleRepository: DAL.RepositoryService<LonghornRoleType>
  longhornStoreRepository: DAL.RepositoryService<LonghornStoreType>
  longhornUserRoleRepository: DAL.RepositoryService<LonghornUserRoleType>
  longhornUserStoreRepository: DAL.RepositoryService<LonghornUserStoreType>
  longhornStoreProductRepository: DAL.RepositoryService<LonghornStoreProductType>
}

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
  protected longhornRoleRepository_: DAL.RepositoryService<LonghornRoleType>
  protected longhornStoreRepository_: DAL.RepositoryService<LonghornStoreType>
  protected longhornUserRoleRepository_: DAL.RepositoryService<LonghornUserRoleType>
  protected longhornUserStoreRepository_: DAL.RepositoryService<LonghornUserStoreType>
  protected longhornStoreProductRepository_: DAL.RepositoryService<LonghornStoreProductType>

  constructor({
    longhornRoleRepository,
    longhornStoreRepository,
    longhornUserRoleRepository,
    longhornUserStoreRepository,
    longhornStoreProductRepository,
  }: InjectedDependencies) {
    super(...arguments)
    this.longhornRoleRepository_ = longhornRoleRepository
    this.longhornStoreRepository_ = longhornStoreRepository
    this.longhornUserRoleRepository_ = longhornUserRoleRepository
    this.longhornUserStoreRepository_ = longhornUserStoreRepository
    this.longhornStoreProductRepository_ = longhornStoreProductRepository
  }
  // ======= MÉTODOS DE ROLES =======
  
  async createRole(data: {
    name: string
    type: RoleType
    description?: string
    permissions?: Record<string, any>
    metadata?: Record<string, any>
  }) {
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

  async updateRole(id: string, data: {
    name?: string
    type?: RoleType
    description?: string
    permissions?: Record<string, any>
    metadata?: Record<string, any>
  }) {
    return await this.longhornRoleRepository_.update(id, data)
  }

  async deleteRole(id: string) {
    return await this.longhornRoleRepository_.delete(id)
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
    const existingStore = await this.longhornStoreRepository_.findOne({
      where: {
        code: data.code,
        deleted_at: null
      }
    })

    if (existingStore) {
      throw new Error(`Store with code ${data.code} already exists`)
    }

    return await this.longhornStoreRepository_.create(data)
  }

  async getActiveStores() {
    return await this.longhornStoreRepository_.find({
      where: {
        is_active: true,
        deleted_at: null
      }
    })
  }

  async getStoreByCode(code: string) {
    return await this.longhornStoreRepository_.findOne({
      where: {
        code,
        deleted_at: null
      }
    })
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
    return await this.longhornStoreRepository_.update(id, data)
  }

  async deactivateStore(id: string) {
    return await this.longhornStoreRepository_.update(id, {
      is_active: false
    })
  }

  async deleteStore(id: string) {
    return await this.longhornStoreRepository_.delete(id)
  }

  // ======= MÉTODOS DE USUARIO-ROL =======

  async assignRole(data: {
    user_id: string
    role_id: string
    store_id?: string
    metadata?: Record<string, any>
  }) {
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

  // ======= MÉTODOS DE USUARIO-TIENDA =======

  async assignUserToStore(data: {
    user_id: string
    store_id: string
    metadata?: Record<string, any>
  }) {
    // Verificar que no exista ya una asignación activa
    const existingAssignment = await this.longhornUserStoreRepository_.findOne({
      where: {
        user_id: data.user_id,
        store_id: data.store_id,
        is_active: true,
        deleted_at: null
      }
    })

    if (existingAssignment) {
      throw new Error(`User is already assigned to this store`)
    }

    return await this.longhornUserStoreRepository_.create(data)
  }

  async getUserStores(user_id: string) {
    return await this.longhornUserStoreRepository_.find({
      where: {
        user_id,
        is_active: true,
        deleted_at: null
      }
    })
  }

  async getStoreUsers(store_id: string) {
    return await this.longhornUserStoreRepository_.find({
      where: {
        store_id,
        is_active: true,
        deleted_at: null
      }
    })
  }

  async removeUserFromStore(user_id: string, store_id: string) {
    const userStore = await this.longhornUserStoreRepository_.findOne({
      where: {
        user_id,
        store_id,
        is_active: true,
        deleted_at: null
      }
    })

    if (!userStore) {
      throw new Error(`User store assignment not found`)
    }

    return await this.longhornUserStoreRepository_.delete(userStore.id)
  }

  async hasAccessToStore(user_id: string, store_id: string): Promise<boolean> {
    const userStore = await this.longhornUserStoreRepository_.findOne({
      where: {
        user_id,
        store_id,
        is_active: true,
        deleted_at: null
      }
    })

    return !!userStore
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
    const existingAssignment = await this.longhornStoreProductRepository_.findOne({
      where: {
        store_id: data.store_id,
        product_id: data.product_id,
        deleted_at: null
      }
    })

    if (existingAssignment) {
      throw new Error(`Product is already assigned to this store`)
    }

    return await this.longhornStoreProductRepository_.create({
      is_available: true,
      is_visible: true,
      ...data
    })
  }

  async getStoreProducts(store_id: string, options?: {
    available_only?: boolean
    visible_only?: boolean
  }) {
    const where: any = {
      store_id,
      deleted_at: null
    }

    if (options?.available_only) {
      where.is_available = true
    }

    if (options?.visible_only) {
      where.is_visible = true
    }

    return await this.longhornStoreProductRepository_.find({
      where
    })
  }

  async getProductStores(product_id: string) {
    return await this.longhornStoreProductRepository_.find({
      where: {
        product_id,
        deleted_at: null
      }
    })
  }

  async updateStoreProduct(store_id: string, product_id: string, data: {
    is_available?: boolean
    is_visible?: boolean
    store_specific_settings?: Record<string, any>
    metadata?: Record<string, any>
  }) {
    const storeProduct = await this.longhornStoreProductRepository_.findOne({
      where: {
        store_id,
        product_id,
        deleted_at: null
      }
    })

    if (!storeProduct) {
      throw new Error(`Store product assignment not found`)
    }

    return await this.longhornStoreProductRepository_.update(storeProduct.id, data)
  }

  async removeProductFromStore(store_id: string, product_id: string) {
    const storeProduct = await this.longhornStoreProductRepository_.findOne({
      where: {
        store_id,
        product_id,
        deleted_at: null
      }
    })

    if (!storeProduct) {
      throw new Error(`Store product assignment not found`)
    }

    return await this.longhornStoreProductRepository_.delete(storeProduct.id)
  }

  async isProductAvailableInStore(store_id: string, product_id: string): Promise<boolean> {
    const storeProduct = await this.longhornStoreProductRepository_.findOne({
      where: {
        store_id,
        product_id,
        is_available: true,
        is_visible: true,
        deleted_at: null
      }
    })

    return !!storeProduct
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
    const userRoles = await this.getUserRoles(user_id)
    
    // Verificar si tiene un rol de tipo SUPER_ADMIN
    // Como no tenemos relación directa con el modelo Role, usaremos una consulta manual
    for (const userRole of userRoles) {
      // TODO: Implementar consulta para verificar el tipo de rol
      // Por ahora verificamos por role_id conocidos
    }
    
    return false
  }

  async isStoreManager(user_id: string, store_id: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(user_id, store_id)
    
    // TODO: Implementar verificación del tipo de rol
    return userRoles.length > 0
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