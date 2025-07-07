import { 
  MedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import { ROLE_TYPES } from "../../../../../modules/longhorn/models/role"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const longhornService = req.scope.resolve("longhorn")
    const { id } = req.params
    const { simulate_user } = req.query

    // OBTENER USUARIO ACTUAL AUTENTICADO (con fallback para testing)
    const currentUserId = simulate_user as string || req.auth_context?.user_id || 'user_01JZC033F50CPV8Y1HGHDJQCJW'
    console.log('🔍 GET ROLE - Using user ID:', currentUserId)

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
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const longhornService = req.scope.resolve("longhorn")
    const { id } = req.params
    const { name, type, description, permissions, is_active, simulate_user } = req.body

    console.log("=== EDICIÓN DE ROL CON VERIFICACIÓN JERÁRQUICA ===")
    console.log("Request:", { id, name, type, description })

    // OBTENER USUARIO ACTUAL AUTENTICADO (con fallback para testing)
    const currentUserId = simulate_user || req.auth_context?.user_id || 'user_01JZC033F50CPV8Y1HGHDJQCJW'
    console.log('🔍 PUT ROLE - Using user ID:', currentUserId)

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
    console.log("Existing role type:", existingRole.type)
    
    console.log("Current user ID:", currentUserId)

    // Verificar permisos jerárquicos para edición
    if (currentUserId) {
      const canEdit = await longhornService.canEditRole(currentUserId, existingRole.type)
      console.log("Can edit existing role?", canEdit, "for type:", existingRole.type)
      
      if (!canEdit) {
        return res.status(403).json({
          message: "No tienes permisos para editar este tipo de rol",
          error: "INSUFFICIENT_PERMISSIONS"
        })
      }
      
      // Si se está cambiando el tipo de rol, verificar permisos para el nuevo tipo
      if (type !== undefined) {
        const typeMapping = {
          "super_admin": ROLE_TYPES.SUPER_ADMIN,
          "local_manager": ROLE_TYPES.STORE_MANAGER,
          "local_staff": ROLE_TYPES.STORE_STAFF
        }
        const newModelType = typeMapping[type]
        
        if (newModelType && newModelType !== existingRole.type) {
          const canCreateNewType = await longhornService.canCreateRole(currentUserId, newModelType)
          console.log("Can create new role type?", canCreateNewType, "for type:", newModelType)
          
          if (!canCreateNewType) {
            return res.status(403).json({
              message: `No tienes permisos para cambiar el rol a tipo: ${type}`,
              error: "INSUFFICIENT_PERMISSIONS"
            })
          }
        }
      }
    } else {
      console.log("No user ID provided, allowing edit (internal API)")
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
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const longhornService = req.scope.resolve("longhorn")
    const { id } = req.params
    const { simulate_user } = req.query

    console.log("=== ELIMINACIÓN DE ROL CON VERIFICACIÓN JERÁRQUICA ===")
    console.log("Request:", { id })

    // OBTENER USUARIO ACTUAL AUTENTICADO (con fallback para testing)
    const currentUserId = simulate_user as string || req.auth_context?.user_id || 'user_01JZC033F50CPV8Y1HGHDJQCJW'
    console.log('🔍 DELETE ROLE - Using user ID:', currentUserId)

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
    console.log("Role to delete type:", existingRole.type)
    
    console.log("Current user ID:", currentUserId)

    // Verificar permisos jerárquicos para eliminación
    if (currentUserId) {
      const canEdit = await longhornService.canEditRole(currentUserId, existingRole.type)
      console.log("Can delete role?", canEdit, "for type:", existingRole.type)
      
      if (!canEdit) {
        return res.status(403).json({
          message: "No tienes permisos para eliminar este tipo de rol",
          error: "INSUFFICIENT_PERMISSIONS"
        })
      }
    } else {
      console.log("No user ID provided, allowing deletion (internal API)")
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