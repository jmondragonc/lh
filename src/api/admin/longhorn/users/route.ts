import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    console.log('=== STARTING SIMPLE GET /admin/longhorn/users ===')
    
    const userModuleService = req.scope.resolve(Modules.USER)
    const longhornService = req.scope.resolve("longhorn")
    console.log('Services resolved successfully')

    // Obtener todos los usuarios del sistema (sin datos Longhorn por ahora)
    console.log('Fetching all users...')
    const allUsers = await userModuleService.listUsers()
    console.log('All users fetched:', allUsers.length)

    // Por ahora solo retornar usuarios básicos sin enriquecer
    // hasta que sepamos que el módulo funciona
    const basicUsers = allUsers.map(user => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      created_at: user.created_at,
      // Placeholder para roles - lo implementaremos después
      longhorn_roles: [],
      longhorn_stores: []
    }))

    console.log('Users processed successfully, sending response')
    res.json({
      users: basicUsers,
      count: basicUsers.length,
      message: "Basic user data without Longhorn enrichment"
    })

  } catch (error) {
    console.error("=== ERROR in SIMPLE GET /admin/longhorn/users ===")
    console.error("Error fetching users:", error)
    console.error("Stack trace:", error.stack)
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message
    })
  }
}
