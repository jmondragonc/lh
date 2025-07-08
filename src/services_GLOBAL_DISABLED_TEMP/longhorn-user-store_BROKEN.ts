import { MedusaService } from "@medusajs/framework/utils"

type AssignUserStoreInput = {
  user_id: string
  store_id: string
  metadata?: Record<string, any>
}

class LonghornUserStoreService extends MedusaService({}) {
  private longhornModuleService_: any

  constructor(container: any) {
    super(...arguments)
    try {
      // En Medusa v2, los módulos se registran como {NOMBRE_MODULO}ModuleService
      this.longhornModuleService_ = container.resolve("longhorn")
    } catch (error) {
      console.warn("LonghornModuleService not available yet:", error.message)
    }
  }

  async assignUserToStore(data: AssignUserStoreInput) {
    return await this.longhornModuleService_.assignUserToStore(data)
  }

  async removeUserFromStore(user_id: string, store_id: string) {
    return await this.longhornModuleService_.removeUserFromStore(user_id, store_id)
  }

  async getUserStores(user_id: string) {
    return await this.longhornModuleService_.getUserStores(user_id)
  }

  async hasAccessToStore(user_id: string, store_id: string): Promise<boolean> {
    return await this.longhornModuleService_.hasAccessToStore(user_id, store_id)
  }

  async getStoreUsers(store_id: string) {
    return await this.longhornModuleService_.getStoreUsers(store_id)
  }
}

export default LonghornUserStoreService