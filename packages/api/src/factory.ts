import type { ProductService } from './services/product-service'
import type { AuthService } from './services/auth-service'
import type { UserService } from './services/user-service'
import type { OrderService } from './services/order-service'
import type { TicketService } from './services/ticket-service'
import type { CartService } from './services/cart-service'
import { TokenStorage } from './adapters/http/token-storage'
import { NativeFetchClient } from './adapters/http/fetch-client'
import { HttpAuthAdapter } from './adapters/http/http-auth-adapter'
import { HttpUserAdapter } from './adapters/http/http-user-adapter'
import { HttpProductAdapter } from './adapters/http/http-product-adapter'
import { HttpOrderAdapter } from './adapters/http/http-order-adapter'
import { HttpTicketAdapter } from './adapters/http/http-ticket-adapter'
import { HttpCartAdapter } from './adapters/http/http-cart-adapter'

export interface ApiServices {
  products: ProductService
  auth: AuthService
  user: UserService
  orders: OrderService
  tickets: TicketService
  cart: CartService
}

export type AppScope = 'storefront' | 'admin'

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

function normalizeApiUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/\/+$/, '')
  if (trimmed.endsWith('/api/v1')) {
    return trimmed
  }
  if (trimmed.endsWith('/v1')) {
    return trimmed
  }
  if (trimmed.endsWith('/api')) {
    return `${trimmed}/v1`
  }
  return `${trimmed}/api/v1`
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
  private readonly orderServices = new Map<string, OrderService>()
  private readonly ticketServices = new Map<string, TicketService>()
  private readonly cartServices = new Map<string, CartService>()
  private readonly tokenStorages = new Map<string, TokenStorage>()

  getProductService(options?: { useMock?: boolean; baseURL?: string }): ProductService {
    const key = options?.baseURL ?? 'default'
    let service = this.productServices.get(key)
    if (!service) {
      const client = new NativeFetchClient({
        baseURL: options?.baseURL ?? getApiBaseUrl(),
      })
      service = new HttpProductAdapter(client)
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
    const key = `${app}_${options?.baseURL ?? 'default'}`
    let service = this.authServices.get(key)
    if (!service) {
      const tokenStorage = this.getTokenStorage(app)
      const client = new NativeFetchClient({
        baseURL: options?.baseURL ?? getApiBaseUrl(),
        tokenStorage,
      })
      service = new HttpAuthAdapter(client)
      this.authServices.set(key, service)
    }

    return service
  }

  getUserService(app: AppScope = 'storefront', options?: { useMock?: boolean; baseURL?: string }): UserService {
    const key = `${app}_${options?.baseURL ?? 'default'}`
    let service = this.userServices.get(key)
    if (!service) {
      const tokenStorage = this.getTokenStorage(app)
      const client = new NativeFetchClient({
        baseURL: options?.baseURL ?? getApiBaseUrl(),
        tokenStorage,
      })
      service = new HttpUserAdapter(client)
      this.userServices.set(key, service)
    }

    return service
  }

  getOrderService(app: AppScope = 'storefront', options?: { baseURL?: string }): OrderService {
    const key = `${app}_${options?.baseURL ?? 'default'}`
    let service = this.orderServices.get(key)
    if (!service) {
      const tokenStorage = this.getTokenStorage(app)
      const client = new NativeFetchClient({
        baseURL: options?.baseURL ?? getApiBaseUrl(),
        tokenStorage,
      })
      service = new HttpOrderAdapter(client)
      this.orderServices.set(key, service)
    }
    return service
  }

  getTicketService(app: AppScope = 'storefront', options?: { baseURL?: string }): TicketService {
    const key = `${app}_${options?.baseURL ?? 'default'}`
    let service = this.ticketServices.get(key)
    if (!service) {
      const tokenStorage = this.getTokenStorage(app)
      const client = new NativeFetchClient({
        baseURL: options?.baseURL ?? getApiBaseUrl(),
        tokenStorage,
      })
      service = new HttpTicketAdapter(client)
      this.ticketServices.set(key, service)
    }
    return service
  }

  getCartService(app: AppScope = 'storefront', options?: { baseURL?: string }): CartService {
    const key = `${app}_${options?.baseURL ?? 'default'}`
    let service = this.cartServices.get(key)
    if (!service) {
      const tokenStorage = this.getTokenStorage(app)
      const client = new NativeFetchClient({
        baseURL: options?.baseURL ?? getApiBaseUrl(),
        tokenStorage,
      })
      service = new HttpCartAdapter(client)
      this.cartServices.set(key, service)
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
export const getOrderService = (app: AppScope = 'storefront', options?: { baseURL?: string }): OrderService =>
  services.getOrderService(app, options)
export const getTicketService = (app: AppScope = 'storefront', options?: { baseURL?: string }): TicketService =>
  services.getTicketService(app, options)
export const getCartService = (app: AppScope = 'storefront', options?: { baseURL?: string }): CartService =>
  services.getCartService(app, options)
export const getTokenStorage = (app: AppScope = 'storefront'): TokenStorage => services.getTokenStorage(app)
