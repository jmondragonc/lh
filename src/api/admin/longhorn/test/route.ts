import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    console.log('=== TEST ENDPOINT - CHECKING LONGHORN MODULE ===')
    
    // Verificar que el módulo Longhorn se puede resolver
    const longhornService = req.scope.resolve("longhorn")
    console.log('✅ Longhorn module resolved successfully')
    
    // Test simple: obtener roles sin JOINs complejos
    const roles = await longhornService.listLonghornRoles({ deleted_at: null })
    console.log('✅ Basic roles query successful, count:', roles.length)
    
    // Test simple: obtener tiendas sin JOINs complejos
    const stores = await longhornService.listLonghornStores({ deleted_at: null })
    console.log('✅ Basic stores query successful, count:', stores.length)
    
    res.json({
      status: "OK",
      module: "longhorn",
      message: "Longhorn module is working correctly",
      data: {
        roles_count: roles.length,
        stores_count: stores.length,
        roles_sample: roles.slice(0, 2),
        stores_sample: stores.slice(0, 2)
      }
    })

  } catch (error) {
    console.error("=== TEST ENDPOINT ERROR ===")
    console.error("Error:", error)
    console.error("Stack:", error.stack)
    
    res.status(500).json({
      status: "ERROR",
      module: "longhorn",
      message: "Longhorn module test failed",
      error: error.message,
      stack: error.stack
    })
  }
}
