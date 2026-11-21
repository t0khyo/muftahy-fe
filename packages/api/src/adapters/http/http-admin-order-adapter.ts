import {
  type OrderItemRefundRequest,
  type OrderResponse,
  type OrderReviewRequest,
  type PaymentAttempt,
  type RefundItemResponse,
  orderListResponseSchema,
  orderResponseSchema,
  paymentAttemptListSchema,
  refundItemResponseSchema,
} from '@workspace/domain/schemas/order'
import type { AdminOrderService } from '../../services/admin-order-service'
import type { NativeFetchClient } from './fetch-client'

export class HttpAdminOrderAdapter implements AdminOrderService {
  private readonly client: NativeFetchClient

  constructor(client: NativeFetchClient) {
    this.client = client
  }

  async getPendingOrders(): Promise<OrderResponse[]> {
    const raw = await this.client.request<unknown>('/orders/pending', {
      method: 'GET',
    })
    return orderListResponseSchema.parse(raw)
  }

  async getOrder(orderId: string): Promise<OrderResponse> {
    const raw = await this.client.request<unknown>(`/orders/${orderId}`, {
      method: 'GET',
    })
    return orderResponseSchema.parse(raw)
  }

  async startReview(orderId: string): Promise<OrderResponse> {
    const raw = await this.client.request<unknown>(`/orders/${orderId}/start-review`, {
      method: 'POST',
    })
    return orderResponseSchema.parse(raw)
  }

  async reviewOrder(orderId: string, payload: OrderReviewRequest): Promise<OrderResponse> {
    const raw = await this.client.request<unknown>(`/orders/${orderId}/review`, {
      method: 'POST',
      body: payload,
    })
    return orderResponseSchema.parse(raw)
  }

  async getReceipts(orderId: string): Promise<PaymentAttempt[]> {
    const raw = await this.client.request<unknown>(`/orders/${orderId}/receipts`, {
      method: 'GET',
    })
    return paymentAttemptListSchema.parse(raw)
  }

  async getReceiptImageBlob(orderId: string, receiptId: string): Promise<Blob> {
    return this.client.requestBlob(`/orders/${orderId}/receipts/${receiptId}/image`, {
      method: 'GET',
    })
  }

  async refundItem(
    orderId: string,
    itemId: string,
    payload: OrderItemRefundRequest,
  ): Promise<RefundItemResponse> {
    const raw = await this.client.request<unknown>(`/orders/${orderId}/items/${itemId}/refund`, {
      method: 'POST',
      body: payload,
    })
    return refundItemResponseSchema.parse(raw)
  }
}

