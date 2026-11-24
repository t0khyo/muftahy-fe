import { useQuery } from '@tanstack/react-query'
import { getProductService } from '@workspace/api/factory'
import {
  isUuid,
  type CategoryDetailResponse,
  type CategoryResponse,
  type ProductResponse,
  type StockStatus,
} from '@workspace/domain/schemas/product'

export interface ProductCatalogFilters {
  category?: string
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
            p.sku?.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query)),
        )
      }

      if (filters?.sort) {
        if (filters.sort === 'price-asc') {
          filtered.sort((a, b) => Number(a.effective_price) - Number(b.effective_price))
        } else if (filters.sort === 'price-desc') {
          filtered.sort((a, b) => Number(b.effective_price) - Number(a.effective_price))
        } else if (filters.sort === 'newest') {
          filtered.reverse()
        }
      }

      return filtered
    },
  })
}

export function useProduct(slugOrId: string) {
  const productService = getProductService()

  return useQuery<ProductResponse | null>({
    queryKey: ['product', slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null
      if (isUuid(slugOrId)) {
        return productService.getProductById(slugOrId)
      }
      return productService.getProductBySlug(slugOrId)
    },
    enabled: Boolean(slugOrId),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePublicCategories() {
  const productService = getProductService()

  return useQuery<CategoryResponse[]>({
    queryKey: ['categories', 'public'],
    queryFn: () => productService.getPublicCategories(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCategoryBySlug(slug: string) {
  const productService = getProductService()

  return useQuery<CategoryDetailResponse | null>({
    queryKey: ['categories', 'slug', slug],
    queryFn: async () => {
      if (!slug) return null
      return productService.getCategoryBySlug(slug)
    },
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  })
}

export function useRelatedProducts(categorySlug?: string, currentId?: string) {
  const productService = getProductService()

  return useQuery<ProductResponse[]>({
    queryKey: ['products', 'related', categorySlug, currentId],
    queryFn: async () => {
      const products = await productService.getProducts({ category: categorySlug, only_active: true })
      return products.filter((p) => p.id !== currentId && p.slug !== currentId).slice(0, 4)
    },
    enabled: Boolean(categorySlug),
    staleTime: 5 * 60 * 1000,
  })
}
