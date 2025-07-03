import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const longhornService = req.scope.resolve("longhorn")
    const { type, active_only = "true" } = req.query

    let roles
    if (type) {
      roles = await longhornService.getRolesByType(type as any)
    } else if (active_only === "true") {
      roles = await longhornService.getActiveRoles()
    } else {
      // Para obtener todos los roles (incluidos inactivos), necesitamos modificar el servicio
      roles = await longhornService.getActiveRoles()
    }

    res.json({
      roles,
      count: roles.length
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
    
    const { name, type, description, permissions, metadata } = req.body

    // Validar datos requeridos
    if (!name || !type) {
      return res.status(400).json({
        message: "Missing required fields: name, type"
      })
    }

    // Validar tipo de rol
    const validTypes = ["SUPER_ADMIN", "STORE_MANAGER", "STORE_STAFF"]
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: `Invalid role type. Must be one of: ${validTypes.join(", ")}`
      })
    }

    const role = await longhornService.createRole({
      name,
      type,
      description,
      permissions,
      metadata
    })

    res.status(201).json({
      role,
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