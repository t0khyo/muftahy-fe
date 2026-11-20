import type {
  ProductCreateInput,
  ProductResponse,
  ProductUpdateInput,
} from '@workspace/domain/schemas/product'
import type {
  ProductFilterParams,
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
    })
  }

  async getCategories(): Promise<string[]> {
    return this.client.request<string[]>('/products/categories', {
      method: 'GET',
    })
  }

  async getProductById(id: string): Promise<ProductResponse> {
    return this.client.request<ProductResponse>(`/products/${id}`, {
      method: 'GET',
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

  async getSampleLicenseKey(_productId: string): Promise<string> {
    return 'XXXXX-XXXXX-XXXXX'
  }
}

