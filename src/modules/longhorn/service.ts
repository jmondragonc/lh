import { MedusaService } from "@medusajs/framework/utils";
import LonghornRole from "./models/role";
import LonghornStore from "./models/store";
import LonghornUserRole from "./models/user-role";
import LonghornUserStore from "./models/user-store";
import LonghornStoreProduct from "./models/store-product";
import LonghornMenuCategory from "./models/menu-category";
import LonghornMenuItem from "./models/menu-item";
import LonghornStoreMenuItem from "./models/store-menu-item";
import LonghornGiftCard from "./models/gift-card";
import LonghornGiftCardTransaction from "./models/gift-card-transaction";
import { ROLE_TYPES, RoleType } from "./models/role";
import { MENU_CATEGORY_TYPES } from "./models/menu-category";
import { DISH_TYPES, COOKING_POINTS, SPICE_LEVELS } from "./models/menu-item";
import { GIFT_CARD_DELIVERY_STATUS } from "./models/gift-card";
import { GIFT_CARD_TRANSACTION_TYPES } from "./models/gift-card-transaction";
import type { GiftCardDeliveryStatus, GiftCardTransactionType } from "./models";

/**
 * Servicio principal del módulo Longhorn
 * Este servicio maneja todos los modelos del sistema:
 * - Roles (LonghornRole)
 * - Tiendas/Locales (LonghornStore)
 * - Asignación Usuario-Rol (LonghornUserRole)
 * - Asignación Usuario-Tienda (LonghornUserStore)
 * - Productos por Tienda (LonghornStoreProduct)
 * - Categorías de Menú (LonghornMenuCategory)
 * - Items de Menú (LonghornMenuItem)
 * - Items de Menú por Tienda (LonghornStoreMenuItem)
 * - Gift Cards (LonghornGiftCard)
 * - Transacciones de Gift Cards (LonghornGiftCardTransaction)
 */
class LonghornModuleService extends MedusaService({
  LonghornRole,
  LonghornStore,
  LonghornUserRole,
  LonghornUserStore,
  LonghornStoreProduct,
  LonghornMenuCategory,
  LonghornMenuItem,
  LonghornStoreMenuItem,
  LonghornGiftCard,
  LonghornGiftCardTransaction,
}) {
  // ======= MÉTODOS DE ROLES =======

  async createRole(data: {
    name: string;
    type: RoleType;
    description?: string;
    permissions?: Record<string, any>;
    metadata?: Record<string, any>;
  }) {
    return await this.createLonghornRoles([data]);
  }

  async getRolesByType(type: RoleType) {
    return await this.listLonghornRoles({
      type,
      deleted_at: null,
    });
  }

  async getActiveRoles() {
    return await this.listLonghornRoles({
      is_active: true,
      deleted_at: null,
    });
  }

  async getAllRoles() {
    return await this.listLonghornRoles({
      deleted_at: null,
    });
  }

  async updateRole(
    id: string,
    data: {
      name?: string;
      type?: RoleType;
      description?: string;
      permissions?: Record<string, any>;
      metadata?: Record<string, any>;
    }
  ) {
    return await this.updateLonghornRoles([{ id, ...data }]);
  }

  async deleteRole(id: string) {
    return await this.deleteLonghornRoles([id]);
  }

  // ======= MÉTODOS DE TIENDAS =======

  async createStore(data: {
    name: string;
    code: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    business_hours?: Record<string, any>;
    delivery_settings?: Record<string, any>;
    metadata?: Record<string, any>;
  }) {
    // Verificar que el código sea único
    const existingStores = await this.listLonghornStores({
      code: data.code,
      deleted_at: null,
    });

    if (existingStores.length > 0) {
      throw new Error(`Store with code ${data.code} already exists`);
    }

    const createdStores = await this.createLonghornStores([data]);
    return createdStores[0];
  }

  async getActiveStores() {
    return await this.listLonghornStores({
      is_active: true,
      deleted_at: null,
    });
  }

  async getStoreByCode(code: string) {
    const stores = await this.listLonghornStores({
      code,
      deleted_at: null,
    });
    return stores[0] || null;
  }

  async updateStore(
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string;
      address?: string;
      phone?: string;
      email?: string;
      business_hours?: Record<string, any>;
      delivery_settings?: Record<string, any>;
      metadata?: Record<string, any>;
    }
  ) {
    const updatedStores = await this.updateLonghornStores([{ id, ...data }]);
    return updatedStores[0];
  }

  async deactivateStore(id: string) {
    const updatedStores = await this.updateLonghornStores([
      {
        id,
        is_active: false,
      },
    ]);
    return updatedStores[0];
  }

  async deleteStore(id: string) {
    return await this.deleteLonghornStores([id]);
  }

  // ======= MÉTODOS DE USUARIO-ROL =======

  async assignRole(data: {
    user_id: string;
    role_id: string;
    store_id?: string;
    metadata?: Record<string, any>;
  }) {
    // Verificar que no exista ya una asignación activa
    const existingAssignments = await this.listLonghornUserRoles({
      user_id: data.user_id,
      role_id: data.role_id,
      store_id: data.store_id || null,
      is_active: true,
      deleted_at: null,
    });

    if (existingAssignments.length > 0) {
      throw new Error(`User already has this role assigned`);
    }

    const createdUserRoles = await this.createLonghornUserRoles([data]);
    return createdUserRoles[0];
  }

  async getUserRoles(user_id: string, store_id?: string) {
    // console.log(
    //   "🔍 getUserRoles called with user_id:",
    //   user_id,
    //   "store_id:",
    //   store_id
    // );

    const filters: any = {
      user_id,
      is_active: true,
      deleted_at: null,
    };

    if (store_id !== undefined) {
      filters.store_id = store_id;
    }

    // Obtener user roles
    const userRoles = await this.listLonghornUserRoles(filters);
    //console.log("🔍 Found", userRoles.length, "user roles for user", user_id);

    // Hacer JOIN manual con roles
    const enrichedUserRoles = await Promise.all(
      userRoles.map(async (userRole) => {
        //console.log("🔍 Enriching userRole with role_id:", userRole.role_id);
        const roles = await this.listLonghornRoles({ id: userRole.role_id });
        const role = roles[0] || null;

        if (role) {
          // console.log("🔍 Found role for enrichment:", {
          //   name: role.name,
          //   type: role.type,
          // });
        } else {
          console.log("⚠️ No role found for role_id:", userRole.role_id);
        }

        return {
          ...userRole,
          role: role,
        };
      })
    );

    // console.log(
    //   "🔍 Returning",
    //   enrichedUserRoles.length,
    //   "enriched user roles"
    // );
    return enrichedUserRoles;
  }

  async getUsersByRoleType(role_type: RoleType, store_id?: string) {
    const filters: any = {
      is_active: true,
      deleted_at: null,
    };

    if (store_id !== undefined) {
      filters.store_id = store_id;
    }

    // Obtener user roles
    const userRoles = await this.listLonghornUserRoles(filters);

    // Hacer JOIN manual con roles y filtrar por tipo
    const enrichedUserRoles = await Promise.all(
      userRoles.map(async (userRole) => {
        const roles = await this.listLonghornRoles({ id: userRole.role_id });
        const role = roles[0] || null;

        return {
          ...userRole,
          role: role,
        };
      })
    );

    // Filtrar por tipo de rol
    return enrichedUserRoles.filter(
      (userRole) => userRole.role?.type === role_type
    );
  }

  async removeUserRole(user_id: string, role_id: string, store_id?: string) {
    const userRoles = await this.listLonghornUserRoles({
      user_id,
      role_id,
      store_id: store_id || null,
      is_active: true,
      deleted_at: null,
    });

    if (userRoles.length === 0) {
      throw new Error(`User role assignment not found`);
    }

    return await this.deleteLonghornUserRoles([userRoles[0].id]);
  }

  async deactivateUserRole(
    user_id: string,
    role_id: string,
    store_id?: string
  ) {
    const userRoles = await this.listLonghornUserRoles({
      user_id,
      role_id,
      store_id: store_id || null,
      is_active: true,
      deleted_at: null,
    });

    if (userRoles.length === 0) {
      throw new Error(`User role assignment not found`);
    }

    const updatedUserRoles = await this.updateLonghornUserRoles([
      {
        id: userRoles[0].id,
        is_active: false,
      },
    ]);
    return updatedUserRoles[0];
  }

  // ======= MÉTODOS DE USUARIO-TIENDA =======

  async assignUserToStore(data: {
    user_id: string;
    store_id: string;
    metadata?: Record<string, any>;
  }) {
    // Verificar que no exista ya una asignación activa
    const existingAssignments = await this.listLonghornUserStores({
      user_id: data.user_id,
      store_id: data.store_id,
      is_active: true,
      deleted_at: null,
    });

    if (existingAssignments.length > 0) {
      throw new Error(`User is already assigned to this store`);
    }

    const createdUserStores = await this.createLonghornUserStores([data]);
    return createdUserStores[0];
  }

  async getUserStores(user_id: string) {
    const userStores = await this.listLonghornUserStores({
      user_id,
      is_active: true,
      deleted_at: null,
    });

    // Hacer JOIN manual con stores
    const enrichedUserStores = await Promise.all(
      userStores.map(async (userStore) => {
        const stores = await this.listLonghornStores({
          id: userStore.store_id,
        });
        const store = stores[0] || null;

        return {
          ...userStore,
          store: store,
        };
      })
    );

    return enrichedUserStores;
  }

  async getStoreUsers(store_id: string) {
    return await this.listLonghornUserStores({
      store_id,
      is_active: true,
      deleted_at: null,
    });
  }

  async removeUserFromStore(user_id: string, store_id: string) {
    const userStores = await this.listLonghornUserStores({
      user_id,
      store_id,
      is_active: true,
      deleted_at: null,
    });

    if (userStores.length === 0) {
      throw new Error(`User store assignment not found`);
    }

    return await this.deleteLonghornUserStores([userStores[0].id]);
  }

  async hasAccessToStore(user_id: string, store_id: string): Promise<boolean> {
    const userStores = await this.listLonghornUserStores({
      user_id,
      store_id,
      is_active: true,
      deleted_at: null,
    });

    return userStores.length > 0;
  }

  // ======= MÉTODOS DE PRODUCTOS POR TIENDA =======

  async assignProductToStore(data: {
    store_id: string;
    product_id: string;
    is_available?: boolean;
    is_visible?: boolean;
    store_specific_settings?: Record<string, any>;
    metadata?: Record<string, any>;
  }) {
    // Verificar que no exista ya una asignación
    const existingAssignments = await this.listLonghornStoreProducts({
      store_id: data.store_id,
      product_id: data.product_id,
      deleted_at: null,
    });

    if (existingAssignments.length > 0) {
      throw new Error(`Product is already assigned to this store`);
    }

    const storeProductData = {
      is_available: true,
      is_visible: true,
      ...data,
    };

    const createdStoreProducts = await this.createLonghornStoreProducts([
      storeProductData,
    ]);
    return createdStoreProducts[0];
  }

  async getStoreProducts(
    store_id: string,
    options?: {
      available_only?: boolean;
      visible_only?: boolean;
    }
  ) {
    const filters: any = {
      store_id,
      deleted_at: null,
    };

    if (options?.available_only) {
      filters.is_available = true;
    }

    if (options?.visible_only) {
      filters.is_visible = true;
    }

    return await this.listLonghornStoreProducts(filters);
  }

  async getProductStores(product_id: string) {
    return await this.listLonghornStoreProducts({
      product_id,
      deleted_at: null,
    });
  }

  async updateStoreProduct(
    store_id: string,
    product_id: string,
    data: {
      is_available?: boolean;
      is_visible?: boolean;
      store_specific_settings?: Record<string, any>;
      metadata?: Record<string, any>;
    }
  ) {
    const storeProducts = await this.listLonghornStoreProducts({
      store_id,
      product_id,
      deleted_at: null,
    });

    if (storeProducts.length === 0) {
      throw new Error(`Store product assignment not found`);
    }

    const updatedStoreProducts = await this.updateLonghornStoreProducts([
      {
        id: storeProducts[0].id,
        ...data,
      },
    ]);
    return updatedStoreProducts[0];
  }

  async removeProductFromStore(store_id: string, product_id: string) {
    const storeProducts = await this.listLonghornStoreProducts({
      store_id,
      product_id,
      deleted_at: null,
    });

    if (storeProducts.length === 0) {
      throw new Error(`Store product assignment not found`);
    }

    return await this.deleteLonghornStoreProducts([storeProducts[0].id]);
  }

  async isProductAvailableInStore(
    store_id: string,
    product_id: string
  ): Promise<boolean> {
    const storeProducts = await this.listLonghornStoreProducts({
      store_id,
      product_id,
      is_available: true,
      is_visible: true,
      deleted_at: null,
    });

    return storeProducts.length > 0;
  }

  async bulkAssignProducts(store_id: string, product_ids: string[]) {
    const assignments = [];

    for (const product_id of product_ids) {
      try {
        const assignment = await this.assignProductToStore({
          store_id,
          product_id,
        });
        assignments.push(assignment);
      } catch (error) {
        // Skip if already assigned
        // console.warn(
        //   `Product ${product_id} already assigned to store ${store_id}`
        // );
      }
    }

    return assignments;
  }

  // ======= MÉTODOS DE PERMISOS Y LÓGICA DE NEGOCIO =======

  async hasPermission(
    user_id: string,
    permission: string,
    store_id?: string
  ): Promise<boolean> {
    const userRoles = await this.getUserRoles(user_id, store_id);

    // Por ahora retornamos true si tiene algún rol
    // TODO: Implementar lógica de permisos cuando tengamos los roles poblados
    return userRoles.length > 0;
  }

  async isSuperAdmin(user_id: string): Promise<boolean> {
    // console.log("\n🔍 === isSuperAdmin CHECK ===");
    // console.log("🔍 Checking user_id:", user_id);
    // console.log("🔍 Expected SUPER_ADMIN type value:", ROLE_TYPES.SUPER_ADMIN);

    // Detectar IDs ficticios para simulación
    if (
      user_id === "super_admin_user_id" ||
      user_id === "manager_user_id" ||
      user_id === "staff_user_id"
    ) {
      // console.log("🎭 SIMULATION MODE: Using fictional ID for testing");
      // console.log("🎭 Fictional ID:", user_id);

      // Por convención, solo 'super_admin_user_id' es Super Admin para testing
      const result = user_id === "super_admin_user_id";
      // console.log(
      //   "🎭 Simulation result for",
      //   user_id,
      //   ":",
      //   result ? "IS Super Admin" : "NOT Super Admin"
      // );
      return result;
    }

    try {
      // Buscar roles del usuario real
      const userRoles = await this.listLonghornUserRoles({
        user_id,
        is_active: true,
        deleted_at: null,
      });

      // console.log("🔍 Found user roles for", user_id, ":", userRoles.length);
      // console.log(
      //   "🔍 User roles details:",
      //   userRoles.map((ur) => ({
      //     role_id: ur.role_id,
      //     is_active: ur.is_active,
      //     user_id: ur.user_id,
      //   }))
      // );

      if (userRoles.length === 0) {
        //console.log("❌ No roles found for user", user_id);
        return false;
      }

      // Verificar cada rol manualmente
      for (const userRole of userRoles) {
        //console.log('\n🔍 Checking user role ID:', userRole.role_id)

        const roles = await this.listLonghornRoles({ id: userRole.role_id });
        //console.log('🔍 Found roles for ID', userRole.role_id, ':', roles.length)

        if (roles.length === 0) {
          //console.log('⚠️ No role found for ID:', userRole.role_id)
          continue;
        }

        const role = roles[0];

        // console.log('🔍 Found role details:')
        // console.log('  - ID:', role.id)
        // console.log('  - Name:', role.name)
        // console.log('  - Type:', role.type)
        // console.log('  - Expected SUPER_ADMIN:', ROLE_TYPES.SUPER_ADMIN)
        // console.log('  - Types match?', role.type === ROLE_TYPES.SUPER_ADMIN)
        // console.log('  - String comparison:', `"${role.type}" === "${ROLE_TYPES.SUPER_ADMIN}"`)

        if (role.type === ROLE_TYPES.SUPER_ADMIN) {
          // console.log('✅ SUPER ADMIN ROLE CONFIRMED!')
          // console.log('✅ User', user_id, 'IS Super Admin')
          // console.log('✅ Role details:', { name: role.name, type: role.type })
          return true;
        } else {
          // console.log('❌ Role type does not match SUPER_ADMIN')
          // console.log('❌ This role type:', `"${role.type}"`)
          // console.log('❌ Expected type:', `"${ROLE_TYPES.SUPER_ADMIN}"`)
        }
      }

      // console.log('\n❌ FINAL RESULT: User', user_id, 'is NOT Super Admin')
      // console.log('❌ None of their roles have SUPER_ADMIN type')
      return false;
    } catch (error) {
      // console.error('🚨 ERROR in isSuperAdmin check:', error)
      // console.error('🚨 Error details:', error.message)
      // console.error('🚨 Stack trace:', error.stack)
      // console.error('🚨 Defaulting to NOT Super Admin for security')
      return false;
    }
  }

  async isStoreManager(user_id: string, store_id: string): Promise<boolean> {
    const userRoles = await this.listLonghornUserRoles({
      user_id,
      store_id,
      is_active: true,
      deleted_at: null,
    });

    // Verificar cada rol manualmente
    for (const userRole of userRoles) {
      const roles = await this.listLonghornRoles({ id: userRole.role_id });
      const role = roles[0];

      if (role?.type === ROLE_TYPES.STORE_MANAGER) {
        return true;
      }
    }

    return false;
  }

  async canManageUser(
    manager_user_id: string,
    target_user_id: string,
    store_id?: string
  ): Promise<boolean> {
    // Super admin puede gestionar a cualquiera
    if (await this.isSuperAdmin(manager_user_id)) {
      return true;
    }

    // Store manager puede gestionar staff de su tienda
    if (store_id && (await this.isStoreManager(manager_user_id, store_id))) {
      // TODO: Verificar que el target user sea solo staff
      return true;
    }

    return false;
  }

  /**
   * Filtrar roles basado en la jerarquía del usuario actual
   * REGLA CRÍTICA: Usuarios menores NO ven Super Admin
   */
  async getFilteredRoles(
    currentUserId?: string
  ): Promise<{ roles: any[]; isFiltered: boolean }> {
    try {
      // console.log(
      //   "🔍 getFilteredRoles called with currentUserId:",
      //   currentUserId
      // );

      // Si no hay usuario actual, mostrar todos los roles (para APIs internas)
      if (!currentUserId) {
        const allRoles = await this.getAllRoles();
        // console.log(
        //   "🔍 No current user - returning all roles:",
        //   allRoles.length
        // );
        return { roles: allRoles, isFiltered: false };
      }

      // Verificar si el usuario actual es Super Admin
      const isSuperAdmin = await this.isSuperAdmin(currentUserId);
      //console.log("🔍 Current user is Super Admin?", isSuperAdmin);

      if (isSuperAdmin) {
        // Super Admin ve todos los roles
        const allRoles = await this.getAllRoles();
        //console.log("🔍 Super Admin - returning all roles:", allRoles.length);
        return { roles: allRoles, isFiltered: false };
      } else {
        // Usuarios menores NO ven roles Super Admin
        const allRoles = await this.getAllRoles();
        // console.log("🔍 All roles before filtering:", allRoles.length);
        // console.log(
        //   "🔍 Role types:",
        //   allRoles.map((r) => ({ name: r.name, type: r.type }))
        // );

        const filteredRoles = allRoles.filter((role) => {
          const isNotSuperAdmin = role.type !== ROLE_TYPES.SUPER_ADMIN;
          // console.log(
          //   `🔍 Role "${role.name}" (${role.type}) - keeping: ${isNotSuperAdmin}`
          // );
          return isNotSuperAdmin;
        });

        // console.log(
        //   "🔍 Filtered roles (removed Super Admin):",
        //   filteredRoles.length
        // );
        // console.log(
        //   "🔍 Filtered role types:",
        //   filteredRoles.map((r) => ({ name: r.name, type: r.type }))
        // );

        return { roles: filteredRoles, isFiltered: true };
      }
    } catch (error) {
      //console.error("🚨 Error filtering roles:", error);
      // En caso de error, mostrar roles básicos sin Super Admin por seguridad
      const allRoles = await this.getAllRoles();
      const safeRoles = allRoles.filter(
        (role) => role.type !== ROLE_TYPES.SUPER_ADMIN
      );
      // console.log(
      //   "🚨 Error fallback - returning safe roles:",
      //   safeRoles.length
      // );
      return { roles: safeRoles, isFiltered: true };
    }
  }

  /**
   * Filtrar usuarios basado en la jerarquía del usuario actual
   * REGLA CRÍTICA: Usuarios menores NO ven Super Admins
   */
  async getFilteredUsers(
    currentUserId?: string
  ): Promise<{ users: any[]; isFiltered: boolean }> {
    try {
      // Si no hay usuario actual, mostrar todos (para APIs internas)
      if (!currentUserId) {
        return { users: [], isFiltered: false };
      }

      // Verificar si el usuario actual es Super Admin
      const isSuperAdmin = await this.isSuperAdmin(currentUserId);

      if (isSuperAdmin) {
        // Super Admin ve todos los usuarios
        return { users: [], isFiltered: false }; // Se manejará en la API
      } else {
        // Usuarios menores NO ven Super Admins
        return { users: [], isFiltered: true }; // Se manejará en la API
      }
    } catch (error) {
      //console.error("Error filtering users:", error);
      // En caso de error, filtrar por seguridad
      return { users: [], isFiltered: true };
    }
  }

  /**
   * Verificar si un usuario puede crear un tipo de rol específico
   */
  async canCreateRole(
    currentUserId: string,
    targetRoleType: RoleType
  ): Promise<boolean> {
    try {
      // Solo Super Admin puede crear roles Super Admin
      if (targetRoleType === ROLE_TYPES.SUPER_ADMIN) {
        return await this.isSuperAdmin(currentUserId);
      }

      // Super Admin puede crear cualquier rol
      if (await this.isSuperAdmin(currentUserId)) {
        return true;
      }

      // Gerente Local puede crear solo Personal Local
      if (targetRoleType === ROLE_TYPES.STORE_STAFF) {
        // Verificar si es gerente en alguna tienda
        const userRoles = await this.getUserRoles(currentUserId);
        return userRoles.some(
          (userRole) => userRole.role?.type === ROLE_TYPES.STORE_MANAGER
        );
      }

      // Personal Local no puede crear roles
      return false;
    } catch (error) {
      //console.error("Error checking role creation permission:", error);
      return false; // Por seguridad, denegar en caso de error
    }
  }

  /**
   * Verificar si un usuario puede editar un rol específico
   */
  async canEditRole(
    currentUserId: string,
    targetRoleType: RoleType
  ): Promise<boolean> {
    try {
      // Solo Super Admin puede editar roles Super Admin
      if (targetRoleType === ROLE_TYPES.SUPER_ADMIN) {
        return await this.isSuperAdmin(currentUserId);
      }

      // Super Admin puede editar cualquier rol
      if (await this.isSuperAdmin(currentUserId)) {
        return true;
      }

      // Otros usuarios no pueden editar roles
      return false;
    } catch (error) {
      //console.error("Error checking role edit permission:", error);
      return false; // Por seguridad, denegar en caso de error
    }
  }

  // ======= MÉTODOS DE CATEGORÍAS DE MENÚ =======

  async createMenuCategory(data: {
    name: string;
    description?: string;
    type: string;
    display_order?: number;
    icon_url?: string;
    is_active?: boolean;
    parent_category_id?: string;
    metadata?: Record<string, any>;
  }) {
    const categoryData = {
      is_active: true,
      display_order: 0,
      ...data,
    };

    const createdCategories = await this.createLonghornMenuCategories([
      categoryData,
    ]);
    return createdCategories[0];
  }

  async getActiveMenuCategories() {
    return await this.listLonghornMenuCategories({
      is_active: true,
      deleted_at: null,
    });
  }

  async getMenuCategoriesByType(type: string) {
    return await this.listLonghornMenuCategories({
      type,
      is_active: true,
      deleted_at: null,
    });
  }

  async getMenuCategoryById(id: string) {
    const categories = await this.listLonghornMenuCategories({
      id,
      deleted_at: null,
    });
    return categories[0] || null;
  }

  async updateMenuCategory(
    id: string,
    data: {
      name?: string;
      description?: string;
      type?: string;
      display_order?: number;
      icon_url?: string;
      is_active?: boolean;
      parent_category_id?: string;
      metadata?: Record<string, any>;
    }
  ) {
    const updatedCategories = await this.updateLonghornMenuCategories([
      { id, ...data },
    ]);
    return updatedCategories[0];
  }

  async deleteMenuCategory(id: string) {
    return await this.deleteLonghornMenuCategories([id]);
  }

  // ======= MÉTODOS DE ITEMS DE MENÚ =======

  async createMenuItem(data: {
    name: string;
    description?: string;
    short_description?: string;
    menu_category_id: string;
    dish_type: string;
    ingredients?: string[];
    allergens?: string[];
    cooking_points_available?: string[];
    spice_level?: string;
    calories?: number;
    proteins?: number;
    carbs?: number;
    fats?: number;
    weight?: number;
    base_price: number;
    preparation_time?: number;
    image_url?: string;
    gallery_urls?: string[];
    is_active?: boolean;
    is_popular?: boolean;
    is_new?: boolean;
    is_spicy?: boolean;
    is_vegetarian?: boolean;
    is_vegan?: boolean;
    is_gluten_free?: boolean;
    display_order?: number;
    min_age_required?: number;
    metadata?: Record<string, any>;
  }) {
    const itemData = {
      spice_level: "SIN_PICANTE",
      preparation_time: 15,
      is_active: true,
      is_popular: false,
      is_new: false,
      is_spicy: false,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      display_order: 0,
      ...data,
    };

    const createdItems = await this.createLonghornMenuItems([itemData]);
    return createdItems[0];
  }

  async getActiveMenuItems() {
    return await this.listLonghornMenuItems({
      is_active: true,
      deleted_at: null,
    });
  }

  async getMenuItemsByCategory(menu_category_id: string) {
    return await this.listLonghornMenuItems({
      menu_category_id,
      is_active: true,
      deleted_at: null,
    });
  }

  async getMenuItemById(id: string) {
    const items = await this.listLonghornMenuItems({
      id,
      deleted_at: null,
    });
    return items[0] || null;
  }

  async getPopularMenuItems() {
    return await this.listLonghornMenuItems({
      is_popular: true,
      is_active: true,
      deleted_at: null,
    });
  }

  async getNewMenuItems() {
    return await this.listLonghornMenuItems({
      is_new: true,
      is_active: true,
      deleted_at: null,
    });
  }

  async updateMenuItem(
    id: string,
    data: {
      name?: string;
      description?: string;
      short_description?: string;
      menu_category_id?: string;
      dish_type?: string;
      ingredients?: string[];
      allergens?: string[];
      cooking_points_available?: string[];
      spice_level?: string;
      calories?: number;
      proteins?: number;
      carbs?: number;
      fats?: number;
      weight?: number;
      base_price?: number;
      preparation_time?: number;
      image_url?: string;
      gallery_urls?: string[];
      is_active?: boolean;
      is_popular?: boolean;
      is_new?: boolean;
      is_spicy?: boolean;
      is_vegetarian?: boolean;
      is_vegan?: boolean;
      is_gluten_free?: boolean;
      display_order?: number;
      min_age_required?: number;
      metadata?: Record<string, any>;
    }
  ) {
    const updatedItems = await this.updateLonghornMenuItems([{ id, ...data }]);
    return updatedItems[0];
  }

  async deleteMenuItem(id: string) {
    return await this.deleteLonghornMenuItems([id]);
  }

  // ======= MÉTODOS DE ITEMS DE MENÚ POR TIENDA =======

  async assignMenuItemToStore(data: {
    store_id: string;
    menu_item_id: string;
    is_available?: boolean;
    is_visible_in_menu?: boolean;
    store_price?: number;
    discount_percentage?: number;
    store_name?: string;
    store_description?: string;
    store_image_url?: string;
    daily_limit?: number;
    current_stock?: number;
    estimated_prep_time?: number;
    available_hours?: Record<string, any>;
    unavailable_dates?: string[];
    display_order?: number;
    is_featured?: boolean;
    promotion_text?: string;
    metadata?: Record<string, any>;
  }) {
    // Verificar que no exista ya una asignación
    const existingAssignments = await this.listLonghornStoreMenuItems({
      store_id: data.store_id,
      menu_item_id: data.menu_item_id,
      deleted_at: null,
    });

    if (existingAssignments.length > 0) {
      throw new Error(`Menu item is already assigned to this store`);
    }

    const storeMenuItemData = {
      is_available: true,
      is_visible_in_menu: true,
      is_featured: false,
      times_ordered: 0,
      ...data,
    };

    const createdStoreMenuItems = await this.createLonghornStoreMenuItems([
      storeMenuItemData,
    ]);
    return createdStoreMenuItems[0];
  }

  async getStoreMenuItems(
    store_id: string,
    options?: {
      available_only?: boolean;
      visible_only?: boolean;
      featured_only?: boolean;
      category_id?: string;
    }
  ) {
    const filters: any = {
      store_id,
      deleted_at: null,
    };

    if (options?.available_only) {
      filters.is_available = true;
    }

    if (options?.visible_only) {
      filters.is_visible_in_menu = true;
    }

    if (options?.featured_only) {
      filters.is_featured = true;
    }

    const storeMenuItems = await this.listLonghornStoreMenuItems(filters);

    // Si se solicita filtrar por categoría, hacer JOIN manual
    if (options?.category_id) {
      const enrichedItems = await Promise.all(
        storeMenuItems.map(async (storeMenuItem) => {
          const menuItems = await this.listLonghornMenuItems({
            id: storeMenuItem.menu_item_id,
          });
          const menuItem = menuItems[0];

          return {
            ...storeMenuItem,
            menu_item: menuItem,
          };
        })
      );

      return enrichedItems.filter(
        (item) => item.menu_item?.menu_category_id === options.category_id
      );
    }

    return storeMenuItems;
  }

  async getMenuItemStores(menu_item_id: string) {
    return await this.listLonghornStoreMenuItems({
      menu_item_id,
      deleted_at: null,
    });
  }

  async updateStoreMenuItem(
    store_id: string,
    menu_item_id: string,
    data: {
      is_available?: boolean;
      is_visible_in_menu?: boolean;
      store_price?: number;
      discount_percentage?: number;
      store_name?: string;
      store_description?: string;
      store_image_url?: string;
      daily_limit?: number;
      current_stock?: number;
      estimated_prep_time?: number;
      available_hours?: Record<string, any>;
      unavailable_dates?: string[];
      display_order?: number;
      is_featured?: boolean;
      promotion_text?: string;
      metadata?: Record<string, any>;
    }
  ) {
    const storeMenuItems = await this.listLonghornStoreMenuItems({
      store_id,
      menu_item_id,
      deleted_at: null,
    });

    if (storeMenuItems.length === 0) {
      throw new Error(`Store menu item assignment not found`);
    }

    const updatedStoreMenuItems = await this.updateLonghornStoreMenuItems([
      {
        id: storeMenuItems[0].id,
        ...data,
      },
    ]);
    return updatedStoreMenuItems[0];
  }

  async removeMenuItemFromStore(store_id: string, menu_item_id: string) {
    const storeMenuItems = await this.listLonghornStoreMenuItems({
      store_id,
      menu_item_id,
      deleted_at: null,
    });

    if (storeMenuItems.length === 0) {
      throw new Error(`Store menu item assignment not found`);
    }

    return await this.deleteLonghornStoreMenuItems([storeMenuItems[0].id]);
  }

  async isMenuItemAvailableInStore(
    store_id: string,
    menu_item_id: string
  ): Promise<boolean> {
    const storeMenuItems = await this.listLonghornStoreMenuItems({
      store_id,
      menu_item_id,
      is_available: true,
      is_visible_in_menu: true,
      deleted_at: null,
    });

    return storeMenuItems.length > 0;
  }

  async bulkAssignMenuItems(store_id: string, menu_item_ids: string[]) {
    const assignments = [];

    for (const menu_item_id of menu_item_ids) {
      try {
        const assignment = await this.assignMenuItemToStore({
          store_id,
          menu_item_id,
        });
        assignments.push(assignment);
      } catch (error) {
        // Skip if already assigned
        console.warn(
          `Menu item ${menu_item_id} already assigned to store ${store_id}`
        );
      }
    }

    return assignments;
  }

  async incrementMenuItemOrders(store_id: string, menu_item_id: string) {
    const storeMenuItems = await this.listLonghornStoreMenuItems({
      store_id,
      menu_item_id,
      deleted_at: null,
    });

    if (storeMenuItems.length > 0) {
      const storeMenuItem = storeMenuItems[0];
      await this.updateLonghornStoreMenuItems([
        {
          id: storeMenuItem.id,
          times_ordered: (storeMenuItem.times_ordered || 0) + 1,
          last_ordered_at: new Date(),
        },
      ]);
    }
  }

  // ======= SEEDING DE DATOS INICIALES =======

  async seedDefaultRoles() {
    const existingRoles = await this.getActiveRoles();

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
            system_settings: true,
          },
        },
        {
          name: "Gerente de Local",
          type: ROLE_TYPES.STORE_MANAGER,
          description: "Gerente con acceso completo a su local asignado",
          permissions: {
            manage_store_staff: true,
            manage_store_menu: true,
            view_store_analytics: true,
            manage_store_settings: true,
          },
        },
        {
          name: "Personal de Local",
          type: ROLE_TYPES.STORE_STAFF,
          description: "Personal con acceso limitado a operaciones básicas",
          permissions: {
            view_store_orders: true,
            manage_order_status: true,
            view_store_menu: true,
          },
        },
      ];

      for (const roleData of defaultRoles) {
        await this.createRole(roleData);
      }

      return defaultRoles.length;
    }

    return 0;
  }

  async seedDefaultStores() {
    const existingStores = await this.getActiveStores();

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
            sunday: { open: "12:00", close: "22:00" },
          },
          delivery_settings: {
            enabled: true,
            delivery_radius: 5,
            min_order_amount: 50,
            delivery_fee: 10,
          },
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
            sunday: { open: "12:00", close: "22:00" },
          },
          delivery_settings: {
            enabled: true,
            delivery_radius: 8,
            min_order_amount: 60,
            delivery_fee: 12,
          },
        },
      ];

      const createdStores = [];
      for (const storeData of defaultStores) {
        const store = await this.createStore(storeData);
        createdStores.push(store);
      }

      return createdStores;
    }

    return [];
  }

  // ======= MÉTODOS DE GIFT CARDS =======

  async createGiftCard(data: {
    user_id?: string;
    code: string;
    initial_value: number | string;
    currency?: string;
    expiration_date?: Date | string;
    customer_id?: string;
    order_id?: string;
    notes?: string;
    sender_name?: string;
    recipient_name?: string;
    recipient_email?: string;
    message?: string;
    delivery_status?: GiftCardDeliveryStatus;
    metadata?: Record<string, any>;
  }) {
    // Verificar que el código sea único
    const existingGiftCards = await this.listLonghornGiftCards({
      code: data.code,
      deleted_at: null,
    });

    if (existingGiftCards.length > 0) {
      throw new Error(`Gift card with code ${data.code} already exists`);
    }

    const giftCardData = {
      currency: "PEN",
      delivery_status: GIFT_CARD_DELIVERY_STATUS.PENDING,
      balance: data.initial_value, // Balance inicial igual al valor inicial
      is_active: true,
      is_redeemed: false,
      ...data,
    };

    const createdGiftCards = await this.createLonghornGiftCards([giftCardData]);
    return createdGiftCards[0];
  }

  async getGiftCardByCode(code: string) {
    const giftCards = await this.listLonghornGiftCards({
      code,
      deleted_at: null,
    });
    return giftCards[0] || null;
  }

  async getActiveGiftCards(user_id?: string) {
    const filters: any = {
      is_active: true,
      deleted_at: null,
    };

    if (user_id) {
      filters.user_id = user_id;
    }

    return await this.listLonghornGiftCards(filters);
  }

  async getGiftCardsByCustomer(customer_id: string) {
    return await this.listLonghornGiftCards({
      customer_id,
      deleted_at: null,
    });
  }

  async updateGiftCard(
    id: string,
    data: {
      is_active?: boolean;
      expiration_date?: Date | string;
      notes?: string;
      sender_name?: string;
      recipient_name?: string;
      recipient_email?: string;
      message?: string;
      delivery_status?: GiftCardDeliveryStatus;
      metadata?: Record<string, any>;
    }
  ) {
    const updatedGiftCards = await this.updateLonghornGiftCards([
      { id, ...data },
    ]);
    return updatedGiftCards[0];
  }

  async deactivateGiftCard(id: string) {
    const updatedGiftCards = await this.updateLonghornGiftCards([
      {
        id,
        is_active: false,
      },
    ]);
    return updatedGiftCards[0];
  }

  async deleteGiftCard(id: string) {
    return await this.deleteLonghornGiftCards([id]);
  }

  // ======= MÉTODOS DE TRANSACCIONES DE GIFT CARDS =======

  async createGiftCardTransaction(data: {
    gift_card_id: string;
    transaction_type: GiftCardTransactionType;
    amount: number | string;
    balance_before: number | string;
    balance_after: number | string;
    user_id?: string;
    customer_id?: string;
    order_id?: string;
    reference_id?: string;
    description?: string;
    notes?: string;
    processed_at?: Date | string;
    metadata?: Record<string, any>;
  }) {
    const transactionData = {
      processed_at: new Date(),
      ...data,
    };

    const createdTransactions = await this.createLonghornGiftCardTransactions([
      transactionData,
    ]);
    return createdTransactions[0];
  }

  async getGiftCardTransactions(
    gift_card_id: string,
    transaction_type?: GiftCardTransactionType
  ) {
    const filters: any = {
      gift_card_id,
      deleted_at: null,
    };

    if (transaction_type) {
      filters.transaction_type = transaction_type;
    }

    return await this.listLonghornGiftCardTransactions(filters);
  }

  async getTransactionsByUser(user_id: string) {
    return await this.listLonghornGiftCardTransactions({
      user_id,
      deleted_at: null,
    });
  }

  async getTransactionsByCustomer(customer_id: string) {
    return await this.listLonghornGiftCardTransactions({
      customer_id,
      deleted_at: null,
    });
  }

  /**
   * Realizar una redención de gift card
   * Verifica saldo y crea la transacción automáticamente
   */
  async redeemGiftCard(data: {
    gift_card_id: string;
    amount: number;
    user_id?: string;
    customer_id?: string;
    order_id?: string;
    description?: string;
    notes?: string;
  }) {
    // Obtener gift card actual
    const giftCards = await this.listLonghornGiftCards({
      id: data.gift_card_id,
      deleted_at: null,
    });

    if (giftCards.length === 0) {
      throw new Error("Gift card not found");
    }

    const giftCard = giftCards[0];

    if (!giftCard.is_active) {
      throw new Error("Gift card is not active");
    }

    const currentBalance = parseFloat(giftCard.balance);
    const redeemAmount = parseFloat(data.amount.toString());

    if (currentBalance < redeemAmount) {
      throw new Error("Insufficient balance on gift card");
    }

    const newBalance = currentBalance - redeemAmount;

    // Crear transacción
    const transaction = await this.createGiftCardTransaction({
      gift_card_id: data.gift_card_id,
      transaction_type: GIFT_CARD_TRANSACTION_TYPES.REDEMPTION,
      amount: redeemAmount,
      balance_before: currentBalance,
      balance_after: newBalance,
      user_id: data.user_id,
      customer_id: data.customer_id,
      order_id: data.order_id,
      description: data.description || "Gift card redemption",
      notes: data.notes,
    });

    // Actualizar gift card
    const giftCardUpdates: any = {
      balance: newBalance,
    };

    if (newBalance <= 0) {
      giftCardUpdates.is_redeemed = true;
      giftCardUpdates.used_at = new Date();
    }

    const updatedGiftCard = await this.updateGiftCard(
      data.gift_card_id,
      giftCardUpdates
    );

    return {
      transaction,
      gift_card: updatedGiftCard,
      new_balance: newBalance,
    };
  }

  /**
   * Generar código único para gift card
   */
  async generateUniqueGiftCardCode(prefix: string = "GIFT"): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      // Generar código aleatorio
      const randomPart = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      const code = `${prefix}${randomPart}`;

      // Verificar que no existe
      const existing = await this.getGiftCardByCode(code);
      if (!existing) {
        return code;
      }

      attempts++;
    }

    throw new Error("Unable to generate unique gift card code");
  }

  /**
   * Obtener estadísticas de gift cards
   */
  async getGiftCardStats(user_id?: string) {
    const filters: any = {
      deleted_at: null,
    };

    if (user_id) {
      filters.user_id = user_id;
    }

    const allGiftCards = await this.listLonghornGiftCards(filters);
    const activeGiftCards = allGiftCards.filter((gc) => gc.is_active);
    const redeemedGiftCards = allGiftCards.filter((gc) => gc.is_redeemed);

    const totalValue = allGiftCards.reduce(
      (sum, gc) => sum + parseFloat(gc.initial_value),
      0
    );
    const totalBalance = activeGiftCards.reduce(
      (sum, gc) => sum + parseFloat(gc.balance),
      0
    );
    const totalRedeemed = redeemedGiftCards.reduce(
      (sum, gc) => sum + parseFloat(gc.initial_value),
      0
    );

    return {
      total_gift_cards: allGiftCards.length,
      active_gift_cards: activeGiftCards.length,
      redeemed_gift_cards: redeemedGiftCards.length,
      total_value: totalValue,
      total_balance: totalBalance,
      total_redeemed: totalRedeemed,
      redemption_rate:
        allGiftCards.length > 0
          ? (redeemedGiftCards.length / allGiftCards.length) * 100
          : 0,
    };
  }
}

export default LonghornModuleService;
