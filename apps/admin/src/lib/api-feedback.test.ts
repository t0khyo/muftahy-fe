import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@workspace/i18n/config'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import { toast } from '@workspace/ui/components/sonner'
import {
  resolveApiError,
  showBackgroundRefetchToast,
  showFeedbackToast,
  showResolvedErrorToast,
} from './api-feedback'

describe('api-feedback', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
    vi.spyOn(toast, 'success').mockImplementation(() => '1')
    vi.spyOn(toast, 'warning').mockImplementation(() => '1')
    vi.spyOn(toast, 'error').mockImplementation(() => '1')
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await i18n.changeLanguage('en')
  })

  it('resolves known admin error codes in English and Arabic', async () => {
    const err = new ApiClientError(409, 'SKU_ALREADY_EXISTS', 'Raw backend text')
    const enResolved = resolveApiError(err)
    expect(enResolved.message).toBe('A product with this SKU already exists.')
    expect(enResolved.isInlineCandidate).toBe(true)

    await i18n.changeLanguage('ar')
    const arResolved = resolveApiError(err)
    expect(arResolved.message).toBe('يوجد منتج آخر مسجل بنفس SKU.')
  })

  it('interpolates retryAfter with Western digits in Arabic for 429 errors', async () => {
    await i18n.changeLanguage('ar')
    const err = new ApiClientError(429, 'RATE_LIMIT_EXCEEDED', 'Too many', {}, 45)
    const resolved = resolveApiError(err)
    expect(resolved.isRateLimited).toBe(true)
    expect(resolved.message).toContain('45')
    expect(resolved.message).not.toMatch(/[٠-٩]/)
  })

  it('falls back to auth:errors for shared error codes and sanitizes 5xx errors', () => {
    const netErr = new ApiClientError(0, 'NETWORK_ERROR', 'Failed to fetch', undefined, undefined, {
      isNetworkError: true,
    })
    const netResolved = resolveApiError(netErr)
    expect(netResolved.isNetworkError).toBe(true)
    expect(netResolved.message).toBe('Unable to connect to the server. Please check your connection.')

    const serverErr = new ApiClientError(500, 'UNMAPPED_CRASH', 'Traceback: SQL error at line 42')
    const serverResolved = resolveApiError(serverErr)
    expect(serverResolved.message).toBe('An unexpected error occurred. Please try again.')
    expect(serverResolved.message).not.toContain('SQL')
  })

  it('maps FastAPI 422 fieldErrors keeping first message per field and honors suppressRawMessage', () => {
    const err = new ApiClientError(422, 'VALIDATION_ERROR', 'Input should be > 0', undefined, undefined, {
      fieldErrors: [
        { field: 'base_price', message: 'Must be positive' },
        { field: 'base_price', message: 'Second error' },
        { field: '', message: 'Root failure' },
      ],
    })
    const resolved = resolveApiError(err)
    expect(resolved.fieldErrors).toEqual({
      base_price: 'Must be positive',
      _root: 'Root failure',
    })
    expect(resolved.message).toBe('Please check the highlighted fields and try again.')

    const unmapped400 = new ApiClientError(400, 'CUSTOM_KEY_ERR', 'Key XXXXX-XXXXX invalid')
    expect(resolveApiError(unmapped400).message).toBe('Key XXXXX-XXXXX invalid')
    expect(resolveApiError(unmapped400, { suppressRawMessage: true }).message).toBe(
      'An unexpected error occurred. Please try again.',
    )
  })

  it('rejects multiline or HTML raw 4xx messages', () => {
    const htmlErr = new ApiClientError(400, 'UNMAPPED', '<html>Bad Gateway</html>')
    expect(resolveApiError(htmlErr).message).toBe('An unexpected error occurred. Please try again.')
  })

  it('emits deduplicated toast IDs by failure class and handles warning descriptors', () => {
    showFeedbackToast({ key: 'admin:feedback.keysImportedPartial', params: { imported: 3, failed: 2 }, variant: 'warning' })
    expect(toast.warning).toHaveBeenCalledWith('Imported 3 keys; 2 failed.')

    showResolvedErrorToast(resolveApiError(new ApiClientError(429, 'RATE_LIMIT_EXCEEDED', 'limit', {}, 30)))
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('30'), { id: 'admin-rate-limit' })

    showResolvedErrorToast(
      resolveApiError(new ApiClientError(0, 'NETWORK_ERROR', 'net', undefined, undefined, { isNetworkError: true })),
    )
    expect(toast.error).toHaveBeenCalledWith(expect.any(String), { id: 'admin-network-error' })

    showBackgroundRefetchToast(resolveApiError(new ApiClientError(500, 'SERVER_ERROR', 'boom')))
    expect(toast.error).toHaveBeenCalledWith(
      'Could not refresh data. Showing last loaded results.',
      { id: 'admin-query-refresh-error' },
    )
  })
})

