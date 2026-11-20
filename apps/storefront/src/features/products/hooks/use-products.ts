import { useQuery } from '@tanstack/react-query'
import { getProductService } from '@workspace/api/factory'
import type {
  ProductCategory,
  ProductResponse,
  StockStatus,
} from '@workspace/domain/schemas/product'

export interface ProductCatalogFilters {
  category?: ProductCategory
  variant?: 'retail' | 'oem'
  stock_status?: StockStatus
  inStockOnly?: boolean
  search?: string
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'newest'
}

export function useProducts(filters?: ProductCatalogFilters) {
  const productService = getProductService()

  return useQuery<ProductResponse[]>({
    queryKey: ['products', filters?.category],
    queryFn: () => productService.getProducts({ category: filters?.category }),
    staleTime: 5 * 60 * 1000,
    select: (products) => {
      let filtered = [...products]

      if (filters?.variant) {
        filtered = filtered.filter((p) => p.variant === filters.variant)
      }

      if (filters?.stock_status) {
        filtered = filtered.filter((p) => p.stock_status === filters.stock_status)
      }

      if (filters?.inStockOnly) {
        filtered = filtered.filter((p) => p.stock_status === 'in_stock')
      }

      if (filters?.search) {
        const query = filters.search.toLowerCase()
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query)),
        )
      }

      if (filters?.sort) {
        if (filters.sort === 'price-asc') {
          filtered.sort((a, b) => Number(a.effective_price) - Number(b.effective_price))
        } else if (filters.sort === 'price-desc') {
          filtered.sort((a, b) => Number(b.effective_price) - Number(a.effective_price))
        }
      }

      return filtered
    },
  })
}

export function useProduct(id: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options
  const productService = getProductService()

  return useQuery<ProductResponse | null>({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        return await productService.getProductById(id)
      } catch {
        return null
      }
    },
    enabled: Boolean(id) && enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useRelatedProducts(category?: ProductCategory, currentId?: string) {
  const productService = getProductService()

  return useQuery<ProductResponse[]>({
    queryKey: ['products', 'related', category, currentId],
    queryFn: async () => {
      const all = await productService.getProducts({ category })
      return all.filter((p) => p.id !== currentId)
    },
    enabled: Boolean(category),
    staleTime: 5 * 60 * 1000,
  })
}
