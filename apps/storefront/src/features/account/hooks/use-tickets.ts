import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getTicketService } from '@workspace/api/factory'
import type { OpenTicketPayload } from '@workspace/api/services/ticket-service'

export const USER_TICKETS_QUERY_KEY = (status?: string) =>
  ['tickets', 'list', status ?? 'all'] as const
export const ticketDetailQueryKey = (id: string) => ['tickets', 'detail', id] as const

export function useTicketsList(status?: string) {
  const ticketService = getTicketService('storefront')

  const query = useQuery({
    queryKey: USER_TICKETS_QUERY_KEY(status),
    queryFn: () => ticketService.listTickets(status),
  })

  return {
    tickets: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useTicketDetail(ticketId: string) {
  const ticketService = getTicketService('storefront')

  const query = useQuery({
    queryKey: ticketDetailQueryKey(ticketId),
    queryFn: () => ticketService.getTicket(ticketId),
    enabled: Boolean(ticketId),
  })

  return {
    ticket: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useOpenTicket() {
  const queryClient = useQueryClient()
  const ticketService = getTicketService('storefront')

  return useMutation({
    mutationFn: (payload: OpenTicketPayload) => ticketService.openTicket(payload),
    onSuccess: (newTicket) => {
      queryClient.setQueryData(ticketDetailQueryKey(newTicket.id), newTicket)
      void queryClient.invalidateQueries({ queryKey: ['tickets', 'list'] })
    },
  })
}

export function useAddTicketComment(ticketId: string) {
  const queryClient = useQueryClient()
  const ticketService = getTicketService('storefront')

  return useMutation({
    mutationFn: (content: string) => ticketService.addComment(ticketId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ticketDetailQueryKey(ticketId) })
    },
  })
}

