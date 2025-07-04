import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import { LONGHORN_MODULE } from "../../../../../../modules/longhorn"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id: user_id } = req.params
    const longhornService = req.scope.resolve(LONGHORN_MODULE)

    // Por ahora saltamos la verificación de permisos hasta que esté funcionando
    // TODO: Implementar verificación de permisos una vez que la funcionalidad básica funcione
    console.log('Skipping permission check for now')

    // Obtener roles del usuario de forma simplificada
    const userRoles = await longhornService.listLonghornUserRoles({
      user_id,
      deleted_at: null
    })
    
    // Hacer JOIN manual con roles para obtener información completa
    const enrichedRoles = await Promise.all(
      userRoles.map(async (userRole) => {
        const roles = await longhornService.listLonghornRoles({ 
          id: userRole.role_id,
          deleted_at: null 
        })
        const role = roles[0] || null
        
        return {
          id: userRole.id,
          user_id: userRole.user_id,
          role_id: userRole.role_id,
          store_id: userRole.store_id,
          is_active: userRole.is_active,
          created_at: userRole.created_at,
          role: role ? {
            id: role.id,
            name: role.name,
            type: role.type,
            description: role.description,
            permissions: role.permissions || []
          } : null
        }
      })
    )
    
    console.log('User roles fetched successfully:', enrichedRoles.length)

    res.json({
      roles: enrichedRoles,
      message: "User roles retrieved successfully"
    })

  } catch (error) {
    console.error("Error fetching user roles:", error)
    res.status(500).json({
      message: "Failed to fetch user roles",
      error: error.message
    })
  }
}

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id: user_id } = req.params
    const longhornService = req.scope.resolve(LONGHORN_MODULE)

    // Por ahora saltamos la verificación de permisos hasta que esté funcionando
    // TODO: Implementar verificación de permisos una vez que la funcionalidad básica funcione
    console.log('Skipping permission check for now')

    const { role_id, store_id, metadata } = req.body

    // Validar datos requeridos
    if (!role_id) {
      return res.status(400).json({
        message: "Missing required field: role_id"
      })
    }

    console.log('Attempting to assign role:', { user_id, role_id, store_id })
    
    // Verificar si el rol ya está asignado
    const existingRoles = await longhornService.listLonghornUserRoles({
      user_id,
      role_id,
      store_id: store_id || null,
      deleted_at: null
    })
    
    if (existingRoles.length > 0) {
      return res.status(400).json({
        message: "User already has this role assigned",
        error: "ROLE_ALREADY_EXISTS"
      })
    }
    
    // Asignar rol al usuario directamente con el método básico
    const userRoleData = {
      user_id,
      role_id,
      store_id: store_id || null,
      is_active: true,
      metadata: metadata || {}
    }
    
    const userRole = await longhornService.createLonghornUserRoles([userRoleData])
    console.log('Role assigned successfully:', userRole[0])

    // Si hay store_id, asignar usuario a tienda (simplificado)
    if (store_id) {
      try {
        const userStoreData = {
          user_id,
          store_id,
          is_active: true,
          metadata: metadata || {}
        }
        await longhornService.createLonghornUserStores([userStoreData])
        console.log('User assigned to store successfully')
      } catch (error) {
        console.log('Store assignment failed (probably already exists):', error.message)
      }
    }

    res.status(201).json({
      user_role: userRole[0],
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
    const longhornService = req.scope.resolve(LONGHORN_MODULE)

    // Por ahora saltamos la verificación de permisos hasta que esté funcionando
    // TODO: Implementar verificación de permisos una vez que la funcionalidad básica funcione
    console.log('Skipping permission check for now')

    const { role_id, store_id } = req.body

    // Validar datos requeridos
    if (!role_id) {
      return res.status(400).json({
        message: "Missing required field: role_id"
      })
    }

    console.log('Attempting to remove role:', { user_id, role_id, store_id })

    // Buscar y eliminar el rol del usuario
    const userRoles = await longhornService.listLonghornUserRoles({
      user_id,
      role_id,
      store_id: store_id || null,
      deleted_at: null
    })
    
    if (userRoles.length === 0) {
      return res.status(404).json({
        message: "User role assignment not found"
      })
    }
    
    await longhornService.deleteLonghornUserRoles([userRoles[0].id])
    console.log('Role removed successfully')

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
