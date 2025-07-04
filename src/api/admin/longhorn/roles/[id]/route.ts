import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import { ROLE_TYPES } from "../../../../../modules/longhorn/models/role"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const longhornService = req.scope.resolve("longhorn")
    const { id } = req.params

    const roles = await longhornService.listLonghornRoles({ 
      id, 
      deleted_at: null 
    })

    if (roles.length === 0) {
      return res.status(404).json({
        message: "Role not found"
      })
    }

    const role = roles[0]

    // Convertir tipo del modelo a tipo del frontend
    const convertedRole = {
      ...role,
      type: role.type === ROLE_TYPES.SUPER_ADMIN ? "super_admin" :
            role.type === ROLE_TYPES.STORE_MANAGER ? "local_manager" :
            role.type === ROLE_TYPES.STORE_STAFF ? "local_staff" : role.type,
      permissions: role.permissions || [],
      is_active: role.metadata?.is_active ?? role.is_active ?? true
    }

    res.json({
      role: convertedRole
    })

  } catch (error) {
    console.error("Error fetching role:", error)
    res.status(500).json({
      message: "Failed to fetch role",
      error: error.message
    })
  }
}

export const PUT = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const longhornService = req.scope.resolve("longhorn")
    const { id } = req.params
    const { name, type, description, permissions, is_active } = req.body

    console.log("🔧 PUT ROLES DEBUG - Request:", {
      id,
      body: { name, type, description, permissions, is_active }
    })

    // Verificar que el rol existe
    const existingRoles = await longhornService.listLonghornRoles({ 
      id, 
      deleted_at: null 
    })

    console.log("🔧 PUT ROLES DEBUG - Existing roles:", existingRoles)

    if (existingRoles.length === 0) {
      return res.status(404).json({
        message: "Role not found"
      })
    }

    const existingRole = existingRoles[0]
    
    // Verificar permisos
    const currentUserId = req.auth_context?.actor_id || req.auth_context?.user_id
    if (currentUserId) {
      const isSuperAdmin = await longhornService.isSuperAdmin(currentUserId)
      
      // Solo super admin puede modificar roles super admin
      if (existingRole.type === ROLE_TYPES.SUPER_ADMIN && !isSuperAdmin) {
        return res.status(403).json({
          message: "Only super administrators can modify super admin roles"
        })
      }
      
      // Solo super admin puede cambiar un rol a super admin
      if (type === "super_admin" && !isSuperAdmin) {
        return res.status(403).json({
          message: "Only super administrators can create super admin roles"
        })
      }
    }

    let updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (permissions !== undefined) updateData.permissions = permissions

    // Convertir tipo del frontend a tipo del modelo si se proporciona
    if (type !== undefined) {
      const typeMapping = {
        "super_admin": ROLE_TYPES.SUPER_ADMIN,
        "local_manager": ROLE_TYPES.STORE_MANAGER,
        "local_staff": ROLE_TYPES.STORE_STAFF
      }

      const modelType = typeMapping[type]
      if (!modelType) {
        return res.status(400).json({
          message: `Invalid role type. Must be one of: super_admin, local_manager, local_staff`
        })
      }
      updateData.type = modelType
    }

    // Manejar is_active a través de metadata
    if (is_active !== undefined) {
      updateData.metadata = {
        ...existingRole.metadata,
        is_active,
        updated_by: currentUserId,
        updated_at: new Date().toISOString()
      }
    }

    console.log("🔧 PUT ROLES DEBUG - Update data:", updateData)

    const updatedRoles = await longhornService.updateRole(id, updateData)
    const updatedRole = updatedRoles[0]

    console.log("🔧 PUT ROLES DEBUG - Updated role from service:", updatedRole)

    // Convertir respuesta al formato del frontend
    const convertedRole = {
      ...updatedRole,
      type: updatedRole.type === ROLE_TYPES.SUPER_ADMIN ? "super_admin" :
            updatedRole.type === ROLE_TYPES.STORE_MANAGER ? "local_manager" :
            updatedRole.type === ROLE_TYPES.STORE_STAFF ? "local_staff" : updatedRole.type,
      permissions: updatedRole.permissions || [],
      is_active: updatedRole.metadata?.is_active ?? updatedRole.is_active ?? true
    }

    console.log("🔧 PUT ROLES DEBUG - Converted role for response:", convertedRole)

    res.json({
      role: convertedRole,
      message: "Role updated successfully"
    })

  } catch (error) {
    console.error("🔧 PUT ROLES DEBUG - Error:", error)
    res.status(500).json({
      message: "Failed to update role",
      error: error.message
    })
  }
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const longhornService = req.scope.resolve("longhorn")
    const { id } = req.params

    // Verificar que el rol existe
    const existingRoles = await longhornService.listLonghornRoles({ 
      id, 
      deleted_at: null 
    })

    if (existingRoles.length === 0) {
      return res.status(404).json({
        message: "Role not found"
      })
    }

    const existingRole = existingRoles[0]
    
    // Verificar permisos
    const currentUserId = req.auth_context?.actor_id || req.auth_context?.user_id
    if (currentUserId) {
      const isSuperAdmin = await longhornService.isSuperAdmin(currentUserId)
      
      // Solo super admin puede eliminar roles super admin
      if (existingRole.type === ROLE_TYPES.SUPER_ADMIN && !isSuperAdmin) {
        return res.status(403).json({
          message: "Only super administrators can delete super admin roles"
        })
      }
    }

    // Verificar si hay usuarios asignados a este rol
    const userRoles = await longhornService.listLonghornUserRoles({
      role_id: id,
      is_active: true,
      deleted_at: null
    })

    if (userRoles.length > 0) {
      return res.status(400).json({
        message: `Cannot delete role: ${userRoles.length} users are currently assigned to this role`,
        assigned_users_count: userRoles.length
      })
    }

    await longhornService.deleteRole(id)

    res.json({
      message: "Role deleted successfully",
      deleted_role_id: id
    })

  } catch (error) {
    console.error("Error deleting role:", error)
    res.status(500).json({
      message: "Failed to delete role",
      error: error.message
    })
  }
}