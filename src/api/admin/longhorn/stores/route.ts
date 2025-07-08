import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse
} from "@medusajs/framework"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    const longhornService = req.scope.resolve("longhorn")
    
    const stores = await longhornService.getActiveStores()

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
    const longhornService = req.scope.resolve("longhorn")
    
    const body = req.body as {
      name: string
      code: string
      description?: string
      address?: string
      phone?: string
      email?: string
      business_hours?: Record<string, any>
      delivery_settings?: Record<string, any>
      metadata?: Record<string, any>
    }
    
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
    } = body

    // Validar datos requeridos
    if (!name || !code) {
      return res.status(400).json({
        message: "Missing required fields: name, code"
      })
    }

    const store = await longhornService.createStore({
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