import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminOrderService } from '@workspace/api/factory'
import type {
  AdminOrdersQueryParams,
  OrderItemRefundRequest,
  OrderResponse,
  OrderReviewRequest,
} from '@workspace/domain/schemas/order'
import type { DashboardOverviewResponse } from '@workspace/domain/schemas/admin-dashboard'
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
  const query = useQuery({
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
  return query
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

  return useMutation({
    mutationFn: (orderId: string) => service.startReview(orderId),
    onSuccess: (updatedOrder) => {
      // Optimistically update order in pending cache
      queryClient.setQueryData<OrderResponse[]>(adminOrderKeys.pending(), (prev) => {
        if (!prev) return [updatedOrder]
        return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      })
      queryClient.setQueryData(adminOrderKeys.detail(updatedOrder.id), updatedOrder)
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all })
    },
  })
}

export function useReviewOrder() {
  const queryClient = useQueryClient()
  const service = getAdminOrderService()

  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: OrderReviewRequest }) =>
      service.reviewOrder(orderId, payload),
    onSuccess: (adjudicatedOrder) => {
      // Remove completed / refunded / cancelled order from pending queue
      queryClient.setQueryData<OrderResponse[]>(adminOrderKeys.pending(), (prev) => {
        if (!prev) return []
        return prev.filter((o) => o.id !== adjudicatedOrder.id)
      })
      queryClient.setQueryData(adminOrderKeys.detail(adjudicatedOrder.id), adjudicatedOrder)
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all })

      // Optimistically decrement pending orders count in dashboard overview
      queryClient.setQueryData<DashboardOverviewResponse>(dashboardKeys.overview(), (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          pending_orders_count: Math.max(0, prev.pending_orders_count - 1),
        }
      })
    },
  })
}

export function useRefundOrderItem() {
  const queryClient = useQueryClient()
  const service = getAdminOrderService()

  return useMutation({
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
      // Optimistically mark item as refunded in detail cache
      queryClient.setQueryData<OrderResponse>(adminOrderKeys.detail(orderId), (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          items: prev.items.map((it) => (it.id === itemId ? { ...it, is_refunded: true } : it)),
        }
      })
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all })
    },
  })
}
