import type { ProductService } from './services/product-service'
import type { AuthService } from './services/auth-service'
import type { UserService } from './services/user-service'
import { MockProductAdapter } from './adapters/mock/product-mock-adapter'
import { MockAuthAdapter } from './adapters/mock/mock-auth-adapter'
import { MockUserAdapter } from './adapters/mock/mock-user-adapter'
import { TokenStorage } from './adapters/http/token-storage'
import { NativeFetchClient } from './adapters/http/fetch-client'
import { HttpAuthAdapter } from './adapters/http/http-auth-adapter'
import { HttpUserAdapter } from './adapters/http/http-user-adapter'

export interface ApiServices {
  products: ProductService
  auth: AuthService
  user: UserService
}

export type AppScope = 'storefront' | 'admin'

function getImportMetaEnv(): Record<string, string | undefined> | undefined {
  try {
    return (import.meta as unknown as { env?: Record<string, string | undefined> })?.env
  } catch {
    return undefined
  }
}

function getProcessEnv(): Record<string, string | undefined> | undefined {
  try {
    return typeof process !== 'undefined' ? process.env : undefined
  } catch {
    return undefined
  }
}

function normalizeApiUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/\/+$/, '')
  if (trimmed.endsWith('/api/v1')) {
    return trimmed
  }
  if (trimmed.endsWith('/api')) {
    return `${trimmed}/v1`
  }
  return `${trimmed}/api/v1`
}

function isMockApiPreferred(): boolean {
  const metaEnv = getImportMetaEnv()
  const procEnv = getProcessEnv()

  // In test runners (Vitest), always default to mock adapters per AGENTS.md
  const isTestEnvironment =
    (typeof process !== 'undefined' && Boolean(process.env?.VITEST)) ||
    metaEnv?.MODE === 'test' ||
    procEnv?.NODE_ENV === 'test'

  if (isTestEnvironment && procEnv?.VITE_TEST_WITH_LIVE_API !== 'true') {
    return true
  }

  // If explicitly disabled
  if (metaEnv?.VITE_USE_MOCK_API === 'false' || procEnv?.VITE_USE_MOCK_API === 'false') {
    return false
  }

  // If explicitly enabled
  if (metaEnv?.VITE_USE_MOCK_API === 'true' || procEnv?.VITE_USE_MOCK_API === 'true') {
    return true
  }

  // If live API URL is provided, prefer HTTP
  const hasLiveUrl = Boolean(
    metaEnv?.VITE_API_URL ||
    metaEnv?.API_URL ||
    procEnv?.VITE_API_URL ||
    procEnv?.API_URL
  )
  if (hasLiveUrl) {
    return false
  }

  // Default to mock for standalone frontend development per AGENTS.md
  return true
}

function getApiBaseUrl(): string {
  const metaEnv = getImportMetaEnv()
  const procEnv = getProcessEnv()

  const rawUrl =
    metaEnv?.VITE_API_URL ||
    metaEnv?.API_URL ||
    procEnv?.VITE_API_URL ||
    procEnv?.API_URL

  if (rawUrl) {
    return normalizeApiUrl(rawUrl)
  }

  return 'http://localhost:8000/api/v1'
}

class ServiceRegistry {
  private productService: ProductService | null = null
  private readonly authServices = new Map<string, AuthService>()
  private readonly userServices = new Map<string, UserService>()
  private readonly tokenStorages = new Map<string, TokenStorage>()

  getProductService(): ProductService {
    if (!this.productService) {
      this.productService = new MockProductAdapter()
    }
    return this.productService
  }

  getTokenStorage(app: AppScope = 'storefront'): TokenStorage {
    const key = app
    let storage = this.tokenStorages.get(key)
    if (!storage) {
      const prefix = app === 'admin' ? 'muftahy_admin_' : 'muftahy_storefront_'
      const expectedAudience = app === 'admin' ? 'admin' : 'customer'
      storage = new TokenStorage(prefix, expectedAudience)
      this.tokenStorages.set(key, storage)
    }
    return storage
  }

  getAuthService(app: AppScope = 'storefront', options?: { useMock?: boolean; baseURL?: string }): AuthService {
    const useMock = options?.useMock ?? isMockApiPreferred()
    const key = `${app}_${useMock ? 'mock' : 'http'}`

    let service = this.authServices.get(key)
    if (!service) {
      if (useMock) {
        service = new MockAuthAdapter()
      } else {
        const tokenStorage = this.getTokenStorage(app)
        const client = new NativeFetchClient({
          baseURL: options?.baseURL ?? getApiBaseUrl(),
          tokenStorage,
        })
        service = new HttpAuthAdapter(client)
      }
      this.authServices.set(key, service)
    }

    return service
  }

  getUserService(app: AppScope = 'storefront', options?: { useMock?: boolean; baseURL?: string }): UserService {
    const useMock = options?.useMock ?? isMockApiPreferred()
    const key = `${app}_${useMock ? 'mock' : 'http'}`

    let service = this.userServices.get(key)
    if (!service) {
      if (useMock) {
        service = new MockUserAdapter(app === 'admin' ? 'admin' : 'customer')
      } else {
        const tokenStorage = this.getTokenStorage(app)
        const client = new NativeFetchClient({
          baseURL: options?.baseURL ?? getApiBaseUrl(),
          tokenStorage,
        })
        service = new HttpUserAdapter(client)
      }
      this.userServices.set(key, service)
    }

    return service
  }
}

export const services = new ServiceRegistry()
export const getProductService = (): ProductService => services.getProductService()
export const getAuthService = (app: AppScope = 'storefront', options?: { useMock?: boolean; baseURL?: string }): AuthService =>
  services.getAuthService(app, options)
export const getUserService = (app: AppScope = 'storefront', options?: { useMock?: boolean; baseURL?: string }): UserService =>
  services.getUserService(app, options)
export const getTokenStorage = (app: AppScope = 'storefront'): TokenStorage => services.getTokenStorage(app)
