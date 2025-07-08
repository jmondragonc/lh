import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import type { LonghornAuthenticatedRequest } from "../../../../types/longhorn-auth"

/**
 * GET /admin/longhorn/gift-cards/stats
 * Obtiene estadísticas generales de gift cards
 */
export const GET = async (
  req: LonghornAuthenticatedRequest,
  res: MedusaResponse
) => {
  try {
    console.log('=== GET /admin/longhorn/gift-cards/stats ===')
    
    const longhornService = req.scope.resolve("longhorn")
    const currentUserId = req.longhornAuth.userId
    const { user_id } = req.query
    
    // Determinar el user_id a usar para filtrar
    // Solo Super Admin puede ver estadísticas de otros usuarios
    let filterUserId: string | undefined
    
    if (user_id && typeof user_id === 'string') {
      // Verificar si el usuario actual puede ver estadísticas de otros
      const isSuperAdmin = await longhornService.isSuperAdmin(currentUserId)
      if (isSuperAdmin) {
        filterUserId = user_id
      } else {
        // Usuarios no-super admin solo pueden ver sus propias estadísticas
        filterUserId = currentUserId
      }
    } else {
      // Si no se especifica user_id, mostrar estadísticas del usuario actual
      filterUserId = currentUserId
    }
    
    // Obtener estadísticas
    const stats = await longhornService.getGiftCardStats(filterUserId)
    
    console.log('📊 Gift card stats:', stats)
    
    res.json({
      stats,
      user_id: filterUserId
    })
    
  } catch (error) {
    console.error('Error fetching gift card stats:', error)
    res.status(500).json({
      message: "Failed to fetch gift card statistics",
      error: error.message
    })
  }
}
