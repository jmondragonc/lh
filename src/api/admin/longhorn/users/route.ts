import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import type { LonghornAuthenticatedRequest } from "../../../types/longhorn-auth";

export const GET = async (
  req: LonghornAuthenticatedRequest,
  res: MedusaResponse
) => {
  try {
    // console.log('=== FILTRADO JERÁRQUICO DE USUARIOS ===')

    const userModuleService = req.scope.resolve(Modules.USER);
    const longhornService = req.scope.resolve("longhorn");
    const { simulate_user } = req.query;

    // OBTENER USUARIO ACTUAL DEL MIDDLEWARE SEGURO
    const currentUserId = req.longhornAuth.userId;

    // Solo permitir simulate_user en desarrollo (ya validado por middleware)
    const finalUserId =
      !req.longhornAuth.isProduction && simulate_user
        ? (simulate_user as string)
        : currentUserId;

    // console.log('✅ USUARIO ACTUAL - Del middleware seguro:', currentUserId)
    // console.log('✅ USUARIO ACTUAL - Es producción:', req.longhornAuth.isProduction)
    // console.log('✅ USUARIO ACTUAL - Simulate User:', simulate_user)
    // console.log('✅ USUARIO ACTUAL - Final User ID:', finalUserId)
    // console.log('✅ USUARIO ACTUAL - Token expira:', req.longhornAuth.tokenExpires?.toISOString())

    // Obtener todos los usuarios del sistema
    const allUsers = await userModuleService.listUsers();
    //console.log("📊 Total users in system:", allUsers.length);

    // Enriquecer usuarios con roles de Longhorn
    const enrichedUsers = await Promise.all(
      allUsers.map(async (user) => {
        try {
          const userRoles = await longhornService.getUserRoles(user.id);
          const longhornStores = await longhornService.getUserStores(user.id);

          return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_url: user.avatar_url,
            created_at: user.created_at,
            longhorn_roles: userRoles,
            longhorn_stores: longhornStores,
          };
        } catch (error) {
          //console.warn(`⚠️ Error enriching user ${user.id}:`, error.message);
          return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_url: user.avatar_url,
            created_at: user.created_at,
            longhorn_roles: [],
            longhorn_stores: [],
          };
        }
      })
    );

    // console.log("📊 Enriched users count:", enrichedUsers.length);

    // APLICAR FILTRADO JERÁRQUICO CRÍTICO
    let filteredUsers = enrichedUsers;
    let isFiltered = false;

    if (finalUserId) {
      try {
        // console.log('\n=== STARTING HIERARCHICAL FILTERING ===')
        // console.log('🔍 Checking if current user is Super Admin...')
        // console.log('🔍 Current user ID:', finalUserId)

        const isSuperAdmin = await longhornService.isSuperAdmin(finalUserId);
        // console.log('🔍 isSuperAdmin() returned:', isSuperAdmin)
        // console.log('🔍 Type of isSuperAdmin result:', typeof isSuperAdmin)
        // console.log('🔍 Is isSuperAdmin truthy?', !!isSuperAdmin)
        // console.log('🔍 CRITICAL: About to evaluate if condition with value:', isSuperAdmin)
        // console.log('🔍 CRITICAL: Condition will be:', isSuperAdmin ? 'TRUE (Super Admin block)' : 'FALSE (Non-Super Admin block)')

        if (isSuperAdmin) {
          // SUPER ADMIN VE TODO SIN RESTRICCIONES - CRÍTICO
          // console.log('\n✅ SUPER ADMIN CONFIRMED - NO FILTERING APPLIED')
          // console.log('✅ Super Admin has unrestricted access to ALL users')
          // console.log('✅ Including other Super Admins')
          // console.log('✅ Total users visible:', enrichedUsers.length)
          // console.log('✅ User emails:', enrichedUsers.map(u =u.email).join(', '))
          // console.log('✅ CRITICAL: Setting filteredUsers = enrichedUsers (NO FILTER)')
          // console.log('✅ CRITICAL: Setting isFiltered = false')

          // CRÍTICO: Super Admin NO tiene filtrado
          filteredUsers = enrichedUsers;
          isFiltered = false;

          // console.log('✅ POST-ASSIGNMENT: filteredUsers.length =', filteredUsers.length)
          // console.log('✅ POST-ASSIGNMENT: isFiltered =', isFiltered)
          // console.log('✅ SUPER ADMIN BLOCK COMPLETED SUCCESSFULLY')
        } else {
          // USUARIOS MENORES NO VEN SUPER ADMINS - APLICAR FILTRO
          // console.log("\n🔒 NON-SUPER ADMIN USER CONFIRMED");
          // console.log("🔒 APPLYING HIERARCHICAL FILTERING");
          // console.log("🔒 Will hide Super Admin users from this user");
          // console.log(
          //   "🔒 CRITICAL: This block should NOT execute for Super Admin"
          // );

          //console.log("\n--- FILTERING PROCESS ---");
          const originalCount = enrichedUsers.length;

          filteredUsers = enrichedUsers.filter((user) => {
            // console.log(`\n🔍 Evaluating user: ${user.email} (ID: ${user.id})`);
            // console.log(
            //   "🔍 User longhorn_roles count:",
            //   user.longhorn_roles?.length || 0
            // );

            if (!user.longhorn_roles || user.longhorn_roles.length === 0) {
              //console.log("🔍 User has no roles - KEEPING (not Super Admin)");
              return true;
            }

            const hasSuperAdminRole = user.longhorn_roles.some((userRole) => {
              const roleName = userRole.role?.name || "Unknown";
              const roleType = userRole.role?.type || "Unknown";
              //console.log(`  📋 Checking role: ${roleName} (${roleType})`);

              const isSuperAdminRole = roleType === "SUPER_ADMIN";
              //console.log(`  📋 Is Super Admin role? ${isSuperAdminRole}`);
              return isSuperAdminRole;
            });

            const shouldKeepUser = !hasSuperAdminRole;
            // console.log(
            //   `🔍 User ${user.email} has Super Admin role: ${hasSuperAdminRole}`
            // );
            // console.log(
            //   `🔍 Decision: ${
            //     shouldKeepUser ? "✅ KEEP USER" : "❌ FILTER OUT (Super Admin)"
            //   }`
            // );

            return shouldKeepUser;
          });

          isFiltered = true;
          // console.log("\n=== HIERARCHICAL FILTER RESULTS ===");
          // console.log("📊 Original users count:", originalCount);
          // console.log("📊 Filtered users count:", filteredUsers.length);
          // console.log(
          //   "📊 Super Admins filtered out:",
          //   originalCount - filteredUsers.length
          // );
          // console.log(
          //   "📊 Final visible users:",
          //   filteredUsers.map((u) => u.email).join(", ")
          // );
        }
      } catch (error) {
        // console.error("\n🚨 ERROR in hierarchical filtering:", error);
        // console.error("🚨 Error message:", error.message);
        // console.error("🚨 Error stack:", error.stack);

        // En caso de error, aplicar filtrado conservador por seguridad
        // Remover Super Admins por defecto para proteger el sistema
        //console.log("🚨 Applying emergency conservative filtering");

        filteredUsers = enrichedUsers.filter((user) => {
          const hasSuperAdminRole =
            user.longhorn_roles?.some(
              (userRole) => userRole.role?.type === "SUPER_ADMIN"
            ) || false;
          return !hasSuperAdminRole;
        });
        isFiltered = true;
        // console.log(
        //   "🚨 Emergency filter applied - removed all Super Admins for security"
        // );
        // console.log("🚨 Emergency filtered count:", filteredUsers.length);
      }
    } else {
      // console.log("\n⚠️ No current user ID provided");
      // console.log("⚠️ Assuming internal API call - allowing all users");
      // console.log("⚠️ This should only happen for system/internal operations");
    }

    // console.log("\n=== FINAL RESULTS ===");
    // console.log("📊 Final users to return:", filteredUsers.length);
    // console.log("📊 Hierarchy filtered?", isFiltered);
    // console.log(
    //   "📊 Final user emails:",
    //   filteredUsers.map((u) => u.email).join(", ")
    // );
    // console.log("📊 VERIFICATION: All users count =", enrichedUsers.length);
    // console.log(
    //   "📊 VERIFICATION: Filtered users count =",
    //   filteredUsers.length
    // );
    // console.log(
    //   "📊 VERIFICATION: Users removed =",
    //   enrichedUsers.length - filteredUsers.length
    // );

    res.json({
      users: filteredUsers,
      count: filteredUsers.length,
      filtered: isFiltered,
    });
  } catch (error) {
    // console.error("=== ERROR in GET /admin/longhorn/users ===");
    // console.error("Error fetching users:", error);
    // console.error("Stack trace:", error.stack);
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

export const POST = async (
  req: LonghornAuthenticatedRequest,
  res: MedusaResponse
) => {
  try {
    // console.log("=== STARTING POST /admin/longhorn/users ===");
    // console.log("Request body:", req.body);

    const { email, password, first_name, last_name, avatar_url } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const authModuleService = req.scope.resolve(Modules.AUTH);
    const userModuleService = req.scope.resolve(Modules.USER);
    //console.log("Services resolved successfully");

    // Paso 1: Crear Auth Identity con credenciales
    //console.log("Step 1: Creating auth identity...");
    const authData = {
      url: req.url,
      headers: req.headers,
      query: req.query,
      body: { email, password },
      protocol: req.protocol,
    };

    const { success, error, authIdentity } = await authModuleService.register(
      "emailpass",
      authData
    );

    if (!success || !authIdentity) {
      //console.error("Auth identity creation failed:", error);
      return res.status(400).json({
        message: error || "Failed to create auth identity",
      });
    }

    //console.log("Auth identity created successfully:", authIdentity.id);

    // Paso 2: Crear usuario en el sistema
    //console.log("Step 2: Creating user...");
    const userData = {
      email,
      first_name: first_name || "",
      last_name: last_name || "",
      avatar_url: avatar_url || null,
      metadata: {
        auth_identity_id: authIdentity.id,
      },
    };

    const [createdUser] = await userModuleService.createUsers([userData]);
    //console.log("User created successfully:", createdUser.id);

    // Paso 3: Vincular auth identity al usuario usando el módulo de autenticación
    //console.log("Step 3: Linking auth identity to user...");
    await authModuleService.updateAuthIdentities([
      {
        id: authIdentity.id,
        app_metadata: {
          user_id: createdUser.id,
        },
      },
    ]);

    //console.log("User creation process completed successfully");

    res.status(201).json({
      user: {
        id: createdUser.id,
        email: createdUser.email,
        first_name: createdUser.first_name,
        last_name: createdUser.last_name,
        avatar_url: createdUser.avatar_url,
        created_at: createdUser.created_at,
        auth_identity_id: authIdentity.id,
      },
      message: "User created successfully with authentication",
    });
  } catch (error) {
    // console.error("=== ERROR in POST /admin/longhorn/users ===");
    // console.error("Error creating user:", error);
    // console.error("Stack trace:", error.stack);

    // Manejar errores específicos
    if (
      error.message?.includes("already exists") ||
      error.message?.includes("duplicate")
    ) {
      return res.status(400).json({
        message: "A user with this email already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
};
