import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import type { AdminMutationMeta, AdminQueryMeta } from './query-meta'
import {
  resolveApiError,
  showBackgroundRefetchToast,
  showFeedbackToast,
  showResolvedErrorToast,
} from '../lib/api-feedback'

export function createAdminQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        const meta = query.meta as unknown as AdminQueryMeta | undefined
        const resolved = resolveApiError(error, meta?.errorFallbackKey)
        if (resolved.isSessionExpired) return
        if (query.state.data !== undefined && !meta?.suppressErrorToast) {
          showBackgroundRefetchToast(resolved)
        }
      },
    }),
    mutationCache: new MutationCache({
      onSuccess: (data, variables, _context, mutation) => {
        const meta = mutation.meta as unknown as AdminMutationMeta | undefined
        if (!meta || meta.suppressSuccessToast) return

        const descriptor = meta.getSuccessDescriptor
          ? meta.getSuccessDescriptor(data, variables)
          : (meta.successDescriptor ?? null)

        if (descriptor) {
          showFeedbackToast(descriptor)
        }
      },
      onError: (error, _variables, _context, mutation) => {
        const meta = mutation.meta as unknown as AdminMutationMeta | undefined
        const resolved = resolveApiError(error, {
          fallbackKey: meta?.errorFallbackKey,
          suppressRawMessage: meta?.suppressRawErrorMessage,
        })

        if (resolved.isSessionExpired) return
        if (meta?.errorMode === 'inline' && resolved.isInlineCandidate) return

        showResolvedErrorToast(resolved)
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000, // 30s rate-limit mitigation for admin
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: (failureCount, error) =>
          failureCount < 1 &&
          error instanceof ApiClientError &&
          (error.isNetworkError || error.status >= 500),
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export const queryClient = createAdminQueryClient()
