import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Query } from '@tanstack/react-query'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import { toast } from '@workspace/ui/components/sonner'
import { createAdminQueryClient } from './query-client'

describe('createAdminQueryClient', () => {
  beforeEach(() => {
    vi.spyOn(toast, 'success').mockImplementation(() => '1')
    vi.spyOn(toast, 'warning').mockImplementation(() => '1')
    vi.spyOn(toast, 'error').mockImplementation(() => '1')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('emits success and warning toasts via MutationCache.onSuccess unless suppressed', async () => {
    const qc = createAdminQueryClient()

    const mutationSuccess = qc.getMutationCache().build(qc, {
      mutationFn: async () => ({ ok: true }),
      meta: { successDescriptor: { key: 'admin:feedback.auditExported' } },
    })
    await mutationSuccess.execute(undefined)
    expect(toast.success).toHaveBeenCalledWith('Audit log exported')

    const mutationSuppressed = qc.getMutationCache().build(qc, {
      mutationFn: async () => ({ ok: true }),
      meta: {
        successDescriptor: { key: 'admin:feedback.auditExported' },
        suppressSuccessToast: true,
      },
    })
    await mutationSuppressed.execute(undefined)
    expect(toast.success).toHaveBeenCalledTimes(1)
  })

  it('skips toast for inline 400/409/422 and expired sessions, while toasting 500/429', async () => {
    const qc = createAdminQueryClient()

    const inlineMutation = qc.getMutationCache().build(qc, {
      mutationFn: async () => {
        throw new ApiClientError(409, 'SKU_ALREADY_EXISTS', 'dup')
      },
      meta: { errorMode: 'inline' },
    })
    await expect(inlineMutation.execute(undefined)).rejects.toThrow()
    expect(toast.error).not.toHaveBeenCalled()

    const expiredMutation = qc.getMutationCache().build(qc, {
      mutationFn: async () => {
        throw new ApiClientError(401, 'AUTHENTICATION_FAILED', 'expired', undefined, undefined, {
          isSessionExpired: true,
        })
      },
      meta: { errorMode: 'toast' },
    })
    await expect(expiredMutation.execute(undefined)).rejects.toThrow()
    expect(toast.error).not.toHaveBeenCalled()

    const serverErrorInlineMutation = qc.getMutationCache().build(qc, {
      mutationFn: async () => {
        throw new ApiClientError(500, 'SERVER_ERROR', 'boom')
      },
      meta: { errorMode: 'inline' },
    })
    await expect(serverErrorInlineMutation.execute(undefined)).rejects.toThrow()
    expect(toast.error).toHaveBeenCalledWith('A server error occurred. Please try again in a moment.', {
      id: 'admin-server-error',
    })
  })

  it('toasts only on background query refetches (when data exists) and disables retry on 4xx/429', async () => {
    const qc = createAdminQueryClient()

    const initialQuery = qc.getQueryCache().build(qc, {
      queryKey: ['test', 'initial'],
      queryFn: async () => {
        throw new ApiClientError(429, 'RATE_LIMIT_EXCEEDED', 'rate limited', undefined, 30)
      },
    })
    await initialQuery.fetch().catch(() => {})
    expect(toast.error).not.toHaveBeenCalled()

    qc.setQueryData(['test', 'stale'], [{ id: '1' }])
    const staleQuery = qc.getQueryCache().find({ queryKey: ['test', 'stale'] }) as unknown as Query<
      unknown,
      unknown,
      unknown,
      readonly unknown[]
    >
    // Trigger background error
    qc.getQueryCache().config.onError?.(new ApiClientError(500, 'SERVER_ERROR', 'down'), staleQuery)
    expect(toast.error).toHaveBeenCalledWith('Could not refresh data. Showing last loaded results.', {
      id: 'admin-query-refresh-error',
    })

    const retryFn = qc.getDefaultOptions().queries?.retry as (count: number, err: unknown) => boolean
    expect(retryFn(0, new ApiClientError(429, 'RATE_LIMIT_EXCEEDED', 'limit'))).toBe(false)
    expect(retryFn(0, new ApiClientError(404, 'ENTITY_NOT_FOUND', 'missing'))).toBe(false)
    expect(retryFn(0, new ApiClientError(500, 'SERVER_ERROR', 'err'))).toBe(true)
    expect(retryFn(1, new ApiClientError(500, 'SERVER_ERROR', 'err'))).toBe(false)
    expect(
      retryFn(0, new ApiClientError(0, 'NETWORK_ERROR', 'net', undefined, undefined, { isNetworkError: true })),
    ).toBe(true)
  })
})

