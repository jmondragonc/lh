import { 
  MedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    console.log('=== FILTRADO JERÁRQUICO DE USUARIOS ===')
    
    const userModuleService = req.scope.resolve(Modules.USER)
    const longhornService = req.scope.resolve("longhorn")
    const { simulate_user } = req.query

    // SIMULACIÓN TEMPORAL: Para testing sin autenticación
    const currentUserId = simulate_user as string || req.auth_context?.user_id
    console.log('🔍 DEBUGGING - Current user ID (simulated):', currentUserId)
    console.log('🔍 DEBUGGING - simulate_user from query:', simulate_user)
    console.log('🔍 DEBUGGING - req.auth_context?.user_id:', req.auth_context?.user_id)

    // DEBUGGING CRÍTICO: Si estamos usando un ID ficticio, reportarlo
    if (currentUserId === 'super_admin_user_id' || currentUserId === 'manager_user_id' || currentUserId === 'staff_user_id') {
      console.log('🚨 PROBLEM DETECTED: Using fictional user ID for simulation:', currentUserId)
      console.log('🚨 This will cause incorrect filtering behavior!')
    }

    // Obtener todos los usuarios del sistema
    const allUsers = await userModuleService.listUsers()
    console.log('Total users in system:', allUsers.length)

    // Enriquecer usuarios con roles de Longhorn
    const enrichedUsers = await Promise.all(
      allUsers.map(async (user) => {
        try {
          const userRoles = await longhornService.getUserRoles(user.id)
          const longhornStores = await longhornService.getUserStores(user.id)
          
          return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_url: user.avatar_url,
            created_at: user.created_at,
            longhorn_roles: userRoles,
            longhorn_stores: longhornStores
          }
        } catch (error) {
          console.warn(`Error enriching user ${user.id}:`, error.message)
          return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_url: user.avatar_url,
            created_at: user.created_at,
            longhorn_roles: [],
            longhorn_stores: []
          }
        }
      })
    )

    // APLICAR FILTRADO JERÁRQUICO CRÍTICO
    let filteredUsers = enrichedUsers
    let isFiltered = false

    if (currentUserId) {
      try {
        const isSuperAdmin = await longhornService.isSuperAdmin(currentUserId)
        console.log('Current user is Super Admin?', isSuperAdmin)
        
        if (isSuperAdmin) {
          // SUPER ADMIN VE TODO SIN RESTRICCIONES
          console.log('✅ SUPER ADMIN - NO FILTERING APPLIED')
          console.log('✅ Super Admin can see all users including other Super Admins')
          filteredUsers = enrichedUsers // Sin filtrado
          isFiltered = false
        } else {
          // USUARIOS MENORES NO VEN SUPER ADMINS
          console.log('🔒 NON-SUPER ADMIN USER - APPLYING HIERARCHICAL FILTERING')
          console.log('🔒 Filtering out Super Admin users...')
          
          filteredUsers = enrichedUsers.filter(user => {
            console.log(`\nChecking user: ${user.email}`)
            console.log('User roles:', user.longhorn_roles)
            
            const hasSuperAdminRole = user.longhorn_roles.some(userRole => {
              console.log('  Checking role:', userRole.role)
              console.log('  Role type:', userRole.role?.type)
              console.log('  Expected type:', 'SUPER_ADMIN')
              console.log('  Comparison result:', userRole.role?.type === 'SUPER_ADMIN')
              const isSuperAdmin = userRole.role?.type === 'SUPER_ADMIN'
              console.log('  Is super admin?', isSuperAdmin)
              return isSuperAdmin
            })
            
            console.log(`  User ${user.email} has Super Admin role:`, hasSuperAdminRole)
            console.log(`  Will ${hasSuperAdminRole ? 'FILTER OUT' : 'KEEP'} this user`)
            
            return !hasSuperAdminRole // Filtrar usuarios con roles Super Admin
          })
          
          isFiltered = true
          console.log('\n=== HIERARCHICAL FILTER APPLIED ===')
          console.log('Original users:', enrichedUsers.length)
          console.log('Filtered users (removed Super Admins):', filteredUsers.length)
          console.log('Users kept:', filteredUsers.map(u => u.email))
        }
      } catch (error) {
        console.error('Error checking user hierarchy:', error)
        // En caso de error, aplicar filtrado conservador por seguridad
        // SOLO para usuarios no-super-admin
        filteredUsers = enrichedUsers.filter(user => {
          const hasSuperAdminRole = user.longhorn_roles.some(userRole => 
            userRole.role?.type === 'SUPER_ADMIN'
          )
          return !hasSuperAdminRole
        })
        isFiltered = true
        console.log('⚠️ Error fallback: Applied conservative filtering')
      }
    } else {
      console.log('No current user ID - allowing all users (internal API)')
    }

    console.log('Final users to return:', filteredUsers.length)
    console.log('Hierarchy filtered?', isFiltered)

    res.json({
      users: filteredUsers,
      count: filteredUsers.length,
      filtered: isFiltered
    })

  } catch (error) {
    console.error("=== ERROR in GET /admin/longhorn/users ===")
    console.error("Error fetching users:", error)
    console.error("Stack trace:", error.stack)
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message
    })
  }
}

export const POST = async (
  req: MedusaRequest,
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
