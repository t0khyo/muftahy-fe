import type {
  OrderItemRefundRequest,
  OrderResponse,
  OrderReviewRequest,
  PaymentAttempt,
} from '@workspace/domain/schemas/order'

export interface RefundItemResponse {
  status: string
  message: string
}

export interface AdminOrderService {
  getPendingOrders(): Promise<OrderResponse[]>
  getOrder(orderId: string): Promise<OrderResponse>
  startReview(orderId: string): Promise<OrderResponse>
  reviewOrder(orderId: string, payload: OrderReviewRequest): Promise<OrderResponse>
  getReceipts(orderId: string): Promise<PaymentAttempt[]>
  getReceiptImageBlob(orderId: string, receiptId: string): Promise<Blob>
  refundItem(orderId: string, itemId: string, payload: OrderItemRefundRequest): Promise<RefundItemResponse>
}

