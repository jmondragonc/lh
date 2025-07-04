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

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    console.log('=== STARTING POST /admin/longhorn/users ===')
    console.log('Request body:', req.body)
    
    const { email, password, first_name, last_name, avatar_url } = req.body
    
    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      })
    }
    
    const authModuleService = req.scope.resolve(Modules.AUTH)
    const userModuleService = req.scope.resolve(Modules.USER)
    console.log('Services resolved successfully')
    
    // Paso 1: Crear Auth Identity con credenciales
    console.log('Step 1: Creating auth identity...')
    const authData = {
      url: req.url,
      headers: req.headers,
      query: req.query,
      body: { email, password },
      protocol: req.protocol,
    }
    
    const { success, error, authIdentity } = await authModuleService.register(
      "emailpass", 
      authData
    )
    
    if (!success || !authIdentity) {
      console.error('Auth identity creation failed:', error)
      return res.status(400).json({
        message: error || "Failed to create auth identity"
      })
    }
    
    console.log('Auth identity created successfully:', authIdentity.id)
    
    // Paso 2: Crear usuario en el sistema
    console.log('Step 2: Creating user...')
    const userData = {
      email,
      first_name: first_name || '',
      last_name: last_name || '',
      avatar_url: avatar_url || null,
      metadata: {
        auth_identity_id: authIdentity.id
      }
    }
    
    const [createdUser] = await userModuleService.createUsers([userData])
    console.log('User created successfully:', createdUser.id)
    
    // Paso 3: Vincular auth identity al usuario usando el módulo de autenticación
    console.log('Step 3: Linking auth identity to user...')
    await authModuleService.updateAuthIdentities([
      {
        id: authIdentity.id,
        app_metadata: {
          user_id: createdUser.id
        }
      }
    ])
    
    console.log('User creation process completed successfully')
    
    res.status(201).json({
      user: {
        id: createdUser.id,
        email: createdUser.email,
        first_name: createdUser.first_name,
        last_name: createdUser.last_name,
        avatar_url: createdUser.avatar_url,
        created_at: createdUser.created_at,
        auth_identity_id: authIdentity.id
      },
      message: "User created successfully with authentication"
    })
    
  } catch (error) {
    console.error("=== ERROR in POST /admin/longhorn/users ===")
    console.error("Error creating user:", error)
    console.error("Stack trace:", error.stack)
    
    // Manejar errores específicos
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      return res.status(400).json({
        message: "A user with this email already exists"
      })
    }
    
    res.status(500).json({
      message: "Failed to create user",
      error: error.message
    })
  }
}
