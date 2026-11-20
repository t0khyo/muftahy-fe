import {
  type OrderResponse,
  type UserOrderSummary,
  orderResponseSchema,
  userOrderSummariesSchema,
} from '@workspace/domain/schemas/order'
import type {
  OrderService,
  UploadReceiptPayload,
} from '../../services/order-service'
import type { NativeFetchClient } from './fetch-client'

export class HttpOrderAdapter implements OrderService {
  private readonly client: NativeFetchClient

  constructor(client: NativeFetchClient) {
    this.client = client
  }

  async listUserOrders(): Promise<UserOrderSummary[]> {
    const raw = await this.client.request<unknown>('/users/me/orders', {
      method: 'GET',
    })
    return userOrderSummariesSchema.parse(raw)
  }

  async getOrder(orderId: string): Promise<OrderResponse> {
    const raw = await this.client.request<unknown>(`/orders/${orderId}`, {
      method: 'GET',
    })
    return orderResponseSchema.parse(raw)
  }

  async uploadReceipt(orderId: string, payload: UploadReceiptPayload): Promise<OrderResponse> {
    const formData = new FormData()
    formData.append('receipt', payload.receipt)
    formData.append('payment_method', payload.payment_method)
    if (payload.amount_claimed !== undefined && payload.amount_claimed !== null) {
      formData.append('amount_claimed', payload.amount_claimed.toString())
    }

    const raw = await this.client.request<unknown>(`/orders/${orderId}/receipt`, {
      method: 'POST',
      body: formData,
    })
    return orderResponseSchema.parse(raw)
  }

  async cancelOrder(orderId: string): Promise<OrderResponse> {
    const raw = await this.client.request<unknown>(`/orders/${orderId}/cancel`, {
      method: 'POST',
    })
    return orderResponseSchema.parse(raw)
  }
}
