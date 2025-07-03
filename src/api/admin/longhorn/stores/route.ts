import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"
import LonghornStoreService from "../../../../modules/longhorn/services/store"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const longhornStoreService = req.scope.resolve("longhornStoreService") as LonghornStoreService
    
    const stores = await longhornStoreService.getActiveStores()

    res.json({
      stores,
      count: stores.length
    })

  } catch (error) {
    console.error("Error fetching stores:", error)
    res.status(500).json({
      message: "Failed to fetch stores",
      error: error.message
    })
  }
}

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const longhornStoreService = req.scope.resolve("longhornStoreService") as LonghornStoreService
    
    const { 
      name, 
      code, 
      description, 
      address, 
      phone, 
      email, 
      business_hours, 
      delivery_settings, 
      metadata 
    } = req.body

    // Validar datos requeridos
    if (!name || !code) {
      return res.status(400).json({
        message: "Missing required fields: name, code"
      })
    }

    const store = await longhornStoreService.createStore({
      name,
      code,
      description,
      address,
      phone,
      email,
      business_hours,
      delivery_settings,
      metadata
    })

    res.status(201).json({
      store,
      message: "Store created successfully"
    })

  } catch (error) {
    console.error("Error creating store:", error)
    res.status(500).json({
      message: "Failed to create store",
      error: error.message
    })
  }
}
