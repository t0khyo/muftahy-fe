import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getPromoService } from '@workspace/api/factory'
import type {
  PromoCreateRequest,
  PromoDetailResponse,
  PromoUpdateRequest,
} from '@workspace/domain/schemas/promos'
import type { ListPromosParams } from '@workspace/api/services/promo-service'
import { useAdminMutation } from '../../../hooks/use-admin-mutation'

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

export const useAdminPromos = usePromos

export function usePromoDetail(promoId: string) {
  const service = getPromoService()
  return useQuery({
    queryKey: promoKeys.detail(promoId),
    queryFn: () => service.getPromo(promoId),
    enabled: Boolean(promoId),
  })
}

export function useCreatePromo(options?: { errorMode?: 'toast' | 'inline' }) {
  const queryClient = useQueryClient()
  const service = getPromoService()

  return useAdminMutation({
    mutationFn: (payload: PromoCreateRequest) => service.createPromo(payload),
    onSuccess: (newPromo) => {
      queryClient.setQueryData<PromoDetailResponse[]>(promoKeys.list(), (prev) => {
        if (!prev) return [newPromo]
        return [newPromo, ...prev]
      })
      queryClient.invalidateQueries({ queryKey: promoKeys.all })
    },
    feedback: {
      successKey: 'admin:feedback.promoCreated',
      errorMode: options?.errorMode,
    },
  })
}

export function useUpdatePromo(options?: { errorMode?: 'toast' | 'inline' }) {
  const queryClient = useQueryClient()
  const service = getPromoService()

  return useAdminMutation({
    mutationFn: ({ promoId, payload }: { promoId: string; payload: PromoUpdateRequest }) =>
      service.updatePromo(promoId, payload),
    onSuccess: (updatedPromo) => {
      queryClient.setQueryData(promoKeys.detail(updatedPromo.id), updatedPromo)
      queryClient.setQueryData<PromoDetailResponse[]>(promoKeys.list(), (prev) => {
        if (!prev) return [updatedPromo]
        return prev.map((p) => (p.id === updatedPromo.id ? updatedPromo : p))
      })
      queryClient.invalidateQueries({ queryKey: promoKeys.all })
    },
    feedback: {
      successKey: 'admin:feedback.promoUpdated',
      errorMode: options?.errorMode,
    },
  })
}

export function useTogglePromoStatus() {
  const queryClient = useQueryClient()
  const service = getPromoService()

  return useAdminMutation({
    mutationFn: ({ code, is_active }: { code: string; is_active: boolean }) =>
      service.updatePromo(code, { is_active }),
    onSuccess: (updatedPromo) => {
      queryClient.setQueryData(promoKeys.detail(updatedPromo.id), updatedPromo)
      queryClient.setQueryData<PromoDetailResponse[]>(promoKeys.list(), (prev) => {
        if (!prev) return [updatedPromo]
        return prev.map((p) => (p.id === updatedPromo.id ? updatedPromo : p))
      })
      queryClient.invalidateQueries({ queryKey: promoKeys.all })
    },
    feedback: {
      getSuccessFeedback: (_data, variables) => ({
        key: variables.is_active
          ? 'admin:feedback.promoActivated'
          : 'admin:feedback.promoDeactivated',
      }),
    },
  })
}
