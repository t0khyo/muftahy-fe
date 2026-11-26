import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as apiFactory from '@workspace/api/factory'
import type { PromoService } from '@workspace/api/services/promo-service'
import type { PromoDetailResponse } from '@workspace/domain/schemas/promos'
import { toast } from '@workspace/ui/components/sonner'
import { createAdminQueryClient } from '../../../app/query-client'
import { promoKeys, useTogglePromoStatus } from './use-promos'

function makePromo(isActive: boolean): PromoDetailResponse {
  return {
    id: 'promo-1',
    code: 'SAVE20',
    discount_percentage: '20.00',
    max_total_uses: 100,
    max_uses_per_user: 1,
    current_total_uses: 2,
    expires_at: '2026-12-31T23:59:59.000Z',
    is_active: isActive,
    created_at: '2026-11-01T00:00:00.000Z',
  }
}

describe('use-promos toggle status mutation', () => {
  let queryClient: QueryClient

  function wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    queryClient = createAdminQueryClient()
  })

  it('calls updatePromo, updates detail and list caches, and emits a single toast', async () => {
    const deactivated = makePromo(false)
    const updatePromo = vi.fn().mockResolvedValue(deactivated)
    const successSpy = vi.spyOn(toast, 'success')

    vi.spyOn(apiFactory, 'getPromoService').mockReturnValue({
      updatePromo,
    } as unknown as PromoService)

    queryClient.setQueryData(promoKeys.list(), [makePromo(true)])

    const { result } = renderHook(() => useTogglePromoStatus(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ code: 'SAVE20', is_active: false })
    })

    expect(updatePromo).toHaveBeenCalledWith('SAVE20', { is_active: false })
    expect(queryClient.getQueryData(promoKeys.detail('promo-1'))).toEqual(deactivated)
    expect(queryClient.getQueryData<PromoDetailResponse[]>(promoKeys.list())?.[0]?.is_active).toBe(
      false
    )
    expect(successSpy).toHaveBeenCalledTimes(1)
  })
})
