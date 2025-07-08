import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import type { LonghornAuthenticatedRequest } from "../../../../types/longhorn-auth"

/**
 * POST /admin/longhorn/gift-cards/generate-code
 * Genera un código único para gift card
 */
export const POST = async (
  req: LonghornAuthenticatedRequest,
  res: MedusaResponse
) => {
  try {
    console.log('=== POST /admin/longhorn/gift-cards/generate-code ===')
    
    const longhornService = req.scope.resolve("longhorn")
    const { prefix = "GIFT" } = req.body
    
    // Generar código único
    const code = await longhornService.generateUniqueGiftCardCode(prefix)
    
    console.log('📊 Generated unique code:', code)
    
    res.json({
      code,
      prefix
    })
    
  } catch (error) {
    console.error('Error generating gift card code:', error)
    res.status(500).json({
      message: "Failed to generate gift card code",
      error: error.message
    })
  }
}
