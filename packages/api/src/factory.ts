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
import { HttpProductAdapter } from './adapters/http/http-product-adapter'

export interface ApiServices {
  products: ProductService
  auth: AuthService
  user: UserService
}

export type AppScope = 'storefront' | 'admin'

function getEnvMockFlag(): string | undefined {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK_API !== undefined) {
      return import.meta.env.VITE_USE_MOCK_API
    }
  } catch {
    // ignore
  }
  if (typeof process !== 'undefined') {
    return process.env?.VITE_USE_MOCK_API
  }
  return undefined
}

function getEnvApiUrl(): string | undefined {
  try {
    if (typeof import.meta !== 'undefined') {
      const url = import.meta.env?.VITE_API_URL || import.meta.env?.API_URL
      if (url) return url
    }
  } catch {
    // ignore
  }
  if (typeof process !== 'undefined') {
    return process.env?.VITE_API_URL || process.env?.API_URL
  }
  return undefined
}

function getEnvMode(): string | undefined {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.MODE !== undefined) {
      return import.meta.env.MODE
    }
  } catch {
    // ignore
  }
  if (typeof process !== 'undefined') {
    return process.env?.NODE_ENV
  }
  return undefined
}

function getEnvLiveApiTest(): string | undefined {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TEST_WITH_LIVE_API !== undefined) {
      return import.meta.env.VITE_TEST_WITH_LIVE_API
    }
  } catch {
    // ignore
  }
  if (typeof process !== 'undefined') {
    return process.env?.VITE_TEST_WITH_LIVE_API
  }
  return undefined
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
  const isVitest = typeof process !== 'undefined' && Boolean(process.env?.VITEST)
  const mode = getEnvMode()
  const isTestEnvironment = isVitest || mode === 'test'

  if (isTestEnvironment && getEnvLiveApiTest() !== 'true') {
    return true
  }

  const mockFlag = getEnvMockFlag()
  if (mockFlag === 'false') {
    return false
  }
  if (mockFlag === 'true') {
    return true
  }

  const liveUrl = getEnvApiUrl()
  if (liveUrl) {
    return false
  }

  return true
}

function getApiBaseUrl(): string {
  const rawUrl = getEnvApiUrl()
  if (rawUrl) {
    return normalizeApiUrl(rawUrl)
  }

  return 'http://localhost:8000/api/v1'
}

class ServiceRegistry {
  private readonly productServices = new Map<string, ProductService>()
  private readonly authServices = new Map<string, AuthService>()
  private readonly userServices = new Map<string, UserService>()
  private readonly tokenStorages = new Map<string, TokenStorage>()

  getProductService(options?: { useMock?: boolean; baseURL?: string }): ProductService {
    const useMock = options?.useMock ?? isMockApiPreferred()
    const key = useMock ? 'mock' : 'http'
    let service = this.productServices.get(key)
    if (!service) {
      if (useMock) {
        service = new MockProductAdapter()
      } else {
        const client = new NativeFetchClient({
          baseURL: options?.baseURL ?? getApiBaseUrl(),
        })
        service = new HttpProductAdapter(client)
      }
      this.productServices.set(key, service)
    }
    return service
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
export const getProductService = (options?: { useMock?: boolean; baseURL?: string }): ProductService =>
  services.getProductService(options)
export const getAuthService = (app: AppScope = 'storefront', options?: { useMock?: boolean; baseURL?: string }): AuthService =>
  services.getAuthService(app, options)
export const getUserService = (app: AppScope = 'storefront', options?: { useMock?: boolean; baseURL?: string }): UserService =>
  services.getUserService(app, options)
export const getTokenStorage = (app: AppScope = 'storefront'): TokenStorage => services.getTokenStorage(app)
