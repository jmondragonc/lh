import { 
  MedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import { ROLE_TYPES } from "../../../../modules/longhorn/models/role"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const longhornService = req.scope.resolve("longhorn")
    const { type, is_active, simulate_user } = req.query

    console.log('=== FILTRADO JERÁRQUICO DE ROLES ===') 
    console.log('Query params:', { type, is_active, simulate_user })

    // OBTENER USUARIO ACTUAL AUTENTICADO (con fallback para testing)
    const currentUserId = simulate_user as string || req.auth_context?.user_id || 'user_01JZC033F50CPV8Y1HGHDJQCJW'
    console.log('🔍 USUARIO ACTUAL - Auth Context User ID:', req.auth_context?.user_id)
    console.log('🔍 USUARIO ACTUAL - Simulate User (override):', simulate_user)
    console.log('🔍 USUARIO ACTUAL - Final User ID:', currentUserId)

    // Obtener roles filtrados por jerarquía
    const { roles: filteredRoles, isFiltered } = await longhornService.getFilteredRoles(currentUserId)
    console.log('Roles after hierarchy filtering:', filteredRoles.length, 'roles, filtered:', isFiltered)

    // Aplicar filtros adicionales de query params
    let finalRoles = filteredRoles
    
    if (type) {
      // Convertir tipos del frontend a tipos del modelo
      const typeMapping = {
        "super_admin": ROLE_TYPES.SUPER_ADMIN,
        "local_manager": ROLE_TYPES.STORE_MANAGER,
        "local_staff": ROLE_TYPES.STORE_STAFF
      }
      const targetType = typeMapping[type as string] || type
      finalRoles = finalRoles.filter(role => role.type === targetType)
      console.log('Roles after type filtering:', finalRoles.length)
    }
    
    if (is_active !== undefined) {
      const activeFilter = is_active === 'true'
      finalRoles = finalRoles.filter(role => role.is_active === activeFilter)
      console.log('Roles after active filtering:', finalRoles.length)
    }
    
    // Convertir tipos del modelo a tipos del frontend
    const convertedRoles = finalRoles.map(role => ({
      ...role,
      type: role.type === ROLE_TYPES.SUPER_ADMIN ? "super_admin" :
            role.type === ROLE_TYPES.STORE_MANAGER ? "local_manager" :
            role.type === ROLE_TYPES.STORE_STAFF ? "local_staff" : role.type,
      permissions: role.permissions || []
    }))

    console.log('Final roles to return:', convertedRoles.length)
    console.log('Hierarchy filtered?', isFiltered)

    res.json({
      roles: convertedRoles,
      count: convertedRoles.length,
      filtered: isFiltered
    })

  } catch (error) {
    console.error("Error fetching roles:", error)
    res.status(500).json({
      message: "Failed to fetch roles",
      error: error.message
    })
  }
}

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const longhornService = req.scope.resolve("longhorn")
    
    const { name, type, description, permissions, is_active = true, simulate_user } = req.body

    console.log('=== CREACIÓN DE ROL CON VERIFICACIÓN JERÁRQUICA ===')
    console.log('Request data:', { name, type, description, simulate_user })

    // OBTENER USUARIO ACTUAL AUTENTICADO (con fallback para testing)
    const currentUserId = simulate_user || req.auth_context?.user_id || 'user_01JZC033F50CPV8Y1HGHDJQCJW'
    console.log('Current user ID:', currentUserId)

    // Verificar permisos de creación jerárquicos
    const canCreate = await longhornService.canCreateRole(currentUserId, modelType)
    console.log('Can create role?', canCreate, 'for type:', modelType)
    
    if (!canCreate) {
      console.log('Permission denied for role creation')
      return res.status(403).json({
        message: `No tienes permisos para crear roles de tipo: ${type}`,
        error: "INSUFFICIENT_PERMISSIONS"
      })
    }

    const role = await longhornService.createRole({
      name,
      type: modelType,
      description,
      permissions: permissions || [],
      metadata: { 
        is_active,
        created_by: currentUserId 
      }
    })

    console.log('Role created successfully:', role[0].id)

    // Convertir respuesta al formato del frontend
    const convertedRole = {
      ...role[0],
      type: type, // Usar el tipo original del frontend
      permissions: role[0].permissions || [],
      is_active: role[0].metadata?.is_active ?? true
    }

    res.status(201).json({
      role: convertedRole,
      message: "Role created successfully"
    })

  } catch (error) {
    console.error("Error creating role:", error)
    res.status(500).json({
      message: "Failed to create role",
      error: error.message
    })
  }
}
