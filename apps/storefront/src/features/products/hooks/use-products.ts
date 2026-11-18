import { useQuery } from '@tanstack/react-query'
import { getProductService } from '@workspace/api/factory'
import type { Product, ProductListFilter, ProductListResult } from '@workspace/domain/schemas/product'

export interface UseProductsOptions {
  filter?: ProductListFilter
  enabled?: boolean
}

export function useProducts(options: UseProductsOptions = {}) {
  const { filter, enabled = true } = options
  const productService = getProductService()

  return useQuery<ProductListResult>({
    queryKey: ['products', filter],
    queryFn: () => productService.list(filter),
    enabled,
  })
}

export function useProduct(slug: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options
  const productService = getProductService()

  return useQuery<Product | null>({
    queryKey: ['product', slug],
    queryFn: () => productService.getBySlug(slug),
    enabled: Boolean(slug) && enabled,
  })
}

export function useRelatedProducts(slugs: string[], options: { enabled?: boolean } = {}) {
  const { enabled = true } = options
  const productService = getProductService()

  return useQuery<Product[]>({
    queryKey: ['products', 'related', slugs],
    queryFn: async () => {
      if (!slugs || slugs.length === 0) return []
      const deduplicated = Array.from(new Set(slugs))
      const results = await Promise.allSettled(
        deduplicated.map((s) => productService.getBySlug(s)),
      )
      return results
        .filter((r): r is PromiseFulfilledResult<Product | null> => r.status === 'fulfilled' && r.value !== null)
        .map((r) => r.value as Product)
    },
    enabled: Boolean(slugs && slugs.length > 0 && enabled),
  })
}

