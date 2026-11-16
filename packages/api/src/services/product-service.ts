import type {
  Product,
  ProductCollection,
  ProductFilterCounts,
  ProductListFilter,
  ProductListResult,
} from '@workspace/domain/schemas/product'

export interface ProductService {
  list(filter?: ProductListFilter): Promise<ProductListResult>
  listByCollection(collection: ProductCollection): Promise<Product[]>
  getFilterCounts(filter?: ProductListFilter): Promise<ProductFilterCounts>
  getBySlug(slug: string): Promise<Product | null>
  getById(id: string): Promise<Product | null>
  getSampleLicenseKey(productId: string): Promise<string>
}

