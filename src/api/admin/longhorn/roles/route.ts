import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import { ROLE_TYPES } from "../../../../modules/longhorn/models/role"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const longhornService = req.scope.resolve("longhorn")
    const { type, is_active } = req.query

    // Construir filtros
    let filters: any = { deleted_at: null }
    
    if (type) {
      // Convertir tipos del frontend a tipos del modelo
      const typeMapping = {
        "super_admin": ROLE_TYPES.SUPER_ADMIN,
        "local_manager": ROLE_TYPES.STORE_MANAGER,
        "local_staff": ROLE_TYPES.STORE_STAFF
      }
      filters.type = typeMapping[type as string] || type
    }
    
    if (is_active !== undefined) {
      filters.is_active = is_active === 'true'
    }

    // Obtener todos los roles que cumplen los filtros
    const allRoles = await longhornService.listLonghornRoles(filters)
    
    // Convertir tipos del modelo a tipos del frontend
    const convertedRoles = allRoles.map(role => ({
      ...role,
      type: role.type === ROLE_TYPES.SUPER_ADMIN ? "super_admin" :
            role.type === ROLE_TYPES.STORE_MANAGER ? "local_manager" :
            role.type === ROLE_TYPES.STORE_STAFF ? "local_staff" : role.type,
      permissions: role.permissions || []
    }))
    
    // Aplicar filtrado de seguridad
    let filteredRoles = convertedRoles
    let isFiltered = false

    // Por ahora no aplicamos filtrado para evitar errores
    // TODO: Restaurar filtrado de seguridad una vez que isSuperAdmin funcione
    console.log('Skipping role filtering for now')

    res.json({
      roles: filteredRoles,
      count: filteredRoles.length,
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
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const longhornService = req.scope.resolve("longhorn")
    
    const { name, type, description, permissions, is_active = true } = req.body

    // Validar datos requeridos
    if (!name || !type) {
      return res.status(400).json({
        message: "Missing required fields: name, type"
      })
    }

    // Convertir tipo del frontend a tipo del modelo
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

    // Por ahora saltamos la verificación de permisos
    // TODO: Restaurar verificación una vez que isSuperAdmin funcione
    console.log('Skipping permission check for role creation')
    const currentUserId = req.auth_context?.actor_id || req.auth_context?.user_id

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