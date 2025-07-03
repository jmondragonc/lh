import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import { 
  LonghornUserRoleService,
  LonghornUserStoreService
} from "../../../../../modules/longhorn/services"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id } = req.params
    const userModuleService = req.scope.resolve(Modules.USER)
    const longhornUserRoleService = req.scope.resolve("longhornUserRoleService") as LonghornUserRoleService
    const longhornUserStoreService = req.scope.resolve("longhornUserStoreService") as LonghornUserStoreService

    // Obtener el usuario
    const user = await userModuleService.retrieveUser(id)
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    // Verificar si el usuario actual puede ver este usuario
    const currentUserRoles = await longhornUserRoleService.getUserRoles(req.user.id)
    const isSuperAdmin = await longhornUserRoleService.isSuperAdmin(req.user.id)
    
    if (!isSuperAdmin) {
      // Lógica adicional para verificar visibilidad según jerarquía
      // Por ahora, solo super admin puede ver detalles de usuario específico
      return res.status(403).json({
        message: "Access denied"
      })
    }

    // Obtener roles y tiendas del usuario
    const userRoles = await longhornUserRoleService.getUserRoles(id)
    const userStores = await longhornUserStoreService.getUserStores(id)

    const enrichedUser = {
      ...user,
      longhorn_roles: userRoles,
      longhorn_stores: userStores
    }

    res.json({
      user: enrichedUser
    })

  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message
    })
  }
}

export const PUT = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id } = req.params
    const userModuleService = req.scope.resolve(Modules.USER)
    const longhornUserRoleService = req.scope.resolve("longhornUserRoleService") as LonghornUserRoleService

    // Verificar si el usuario actual puede gestionar este usuario
    const canManage = await longhornUserRoleService.canManageUser(req.user.id, id)
    if (!canManage) {
      return res.status(403).json({
        message: "Insufficient privileges to manage this user"
      })
    }

    const { first_name, last_name, email, metadata } = req.body

    // Actualizar datos básicos del usuario
    const updatedUser = await userModuleService.updateUsers(id, {
      first_name,
      last_name,
      email,
      metadata
    })

    // Obtener información completa actualizada
    const userRoles = await longhornUserRoleService.getUserRoles(id)
    const longhornUserStoreService = req.scope.resolve("longhornUserStoreService") as LonghornUserStoreService
    const userStores = await longhornUserStoreService.getUserStores(id)

    const enrichedUser = {
      ...updatedUser,
      longhorn_roles: userRoles,
      longhorn_stores: userStores
    }

    res.json({
      user: enrichedUser,
      message: "User updated successfully"
    })

  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({
      message: "Failed to update user",
      error: error.message
    })
  }
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id } = req.params
    const userModuleService = req.scope.resolve(Modules.USER)
    const longhornUserRoleService = req.scope.resolve("longhornUserRoleService") as LonghornUserRoleService

    // Verificar si el usuario actual puede gestionar este usuario
    const canManage = await longhornUserRoleService.canManageUser(req.user.id, id)
    if (!canManage) {
      return res.status(403).json({
        message: "Insufficient privileges to manage this user"
      })
    }

    // No permitir que un usuario se elimine a sí mismo
    if (req.user.id === id) {
      return res.status(400).json({
        message: "Cannot delete your own account"
      })
    }

    // Eliminar asignaciones de roles y tiendas primero
    const userRoles = await longhornUserRoleService.getUserRoles(id)
    for (const userRole of userRoles) {
      await longhornUserRoleService.removeUserRole(id, userRole.role_id, userRole.store_id)
    }

    const longhornUserStoreService = req.scope.resolve("longhornUserStoreService") as LonghornUserStoreService
    const userStores = await longhornUserStoreService.getUserStores(id)
    for (const userStore of userStores) {
      await longhornUserStoreService.removeUserFromStore(id, userStore.store_id)
    }

    // Eliminar el usuario
    await userModuleService.deleteUsers([id])

    res.json({
      message: "User deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message
    })
  }
}
