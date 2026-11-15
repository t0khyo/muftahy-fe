import { useQuery } from '@tanstack/react-query'
import { getProductService } from '@workspace/api/factory'
import type { Product, ProductListFilter } from '@workspace/domain/schemas/product'

export interface UseProductsOptions {
  filter?: ProductListFilter
  enabled?: boolean
}

export function useProducts(options: UseProductsOptions = {}) {
  const { filter, enabled = true } = options
  const productService = getProductService()

  return useQuery<Product[]>({
    queryKey: ['products', filter],
    queryFn: () => productService.list(filter),
    enabled,
  })
}

