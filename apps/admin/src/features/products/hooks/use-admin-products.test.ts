import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import * as apiFactory from '@workspace/api/factory'
import type { ProductService } from '@workspace/api/services/product-service'
import type { ProductResponse } from '@workspace/domain/schemas/product'
import { toast } from '@workspace/ui/components/sonner'
import { createAdminQueryClient } from '../../../app/query-client'
import {
  adminProductKeys,
  useBulkUpdateProductStatus,
  useUpdateProductStatus,
} from './use-admin-products'

function makeProduct(id: string, isActive: boolean): ProductResponse {
  return {
    id,
    name: `Product ${id}`,
    slug: `product-${id}`,
    sku: `OS-${id.toUpperCase()}`,
    description: 'Sample',
    category: {
      id: 'cat-1',
      name: 'Operating Systems',
      code: 'OS',
      slug: 'operating-systems',
      display_order: 0,
      is_active: true,
      product_count: 1,
    },
    variant: 'retail',
    base_price: '100.00',
    sale_price: null,
    effective_price: '100.00',
    discount_percentage: null,
    stock_status: 'in_stock',
    available_count: 5,
    preorder_enabled: false,
    is_active: isActive,
    images: [],
  }
}

describe('use-admin-products status mutations', () => {
  let queryClient: QueryClient

  function wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    queryClient = createAdminQueryClient()
  })

  it('updates product detail and list cache with one publish toast via useUpdateProductStatus', async () => {
    const updated = makeProduct('p-1', true)
    const updateProduct = vi.fn().mockResolvedValue(updated)
    const successSpy = vi.spyOn(toast, 'success')

    vi.spyOn(apiFactory, 'getProductService').mockReturnValue({
      updateProduct,
    } as unknown as ProductService)

    queryClient.setQueryData(adminProductKeys.list({ only_active: false }), [
      makeProduct('p-1', false),
    ])

    const { result } = renderHook(() => useUpdateProductStatus(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 'p-1', is_active: true })
    })

    expect(updateProduct).toHaveBeenCalledWith('p-1', { is_active: true })
    expect(queryClient.getQueryData(adminProductKeys.detail('p-1'))).toEqual(updated)
    expect(
      queryClient.getQueryData<ProductResponse[]>(
        adminProductKeys.list({ only_active: false })
      )?.[0]?.is_active
    ).toBe(true)
    expect(successSpy).toHaveBeenCalledTimes(1)
  })

  it('runs bulk status sequentially, reports partial warning on non-fatal failure, and aborts remaining items on 429', async () => {
    const updateProduct = vi
      .fn()
      .mockResolvedValueOnce(makeProduct('p-1', true))
      .mockRejectedValueOnce(new ApiClientError(429, 'RATE_LIMIT_EXCEEDED', 'Slow down'))
      .mockResolvedValueOnce(makeProduct('p-3', true))

    const warningSpy = vi.spyOn(toast, 'warning')
    vi.spyOn(apiFactory, 'getProductService').mockReturnValue({
      updateProduct,
    } as unknown as ProductService)

    const { result } = renderHook(() => useBulkUpdateProductStatus(), { wrapper })

    let res: Awaited<ReturnType<typeof result.current.mutateAsync>> | undefined
    await act(async () => {
      res = await result.current.mutateAsync({
        ids: ['p-1', 'p-2', 'p-3'],
        is_active: true,
      })
    })

    expect(updateProduct).toHaveBeenCalledTimes(2)
    expect(res).toEqual({ total: 3, succeeded: 1, failed: 2, aborted: true })
    expect(warningSpy).toHaveBeenCalledTimes(1)
  })

  it('re-throws firstError when all bulk status calls fail so MutationCache shows an error toast', async () => {
    const updateProduct = vi
      .fn()
      .mockRejectedValue(new ApiClientError(500, 'INTERNAL_ERROR', 'Boom'))
    const errorSpy = vi.spyOn(toast, 'error')
    const successSpy = vi.spyOn(toast, 'success')

    vi.spyOn(apiFactory, 'getProductService').mockReturnValue({
      updateProduct,
    } as unknown as ProductService)

    const { result } = renderHook(() => useBulkUpdateProductStatus(), { wrapper })

    await act(async () => {
      await expect(
        result.current.mutateAsync({ ids: ['p-1', 'p-2'], is_active: false })
      ).rejects.toBeInstanceOf(ApiClientError)
    })

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })
    expect(successSpy).not.toHaveBeenCalled()
  })
})
