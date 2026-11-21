import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getPromoService } from '@workspace/api/factory'
import type {
  PromoCreateRequest,
  PromoDetailResponse,
  PromoUpdateRequest,
} from '@workspace/domain/schemas/promos'
import type { ListPromosParams } from '@workspace/api/services/promo-service'

export const promoKeys = {
  all: ['admin', 'promos'] as const,
  list: (params?: ListPromosParams) => [...promoKeys.all, 'list', params] as const,
  detail: (id: string) => [...promoKeys.all, 'detail', id] as const,
}

export function usePromos(params?: ListPromosParams) {
  const service = getPromoService()
  return useQuery({
    queryKey: promoKeys.list(params),
    queryFn: () => service.listPromos(params),
  })
}

// Aliases for workstation routes
export const useAdminPromos = usePromos

export function usePromoDetail(promoId: string) {
  const service = getPromoService()
  return useQuery({
    queryKey: promoKeys.detail(promoId),
    queryFn: () => service.getPromo(promoId),
    enabled: Boolean(promoId),
  })
}

export function useCreatePromo() {
  const queryClient = useQueryClient()
  const service = getPromoService()

  return useMutation({
    mutationFn: (payload: PromoCreateRequest) => service.createPromo(payload),
    onSuccess: (newPromo) => {
      queryClient.setQueryData<PromoDetailResponse[]>(promoKeys.list(), (prev) => {
        if (!prev) return [newPromo]
        return [newPromo, ...prev]
      })
    },
  })
}

export function useUpdatePromo() {
  const queryClient = useQueryClient()
  const service = getPromoService()

  return useMutation({
    mutationFn: ({ promoId, payload }: { promoId: string; payload: PromoUpdateRequest }) =>
      service.updatePromo(promoId, payload),
    onSuccess: (updatedPromo) => {
      queryClient.setQueryData(promoKeys.detail(updatedPromo.id), updatedPromo)
      queryClient.setQueryData<PromoDetailResponse[]>(promoKeys.list(), (prev) => {
        if (!prev) return [updatedPromo]
        return prev.map((p) => (p.id === updatedPromo.id ? updatedPromo : p))
      })
    },
  })
}

export function useTogglePromoStatus() {
  const updateMutation = useUpdatePromo()
  return useMutation({
    mutationFn: ({ code, is_active }: { code: string; is_active: boolean }) =>
      updateMutation.mutateAsync({ promoId: code, payload: { is_active } }),
  })
}
