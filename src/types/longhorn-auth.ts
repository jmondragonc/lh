import type { MedusaRequest } from "@medusajs/framework"
// AuthContext type - defining locally since import is problematic
interface AuthContext {
  user_id?: string;
  [key: string]: any;
}

// Tipos para el middleware de autenticación de Longhorn
export interface LonghornAuthInfo {
  userId: string
  actorType: string
  isProduction: boolean
  tokenExpires: Date | null
}

// Extensión del tipo MedusaRequest para incluir información de Longhorn
declare global {
  namespace Express {
    interface Request {
      longhornAuth?: LonghornAuthInfo
    }
  }
}

// Re-exportar para uso en endpoints
export interface LonghornAuthenticatedRequest extends MedusaRequest {
  longhornAuth?: LonghornAuthInfo
  auth_context?: AuthContext & {
    user_id?: string
  }
  body: unknown
}
