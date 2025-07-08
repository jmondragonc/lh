import { defineMiddlewares, authenticate } from "@medusajs/framework/http";
import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http";

// Middleware personalizado para validación adicional de autenticación
const validateLonghornAuth = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  try {
    // Verificar que tenemos un contexto de autenticación válido
    const authContext = (req as any).auth_context;

    if (!authContext) {
      //console.error('🚨 SECURITY: Missing auth_context in Longhorn endpoint')
      return res.status(401).json({
        message: "Autenticación requerida",
        error: "MISSING_AUTH_CONTEXT",
        timestamp: new Date().toISOString(),
      });
    }

    // Verificar que tenemos un user_id válido
    const userId = authContext.app_metadata?.user_id || authContext.actor_id;

    if (!userId) {
      // console.error('🚨 SECURITY: Missing user_id in auth_context')
      // console.error('🚨 Auth context:', JSON.stringify(authContext, null, 2))
      return res.status(401).json({
        message: "Usuario no identificado",
        error: "MISSING_USER_ID",
        timestamp: new Date().toISOString(),
      });
    }

    // Verificar que el actor_type es 'user'
    if (authContext.actor_type !== "user") {
      //console.error('🚨 SECURITY: Invalid actor_type:', authContext.actor_type)
      return res.status(403).json({
        message: "Tipo de actor no autorizado",
        error: "INVALID_ACTOR_TYPE",
        expected: "user",
        received: authContext.actor_type,
        timestamp: new Date().toISOString(),
      });
    }

    // Validar que el token no haya expirado
    if (authContext.exp && authContext.exp < Math.floor(Date.now() / 1000)) {
      //console.error('🚨 SECURITY: Expired token')
      return res.status(401).json({
        message: "Token expirado",
        error: "TOKEN_EXPIRED",
        timestamp: new Date().toISOString(),
      });
    }

    // En producción, NO permitir simulate_user
    if (process.env.NODE_ENV === "production" && req.query.simulate_user) {
      //console.error('🚨 SECURITY: simulate_user not allowed in production')
      return res.status(403).json({
        message: "Simulación de usuario no permitida en producción",
        error: "SIMULATE_USER_FORBIDDEN",
        timestamp: new Date().toISOString(),
      });
    }

    // Log de seguridad (solo en desarrollo)
    if (process.env.NODE_ENV === "development") {
      // console.log('✅ SECURITY: Longhorn auth validation passed')
      // console.log('✅ User ID:', userId)
      // console.log('✅ Actor type:', authContext.actor_type)
      // console.log('✅ Token expires:', new Date(authContext.exp * 1000).toISOString())
    }

    // Añadir información de usuario verificada al request para fácil acceso
    req.longhornAuth = {
      userId,
      actorType: authContext.actor_type,
      isProduction: process.env.NODE_ENV === "production",
      tokenExpires: authContext.exp ? new Date(authContext.exp * 1000) : null,
    };

    next();
  } catch (error) {
    //console.error('🚨 SECURITY: Error in Longhorn auth validation:', error)
    return res.status(500).json({
      message: "Error en validación de autenticación",
      error: "AUTH_VALIDATION_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/longhorn/*",
      middlewares: [
        // Primero: Autenticación estándar de MedusaJS
        authenticate("user", ["session", "bearer", "api-key"]),
        // Segundo: Validación adicional específica de Longhorn
        validateLonghornAuth,
      ],
    },
  ],
});
