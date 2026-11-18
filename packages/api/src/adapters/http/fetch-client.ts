import { apiErrorResponseSchema } from '@workspace/domain/schemas/auth'
import type { TokenStorage } from './token-storage'

export class ApiClientError extends Error {
  readonly status: number
  readonly errorCode: string
  readonly details?: Record<string, unknown>
  readonly retryAfter?: number

  constructor(status: number, errorCode: string, message: string, details?: Record<string, unknown>, retryAfter?: number) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.errorCode = errorCode
    this.details = details
    this.retryAfter = retryAfter
  }
}

export interface FetchClientOptions {
  baseURL?: string
  tokenStorage?: TokenStorage
  onAuthRequired?: () => void
  fetchFn?: typeof fetch
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  isRetry?: boolean
  skipAuth?: boolean
}

export class NativeFetchClient {
  private readonly baseURL: string
  private readonly tokenStorage?: TokenStorage
  private readonly onAuthRequired?: () => void
  private readonly customFetch?: typeof fetch
  private refreshPromise: Promise<string | null> | null = null

  constructor(options: FetchClientOptions = {}) {
    this.baseURL = (options.baseURL ?? 'http://localhost:8000/api/v1').replace(/\/+$/, '')
    this.tokenStorage = options.tokenStorage
    this.onAuthRequired = options.onAuthRequired
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

  private async performTokenRefresh(staleAccessToken: string | null): Promise<string | null> {
    if (!this.tokenStorage) return null

    // Check if another request or tab already refreshed the access token
    const currentToken = this.tokenStorage.getAccessToken()
    if (currentToken && currentToken !== staleAccessToken) {
      return currentToken
    }

    const refreshToken = this.tokenStorage.getRefreshToken()
    if (!refreshToken) {
      this.tokenStorage.clearTokens()
      this.onAuthRequired?.()
      return null
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
        return null
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

      return data.access_token
    } catch {
      this.tokenStorage.clearTokens()
      this.onAuthRequired?.()
      return null
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

    const response = await fetchImpl(url, {
      ...options,
      headers,
      body: body as BodyInit | null | undefined,
    })

    // Handle 401 Unauthorized with single-flight latch
    if (response.status === 401 && !options.isRetry && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
      if (!this.refreshPromise) {
        this.refreshPromise = this.executeWithLock(() => this.performTokenRefresh(accessToken)).finally(() => {
          this.refreshPromise = null
        })
      }

      const newAccessToken = await this.refreshPromise
      if (newAccessToken) {
        const retryHeaders = new Headers(headers)
        retryHeaders.set('Authorization', `Bearer ${newAccessToken}`)
        return this.request<T>(path, {
          ...options,
          isRetry: true,
          headers: retryHeaders,
        })
      }
    }

    // Handle 429 Too Many Requests
    let retryAfter: number | undefined
    if (response.status === 429) {
      const retryHeader = response.headers.get('Retry-After')
      if (retryHeader) {
        const parsed = parseInt(retryHeader, 10)
        if (!isNaN(parsed) && parsed >= 0) {
          retryAfter = parsed
        }
      }
    }

    if (!response.ok) {
      let errorCode = 'REQUEST_FAILED'
      let message = response.statusText || 'An error occurred'
      let details: Record<string, unknown> | undefined

      try {
        const errJson = (await response.json()) as unknown
        const parsedError = apiErrorResponseSchema.safeParse(errJson)
        if (parsedError.success) {
          errorCode = parsedError.data.error_code
          message = parsedError.data.message
          details = parsedError.data.details
          if (parsedError.data.retry_after !== undefined) {
            retryAfter = parsedError.data.retry_after
          }
        }
      } catch {
        // Fallback to HTTP status defaults
      }

      throw new ApiClientError(response.status, errorCode, message, details, retryAfter)
    }

    if (response.status === 204) {
      return undefined as unknown as T
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T
    }

    return (await response.text()) as unknown as T
  }
}
