import type {
  CartCheckoutRequest,
  CartResponse,
  PromoCheckResponse,
} from '@workspace/domain/schemas/cart'
import type { OrderResponse } from '@workspace/domain/schemas/order'

export interface CartService {
  getCart(): Promise<CartResponse>
  addItem(productId: string, quantity?: number): Promise<CartResponse>
  removeItem(itemId: string): Promise<CartResponse>
  validatePromo(promoCode: string): Promise<PromoCheckResponse>
  checkout(payload?: CartCheckoutRequest): Promise<OrderResponse>
}
