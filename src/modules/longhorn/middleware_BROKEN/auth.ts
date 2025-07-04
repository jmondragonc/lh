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
 * REGLA CRÍTICA: Usuarios menores NO ven Super Administrador ni su rol
 */
export async function filterVisibleUsers(
  currentUserId: string, 
  users: any[], 
  userRoleService: LonghornUserRoleService,
  storeId?: string
): Promise<any[]> {
  const isSuperAdmin = await userRoleService.isSuperAdmin(currentUserId)
  
  // Super admin ve a todos (único privilegio total)
  if (isSuperAdmin) {
    return users
  }

  // REGLA CRÍTICA: Filtrar Super Admins de la vista de usuarios menores
  const filteredUsers = []
  for (const user of users) {
    const isTargetSuperAdmin = await userRoleService.isSuperAdmin(user.id)
    
    // NUNCA mostrar Super Admins a usuarios no-Super Admin
    if (isTargetSuperAdmin) {
      continue // SKIP Super Admin users
    }
    
    filteredUsers.push(user)
  }

  // Si hay storeId, aplicar filtrado adicional por tienda
  if (storeId) {
    const isStoreManager = await userRoleService.isStoreManager(currentUserId, storeId)
    
    if (isStoreManager) {
      // Manager ve solo a su staff en la tienda (ya sin Super Admins)
      const storeVisibleUsers = []
      for (const user of filteredUsers) {
        const userRoles = await userRoleService.getUserRoles(user.id, storeId)
        
        // Mostrar usuarios que tienen roles en esta tienda
        if (userRoles.length > 0) {
          // Verificar que no sea manager de otra tienda
          const isManagerElsewhere = await userRoleService.isManagerOfOtherStore(user.id, storeId)
          
          if (!isManagerElsewhere) {
            storeVisibleUsers.push(user)
          }
        }
      }
      return storeVisibleUsers
    }
  }

  // Staff solo se ve a sí mismo (ya sin Super Admins)
  return filteredUsers.filter(user => user.id === currentUserId)
}
