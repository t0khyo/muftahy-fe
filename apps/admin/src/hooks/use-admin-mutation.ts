import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query'
import type { AdminMutationMeta } from '../app/query-meta'
import type { FeedbackDescriptor } from '../lib/api-feedback'

export interface AdminMutationFeedback<TData, TVariables> {
  successKey?: string
  getSuccessFeedback?: (data: TData, variables: TVariables) => FeedbackDescriptor | null
  errorMode?: 'toast' | 'inline'
  suppressSuccessToast?: boolean
  errorFallbackKey?: string
  suppressRawErrorMessage?: boolean
}

export type UseAdminMutationOptions<TData, TError, TVariables, TContext> = Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  'meta'
> & {
  feedback: AdminMutationFeedback<TData, TVariables>
}

export function useAdminMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>({
  feedback,
  ...options
}: UseAdminMutationOptions<TData, TError, TVariables, TContext>): UseMutationResult<
  TData,
  TError,
  TVariables,
  TContext
> {
  const meta: AdminMutationMeta = {
    successDescriptor: feedback.successKey ? { key: feedback.successKey } : undefined,
    getSuccessDescriptor: feedback.getSuccessFeedback
      ? (data: unknown, variables: unknown) =>
          feedback.getSuccessFeedback!(data as TData, variables as TVariables)
      : undefined,
    suppressSuccessToast: feedback.suppressSuccessToast,
    errorMode: feedback.errorMode ?? 'toast',
    errorFallbackKey: feedback.errorFallbackKey,
    suppressRawErrorMessage: feedback.suppressRawErrorMessage,
  }

  return useMutation({
    ...options,
    meta: meta as unknown as UseMutationOptions<TData, TError, TVariables, TContext>['meta'],
  })
}

