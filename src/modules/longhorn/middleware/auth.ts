import { MiddlewareRoute, authenticate } from "@medusajs/framework"
import { LonghornUserRoleService } from "../services/user-role"
import { ROLE_TYPES } from "../models/role"

/**
 * Middleware para verificar permisos de usuario en el sistema Longhorn
 * Extiende la funcionalidad de autenticación de Medusa
 */

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    [key: string]: any
  }
  headers: {
    [key: string]: string
  }
}

/**
 * Middleware base para autenticación requerida
 */
export function requireAuth(): MiddlewareRoute {
  return authenticate("user", "bearer")
}

/**
 * Middleware para verificar si el usuario es Super Administrador
 */
export function requireSuperAdmin() {
  return async (req: AuthenticatedRequest, res: any, next: any) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        })
      }

      const userRoleService = req.scope.resolve("longhornUserRoleService") as LonghornUserRoleService
      const isSuperAdmin = await userRoleService.isSuperAdmin(req.user.id)

      if (!isSuperAdmin) {
        return res.status(403).json({
          message: "Super Admin access required"
        })
      }

      next()
    } catch (error) {
      console.error("Error in requireSuperAdmin middleware:", error)
      return res.status(500).json({
        message: "Internal server error"
      })
    }
  }
}

/**
 * Middleware para verificar si el usuario es gerente de la tienda especificada
 */
export function requireStoreManager(storeIdParam: string = "store_id") {
  return async (req: AuthenticatedRequest, res: any, next: any) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        })
      }

      const storeId = (req.params as any)[storeIdParam]
      if (!storeId) {
        return res.status(400).json({
          message: `Store ID parameter '${storeIdParam}' is required`
        })
      }

      const userRoleService = req.scope.resolve("longhornUserRoleService") as LonghornUserRoleService
      
      // Super admin puede actuar como manager de cualquier tienda
      const isSuperAdmin = await userRoleService.isSuperAdmin(req.user.id)
      if (isSuperAdmin) {
        return next()
      }

      // Verificar si es manager de esta tienda específica
      const isStoreManager = await userRoleService.isStoreManager(req.user.id, storeId)
      if (!isStoreManager) {
        return res.status(403).json({
          message: "Store Manager access required for this store"
        })
      }

      next()
    } catch (error) {
      console.error("Error in requireStoreManager middleware:", error)
      return res.status(500).json({
        message: "Internal server error"
      })
    }
  }
}

/**
 * Middleware para verificar si el usuario tiene acceso a una tienda
 */
export function requireStoreAccess(storeIdParam: string = "store_id") {
  return async (req: AuthenticatedRequest, res: any, next: any) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        })
      }

      const storeId = (req.params as any)[storeIdParam]
      if (!storeId) {
        return res.status(400).json({
          message: `Store ID parameter '${storeIdParam}' is required`
        })
      }

      const userRoleService = req.scope.resolve("longhornUserRoleService") as LonghornUserRoleService
      
      // Super admin tiene acceso a todas las tiendas
      const isSuperAdmin = await userRoleService.isSuperAdmin(req.user.id)
      if (isSuperAdmin) {
        return next()
      }

      // Verificar si tiene algún rol en esta tienda
      const userRoles = await userRoleService.getUserRoles(req.user.id, storeId)
      if (userRoles.length === 0) {
        return res.status(403).json({
          message: "Access denied to this store"
        })
      }

      next()
    } catch (error) {
      console.error("Error in requireStoreAccess middleware:", error)
      return res.status(500).json({
        message: "Internal server error"
      })
    }
  }
}

/**
 * Middleware para verificar permisos específicos
 */
export function requirePermission(permission: string, storeIdParam?: string) {
  return async (req: AuthenticatedRequest, res: any, next: any) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        })
      }

      const storeId = storeIdParam ? (req.params as any)[storeIdParam] : undefined
      const userRoleService = req.scope.resolve("longhornUserRoleService") as LonghornUserRoleService
      
      const hasPermission = await userRoleService.hasPermission(req.user.id, permission, storeId)
      if (!hasPermission) {
        return res.status(403).json({
          message: `Permission '${permission}' required`
        })
      }

      next()
    } catch (error) {
      console.error("Error in requirePermission middleware:", error)
      return res.status(500).json({
        message: "Internal server error"
      })
    }
  }
}

/**
 * Middleware para verificar si el usuario puede gestionar a otro usuario
 */
export function requireUserManagement(targetUserIdParam: string = "user_id", storeIdParam?: string) {
  return async (req: AuthenticatedRequest, res: any, next: any) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        })
      }

      const targetUserId = (req.params as any)[targetUserIdParam] || (req.body as any).user_id
      if (!targetUserId) {
        return res.status(400).json({
          message: `Target user ID parameter '${targetUserIdParam}' is required`
        })
      }

      const storeId = storeIdParam ? (req.params as any)[storeIdParam] : (req.body as any).store_id
      const userRoleService = req.scope.resolve("longhornUserRoleService") as LonghornUserRoleService
      
      const canManage = await userRoleService.canManageUser(req.user.id, targetUserId, storeId)
      if (!canManage) {
        return res.status(403).json({
          message: "Insufficient privileges to manage this user"
        })
      }

      next()
    } catch (error) {
      console.error("Error in requireUserManagement middleware:", error)
      return res.status(500).json({
        message: "Internal server error"
      })
    }
  }
}

/**
 * Utilidad para filtrar usuarios visibles según jerarquía
 */
export async function filterVisibleUsers(
  currentUserId: string, 
  users: any[], 
  userRoleService: LonghornUserRoleService,
  storeId?: string
): Promise<any[]> {
  const isSuperAdmin = await userRoleService.isSuperAdmin(currentUserId)
  
  // Super admin ve a todos
  if (isSuperAdmin) {
    return users
  }

  // Manager ve solo a su staff en la tienda
  if (storeId) {
    const isStoreManager = await userRoleService.isStoreManager(currentUserId, storeId)
    if (isStoreManager) {
      const visibleUsers = []
      for (const user of users) {
        const userRoles = await userRoleService.getUserRoles(user.id, storeId)
        const isOnlyStaff = userRoles.every(ur => 
          ur.role && ur.role.type === ROLE_TYPES.STORE_STAFF
        )
        if (isOnlyStaff) {
          visibleUsers.push(user)
        }
      }
      return visibleUsers
    }
  }

  // Staff no ve a otros usuarios
  return []
}
