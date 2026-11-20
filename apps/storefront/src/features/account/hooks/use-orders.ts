import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getOrderService } from '@workspace/api/factory'
import type { UploadReceiptPayload } from '@workspace/api/services/order-service'

export const USER_ORDERS_QUERY_KEY = ['orders', 'list'] as const
export const orderDetailQueryKey = (id: string) => ['orders', 'detail', id] as const

export function useUserOrders() {
  const orderService = getOrderService('storefront')

  const query = useQuery({
    queryKey: USER_ORDERS_QUERY_KEY,
    queryFn: () => orderService.listUserOrders(),
  })

  return {
    orders: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useOrderDetail(orderId: string) {
  const orderService = getOrderService('storefront')

  const query = useQuery({
    queryKey: orderDetailQueryKey(orderId),
    queryFn: () => orderService.getOrder(orderId),
    enabled: Boolean(orderId),
  })

  return {
    order: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useUploadReceipt() {
  const queryClient = useQueryClient()
  const orderService = getOrderService('storefront')

  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: UploadReceiptPayload }) =>
      orderService.uploadReceipt(orderId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(orderDetailQueryKey(updated.id), updated)
      void queryClient.invalidateQueries({ queryKey: USER_ORDERS_QUERY_KEY })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  const orderService = getOrderService('storefront')

  return useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId),
    onSuccess: (cancelled) => {
      queryClient.setQueryData(orderDetailQueryKey(cancelled.id), cancelled)
      void queryClient.invalidateQueries({ queryKey: USER_ORDERS_QUERY_KEY })
    },
  })
}

