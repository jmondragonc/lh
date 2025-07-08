import type { MedusaRequest } from "@medusajs/framework"

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
  longhornAuth: LonghornAuthInfo
}
