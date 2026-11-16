import { useQuery } from '@tanstack/react-query'
import { getProductService } from '@workspace/api/factory'
import type { ProductFilterCounts, ProductListFilter } from '@workspace/domain/schemas/product'

export interface UseFilterCountsOptions {
  filter?: ProductListFilter
  enabled?: boolean
}

export function useFilterCounts(options: UseFilterCountsOptions = {}) {
  const { filter, enabled = true } = options
  const productService = getProductService()

  return useQuery<ProductFilterCounts>({
    queryKey: ['product-filter-counts', filter],
    queryFn: () => productService.getFilterCounts(filter),
    enabled,
  })
}

