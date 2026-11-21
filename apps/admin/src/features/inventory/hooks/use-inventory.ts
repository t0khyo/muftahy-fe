import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getInventoryService } from '@workspace/api/factory'
import type {
  KeyBatchImportRequest,
  KeyResponse,
  KeyUpdate,
} from '@workspace/domain/schemas/inventory'
import type { ListKeysParams } from '@workspace/api/services/inventory-service'

export const inventoryKeys = {
  all: ['admin', 'inventory'] as const,
  stats: (productId?: string) => [...inventoryKeys.all, 'stats', { productId }] as const,
  keys: (params?: ListKeysParams) => [...inventoryKeys.all, 'keys', params] as const,
  detail: (id: string) => [...inventoryKeys.all, 'detail', id] as const,
}

export function useInventoryStats(productId?: string) {
  const service = getInventoryService()
  return useQuery({
    queryKey: inventoryKeys.stats(productId),
    queryFn: () => service.getStats(productId),
  })
}

export function useKeyList(params?: ListKeysParams) {
  const service = getInventoryService()
  return useQuery({
    queryKey: inventoryKeys.keys(params),
    queryFn: () => service.listKeys(params),
  })
}

// Ergonomic aliases for workstation routes
export const useInventoryKeys = useKeyList
export const useProductStockSummary = useInventoryStats

export function useKeyDetail(keyId: string) {
  const service = getInventoryService()
  return useQuery({
    queryKey: inventoryKeys.detail(keyId),
    queryFn: () => service.getKey(keyId),
    enabled: Boolean(keyId),
  })
}

export function useKeyBatchImport() {
  const queryClient = useQueryClient()
  const service = getInventoryService()

  return useMutation({
    mutationFn: (payload: KeyBatchImportRequest) => service.importKeys(payload),
    onSuccess: (_response, variables) => {
      // Invalidate inventory stats for the affected product
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.stats(variables.product_id),
      })
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.keys({ productId: variables.product_id }),
      })
    },
  })
}

export function useKeyUpdate() {
  const queryClient = useQueryClient()
  const service = getInventoryService()

  return useMutation({
    mutationFn: ({ keyId, payload }: { keyId: string; payload: KeyUpdate }) =>
      service.updateKey(keyId, payload),
    onSuccess: (updatedKey) => {
      queryClient.setQueryData(inventoryKeys.detail(updatedKey.id), updatedKey)
      queryClient.setQueryData<KeyResponse[]>(
        inventoryKeys.keys({ productId: updatedKey.product_id }),
        (prev) => {
          if (!prev) return prev
          return prev.map((k) => (k.id === updatedKey.id ? updatedKey : k))
        },
      )
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.stats(updatedKey.product_id),
      })
    },
  })
}
