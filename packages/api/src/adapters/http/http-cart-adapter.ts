import {
  type CartCheckoutRequest,
  type CartItemAddRequest,
  type CartItemUpdateRequest,
  type CartResponse,
  type PromoCheckRequest,
  type PromoCheckResponse,
  cartCheckoutRequestSchema,
  cartItemAddRequestSchema,
  cartItemUpdateRequestSchema,
  cartResponseSchema,
  promoCheckRequestSchema,
  promoCheckResponseSchema,
} from '@workspace/domain/schemas/cart'
import {
  type OrderResponse,
  orderResponseSchema,
} from '@workspace/domain/schemas/order'
import type { CartService } from '../../services/cart-service'
import type { NativeFetchClient } from './fetch-client'

export class HttpCartAdapter implements CartService {
  private readonly client: NativeFetchClient

  constructor(client: NativeFetchClient) {
    this.client = client
  }

  async getCart(): Promise<CartResponse> {
    const raw = await this.client.request<unknown>('/cart', {
      method: 'GET',
    })
    return cartResponseSchema.parse(raw)
  }

  async addItem(productId: string, quantity = 1): Promise<CartResponse> {
    const payload: CartItemAddRequest = cartItemAddRequestSchema.parse({
      product_id: productId,
      quantity,
    })
    const raw = await this.client.request<unknown>('/cart/items', {
      method: 'POST',
      body: payload,
    })
    return cartResponseSchema.parse(raw)
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<CartResponse> {
    const payload: CartItemUpdateRequest = cartItemUpdateRequestSchema.parse({
      quantity,
    })
    const raw = await this.client.request<unknown>(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: payload,
    })
    return cartResponseSchema.parse(raw)
  }

  async removeItem(itemId: string): Promise<CartResponse> {
    const raw = await this.client.request<unknown>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    })
    return cartResponseSchema.parse(raw)
  }

  async validatePromo(promoCode: string): Promise<PromoCheckResponse> {
    const payload: PromoCheckRequest = promoCheckRequestSchema.parse({
      promo_code: promoCode,
    })
    const raw = await this.client.request<unknown>('/cart/promo-check', {
      method: 'POST',
      body: payload,
    })
    return promoCheckResponseSchema.parse(raw)
  }

  async checkout(payload?: CartCheckoutRequest): Promise<OrderResponse> {
    const parsedPayload = cartCheckoutRequestSchema.parse(payload)
    const raw = await this.client.request<unknown>('/cart/checkout', {
      method: 'POST',
      body: parsedPayload,
    })
    return orderResponseSchema.parse(raw)
  }
}
