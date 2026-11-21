import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminOrderService } from '@workspace/api/factory'
import type {
  OrderItemRefundRequest,
  OrderResponse,
  OrderReviewRequest,
} from '@workspace/domain/schemas/order'
import type { DashboardOverviewResponse } from '@workspace/domain/schemas/admin-dashboard'
import { dashboardKeys } from '../../dashboard/hooks/use-admin-dashboard'

export const adminOrderKeys = {
  all: ['admin', 'orders'] as const,
  pending: () => [...adminOrderKeys.all, 'pending'] as const,
  detail: (id: string) => [...adminOrderKeys.all, 'detail', id] as const,
  receipts: (id: string) => [...adminOrderKeys.all, 'receipts', id] as const,
}

export function usePendingOrders() {
  const service = getAdminOrderService()
  return useQuery({
    queryKey: adminOrderKeys.pending(),
    queryFn: () => service.getPendingOrders(),
  })
}

// Alias for general admin order listing with normalized items array
export function useAdminOrders(params?: { status?: string; limit?: number }) {
  void params
  const query = usePendingOrders()
  return {
    ...query,
    data: query.data ? { items: query.data, total: query.data.length } : undefined,
  }
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
    },
  })
}
