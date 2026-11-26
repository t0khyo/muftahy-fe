import { apiErrorResponseSchema } from '@workspace/domain/schemas/auth'
import type { TokenStorage } from './token-storage'

export interface FieldValidationError {
  field: string
  message: string
  code?: string
}

export interface ApiClientErrorOptions {
  fieldErrors?: FieldValidationError[]
  isNetworkError?: boolean
  isSessionExpired?: boolean
}

interface FastApiValidationEntry {
  loc: Array<string | number>
  msg: string
  type?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function parseFastApiValidationPayload(errJson: unknown): FastApiValidationEntry[] | null {
  if (!isRecord(errJson) || !Array.isArray(errJson.detail)) return null
  const entries: FastApiValidationEntry[] = []
  for (const item of errJson.detail) {
    if (!isRecord(item) || !Array.isArray(item.loc) || typeof item.msg !== 'string') {
      return null
    }
    const validLoc = item.loc.every((seg) => typeof seg === 'string' || typeof seg === 'number')
    if (!validLoc) return null
    entries.push({
      loc: item.loc as Array<string | number>,
      msg: item.msg,
      ...(typeof item.type === 'string' ? { type: item.type } : {}),
    })
  }
  return entries
}

function parsePlainDetailPayload(errJson: unknown): string | null {
  if (!isRecord(errJson) || typeof errJson.detail !== 'string' || errJson.detail.length === 0) {
    return null
  }
  return errJson.detail
}

function clampRetryAfter(seconds: number): number {
  if (!Number.isFinite(seconds)) return 60
  return Math.min(300, Math.max(1, Math.ceil(seconds)))
}

function parseRetryAfterHeader(header: string | null): number | undefined {
  if (!header) return undefined
  const trimmed = header.trim()
  if (/^\d+$/.test(trimmed)) {
    return clampRetryAfter(parseInt(trimmed, 10))
  }
  const timestamp = Date.parse(trimmed)
  if (!Number.isNaN(timestamp)) {
    return clampRetryAfter((timestamp - Date.now()) / 1000)
  }
  return undefined
}

function mapStatusToErrorCode(status: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST'
    case 401:
      return 'AUTHENTICATION_FAILED'
    case 403:
      return 'PERMISSION_DENIED'
    case 404:
      return 'ENTITY_NOT_FOUND'
    case 409:
      return 'CONFLICT'
    case 422:
      return 'VALIDATION_ERROR'
    case 429:
      return 'RATE_LIMIT_EXCEEDED'
    default:
      return status >= 500 ? 'SERVER_ERROR' : 'REQUEST_FAILED'
  }
}

function extractFieldErrorsFromDetails(details?: Record<string, unknown>): FieldValidationError[] | undefined {
  const raw = details?.field_errors
  if (!raw) return undefined

  if (Array.isArray(raw)) {
    const items: FieldValidationError[] = []
    for (const entry of raw) {
      if (isRecord(entry) && typeof entry.field === 'string' && entry.field && typeof entry.message === 'string') {
        items.push({
          field: entry.field,
          message: entry.message,
          ...(typeof entry.code === 'string' ? { code: entry.code } : {}),
        })
      }
    }
    return items.length > 0 ? items : undefined
  }

  if (isRecord(raw)) {
    const items: FieldValidationError[] = []
    for (const [field, val] of Object.entries(raw)) {
      if (typeof val === 'string' && val) {
        items.push({ field, message: val })
      } else if (Array.isArray(val)) {
        const firstMsg = val.find((v): v is string => typeof v === 'string' && v.length > 0)
        if (firstMsg) {
          items.push({ field, message: firstMsg })
        }
      }
    }
    return items.length > 0 ? items : undefined
  }

  return undefined
}

function formatFastApiLoc(loc: Array<string | number>): string {
  const parts = loc.map(String)
  const trimmed =
    parts.length > 0 && (parts[0] === 'body' || parts[0] === 'query' || parts[0] === 'path')
      ? parts.slice(1)
      : parts
  return trimmed.length > 0 ? trimmed.join('.') : '_root'
}

function normalizeErrorPayload(
  status: number,
  statusText: string,
  errJson: unknown,
  headerRetryAfter?: number,
): {
  errorCode: string
  message: string
  details?: Record<string, unknown>
  retryAfter?: number
  fieldErrors?: FieldValidationError[]
} {
  const defaultMessage = statusText || `HTTP ${status}`
  let retryAfter = headerRetryAfter

  const parsedMuftahy = apiErrorResponseSchema.safeParse(errJson)
  if (parsedMuftahy.success) {
    if (parsedMuftahy.data.retry_after !== undefined) {
      retryAfter = clampRetryAfter(parsedMuftahy.data.retry_after)
    }
    return {
      errorCode: parsedMuftahy.data.error_code,
      message: parsedMuftahy.data.message || defaultMessage,
      details: parsedMuftahy.data.details,
      retryAfter,
      fieldErrors: extractFieldErrorsFromDetails(parsedMuftahy.data.details),
    }
  }

  const parsedFastApi = parseFastApiValidationPayload(errJson)
  if (parsedFastApi) {
    const fieldErrors: FieldValidationError[] = parsedFastApi.map((entry) => ({
      field: formatFastApiLoc(entry.loc),
      message: entry.msg,
      code: entry.type,
    }))
    return {
      errorCode: 'VALIDATION_ERROR',
      message: fieldErrors[0]?.message || defaultMessage,
      retryAfter,
      fieldErrors: fieldErrors.length > 0 ? fieldErrors : undefined,
    }
  }

  const parsedDetail = parsePlainDetailPayload(errJson)
  if (parsedDetail) {
    return {
      errorCode: mapStatusToErrorCode(status),
      message: parsedDetail,
      retryAfter,
    }
  }

  return {
    errorCode: mapStatusToErrorCode(status),
    message: defaultMessage,
    retryAfter,
  }
}

export class ApiClientError extends Error {
  readonly status: number
  readonly errorCode: string
  readonly details?: Record<string, unknown>
  readonly retryAfter?: number
  readonly fieldErrors?: FieldValidationError[]
  readonly isNetworkError: boolean
  readonly isSessionExpired: boolean

  constructor(
    status: number,
    errorCode: string,
    message: string,
    details?: Record<string, unknown>,
    retryAfter?: number,
    options?: ApiClientErrorOptions,
  ) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.errorCode = errorCode
    this.details = details
    this.retryAfter = retryAfter
    this.fieldErrors = options?.fieldErrors
    this.isNetworkError = options?.isNetworkError ?? false
    this.isSessionExpired = options?.isSessionExpired ?? false
  }
}

export interface FetchClientOptions {
  baseURL?: string
  tokenStorage?: TokenStorage
  onAuthRequired?: () => void
  onRateLimited?: (retryAfter: number) => void
  fetchFn?: typeof fetch
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  isRetry?: boolean
  skipAuth?: boolean
  responseType?: 'json' | 'text' | 'blob'
}

export class NativeFetchClient {
  private readonly baseURL: string
  private readonly tokenStorage?: TokenStorage
  private readonly onAuthRequired?: () => void
  private readonly onRateLimited?: (retryAfter: number) => void
  private readonly customFetch?: typeof fetch
  private refreshPromise: Promise<{ accessToken: string | null; sessionExpired: boolean }> | null = null

  constructor(options: FetchClientOptions = {}) {
    this.baseURL = (options.baseURL ?? 'http://localhost:8000/api/v1').replace(/\/+$/, '')
    this.tokenStorage = options.tokenStorage
    this.onAuthRequired = options.onAuthRequired
    this.onRateLimited = options.onRateLimited
    this.customFetch = options.fetchFn
  }

  private getFetch(): typeof fetch {
    if (this.customFetch) return this.customFetch
    if (typeof window !== 'undefined' && window.fetch) return window.fetch.bind(window)
    if (typeof globalThis !== 'undefined' && globalThis.fetch) return globalThis.fetch
    throw new Error('Fetch API is not available in the current environment')
  }

  private buildUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${this.baseURL}${normalizedPath}`
  }

  private async executeWithLock<T>(fn: () => Promise<T>): Promise<T> {
    if (typeof navigator !== 'undefined' && navigator.locks?.request) {
      return navigator.locks.request('muftahy_auth_refresh', fn)
    }
    return fn()
  }

  private async performTokenRefresh(
    staleAccessToken: string | null,
  ): Promise<{ accessToken: string | null; sessionExpired: boolean }> {
    if (!this.tokenStorage) return { accessToken: null, sessionExpired: false }

    // Check if another request or tab already refreshed the access token
    const currentToken = this.tokenStorage.getAccessToken()
    if (currentToken && currentToken !== staleAccessToken) {
      return { accessToken: currentToken, sessionExpired: false }
    }

    const refreshToken = this.tokenStorage.getRefreshToken()
    if (!refreshToken) {
      this.tokenStorage.clearTokens()
      this.onAuthRequired?.()
      return { accessToken: null, sessionExpired: true }
    }

    try {
      const fetchImpl = this.getFetch()
      const response = await fetchImpl(this.buildUrl('/auth/refresh'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!response.ok) {
        this.tokenStorage.clearTokens()
        this.onAuthRequired?.()
        return { accessToken: null, sessionExpired: true }
      }

      const data = (await response.json()) as {
        access_token: string
        refresh_token: string
        token_type?: string
        expires_in?: number
      }

      this.tokenStorage.setTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
      })

      return { accessToken: data.access_token, sessionExpired: false }
    } catch {
      this.tokenStorage.clearTokens()
      this.onAuthRequired?.()
      return { accessToken: null, sessionExpired: true }
    }
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const fetchImpl = this.getFetch()
    const url = this.buildUrl(path)
    const headers = new Headers(options.headers || {})

    let accessToken: string | null = null
    if (!options.skipAuth && this.tokenStorage) {
      accessToken = this.tokenStorage.getAccessToken()
      if (accessToken && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${accessToken}`)
      }
    }

    let body = options.body
    if (body !== undefined && !(body instanceof FormData) && typeof body !== 'string') {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
      }
      body = JSON.stringify(body)
    }

    let response: Response
    try {
      response = await fetchImpl(url, {
        ...options,
        headers,
        body: body as BodyInit | null | undefined,
      })
    } catch (err) {
      if (err && typeof err === 'object' && (err as { name?: string }).name === 'AbortError') {
        throw err
      }
      throw new ApiClientError(0, 'NETWORK_ERROR', 'Network request failed', undefined, undefined, {
        isNetworkError: true,
      })
    }

    // Handle 401 Unauthorized with single-flight latch
    let isSessionExpired = false
    if (response.status === 401 && !options.isRetry && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
      if (!this.refreshPromise) {
        this.refreshPromise = this.executeWithLock(() => this.performTokenRefresh(accessToken)).finally(() => {
          this.refreshPromise = null
        })
      }

      const refreshResult = await this.refreshPromise
      if (refreshResult.accessToken) {
        const retryHeaders = new Headers(headers)
        retryHeaders.set('Authorization', `Bearer ${refreshResult.accessToken}`)
        return this.request<T>(path, {
          ...options,
          isRetry: true,
          headers: retryHeaders,
        })
      }
      isSessionExpired = refreshResult.sessionExpired
    }

    // Handle 429 Too Many Requests
    const headerRetryAfter =
      response.status === 429 ? parseRetryAfterHeader(response.headers.get('Retry-After')) : undefined

    if (!response.ok) {
      let errJson: unknown
      try {
        errJson = await response.json()
      } catch {
        errJson = undefined
      }

      const normalized = normalizeErrorPayload(response.status, response.statusText, errJson, headerRetryAfter)
      const finalRetryAfter =
        response.status === 429 ? (normalized.retryAfter ?? 60) : normalized.retryAfter

      if (response.status === 429 && finalRetryAfter !== undefined) {
        this.onRateLimited?.(finalRetryAfter)
      }

      throw new ApiClientError(
        response.status,
        normalized.errorCode,
        normalized.message,
        normalized.details,
        finalRetryAfter,
        {
          fieldErrors: normalized.fieldErrors,
          isSessionExpired,
        },
      )
    }

    if (response.status === 204) {
      return undefined as unknown as T
    }

    if (options.responseType === 'blob') {
      return (await response.blob()) as unknown as T
    }

    if (options.responseType === 'text') {
      return (await response.text()) as unknown as T
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      try {
        return (await response.json()) as T
      } catch {
        throw new ApiClientError(502, 'SERVER_ERROR', 'Invalid server response')
      }
    }

    return (await response.text()) as unknown as T
  }

  async requestBlob(path: string, options: RequestOptions = {}): Promise<Blob> {
    return this.request<Blob>(path, { ...options, responseType: 'blob' })
  }
}
