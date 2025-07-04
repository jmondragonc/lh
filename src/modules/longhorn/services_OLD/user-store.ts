import { MedusaService } from "@medusajs/framework/utils"

type CreateUserStoreInput = {
  user_id: string
  store_id: string
  metadata?: Record<string, any>
}

class LonghornUserStoreService extends MedusaService({}) {
  protected readonly longhornModuleService_: any

  constructor(container: any) {
    super(...arguments)
    this.longhornModuleService_ = container.longhornModuleService
  }

  async assignUserToStore(data: CreateUserStoreInput) {
    return await this.longhornModuleService_.assignUserToStore(data)
  }

  async getUserStores(user_id: string) {
    return await this.longhornModuleService_.getUserStores(user_id)
  }

  async getStoreUsers(store_id: string) {
    return await this.longhornModuleService_.getStoreUsers(store_id)
  }

  async removeUserFromStore(user_id: string, store_id: string) {
    return await this.longhornModuleService_.removeUserFromStore(user_id, store_id)
  }

  async hasAccessToStore(user_id: string, store_id: string): Promise<boolean> {
    return await this.longhornModuleService_.hasAccessToStore(user_id, store_id)
  }
}

export default LonghornUserStoreService