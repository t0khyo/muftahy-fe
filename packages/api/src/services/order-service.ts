import type {
  OrderResponse,
  UserOrderSummary,
} from '@workspace/domain/schemas/order'

export interface UploadReceiptPayload {
  receipt: File
  payment_method: string
  amount_claimed?: number
}

export interface OrderService {
  listUserOrders(): Promise<UserOrderSummary[]>
  getOrder(orderId: string): Promise<OrderResponse>
  uploadReceipt(orderId: string, payload: UploadReceiptPayload): Promise<OrderResponse>
  cancelOrder(orderId: string): Promise<OrderResponse>
}

