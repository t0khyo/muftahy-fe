import type {
  ProductCreateInput,
  ProductResponse,
  ProductUpdateInput,
} from '@workspace/domain/schemas/product'
import type {
  ProductFilterParams,
  ProductService,
} from '../../services/product-service'

export const MOCK_PRODUCTS: ProductResponse[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Windows 11 Professional',
    category: 'windows',
    variant: 'retail',
    base_price: '499.00',
    sale_price: '349.00',
    effective_price: '349.00',
    discount_percentage: 30,
    stock_status: 'in_stock',
    available_count: 14,
    preorder_enabled: true,
    description: 'Genuine Microsoft Windows 11 Pro digital retail license key for 1 PC.',
    is_active: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    name: 'Windows 11 Professional',
    category: 'windows',
    variant: 'oem',
    base_price: '299.00',
    sale_price: null,
    effective_price: '299.00',
    discount_percentage: null,
    stock_status: 'in_stock',
    available_count: 28,
    preorder_enabled: true,
    description: 'Genuine Microsoft Windows 11 Pro OEM digital license key tied to motherboard.',
    is_active: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    name: 'Windows 11 Home',
    category: 'windows',
    variant: 'retail',
    base_price: '399.00',
    sale_price: '299.00',
    effective_price: '299.00',
    discount_percentage: 25,
    stock_status: 'in_stock',
    available_count: 9,
    preorder_enabled: true,
    description: 'Genuine Microsoft Windows 11 Home digital retail license key for 1 PC.',
    is_active: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    name: 'Windows 10 Professional',
    category: 'windows',
    variant: 'retail',
    base_price: '349.00',
    sale_price: '249.00',
    effective_price: '249.00',
    discount_percentage: 28,
    stock_status: 'in_stock',
    available_count: 5,
    preorder_enabled: true,
    description: 'Genuine Microsoft Windows 10 Pro digital retail license key for 1 PC.',
    is_active: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000005',
    name: 'Office 2021 Professional Plus',
    category: 'office',
    variant: 'retail',
    base_price: '899.00',
    sale_price: '699.00',
    effective_price: '699.00',
    discount_percentage: 22,
    stock_status: 'in_stock',
    available_count: 12,
    preorder_enabled: true,
    description: 'One-time purchase for 1 PC including Word, Excel, PowerPoint, Outlook, and Access.',
    is_active: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000006',
    name: 'Office 2019 Professional Plus',
    category: 'office',
    variant: 'retail',
    base_price: '599.00',
    sale_price: null,
    effective_price: '599.00',
    discount_percentage: null,
    stock_status: 'preorder',
    available_count: 0,
    preorder_enabled: true,
    description: 'Classic 2019 versions of Word, Excel, PowerPoint, and Outlook for 1 PC.',
    is_active: true,
  },
]

export class MockProductAdapter implements ProductService {
  private products: ProductResponse[] = [...MOCK_PRODUCTS]

  async getProducts(params?: ProductFilterParams): Promise<ProductResponse[]> {
    let result = [...this.products]

    const onlyActive = params?.only_active ?? true
    if (onlyActive) {
      result = result.filter((p) => p.is_active)
    }

    if (params?.category) {
      result = result.filter((p) => p.category === params.category)
    }

    return result
  }

  async getCategories(): Promise<string[]> {
    return ['windows', 'office']
  }

  async getProductById(id: string): Promise<ProductResponse> {
    const product = this.products.find((p) => p.id === id)
    if (!product) {
      throw new Error(`Product not found: ${id}`)
    }
    return { ...product }
  }

  async createProduct(data: ProductCreateInput): Promise<ProductResponse> {
    const base = Number.parseFloat(data.base_price)
    const sale = data.sale_price ? Number.parseFloat(data.sale_price) : null
    let discountPercentage: number | null = null

    if (sale !== null && base > 0) {
      discountPercentage = Math.round(((base - sale) / base) * 100)
    }

    const effectivePrice = data.sale_price ?? data.base_price

    const newProduct: ProductResponse = {
      id: crypto.randomUUID(),
      name: data.name,
      category: data.category,
      variant: data.variant ?? null,
      base_price: data.base_price,
      sale_price: data.sale_price ?? null,
      effective_price: effectivePrice,
      discount_percentage: discountPercentage,
      stock_status: 'out_of_stock',
      available_count: 0,
      preorder_enabled: data.preorder_enabled ?? true,
      description: data.description ?? null,
      is_active: true,
    }

    this.products.push(newProduct)
    return { ...newProduct }
  }

  async updateProduct(id: string, data: ProductUpdateInput): Promise<ProductResponse> {
    const index = this.products.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new Error(`Product not found: ${id}`)
    }

    const current = this.products[index]
    const updatedBasePrice = data.base_price ?? current.base_price
    const updatedSalePrice =
      data.sale_price !== undefined ? data.sale_price : current.sale_price

    const base = Number.parseFloat(updatedBasePrice)
    const sale = updatedSalePrice ? Number.parseFloat(updatedSalePrice) : null
    let discountPercentage: number | null = null

    if (sale !== null && base > 0) {
      discountPercentage = Math.round(((base - sale) / base) * 100)
    }

    const effectivePrice = updatedSalePrice ?? updatedBasePrice

    const updated: ProductResponse = {
      ...current,
      base_price: updatedBasePrice,
      sale_price: updatedSalePrice,
      effective_price: effectivePrice,
      discount_percentage: discountPercentage,
      is_active: data.is_active ?? current.is_active,
      preorder_enabled: data.preorder_enabled ?? current.preorder_enabled,
      description: data.description !== undefined ? data.description : current.description,
    }

    this.products[index] = updated
    return { ...updated }
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const product = this.products.find((p) => p.id === id)
    if (!product) {
      throw new Error(`Product not found: ${id}`)
    }
    product.is_active = false
    return { message: 'Product deactivated successfully' }
  }

  async getSampleLicenseKey(_productId: string): Promise<string> {
    return 'XXXXX-XXXXX-XXXXX'
  }
}
