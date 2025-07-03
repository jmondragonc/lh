import { MedusaService } from "@medusajs/framework/utils"
import LonghornUserStore from "../models/user-store"

type CreateUserStoreInput = {
  user_id: string
  store_id: string
  metadata?: Record<string, any>
}

class LonghornUserStoreService extends MedusaService({
  LonghornUserStore,
}) {
  async assignUserToStore(data: CreateUserStoreInput) {
    // Verificar que no exista ya una asignación activa
    const existingAssignment = await this.longhornUserStoreRepository_.findOne({
      where: {
        user_id: data.user_id,
        store_id: data.store_id,
        is_active: true,
        deleted_at: null
      }
    })

    if (existingAssignment) {
      throw new Error(`User is already assigned to this store`)
    }

    return await this.longhornUserStoreRepository_.create(data)
  }

  async getUserStores(user_id: string) {
    return await this.longhornUserStoreRepository_.find({
      where: {
        user_id,
        is_active: true,
        deleted_at: null
      }
    })
  }

  async getStoreUsers(store_id: string) {
    return await this.longhornUserStoreRepository_.find({
      where: {
        store_id,
        is_active: true,
        deleted_at: null
      }
    })
  }

  async removeUserFromStore(user_id: string, store_id: string) {
    const userStore = await this.longhornUserStoreRepository_.findOne({
      where: {
        user_id,
        store_id,
        is_active: true,
        deleted_at: null
      }
    })

    if (!userStore) {
      throw new Error(`User store assignment not found`)
    }

    return await this.longhornUserStoreRepository_.delete(userStore.id)
  }

  async hasAccessToStore(user_id: string, store_id: string): Promise<boolean> {
    const userStore = await this.longhornUserStoreRepository_.findOne({
      where: {
        user_id,
        store_id,
        is_active: true,
        deleted_at: null
      }
    })

    return !!userStore
  }
}

export default LonghornUserStoreService
