import type {
  ProductCategory,
  ProductCreateInput,
  ProductResponse,
  ProductUpdateInput,
} from '@workspace/domain/schemas/product'

export interface ProductFilterParams {
  category?: ProductCategory
  only_active?: boolean
}

export interface ProductService {
  getProducts(params?: ProductFilterParams): Promise<ProductResponse[]>
  getCategories(): Promise<string[]>
  getProductById(id: string): Promise<ProductResponse>
  createProduct(data: ProductCreateInput): Promise<ProductResponse>
  updateProduct(id: string, data: ProductUpdateInput): Promise<ProductResponse>
  deleteProduct(id: string): Promise<{ message: string }>
  getSampleLicenseKey(productId: string): Promise<string>
}
