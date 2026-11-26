import '@tanstack/react-query'
import type { FeedbackDescriptor } from '../lib/api-feedback'

export interface AdminMutationMeta {
  successDescriptor?: FeedbackDescriptor
  getSuccessDescriptor?: (data: unknown, variables: unknown) => FeedbackDescriptor | null
  suppressSuccessToast?: boolean
  errorMode?: 'toast' | 'inline'
  errorFallbackKey?: string
  suppressRawErrorMessage?: boolean
}

export interface AdminQueryMeta {
  suppressErrorToast?: boolean
  errorFallbackKey?: string
}

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: AdminMutationMeta
    queryMeta: AdminQueryMeta
  }
}

