import { 
  MedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { ROLE_TYPES } from "../../../../modules/longhorn/models/role"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    console.log('=== DEBUG ENDPOINT - GET REAL USER IDS ===')
    
    const userModuleService = req.scope.resolve(Modules.USER)
    const longhornService = req.scope.resolve("longhorn")

    // Obtener todos los usuarios del sistema
    const allUsers = await userModuleService.listUsers()
    console.log('Total users in system:', allUsers.length)

    // Enriquecer con roles de Longhorn para identificar quién es quién
    const usersWithRoles = await Promise.all(
      allUsers.map(async (user) => {
        try {
          const userRoles = await longhornService.getUserRoles(user.id)
          const roleTypes = userRoles.map(ur => ur.role?.type).filter(Boolean)
          
          return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role_types: roleTypes,
            is_super_admin: roleTypes.includes(ROLE_TYPES.SUPER_ADMIN),
            is_manager: roleTypes.includes(ROLE_TYPES.STORE_MANAGER),
            is_staff: roleTypes.includes(ROLE_TYPES.STORE_STAFF)
          }
        } catch (error) {
          return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role_types: [],
            is_super_admin: false,
            is_manager: false,
            is_staff: false,
            error: error.message
          }
        }
      })
    )

    // Identificar IDs específicos para testing
    const superAdminUser = usersWithRoles.find(u => u.is_super_admin)
    const managerUser = usersWithRoles.find(u => u.is_manager && !u.is_super_admin)
    const staffUser = usersWithRoles.find(u => u.is_staff && !u.is_manager && !u.is_super_admin)

    console.log('=== REAL USER IDS FOR TESTING ===')
    console.log('Super Admin:', superAdminUser?.id, '(' + superAdminUser?.email + ')')
    console.log('Manager:', managerUser?.id, '(' + managerUser?.email + ')')
    console.log('Staff:', staffUser?.id, '(' + staffUser?.email + ')')

    res.json({
      message: "Real user IDs for testing simulation",
      total_users: allUsers.length,
      users_with_roles: usersWithRoles,
      testing_ids: {
        super_admin_id: superAdminUser?.id || null,
        super_admin_email: superAdminUser?.email || null,
        manager_id: managerUser?.id || null,
        manager_email: managerUser?.email || null,
        staff_id: staffUser?.id || null,
        staff_email: staffUser?.email || null
      },
      corrected_urls: {
        super_admin_view: superAdminUser ? `http://localhost:9000/app/users/management?simulate_user=${superAdminUser.id}` : 'No Super Admin found',
        manager_view: managerUser ? `http://localhost:9000/app/users/management?simulate_user=${managerUser.id}` : 'No Manager found',
        staff_view: staffUser ? `http://localhost:9000/app/users/management?simulate_user=${staffUser.id}` : 'No Staff found'
      }
    })

  } catch (error) {
    console.error("Error in debug endpoint:", error)
    res.status(500).json({
      message: "Failed to get debug info",
      error: error.message
    })
  }
}
