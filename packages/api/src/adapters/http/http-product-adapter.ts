import type {
  CategoryCreateInput,
  CategoryDetailResponse,
  CategoryResponse,
  CategoryUpdateInput,
  ImageReorderRequest,
  ProductCreateInput,
  ProductImageResponse,
  ProductResponse,
  ProductUpdateInput,
} from '@workspace/domain/schemas/product'
import type {
  ProductFilterParams,
  ProductImageUploadInput,
  ProductService,
} from '../../services/product-service'
import type { NativeFetchClient } from './fetch-client'

export class HttpProductAdapter implements ProductService {
  private readonly client: NativeFetchClient

  constructor(client: NativeFetchClient) {
    this.client = client
  }

  async getProducts(params?: ProductFilterParams): Promise<ProductResponse[]> {
    const searchParams = new URLSearchParams()
    if (params?.category) {
      searchParams.set('category', params.category)
    }
    if (params?.only_active !== undefined) {
      searchParams.set('only_active', String(params.only_active))
    }

    const query = searchParams.toString()
    const path = query ? `/products?${query}` : '/products'

    return this.client.request<ProductResponse[]>(path, {
      method: 'GET',
      skipAuth: true,
    })
  }

  async getPublicCategories(): Promise<CategoryResponse[]> {
    return this.client.request<CategoryResponse[]>('/categories', {
      method: 'GET',
      skipAuth: true,
    })
  }

  async getCategoryBySlug(slug: string): Promise<CategoryDetailResponse> {
    return this.client.request<CategoryDetailResponse>(`/categories/slug/${encodeURIComponent(slug)}`, {
      method: 'GET',
      skipAuth: true,
    })
  }

  async getProductBySlug(slug: string): Promise<ProductResponse> {
    return this.client.request<ProductResponse>(`/products/slug/${encodeURIComponent(slug)}`, {
      method: 'GET',
      skipAuth: true,
    })
  }

  async getAdminCategories(): Promise<CategoryResponse[]> {
    return this.client.request<CategoryResponse[]>('/admin/categories', {
      method: 'GET',
    })
  }

  async createCategory(data: CategoryCreateInput): Promise<CategoryResponse> {
    return this.client.request<CategoryResponse>('/admin/categories', {
      method: 'POST',
      body: data,
    })
  }

  async updateCategory(id: string, data: CategoryUpdateInput): Promise<CategoryResponse> {
    return this.client.request<CategoryResponse>(`/admin/categories/${id}`, {
      method: 'PATCH',
      body: data,
    })
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    return this.client.request<{ message: string }>(`/admin/categories/${id}`, {
      method: 'DELETE',
    })
  }

  async getProductById(id: string): Promise<ProductResponse> {
    return this.client.request<ProductResponse>(`/products/${id}`, {
      method: 'GET',
      skipAuth: true,
    })
  }

  async createProduct(data: ProductCreateInput): Promise<ProductResponse> {
    return this.client.request<ProductResponse>('/products', {
      method: 'POST',
      body: data,
    })
  }

  async updateProduct(id: string, data: ProductUpdateInput): Promise<ProductResponse> {
    return this.client.request<ProductResponse>(`/products/${id}`, {
      method: 'PATCH',
      body: data,
    })
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    return this.client.request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    })
  }

  async uploadProductImage(productId: string, input: ProductImageUploadInput): Promise<ProductImageResponse> {
    const formData = new FormData()
    formData.append('file', input.file)
    if (input.alt_text !== undefined && input.alt_text !== null) {
      formData.append('alt_text', input.alt_text)
    }
    if (input.is_primary !== undefined) {
      formData.append('is_primary', String(input.is_primary))
    }

    return this.client.request<ProductImageResponse>(`/products/${productId}/images`, {
      method: 'POST',
      body: formData,
    })
  }

  async deleteProductImage(productId: string, imageId: string): Promise<{ message: string }> {
    return this.client.request<{ message: string }>(`/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
    })
  }

  async setPrimaryProductImage(productId: string, imageId: string): Promise<ProductImageResponse> {
    return this.client.request<ProductImageResponse>(`/products/${productId}/images/${imageId}/primary`, {
      method: 'PATCH',
    })
  }

  async reorderProductImages(productId: string, data: ImageReorderRequest): Promise<ProductImageResponse[]> {
    return this.client.request<ProductImageResponse[]>(`/products/${productId}/images/reorder`, {
      method: 'PATCH',
      body: data,
    })
  }

  async getSampleLicenseKey(_productId: string): Promise<string> {
    return 'XXXXX-XXXXX-XXXXX'
  }
}
