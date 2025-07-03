import { MedusaService } from "@medusajs/framework/utils"
import LonghornStore from "../models/store"

type CreateStoreInput = {
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

class LonghornStoreService extends MedusaService({
  LonghornStore,
}) {
  async createStore(data: CreateStoreInput) {
    // Verificar que el código sea único
    const existingStore = await this.longhornStoreRepository_.findOne({
      where: {
        code: data.code,
        deleted_at: null
      }
    })

    if (existingStore) {
      throw new Error(`Store with code ${data.code} already exists`)
    }

    return await this.longhornStoreRepository_.create(data)
  }

  async getActiveStores() {
    return await this.longhornStoreRepository_.find({
      where: {
        is_active: true,
        deleted_at: null
      }
    })
  }

  async getStoreByCode(code: string) {
    return await this.longhornStoreRepository_.findOne({
      where: {
        code,
        deleted_at: null
      }
    })
  }

  async updateStore(id: string, data: Partial<CreateStoreInput>) {
    return await this.longhornStoreRepository_.update(id, data)
  }

  async deactivateStore(id: string) {
    return await this.longhornStoreRepository_.update(id, {
      is_active: false
    })
  }

  async deleteStore(id: string) {
    return await this.longhornStoreRepository_.delete(id)
  }

  async seedDefaultStores() {
    const existingStores = await this.getActiveStores()
    
    if (existingStores.length === 0) {
      const defaultStores: CreateStoreInput[] = [
        {
          name: "Longhorn Steakhouse - Centro",
          code: "LH001",
          description: "Local principal en el centro de la ciudad",
          address: "Av. Principal 123, Centro",
          phone: "+51-1-234-5678",
          email: "centro@longhorn.pe",
          business_hours: {
            monday: { open: "11:00", close: "23:00" },
            tuesday: { open: "11:00", close: "23:00" },
            wednesday: { open: "11:00", close: "23:00" },
            thursday: { open: "11:00", close: "23:00" },
            friday: { open: "11:00", close: "24:00" },
            saturday: { open: "11:00", close: "24:00" },
            sunday: { open: "12:00", close: "22:00" }
          },
          delivery_settings: {
            enabled: true,
            delivery_radius: 5,
            min_order_amount: 50,
            delivery_fee: 10
          }
        },
        {
          name: "Longhorn Steakhouse - San Isidro",
          code: "LH002",
          description: "Local en el distrito financiero",
          address: "Av. Rivera Navarrete 456, San Isidro",
          phone: "+51-1-234-5679",
          email: "sanisidro@longhorn.pe",
          business_hours: {
            monday: { open: "11:00", close: "23:00" },
            tuesday: { open: "11:00", close: "23:00" },
            wednesday: { open: "11:00", close: "23:00" },
            thursday: { open: "11:00", close: "23:00" },
            friday: { open: "11:00", close: "24:00" },
            saturday: { open: "11:00", close: "24:00" },
            sunday: { open: "12:00", close: "22:00" }
          },
          delivery_settings: {
            enabled: true,
            delivery_radius: 8,
            min_order_amount: 60,
            delivery_fee: 12
          }
        }
      ]

      const createdStores = []
      for (const storeData of defaultStores) {
        const store = await this.createStore(storeData)
        createdStores.push(store)
      }

      return createdStores
    }

    return []
  }
}

export default LonghornStoreService
