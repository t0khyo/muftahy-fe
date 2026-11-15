import type { Product, ProductListFilter } from '@workspace/domain/schemas/product'

export interface ProductService {
  list(filter?: ProductListFilter): Promise<Product[]>
  getBySlug(slug: string): Promise<Product | null>
  getById(id: string): Promise<Product | null>
  getSampleLicenseKey(productId: string): Promise<string>
}

