import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import type { LonghornAuthenticatedRequest } from "../../../../types/longhorn-auth";

export const GET = async (
  req: LonghornAuthenticatedRequest,
  res: MedusaResponse
) => {
  try {
    const { id } = req.params;
    const userModuleService = req.scope.resolve(Modules.USER);
    const longhornService = req.scope.resolve("longhorn");

    // Obtener el usuario
    const user = await userModuleService.retrieveUser(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Usuario autenticado por middleware seguro
    //console.log('✅ Authenticated user ID (del middleware):', req.longhornAuth.userId)

    // Obtener roles y tiendas del usuario
    const userRoles = await longhornService.getUserRoles(id);
    const userStores = await longhornService.getUserStores(id);

    const enrichedUser = {
      ...user,
      longhorn_roles: userRoles,
      longhorn_stores: userStores,
    };

    res.json({
      user: enrichedUser,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

export const PUT = async (
  req: LonghornAuthenticatedRequest,
  res: MedusaResponse
) => {
  try {
    //console.log('=== STARTING PUT UPDATE USER ===', { userId: req.params.id })

    const { id } = req.params;
    const userModuleService = req.scope.resolve(Modules.USER);
    const longhornService = req.scope.resolve("longhorn");

    // OBTENER USUARIO ACTUAL DEL MIDDLEWARE SEGURO
    const currentUserId = req.longhornAuth?.userId;
    
    if (!currentUserId) {
      return res.status(401).json({
        message: "Authentication required"
      })
    }
    //console.log('✅ Current user ID del middleware seguro:', currentUserId)

    const requestBody = req.body as {
      first_name?: string
      last_name?: string
      email?: string
      avatar_url?: string
      metadata?: Record<string, any>
    }
    const { first_name, last_name, email, avatar_url, metadata } = requestBody;

    // console.log('🔍 PUT UPDATE - Received data:', {
    //   first_name,
    //   last_name,
    //   email,
    //   avatar_url,
    //   metadata
    // })

    // Actualizar datos básicos del usuario
    const updateData = {
      id,
      first_name,
      last_name,
      email,
      avatar_url,
      metadata,
    };

    //console.log('🔍 PUT UPDATE - Sending to userModuleService.updateUsers:', updateData)

    const [updatedUser] = await userModuleService.updateUsers([updateData]);

    // console.log('🔍 PUT UPDATE - Updated user result:', {
    //   id: updatedUser.id,
    //   email: updatedUser.email,
    //   avatar_url: updatedUser.avatar_url,
    //   first_name: updatedUser.first_name,
    //   last_name: updatedUser.last_name
    // })

    // Obtener información completa actualizada
    const userRoles = await longhornService.getUserRoles(id);
    const userStores = await longhornService.getUserStores(id);

    const enrichedUser = {
      ...updatedUser,
      longhorn_roles: userRoles,
      longhorn_stores: userStores,
    };

    res.json({
      user: enrichedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    //console.error("Error updating user:", error)
    res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
};

export const DELETE = async (
  req: LonghornAuthenticatedRequest,
  res: MedusaResponse
) => {
  try {
    //console.log('=== STARTING DELETE USER ===', { userId: req.params.id })

    const { id } = req.params;
    const userModuleService = req.scope.resolve(Modules.USER);
    const longhornService = req.scope.resolve("longhorn");
    const authModuleService = req.scope.resolve(Modules.AUTH);

    // OBTENER USUARIO ACTUAL DEL MIDDLEWARE SEGURO
    const currentUserId = req.longhornAuth?.userId;
    
    if (!currentUserId) {
      return res.status(401).json({
        message: "Authentication required"
      })
    }

    // console.log('🔒 SECURITY CHECK - User Deletion')
    // console.log('Current user:', currentUserId)
    // console.log('Target user to delete:', id)

    // Verificar si el usuario actual es Super Admin
    const isCurrentUserSuperAdmin = await longhornService.isSuperAdmin(
      currentUserId
    );
    //console.log('Current user is Super Admin?', isCurrentUserSuperAdmin)

    // Verificar si el usuario objetivo tiene rol Super Admin
    const targetUserRoles = await longhornService.getUserRoles(id);
    const targetHasSuperAdminRole = targetUserRoles.some(
      (userRole) => userRole.role?.type === "SUPER_ADMIN"
    );
    //console.log('Target user has Super Admin role?', targetHasSuperAdminRole)

    // REGLA CRÍTICA: Solo Super Admin puede eliminar otros Super Admins
    if (targetHasSuperAdminRole && !isCurrentUserSuperAdmin) {
      console.log(
        "❌ SECURITY VIOLATION: Non-Super Admin trying to delete Super Admin"
      );
      return res.status(403).json({
        message:
          "No tienes permisos para eliminar usuarios con roles de Super Administrador",
        error: "INSUFFICIENT_PRIVILEGES",
      });
    }

    // No permitir autoborrado (opcional, pero recomendado)
    if (currentUserId === id) {
      //console.log('❌ SECURITY VIOLATION: User trying to delete themselves')
      return res.status(403).json({
        message: "No puedes eliminar tu propia cuenta",
        error: "SELF_DELETION_NOT_ALLOWED",
      });
    }

    //console.log('✅ Security checks passed, starting deletion process...')

    // Paso 1: Simplificado - Eliminar asignaciones de roles Longhorn
    try {
      //console.log('Attempting to get user roles...')
      const userRoles = await longhornService.getUserRoles(id);
      //console.log('User roles to remove:', userRoles?.length || 0)

      if (userRoles && userRoles.length > 0) {
        for (const userRole of userRoles) {
          //console.log('Removing role:', userRole)
          await longhornService.removeUserRole(
            id,
            userRole.role_id,
            userRole.store_id || undefined
          );
        }
        //console.log('User roles removed successfully')
      } else {
        //console.log('No user roles to remove')
      }
    } catch (error) {
      //console.warn('Error removing user roles (continuing):', error.message)
    }

    // Paso 2: Simplificado - Eliminar asignaciones de tiendas Longhorn
    try {
      //console.log('Attempting to get user stores...')
      const userStores = await longhornService.getUserStores(id);
      //console.log('User stores to remove:', userStores?.length || 0)

      if (userStores && userStores.length > 0) {
        for (const userStore of userStores) {
          //console.log('Removing store:', userStore)
          await longhornService.removeUserFromStore(id, userStore.store_id);
        }
        //console.log('User stores removed successfully')
      } else {
        //console.log('No user stores to remove')
      }
    } catch (error) {
      //console.warn('Error removing user stores (continuing):', error.message)
    }

    // Paso 3: Buscar y eliminar auth identity asociada
    try {
      // Buscar auth identity por metadata del usuario
      const user = await userModuleService.retrieveUser(id);
      if (user?.metadata?.auth_identity_id) {
        await authModuleService.deleteAuthIdentities([
          user.metadata.auth_identity_id as string,
        ]);
        //console.log('Auth identity removed successfully')
      } else {
        //console.log('No auth identity found in user metadata')
      }
    } catch (error) {
      //console.warn('Error removing auth identity (continuing):', error.message)
    }

    // Paso 4: Eliminar el usuario del sistema
    await userModuleService.deleteUsers([id]);
    //console.log('User deleted from system successfully')

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    //console.error("=== ERROR DELETING USER ===")
    //console.error("Error deleting user:", error)
    //console.error("Stack trace:", error.stack)
    //console.error("Request user:", req.user)
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
};
