import { beforeEach, describe, expect, it, vi } from 'vitest'
import { parseJwtPayload, TokenStorage } from './token-storage'

// Helper to create unverified mock JWT tokens
function createMockJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${header}.${body}.signature`
}

describe('parseJwtPayload', () => {
  it('parses valid base64url payloads', () => {
    const token = createMockJwt({ sub: 'user-123', aud: 'customer', exp: 1999999999 })
    const payload = parseJwtPayload(token)
    expect(payload).not.toBeNull()
    expect(payload?.sub).toBe('user-123')
    expect(payload?.aud).toBe('customer')
  })

  it('returns null for malformed tokens', () => {
    expect(parseJwtPayload('invalid')).toBeNull()
    expect(parseJwtPayload('header.invalid-base64-json.sig')).toBeNull()
  })
})

describe('TokenStorage', () => {
  let mockStorage: Record<string, string> = {}

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
  })

  it('isolates storage keys using prefix', () => {
    const storefront = new TokenStorage('muftahy_storefront_')
    const admin = new TokenStorage('muftahy_admin_')

    storefront.setTokens({
      access_token: createMockJwt({ aud: 'customer', exp: Math.floor(Date.now() / 1000) + 900 }),
      refresh_token: 'sf-refresh',
    })

    admin.setTokens({
      access_token: createMockJwt({ aud: 'admin', exp: Math.floor(Date.now() / 1000) + 900 }),
      refresh_token: 'admin-refresh',
    })

    expect(storefront.getRefreshToken()).toBe('sf-refresh')
    expect(admin.getRefreshToken()).toBe('admin-refresh')
    expect(mockStorage['muftahy_storefront_refresh_token']).toBe('sf-refresh')
    expect(mockStorage['muftahy_admin_refresh_token']).toBe('admin-refresh')
  })

  it('decouples access token expiration from refresh token retention', () => {
    const storage = new TokenStorage('muftahy_storefront_')

    // Access token expired 10 minutes ago
    const expiredToken = createMockJwt({
      aud: 'customer',
      exp: Math.floor(Date.now() / 1000) - 600,
    })

    storage.setTokens({
      access_token: expiredToken,
      refresh_token: 'valid-30-day-refresh-token',
    })

    // Access token reports null
    expect(storage.getAccessToken()).toBeNull()
    expect(storage.hasValidToken()).toBe(false)

    // But refresh token is still safely stored and retained!
    expect(storage.getRefreshToken()).toBe('valid-30-day-refresh-token')
    expect(storage.hasRefreshToken()).toBe(true)
  })

  it('wipes storage when audience mismatches expectedAudience', () => {
    const adminStorage = new TokenStorage('muftahy_admin_', 'admin')

    // Storing a customer token in admin storage
    const customerToken = createMockJwt({
      aud: 'customer',
      exp: Math.floor(Date.now() / 1000) + 900,
    })

    adminStorage.setTokens({
      access_token: customerToken,
      refresh_token: 'some-refresh',
    })

    // Upon checking, mismatch is detected and cleared
    expect(adminStorage.getAccessToken()).toBeNull()
    expect(adminStorage.getRefreshToken()).toBeNull()
    expect(adminStorage.hasRefreshToken()).toBe(false)
  })

  it('clears all prefixed keys on clearTokens()', () => {
    const storage = new TokenStorage('muftahy_storefront_')
    storage.setTokens({
      access_token: 'acc',
      refresh_token: 'ref',
      token_type: 'bearer',
    })

    expect(storage.getRefreshToken()).toBe('ref')
    storage.clearTokens()
    expect(storage.getRefreshToken()).toBeNull()
    expect(storage.getAccessToken()).toBeNull()
  })
})
