import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import LonghornUserRoleService from "../../../../modules/longhorn/services/user-role"
import LonghornUserStoreService from "../../../../modules/longhorn/services/user-store"
import { filterVisibleUsers } from "../../../../modules/longhorn/middleware/auth"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const userModuleService = req.scope.resolve(Modules.USER)
    const longhornUserRoleService = req.scope.resolve("longhornUserRoleService") as LonghornUserRoleService
    const longhornUserStoreService = req.scope.resolve("longhornUserStoreService") as LonghornUserStoreService

    const { store_id, role_type } = req.query

    // Obtener todos los usuarios del sistema
    const allUsers = await userModuleService.listUsers()

    let filteredUsers = allUsers

    // Filtrar por tienda si se especifica
    if (store_id) {
      const storeUsers = await longhornUserStoreService.getStoreUsers(store_id as string)
      const storeUserIds = storeUsers.map(su => su.user_id)
      filteredUsers = allUsers.filter(user => storeUserIds.includes(user.id))
    }

    // Filtrar por tipo de rol si se especifica
    if (role_type) {
      const usersWithRole = []
      for (const user of filteredUsers) {
        const userRoles = await longhornUserRoleService.getUserRoles(user.id, store_id as string)
        // TODO: Implementar verificación de tipo de rol cuando tengamos la relación
        const hasRoleType = userRoles.length > 0 // Placeholder
        if (hasRoleType) {
          usersWithRole.push(user)
        }
      }
      filteredUsers = usersWithRole
    }

    // Aplicar filtro de visibilidad según jerarquía
    const visibleUsers = await filterVisibleUsers(
      req.user.id,
      filteredUsers,
      longhornUserRoleService,
      store_id as string
    )

    // Enriquecer usuarios con información de roles y tiendas
    const enrichedUsers = await Promise.all(
      visibleUsers.map(async (user) => {
        const userRoles = await longhornUserRoleService.getUserRoles(user.id)
        const userStores = await longhornUserStoreService.getUserStores(user.id)

        return {
          ...user,
          longhorn_roles: userRoles,
          longhorn_stores: userStores
        }
      })
    )

    res.json({
      users: enrichedUsers,
      count: enrichedUsers.length
    })

  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message
    })
  }
}

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const userModuleService = req.scope.resolve(Modules.USER)
    const longhornUserRoleService = req.scope.resolve("longhornUserRoleService") as LonghornUserRoleService
    const longhornUserStoreService = req.scope.resolve("longhornUserStoreService") as LonghornUserStoreService

    const { 
      first_name,
      last_name,
      email,
      role_id,
      store_id,
      metadata 
    } = req.body

    // Validar datos requeridos
    if (!first_name || !last_name || !email || !role_id) {
      return res.status(400).json({
        message: "Missing required fields: first_name, last_name, email, role_id"
      })
    }

    // Crear el usuario en Medusa
    const newUser = await userModuleService.createUsers({
      first_name,
      last_name,
      email,
      metadata
    })

    try {
      // Asignar rol al usuario
      await longhornUserRoleService.assignRole({
        user_id: newUser.id,
        role_id,
        store_id,
        metadata
      })

      // Si hay store_id, asignar usuario a la tienda
      if (store_id) {
        await longhornUserStoreService.assignUserToStore({
          user_id: newUser.id,
          store_id,
          metadata
        })
      }

      // Obtener el usuario completo con roles y tiendas
      const userRoles = await longhornUserRoleService.getUserRoles(newUser.id)
      const userStores = await longhornUserStoreService.getUserStores(newUser.id)

      const enrichedUser = {
        ...newUser,
        longhorn_roles: userRoles,
        longhorn_stores: userStores
      }

      res.status(201).json({
        user: enrichedUser,
        message: "User created successfully"
      })

    } catch (roleError) {
      // Si falla la asignación de rol, eliminar el usuario creado
      await userModuleService.deleteUsers([newUser.id])
      throw roleError
    }

  } catch (error) {
    console.error("Error creating user:", error)
    res.status(500).json({
      message: "Failed to create user",
      error: error.message
    })
  }
}
