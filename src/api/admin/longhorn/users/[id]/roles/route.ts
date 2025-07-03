import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import LonghornUserRoleService from "../../../../../../modules/longhorn/services/user-role"
import LonghornUserStoreService from "../../../../../../modules/longhorn/services/user-store"

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id: user_id } = req.params
    const longhornUserRoleService = req.scope.resolve("longhornUserRoleService") as LonghornUserRoleService
    const longhornUserStoreService = req.scope.resolve("longhornUserStoreService") as LonghornUserStoreService

    // Verificar si el usuario actual puede gestionar este usuario
    const canManage = await longhornUserRoleService.canManageUser(req.user.id, user_id)
    if (!canManage) {
      return res.status(403).json({
        message: "Insufficient privileges to manage this user"
      })
    }

    const { role_id, store_id, metadata } = req.body

    // Validar datos requeridos
    if (!role_id) {
      return res.status(400).json({
        message: "Missing required field: role_id"
      })
    }

    // Asignar rol al usuario
    const userRole = await longhornUserRoleService.assignRole({
      user_id,
      role_id,
      store_id,
      metadata
    })

    // Si hay store_id y el usuario no está asignado a esa tienda, asignarlo
    if (store_id) {
      try {
        const hasStoreAccess = await longhornUserStoreService.hasAccessToStore(user_id, store_id)
        if (!hasStoreAccess) {
          await longhornUserStoreService.assignUserToStore({
            user_id,
            store_id,
            metadata
          })
        }
      } catch (error) {
        // Si ya está asignado, continuar
        console.log("User already assigned to store or other error:", error.message)
      }
    }

    res.status(201).json({
      user_role: userRole,
      message: "Role assigned successfully"
    })

  } catch (error) {
    console.error("Error assigning role:", error)
    res.status(500).json({
      message: "Failed to assign role",
      error: error.message
    })
  }
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id: user_id } = req.params
    const longhornUserRoleService = req.scope.resolve("longhornUserRoleService") as LonghornUserRoleService

    // Verificar si el usuario actual puede gestionar este usuario
    const canManage = await longhornUserRoleService.canManageUser(req.user.id, user_id)
    if (!canManage) {
      return res.status(403).json({
        message: "Insufficient privileges to manage this user"
      })
    }

    const { role_id, store_id } = req.body

    // Validar datos requeridos
    if (!role_id) {
      return res.status(400).json({
        message: "Missing required field: role_id"
      })
    }

    // No permitir que un super admin se quite su propio rol de super admin
    if (req.user.id === user_id) {
      const isSuperAdmin = await longhornUserRoleService.isSuperAdmin(user_id)
      if (isSuperAdmin) {
        return res.status(400).json({
          message: "Cannot remove your own Super Admin role"
        })
      }
    }

    await longhornUserRoleService.removeUserRole(user_id, role_id, store_id)

    res.json({
      message: "Role removed successfully"
    })

  } catch (error) {
    console.error("Error removing role:", error)
    res.status(500).json({
      message: "Failed to remove role",
      error: error.message
    })
  }
}
