import { useQuery } from '@tanstack/react-query'
import { getProductService } from '@workspace/api/factory'
import type { Product, ProductCollection } from '@workspace/domain/schemas/product'

export interface UseProductCollectionOptions {
  collection: ProductCollection
  enabled?: boolean
}

export function useProductCollection({
  collection,
  enabled = true,
}: UseProductCollectionOptions) {
  const productService = getProductService()

  return useQuery<Product[]>({
    queryKey: ['products', 'collection', collection],
    queryFn: () => productService.listByCollection(collection),
    enabled,
  })
}

