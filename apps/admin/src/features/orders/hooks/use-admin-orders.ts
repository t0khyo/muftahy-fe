import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminOrderService } from '@workspace/api/factory'
import type {
  AdminOrdersQueryParams,
  OrderItemRefundRequest,
  OrderResponse,
  OrderReviewRequest,
} from '@workspace/domain/schemas/order'
import type { DashboardOverviewResponse } from '@workspace/domain/schemas/admin-dashboard'
import { useAdminMutation } from '../../../hooks/use-admin-mutation'
import { dashboardKeys } from '../../dashboard/hooks/use-admin-dashboard'

export const adminOrderKeys = {
  all: ['admin', 'orders'] as const,
  list: (params?: AdminOrdersQueryParams) => [...adminOrderKeys.all, 'list', params ?? {}] as const,
  pending: () => [...adminOrderKeys.all, 'pending'] as const,
  detail: (id: string) => [...adminOrderKeys.all, 'detail', id] as const,
  receipts: (id: string) => [...adminOrderKeys.all, 'receipts', id] as const,
  receiptImage: (orderId: string, receiptId: string) =>
    [...adminOrderKeys.all, 'receipt-image', orderId, receiptId] as const,
}

export function usePendingOrders() {
  const service = getAdminOrderService()
  return useQuery({
    queryKey: adminOrderKeys.pending(),
    queryFn: () => service.getPendingOrders(),
  })
}

export function useAdminOrders(params?: AdminOrdersQueryParams) {
  const service = getAdminOrderService()
  return useQuery({
    queryKey: adminOrderKeys.list(params),
    queryFn: async () => {
      if (typeof service.getOrders === 'function') {
        const res = await service.getOrders(params)
        if (Array.isArray(res)) {
          return { items: res, total: res.length }
        }
        const maybeObj = res as unknown as { items?: OrderResponse[]; total?: number }
        const items = Array.isArray(maybeObj?.items) ? maybeObj.items : []
        return { items, total: maybeObj?.total ?? items.length }
      }
      const pending = await service.getPendingOrders()
      return { items: pending, total: pending.length }
    },
  })
}

export function useAdminOrderDetail(orderId: string) {
  const service = getAdminOrderService()
  return useQuery({
    queryKey: adminOrderKeys.detail(orderId),
    queryFn: () => service.getOrder(orderId),
    enabled: Boolean(orderId),
  })
}

export function useAdminOrderReceipts(orderId: string) {
  const service = getAdminOrderService()
  return useQuery({
    queryKey: adminOrderKeys.receipts(orderId),
    queryFn: () => service.getReceipts(orderId),
    enabled: Boolean(orderId),
  })
}

export function useAdminReceiptImage(
  orderId?: string,
  receiptId?: string,
  options?: { enabled?: boolean },
) {
  const service = getAdminOrderService()
  return useQuery({
    queryKey:
      orderId && receiptId
        ? adminOrderKeys.receiptImage(orderId, receiptId)
        : (['admin', 'orders', 'receipt-image', 'none'] as const),
    queryFn: () => {
      if (!orderId || !receiptId) throw new Error('Order ID and Receipt ID are required')
      return service.getReceiptImageBlob(orderId, receiptId)
    },
    enabled: Boolean(orderId && receiptId && (options?.enabled ?? true)),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useStartOrderReview() {
  const queryClient = useQueryClient()
  const service = getAdminOrderService()

  return useAdminMutation({
    mutationFn: (orderId: string) => service.startReview(orderId),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData<OrderResponse[]>(adminOrderKeys.pending(), (prev) => {
        if (!prev) return [updatedOrder]
        return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      })
      queryClient.setQueryData(adminOrderKeys.detail(updatedOrder.id), updatedOrder)
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all })
    },
    feedback: {
      successKey: 'admin:feedback.orderReviewStarted',
    },
  })
}

export function useReviewOrder(options?: { errorMode?: 'toast' | 'inline' }) {
  const queryClient = useQueryClient()
  const service = getAdminOrderService()

  return useAdminMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: OrderReviewRequest }) =>
      service.reviewOrder(orderId, payload),
    onSuccess: (adjudicatedOrder) => {
      queryClient.setQueryData<OrderResponse[]>(adminOrderKeys.pending(), (prev) => {
        if (!prev) return []
        return prev.filter((o) => o.id !== adjudicatedOrder.id)
      })
      queryClient.setQueryData(adminOrderKeys.detail(adjudicatedOrder.id), adjudicatedOrder)
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all })

      queryClient.setQueryData<DashboardOverviewResponse>(dashboardKeys.overview(), (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          pending_orders_count: Math.max(0, prev.pending_orders_count - 1),
        }
      })
    },
    feedback: {
      errorMode: options?.errorMode,
      getSuccessFeedback: (_data, { payload }) => {
        if (payload.action === 'approve') {
          return { key: 'admin:feedback.orderApproved' }
        }
        if (payload.action === 'reject_wrong_amount') {
          return { key: 'admin:feedback.orderRejectedWrongAmount' }
        }
        return { key: 'admin:feedback.orderRejectedRefund' }
      },
    },
  })
}

export function useRefundOrderItem(options?: { errorMode?: 'toast' | 'inline' }) {
  const queryClient = useQueryClient()
  const service = getAdminOrderService()

  return useAdminMutation({
    mutationFn: ({
      orderId,
      itemId,
      payload,
    }: {
      orderId: string
      itemId: string
      payload: OrderItemRefundRequest
    }) => service.refundItem(orderId, itemId, payload),
    onSuccess: (_, { orderId, itemId }) => {
      queryClient.setQueryData<OrderResponse>(adminOrderKeys.detail(orderId), (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          items: prev.items.map((it) => (it.id === itemId ? { ...it, is_refunded: true } : it)),
        }
      })
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all })
    },
    feedback: {
      successKey: 'admin:feedback.orderItemRefunded',
      errorMode: options?.errorMode,
    },
  })
}
