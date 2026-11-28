import type { ProductResponse } from '@workspace/domain/schemas/product'
import type { ProductService } from './services/product-service'
import type { AuthService } from './services/auth-service'
import type { UserService } from './services/user-service'
import type { OrderService } from './services/order-service'
import type { TicketService } from './services/ticket-service'
import type { CartService } from './services/cart-service'
import type { AdminDashboardService } from './services/admin-dashboard-service'
import type { AdminProfileService } from './services/admin-profile-service'
import type { InventoryService } from './services/inventory-service'
import type { AdminOrderService } from './services/admin-order-service'
import type { AuditService } from './services/audit-service'
import type { PromoService } from './services/promo-service'
import type { LedgerService } from './services/ledger-service'
import type { SettingsService } from './services/settings-service'
import { TokenStorage } from './adapters/http/token-storage'
import { NativeFetchClient } from './adapters/http/fetch-client'
import { HttpAuthAdapter } from './adapters/http/http-auth-adapter'
import { HttpUserAdapter } from './adapters/http/http-user-adapter'
import { HttpProductAdapter } from './adapters/http/http-product-adapter'
import { HttpOrderAdapter } from './adapters/http/http-order-adapter'
import { HttpTicketAdapter } from './adapters/http/http-ticket-adapter'
import { HttpCartAdapter } from './adapters/http/http-cart-adapter'
import { HttpAdminDashboardAdapter } from './adapters/http/http-admin-dashboard-adapter'
import { HttpAdminProfileAdapter } from './adapters/http/http-admin-profile-adapter'
import { HttpInventoryAdapter } from './adapters/http/http-inventory-adapter'
import { HttpAdminOrderAdapter } from './adapters/http/http-admin-order-adapter'
import { HttpAuditAdapter } from './adapters/http/http-audit-adapter'
import { HttpPromoAdapter } from './adapters/http/http-promo-adapter'
import { HttpLedgerAdapter } from './adapters/http/http-ledger-adapter'
import { HttpSettingsAdapter } from './adapters/http/http-settings-adapter'

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
  private readonly adminDashboardServices = new Map<string, AdminDashboardService>()
  private readonly adminProfileServices = new Map<string, AdminProfileService>()
  private readonly inventoryServices = new Map<string, InventoryService>()
  private readonly adminOrderServices = new Map<string, AdminOrderService>()
  private readonly auditServices = new Map<string, AuditService>()
  private readonly promoServices = new Map<string, PromoService>()
  private readonly ledgerServices = new Map<string, LedgerService>()
  private readonly settingsServices = new Map<string, SettingsService>()
  private readonly tokenStorages = new Map<string, TokenStorage>()
  private adminRateLimitHandler?: (retryAfter: number) => void

  setAdminRateLimitHandler(handler?: (retryAfter: number) => void): void {
    this.adminRateLimitHandler = handler
  }

  private createClient(app: AppScope, baseURL?: string): NativeFetchClient {
    const tokenStorage = this.getTokenStorage(app)
    return new NativeFetchClient({
      baseURL: baseURL ?? getApiBaseUrl(),
      tokenStorage,
      onRateLimited: app === 'admin' ? (retryAfter) => this.adminRateLimitHandler?.(retryAfter) : undefined,
    })
  }

  getProductService(options?: { baseURL?: string }): ProductService
  getProductService(app: AppScope, options?: { baseURL?: string }): ProductService
  getProductService(
    appOrOptions?: AppScope | { baseURL?: string },
    options?: { baseURL?: string },
  ): ProductService {
    const isApp = typeof appOrOptions === 'string'
    const app: AppScope = isApp ? (appOrOptions as AppScope) : 'storefront'
    const opts = isApp ? options : appOrOptions

    const key = `${app}_${opts?.baseURL ?? 'default'}`
    let service = this.productServices.get(key)
    if (!service) {
      const client =
        app === 'admin'
          ? this.createClient('admin', opts?.baseURL)
          : new NativeFetchClient({ baseURL: opts?.baseURL ?? getApiBaseUrl() })
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

  getAuthService(app: AppScope = 'storefront', options?: { baseURL?: string }): AuthService {
    const key = `${app}_${options?.baseURL ?? 'default'}`
    let service = this.authServices.get(key)
    if (!service) {
      service = new HttpAuthAdapter(this.createClient(app, options?.baseURL))
      this.authServices.set(key, service)
    }

    return service
  }

  getUserService(app: AppScope = 'storefront', options?: { baseURL?: string }): UserService {
    const key = `${app}_${options?.baseURL ?? 'default'}`
    let service = this.userServices.get(key)
    if (!service) {
      service = new HttpUserAdapter(this.createClient(app, options?.baseURL))
      this.userServices.set(key, service)
    }

    return service
  }

  getOrderService(app: AppScope = 'storefront', options?: { baseURL?: string }): OrderService {
    const key = `${app}_${options?.baseURL ?? 'default'}`
    let service = this.orderServices.get(key)
    if (!service) {
      service = new HttpOrderAdapter(this.createClient(app, options?.baseURL))
      this.orderServices.set(key, service)
    }
    return service
  }

  getTicketService(app: AppScope = 'storefront', options?: { baseURL?: string }): TicketService {
    const key = `${app}_${options?.baseURL ?? 'default'}`
    let service = this.ticketServices.get(key)
    if (!service) {
      service = new HttpTicketAdapter(this.createClient(app, options?.baseURL))
      this.ticketServices.set(key, service)
    }
    return service
  }

  getCartService(app: AppScope = 'storefront', options?: { baseURL?: string }): CartService {
    const key = `${app}_${options?.baseURL ?? 'default'}`
    let service = this.cartServices.get(key)
    if (!service) {
      service = new HttpCartAdapter(this.createClient(app, options?.baseURL))
      this.cartServices.set(key, service)
    }
    return service
  }

  getAdminDashboardService(options?: { baseURL?: string }): AdminDashboardService {
    const key = options?.baseURL ?? 'default'
    let service = this.adminDashboardServices.get(key)
    if (!service) {
      service = new HttpAdminDashboardAdapter(this.createClient('admin', options?.baseURL))
      this.adminDashboardServices.set(key, service)
    }
    return service
  }

  getAdminProfileService(options?: { baseURL?: string }): AdminProfileService {
    const key = options?.baseURL ?? 'default'
    let service = this.adminProfileServices.get(key)
    if (!service) {
      service = new HttpAdminProfileAdapter(this.createClient('admin', options?.baseURL))
      this.adminProfileServices.set(key, service)
    }
    return service
  }

  getInventoryService(options?: { baseURL?: string }): InventoryService {
    const key = options?.baseURL ?? 'default'
    let service = this.inventoryServices.get(key)
    if (!service) {
      service = new HttpInventoryAdapter(this.createClient('admin', options?.baseURL))
      this.inventoryServices.set(key, service)
    }
    return service
  }

  getAdminOrderService(options?: { baseURL?: string }): AdminOrderService {
    const key = options?.baseURL ?? 'default'
    let service = this.adminOrderServices.get(key)
    if (!service) {
      service = new HttpAdminOrderAdapter(this.createClient('admin', options?.baseURL))
      this.adminOrderServices.set(key, service)
    }
    return service
  }

  getAuditService(options?: { baseURL?: string }): AuditService {
    const key = options?.baseURL ?? 'default'
    let service = this.auditServices.get(key)
    if (!service) {
      service = new HttpAuditAdapter(this.createClient('admin', options?.baseURL))
      this.auditServices.set(key, service)
    }
    return service
  }

  getPromoService(options?: { baseURL?: string }): PromoService {
    const key = options?.baseURL ?? 'default'
    let service = this.promoServices.get(key)
    if (!service) {
      service = new HttpPromoAdapter(this.createClient('admin', options?.baseURL))
      this.promoServices.set(key, service)
    }
    return service
  }

  getLedgerService(options?: { baseURL?: string }): LedgerService {
    const key = options?.baseURL ?? 'default'
    let service = this.ledgerServices.get(key)
    if (!service) {
      service = new HttpLedgerAdapter(this.createClient('admin', options?.baseURL))
      this.ledgerServices.set(key, service)
    }
    return service
  }

  getSettingsService(app: AppScope = 'storefront', options?: { baseURL?: string }): SettingsService {
    const key = `${app}_${options?.baseURL ?? 'default'}`
    let service = this.settingsServices.get(key)
    if (!service) {
      const client =
        app === 'admin'
          ? this.createClient('admin', options?.baseURL)
          : new NativeFetchClient({ baseURL: options?.baseURL ?? getApiBaseUrl() })
      service = new HttpSettingsAdapter(client)
      this.settingsServices.set(key, service)
    }
    return service
  }
}

export const services = new ServiceRegistry()

export const setAdminRateLimitHandler = (handler?: (retryAfter: number) => void): void =>
  services.setAdminRateLimitHandler(handler)

export function getProductService(options?: { baseURL?: string }): ProductService
export function getProductService(app: AppScope, options?: { baseURL?: string }): ProductService
export function getProductService(
  appOrOptions?: AppScope | { baseURL?: string },
  options?: { baseURL?: string },
): ProductService {
  return services.getProductService(appOrOptions as any, options)
}

export const getAuthService = (app: AppScope = 'storefront', options?: { baseURL?: string }): AuthService =>
  services.getAuthService(app, options)
export const getUserService = (app: AppScope = 'storefront', options?: { baseURL?: string }): UserService =>
  services.getUserService(app, options)
export const getOrderService = (app: AppScope = 'storefront', options?: { baseURL?: string }): OrderService =>
  services.getOrderService(app, options)
export const getTicketService = (app: AppScope = 'storefront', options?: { baseURL?: string }): TicketService =>
  services.getTicketService(app, options)
export const getCartService = (app: AppScope = 'storefront', options?: { baseURL?: string }): CartService =>
  services.getCartService(app, options)
export const getAdminDashboardService = (options?: { baseURL?: string }): AdminDashboardService =>
  services.getAdminDashboardService(options)
export const getAdminProfileService = (options?: { baseURL?: string }): AdminProfileService =>
  services.getAdminProfileService(options)
export const getInventoryService = (options?: { baseURL?: string }): InventoryService =>
  services.getInventoryService(options)
export const getAdminOrderService = (options?: { baseURL?: string }): AdminOrderService =>
  services.getAdminOrderService(options)
export const getAuditService = (options?: { baseURL?: string }): AuditService =>
  services.getAuditService(options)
export const getPromoService = (options?: { baseURL?: string }): PromoService =>
  services.getPromoService(options)
export const getLedgerService = (options?: { baseURL?: string }): LedgerService =>
  services.getLedgerService(options)
export const getSettingsService = (app: AppScope = 'storefront', options?: { baseURL?: string }): SettingsService =>
  services.getSettingsService(app, options)
export const getTokenStorage = (app: AppScope = 'storefront'): TokenStorage => services.getTokenStorage(app)

/**
 * Resolves static media storage paths to fully qualified URLs.
 */
export function resolveStorageUrl(
  pathOrUrl: string | null | undefined,
  baseURL?: string,
): string | null {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') {
    return null
  }
  const trimmed = pathOrUrl.trim()
  if (!trimmed) {
    return null
  }

  // Retired legacy assets
  if (trimmed.startsWith('/images/products/') || trimmed.startsWith('images/products/')) {
    return null
  }

  // Fully qualified URLs or browser local blobs
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed
  }

  // Extract base URL stripping /api/v1 or /v1 suffix
  const rawBase = baseURL ?? getApiBaseUrl()
  const base = rawBase.replace(/\/api\/v1\/?$/, '').replace(/\/v1\/?$/, '').replace(/\/+$/, '')

  if (trimmed.startsWith('products/')) {
    return `${base}/storage/${trimmed}`
  }
  if (trimmed.startsWith('/storage/')) {
    return `${base}${trimmed}`
  }
  if (trimmed.startsWith('storage/')) {
    return `${base}/${trimmed}`
  }
  if (trimmed.startsWith('/')) {
    return `${base}${trimmed}`
  }

  return `${base}/${trimmed}`
}

/**
 * Extracts the primary or first image URL from a product entity and resolves it through resolveStorageUrl.
 */
export function getProductMainImageUrl(
  product: Pick<ProductResponse, 'primary_image_url' | 'images'> | null | undefined,
  baseURL?: string,
): string | null {
  if (!product) return null
  const candidate =
    product.primary_image_url ||
    product.images?.find((img) => img.is_primary)?.url ||
    product.images?.[0]?.url ||
    null
  return resolveStorageUrl(candidate, baseURL)
}

/**
 * Extracts the dedicated card thumbnail URL if available, falling back to the primary gallery image.
 */
export function getProductThumbnailUrl(
  product: Pick<ProductResponse, 'thumbnail_url' | 'primary_image_url' | 'images'> | null | undefined,
  baseURL?: string,
): string | null {
  if (!product) return null
  if (product.thumbnail_url) {
    return resolveStorageUrl(product.thumbnail_url, baseURL)
  }
  return getProductMainImageUrl(product, baseURL)
}
