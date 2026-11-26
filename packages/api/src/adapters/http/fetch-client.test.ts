import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiClientError, NativeFetchClient } from './fetch-client'
import { TokenStorage } from './token-storage'

describe('NativeFetchClient', () => {
  let mockStorage: Record<string, string> = {}
  let tokenStorage: TokenStorage

  beforeEach(() => {
    mockStorage = {}
    const storageMock = {
      getItem: (k: string) => mockStorage[k] ?? null,
      setItem: (k: string, v: string) => {
        mockStorage[k] = v
      },
      removeItem: (k: string) => {
        delete mockStorage[k]
      },
      clear: () => {
        mockStorage = {}
      },
      length: 0,
      key: () => null,
    } as unknown as Storage

    vi.stubGlobal('localStorage', storageMock)
    vi.stubGlobal('window', { localStorage: storageMock, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    tokenStorage = new TokenStorage('test_')
  })

  it('attaches Bearer token to authenticated requests', async () => {
    tokenStorage.setTokens({
      access_token: 'valid-token',
      refresh_token: 'refresh-token',
      expires_in: 900,
    })

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true }),
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      tokenStorage,
      fetchFn: mockFetch as unknown as typeof fetch,
    })

    const result = await client.request<{ success: boolean }>('/users/me')
    expect(result).toEqual({ success: true })
    expect(mockFetch).toHaveBeenCalledTimes(1)
    const callHeaders = mockFetch.mock.calls[0][1].headers as Headers
    expect(callHeaders.get('Authorization')).toBe('Bearer valid-token')
  })

  it('extracts Retry-After header and details on 429 errors', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      headers: new Headers({
        'content-type': 'application/json',
        'Retry-After': '45',
      }),
      json: async () => ({
        error_code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Try again in 45s.',
        details: {},
      }),
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })

    await expect(client.request('/auth/login')).rejects.toThrow(ApiClientError)

    try {
      await client.request('/auth/login')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiClientError)
      const apiErr = err as ApiClientError
      expect(apiErr.status).toBe(429)
      expect(apiErr.errorCode).toBe('RATE_LIMIT_EXCEEDED')
      expect(apiErr.retryAfter).toBe(45)
    }
  })

  it('deduplicates concurrent 401s into a single refresh call and retries pending requests', async () => {
    tokenStorage.setTokens({
      access_token: 'old-access-token',
      refresh_token: 'uuid-refresh-token-1',
    })

    let refreshCallCount = 0
    let userMeCallCount = 0

    const mockFetch = vi.fn(async (url: string, init?: RequestInit) => {
      const urlStr = url.toString()
      if (urlStr.includes('/auth/refresh')) {
        refreshCallCount++
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            access_token: 'new-rotated-token',
            refresh_token: 'uuid-refresh-token-2',
            token_type: 'bearer',
            expires_in: 900,
          }),
        }
      }

      if (urlStr.includes('/users/me')) {
        userMeCallCount++
        const headers = init?.headers as Headers
        if (headers?.get('Authorization') === 'Bearer new-rotated-token') {
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ id: 'user-1', name: 'Success' }),
          }
        }
        return {
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ error_code: 'AUTHENTICATION_FAILED', message: 'Token expired' }),
        }
      }

      throw new Error(`Unexpected URL: ${urlStr}`)
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      tokenStorage,
      fetchFn: mockFetch as unknown as typeof fetch,
    })

    // Dispatch 3 concurrent requests that all fail with 401 initially
    const [res1, res2, res3] = await Promise.all([
      client.request<{ id: string }>('/users/me'),
      client.request<{ id: string }>('/users/me'),
      client.request<{ id: string }>('/users/me'),
    ])

    expect(res1.id).toBe('user-1')
    expect(res2.id).toBe('user-1')
    expect(res3.id).toBe('user-1')

    // Refresh MUST be called exactly once
    expect(refreshCallCount).toBe(1)
    // New refresh token stored
    expect(tokenStorage.getRefreshToken()).toBe('uuid-refresh-token-2')
  })

  it('triggers onAuthRequired and clears tokens when refresh fails with 401', async () => {
    tokenStorage.setTokens({
      access_token: 'expired-access',
      refresh_token: 'bad-refresh-token',
    })

    const onAuthRequired = vi.fn()

    const mockFetch = vi.fn(async (url: string) => {
      const urlStr = url.toString()
      if (urlStr.includes('/auth/refresh')) {
        return {
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ error_code: 'AUTHENTICATION_FAILED', message: 'Invalid refresh token' }),
        }
      }

      return {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error_code: 'AUTHENTICATION_FAILED', message: 'Token expired' }),
      }
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      tokenStorage,
      onAuthRequired,
      fetchFn: mockFetch as unknown as typeof fetch,
    })

    await expect(client.request('/users/me')).rejects.toThrow(ApiClientError)
    expect(onAuthRequired).toHaveBeenCalledTimes(1)
    expect(tokenStorage.getRefreshToken()).toBeNull()
  })

  it('supports streaming binary data via requestBlob with authentication', async () => {
    tokenStorage.setTokens({
      access_token: 'binary-access-token',
      refresh_token: 'refresh-token',
    })

    const dummyBlob = new Blob(['sample-image-data'], { type: 'image/png' })
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'image/png' }),
      blob: async () => dummyBlob,
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      tokenStorage,
      fetchFn: mockFetch as unknown as typeof fetch,
    })

    const blob = await client.requestBlob('/orders/123/receipts/456/image')
    expect(blob).toBe(dummyBlob)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    const callHeaders = mockFetch.mock.calls[0][1].headers as Headers
    expect(callHeaders.get('Authorization')).toBe('Bearer binary-access-token')
  })

  it('normalizes FastAPI 422 validation arrays stripping body/query/path prefixes', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        detail: [
          { loc: ['body', 'base_price'], msg: 'Input should be greater than 0', type: 'greater_than' },
          { loc: ['query', 'limit'], msg: 'Input should be <= 100', type: 'less_than_equal' },
        ],
      }),
    })

    const client = new NativeFetchClient({ fetchFn: mockFetch as unknown as typeof fetch })
    await expect(client.request('/admin/products', { method: 'POST' })).rejects.toMatchObject({
      status: 422,
      errorCode: 'VALIDATION_ERROR',
      message: 'Input should be greater than 0',
      fieldErrors: [
        { field: 'base_price', message: 'Input should be greater than 0', code: 'greater_than' },
        { field: 'limit', message: 'Input should be <= 100', code: 'less_than_equal' },
      ],
    })
  })

  it('extracts fieldErrors from Muftahy details.field_errors and maps plain detail strings', async () => {
    const mockFetchDetails = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        error_code: 'VALIDATION_ERROR',
        message: 'Invalid payload',
        details: {
          field_errors: { sku: 'Duplicate SKU', title: ['Title too short'] },
        },
      }),
    })

    const client1 = new NativeFetchClient({ fetchFn: mockFetchDetails as unknown as typeof fetch })
    await expect(client1.request('/admin/products')).rejects.toMatchObject({
      status: 400,
      errorCode: 'VALIDATION_ERROR',
      fieldErrors: [
        { field: 'sku', message: 'Duplicate SKU' },
        { field: 'title', message: 'Title too short' },
      ],
    })

    const mockFetchPlain = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      statusText: 'Conflict',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Order already approved' }),
    })

    const client2 = new NativeFetchClient({ fetchFn: mockFetchPlain as unknown as typeof fetch })
    await expect(client2.request('/admin/orders/1/review')).rejects.toMatchObject({
      status: 409,
      errorCode: 'CONFLICT',
      message: 'Order already approved',
    })
  })

  it('handles non-JSON 502 HTML errors and malformed 200 JSON responses safely', async () => {
    const mockFetch502 = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      headers: new Headers({ 'content-type': 'text/html' }),
      json: async () => {
        throw new SyntaxError('Unexpected token <')
      },
    })

    const client1 = new NativeFetchClient({ fetchFn: mockFetch502 as unknown as typeof fetch })
    await expect(client1.request('/admin/orders')).rejects.toMatchObject({
      status: 502,
      errorCode: 'SERVER_ERROR',
      message: 'Bad Gateway',
    })

    const mockFetchBad200 = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => {
        throw new SyntaxError('Unexpected token <')
      },
    })

    const client2 = new NativeFetchClient({ fetchFn: mockFetchBad200 as unknown as typeof fetch })
    await expect(client2.request('/admin/orders')).rejects.toMatchObject({
      status: 502,
      errorCode: 'SERVER_ERROR',
      message: 'Invalid server response',
    })
  })

  it('normalizes network TypeError and TimeoutError while rethrowing AbortError', async () => {
    const mockFetchNet = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    const clientNet = new NativeFetchClient({ fetchFn: mockFetchNet as unknown as typeof fetch })
    await expect(clientNet.request('/admin/orders')).rejects.toMatchObject({
      status: 0,
      errorCode: 'NETWORK_ERROR',
      isNetworkError: true,
    })

    const timeoutErr = new DOMException('Timed out', 'TimeoutError')
    const mockFetchTimeout = vi.fn().mockRejectedValue(timeoutErr)
    const clientTimeout = new NativeFetchClient({ fetchFn: mockFetchTimeout as unknown as typeof fetch })
    await expect(clientTimeout.request('/admin/orders')).rejects.toMatchObject({
      status: 0,
      errorCode: 'NETWORK_ERROR',
      isNetworkError: true,
    })

    const abortErr = new DOMException('Aborted', 'AbortError')
    const mockFetchAbort = vi.fn().mockRejectedValue(abortErr)
    const clientAbort = new NativeFetchClient({ fetchFn: mockFetchAbort as unknown as typeof fetch })
    await expect(clientAbort.request('/admin/orders')).rejects.toBe(abortErr)
  })

  it('clamps Retry-After headers, falls back to 60s, and invokes onRateLimited', async () => {
    const onRateLimited = vi.fn()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      headers: new Headers({ 'Retry-After': '9999' }),
      json: async () => {
        throw new Error('no json')
      },
    })

    const client = new NativeFetchClient({
      onRateLimited,
      fetchFn: mockFetch as unknown as typeof fetch,
    })

    await expect(client.request('/admin/products')).rejects.toMatchObject({
      status: 429,
      errorCode: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 300,
    })
    expect(onRateLimited).toHaveBeenCalledWith(300)

    const mockFetchDefault = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      headers: new Headers(),
      json: async () => ({ detail: 'Too many requests' }),
    })
    const clientDefault = new NativeFetchClient({
      onRateLimited,
      fetchFn: mockFetchDefault as unknown as typeof fetch,
    })
    await expect(clientDefault.request('/admin/products')).rejects.toMatchObject({
      status: 429,
      retryAfter: 60,
    })
    expect(onRateLimited).toHaveBeenCalledWith(60)
  })
})
