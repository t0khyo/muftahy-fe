export interface JwtPayload {
  aud?: string
  exp?: number
  sub?: string
  [key: string]: unknown
}

export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2 || !parts[1]) return null
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    const jsonStr =
      typeof atob === 'function'
        ? atob(base64)
        : typeof Buffer !== 'undefined'
          ? Buffer.from(base64, 'base64').toString('utf-8')
          : null
    if (!jsonStr) return null
    return JSON.parse(jsonStr) as JwtPayload
  } catch {
    return null
  }
}

export interface StoredTokens {
  access_token: string
  refresh_token: string
  token_type?: string
  expires_in?: number
}

export class TokenStorage {
  private readonly prefix: string
  private readonly expectedAudience?: string

  constructor(prefix: 'muftahy_storefront_' | 'muftahy_admin_' | string, expectedAudience?: string) {
    this.prefix = prefix
    this.expectedAudience = expectedAudience
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  private getStorage(): Storage | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage
    }
    return null
  }

  getAccessToken(): string | null {
    const storage = this.getStorage()
    if (!storage) return null

    const token = storage.getItem(this.getKey('access_token'))
    if (!token) return null

    const payload = parseJwtPayload(token)
    if (payload) {
      // Check audience mismatch: if audience is present and does not match expected, wipe storage
      if (this.expectedAudience && payload.aud && payload.aud !== this.expectedAudience) {
        this.clearTokens()
        return null
      }

      // Decoupled eviction: if expired, return null for access token, but do NOT wipe refresh token!
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return null
      }
    }

    return token
  }

  getRefreshToken(): string | null {
    const storage = this.getStorage()
    if (!storage) return null
    return storage.getItem(this.getKey('refresh_token'))
  }

  hasValidToken(): boolean {
    return this.getAccessToken() !== null
  }

  hasRefreshToken(): boolean {
    const token = this.getRefreshToken()
    return typeof token === 'string' && token.trim().length > 0
  }

  getExpectedAudience(): string | undefined {
    return this.expectedAudience
  }

  getAudience(): string | null {
    const token = this.getAccessToken()
    if (!token) return null
    const payload = parseJwtPayload(token)
    return payload?.aud ?? null
  }

  setTokens(tokens: StoredTokens): void {
    const storage = this.getStorage()
    if (!storage) return

    storage.setItem(this.getKey('access_token'), tokens.access_token)
    storage.setItem(this.getKey('refresh_token'), tokens.refresh_token)

    if (tokens.token_type) {
      storage.setItem(this.getKey('token_type'), tokens.token_type)
    }

    const payload = parseJwtPayload(tokens.access_token)
    const expiresInSeconds = tokens.expires_in ?? (payload?.exp ? payload.exp - Math.floor(Date.now() / 1000) : 900)
    const expiresAt = Date.now() + Math.max(0, expiresInSeconds) * 1000
    storage.setItem(this.getKey('expires_at'), expiresAt.toString())
  }

  clearTokens(): void {
    const storage = this.getStorage()
    if (!storage) return

    storage.removeItem(this.getKey('access_token'))
    storage.removeItem(this.getKey('refresh_token'))
    storage.removeItem(this.getKey('token_type'))
    storage.removeItem(this.getKey('expires_at'))
  }

  onTokensChanged(callback: (tokens: { accessToken: string | null; refreshToken: string | null }) => void): () => void {
    if (typeof window === 'undefined') return () => {}

    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key.startsWith(this.prefix)) {
        callback({
          accessToken: this.getAccessToken(),
          refreshToken: this.getRefreshToken(),
        })
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }
}
