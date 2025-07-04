import { MedusaService } from "@medusajs/framework/utils"
import LonghornStoreProduct from "../models/store-product"

type CreateStoreProductInput = {
  store_id: string
  product_id: string
  is_available?: boolean
  is_visible?: boolean
  store_specific_settings?: Record<string, any>
  metadata?: Record<string, any>
}

class LonghornStoreProductService extends MedusaService({
  LonghornStoreProduct,
}) {
  async assignProductToStore(data: CreateStoreProductInput) {
    // Verificar que no exista ya una asignación
    const existingAssignment = await this.longhornStoreProductRepository_.findOne({
      where: {
        store_id: data.store_id,
        product_id: data.product_id,
        deleted_at: null
      }
    })

    if (existingAssignment) {
      throw new Error(`Product is already assigned to this store`)
    }

    return await this.longhornStoreProductRepository_.create({
      is_available: true,
      is_visible: true,
      ...data
    })
  }

  async getStoreProducts(store_id: string, options?: {
    available_only?: boolean
    visible_only?: boolean
  }) {
    const where: any = {
      store_id,
      deleted_at: null
    }

    if (options?.available_only) {
      where.is_available = true
    }

    if (options?.visible_only) {
      where.is_visible = true
    }

    return await this.longhornStoreProductRepository_.find({
      where
    })
  }

  async getProductStores(product_id: string) {
    return await this.longhornStoreProductRepository_.find({
      where: {
        product_id,
        deleted_at: null
      }
    })
  }

  async updateStoreProduct(store_id: string, product_id: string, data: {
    is_available?: boolean
    is_visible?: boolean
    store_specific_settings?: Record<string, any>
    metadata?: Record<string, any>
  }) {
    const storeProduct = await this.longhornStoreProductRepository_.findOne({
      where: {
        store_id,
        product_id,
        deleted_at: null
      }
    })

    if (!storeProduct) {
      throw new Error(`Store product assignment not found`)
    }

    return await this.longhornStoreProductRepository_.update(storeProduct.id, data)
  }

  async removeProductFromStore(store_id: string, product_id: string) {
    const storeProduct = await this.longhornStoreProductRepository_.findOne({
      where: {
        store_id,
        product_id,
        deleted_at: null
      }
    })

    if (!storeProduct) {
      throw new Error(`Store product assignment not found`)
    }

    return await this.longhornStoreProductRepository_.delete(storeProduct.id)
  }

  async isProductAvailableInStore(store_id: string, product_id: string): Promise<boolean> {
    const storeProduct = await this.longhornStoreProductRepository_.findOne({
      where: {
        store_id,
        product_id,
        is_available: true,
        is_visible: true,
        deleted_at: null
      }
    })

    return !!storeProduct
  }

  async bulkAssignProducts(store_id: string, product_ids: string[]) {
    const assignments = []
    
    for (const product_id of product_ids) {
      try {
        const assignment = await this.assignProductToStore({
          store_id,
          product_id
        })
        assignments.push(assignment)
      } catch (error) {
        // Skip if already assigned
        console.warn(`Product ${product_id} already assigned to store ${store_id}`)
      }
    }

    return assignments
  }
}

export default LonghornStoreProductService
