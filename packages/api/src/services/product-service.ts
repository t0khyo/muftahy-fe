import type {
  CategoryCreateInput,
  CategoryDetailResponse,
  CategoryResponse,
  CategoryUpdateInput,
  ImageReorderRequest,
  ProductCreateInput,
  ProductImageResponse,
  ProductResponse,
  ProductThumbnailResponse,
  ProductUpdateInput,
} from '@workspace/domain/schemas/product'

export interface ProductFilterParams {
  category?: string
  only_active?: boolean
  is_featured?: boolean
}

export interface ProductImageUploadInput {
  file: File | Blob
  alt_text?: string | null
  is_primary?: boolean
}

export interface ProductService {
  getProducts(params?: ProductFilterParams): Promise<ProductResponse[]>
  getPublicCategories(): Promise<CategoryResponse[]>
  getCategoryBySlug(slug: string): Promise<CategoryDetailResponse>
  getProductBySlug(slug: string): Promise<ProductResponse>
  getAdminCategories(): Promise<CategoryResponse[]>
  createCategory(data: CategoryCreateInput): Promise<CategoryResponse>
  updateCategory(id: string, data: CategoryUpdateInput): Promise<CategoryResponse>
  deleteCategory(id: string): Promise<{ message: string }>
  getProductById(id: string): Promise<ProductResponse>
  createProduct(data: ProductCreateInput): Promise<ProductResponse>
  updateProduct(id: string, data: ProductUpdateInput): Promise<ProductResponse>
  deleteProduct(id: string): Promise<{ message: string }>
  uploadProductImage(productId: string, input: ProductImageUploadInput): Promise<ProductImageResponse>
  deleteProductImage(productId: string, imageId: string): Promise<{ message: string }>
  setPrimaryProductImage(productId: string, imageId: string): Promise<ProductImageResponse>
  reorderProductImages(productId: string, data: ImageReorderRequest): Promise<ProductImageResponse[]>
  uploadProductThumbnail(productId: string, file: File | Blob): Promise<ProductThumbnailResponse>
  deleteProductThumbnail(productId: string): Promise<void>
  getSampleLicenseKey(productId: string): Promise<string>
}
