import type { ProductService } from './services/product-service'
import { MockProductAdapter } from './adapters/mock/product-mock-adapter'

export interface ApiServices {
  products: ProductService
}

class ServiceRegistry {
  private productService: ProductService | null = null

  getProductService(): ProductService {
    if (!this.productService) {
      this.productService = new MockProductAdapter()
    }
    return this.productService
  }
}

export const services = new ServiceRegistry()
export const getProductService = (): ProductService => services.getProductService()

