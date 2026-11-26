import { toast } from '@workspace/ui/components/sonner'
import { i18n } from '@workspace/i18n/config'
import { formatNumber } from '@workspace/domain/formatters/number'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'

export interface FeedbackDescriptor {
  key: string
  params?: Record<string, string | number>
  variant?: 'success' | 'warning'
}

export interface ResolvedApiError {
  status: number
  errorCode: string
  message: string
  fieldErrors: Record<string, string>
  retryAfter?: number
  isInlineCandidate: boolean
  isRateLimited: boolean
  isNetworkError: boolean
  isSessionExpired: boolean
}

export interface ResolveApiErrorOptions {
  fallbackKey?: string
  suppressRawMessage?: boolean
}

type DynamicT = (key: string, options?: Record<string, unknown>) => string
type DynamicExists = (key: string) => boolean

const translateUntyped = i18n.t.bind(i18n) as unknown as DynamicT
const existsUntyped = i18n.exists.bind(i18n) as unknown as DynamicExists

const SAFE_MESSAGE_MAX_LEN = 160

function formatTemplateParams(
  params?: Record<string, string | number>,
): Record<string, string | number> | undefined {
  if (!params) return undefined
  const locale = i18n.language || 'en'
  const formatted: Record<string, string | number> = {}
  for (const [k, v] of Object.entries(params)) {
    formatted[k] = typeof v === 'number' ? formatNumber(v, { locale, useGrouping: false }) : v
  }
  return formatted
}

export function translateFeedbackKey(
  key: string,
  params?: Record<string, string | number>,
): string | null {
  if (!existsUntyped(key)) return null
  const result = translateUntyped(key, formatTemplateParams(params))
  return typeof result === 'string' && result !== key ? result : null
}

function isSafeClientMessage(message: string): boolean {
  const trimmed = message.trim()
  if (!trimmed || trimmed.length > SAFE_MESSAGE_MAX_LEN) return false
  if (/[\r\n]/.test(trimmed)) return false
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return false
  return true
}

function mapFieldErrors(apiError: ApiClientError): Record<string, string> {
  const mapped: Record<string, string> = {}
  if (!apiError.fieldErrors) return mapped
  for (const entry of apiError.fieldErrors) {
    const key = entry.field.trim() || '_root'
    if (!mapped[key]) {
      mapped[key] = entry.message
    }
  }
  return mapped
}

export function resolveApiError(
  error: unknown,
  optionsOrFallback?: string | ResolveApiErrorOptions,
): ResolvedApiError {
  const opts: ResolveApiErrorOptions =
    typeof optionsOrFallback === 'string'
      ? { fallbackKey: optionsOrFallback }
      : (optionsOrFallback ?? {})
  const fallbackKey = opts.fallbackKey ?? 'auth:errors.GENERIC_ERROR'
  const fallbackMessage =
    translateFeedbackKey(fallbackKey) ??
    translateFeedbackKey('auth:errors.GENERIC_ERROR') ??
    'An unexpected error occurred. Please try again.'

  if (error instanceof ApiClientError) {
    const isRateLimited = error.status === 429 || error.errorCode === 'RATE_LIMIT_EXCEEDED'
    const isInlineCandidate = error.status === 400 || error.status === 409 || error.status === 422
    const params = isRateLimited ? { seconds: error.retryAfter ?? 60 } : undefined

    const adminMsg = translateFeedbackKey(`admin:errors.${error.errorCode}`, params)
    const authMsg = adminMsg ? null : translateFeedbackKey(`auth:errors.${error.errorCode}`, params)
    const allowRaw4xx =
      !opts.suppressRawMessage &&
      error.status >= 400 &&
      error.status < 500 &&
      error.status !== 422 &&
      isSafeClientMessage(error.message)

    const message = adminMsg ?? authMsg ?? (allowRaw4xx ? error.message.trim() : fallbackMessage)

    return {
      status: error.status,
      errorCode: error.errorCode,
      message,
      fieldErrors: mapFieldErrors(error),
      retryAfter: error.retryAfter,
      isInlineCandidate,
      isRateLimited,
      isNetworkError: error.isNetworkError,
      isSessionExpired: error.isSessionExpired,
    }
  }

  return {
    status: 0,
    errorCode: 'GENERIC_ERROR',
    message: fallbackMessage,
    fieldErrors: {},
    isInlineCandidate: false,
    isRateLimited: false,
    isNetworkError: false,
    isSessionExpired: false,
  }
}

export function showFeedbackToast(descriptor: FeedbackDescriptor): void {
  const message = translateFeedbackKey(descriptor.key, descriptor.params) ?? descriptor.key
  if (descriptor.variant === 'warning') {
    toast.warning(message)
  } else {
    toast.success(message)
  }
}

export function showResolvedErrorToast(resolved: ResolvedApiError): void {
  if (resolved.isRateLimited) {
    toast.error(resolved.message, { id: 'admin-rate-limit' })
    return
  }
  if (resolved.isNetworkError) {
    toast.error(resolved.message, { id: 'admin-network-error' })
    return
  }
  if (resolved.status >= 500) {
    toast.error(resolved.message, { id: 'admin-server-error' })
    return
  }
  toast.error(resolved.message)
}

export function showBackgroundRefetchToast(resolved: ResolvedApiError): void {
  if (resolved.isRateLimited) {
    toast.error(resolved.message, { id: 'admin-rate-limit' })
    return
  }
  if (resolved.isNetworkError) {
    toast.error(resolved.message, { id: 'admin-network-error' })
    return
  }
  const message = translateFeedbackKey('admin:feedback.backgroundRefreshFailed') ?? resolved.message
  toast.error(message, { id: 'admin-query-refresh-error' })
}

