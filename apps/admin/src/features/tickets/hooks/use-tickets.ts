import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getTicketService } from '@workspace/api/factory'
import type { TicketDetail, TicketResolveRequest } from '@workspace/domain/schemas/ticket'

export const adminTicketKeys = {
  all: ['admin', 'tickets'] as const,
  list: (status?: string) => [...adminTicketKeys.all, 'list', { status }] as const,
  detail: (id: string) => [...adminTicketKeys.all, 'detail', id] as const,
}

export function useAdminTickets(status?: string) {
  const service = getTicketService('admin')
  return useQuery({
    queryKey: adminTicketKeys.list(status),
    queryFn: () => service.listTickets(status),
  })
}

export function useTicketDetail(ticketId: string) {
  const service = getTicketService('admin')
  return useQuery({
    queryKey: adminTicketKeys.detail(ticketId),
    queryFn: () => service.getTicket(ticketId),
    enabled: Boolean(ticketId),
  })
}

export function useAddTicketComment() {
  const queryClient = useQueryClient()
  const service = getTicketService('admin')

  return useMutation({
    mutationFn: ({ ticketId, content }: { ticketId: string; content: string }) =>
      service.addComment(ticketId, content),
    onSuccess: (newComment, { ticketId }) => {
      queryClient.setQueryData<TicketDetail>(adminTicketKeys.detail(ticketId), (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          comments: [...prev.comments, newComment],
        }
      })
    },
  })
}

export function useResolveTicket() {
  const queryClient = useQueryClient()
  const service = getTicketService('admin')

  return useMutation({
    mutationFn: ({ ticketId, payload }: { ticketId: string; payload: TicketResolveRequest }) =>
      service.resolveTicket(ticketId, payload),
    onSuccess: (resolvedTicket) => {
      queryClient.setQueryData(adminTicketKeys.detail(resolvedTicket.id), resolvedTicket)
      queryClient.setQueryData<TicketDetail[]>(adminTicketKeys.list(), (prev) => {
        if (!prev) return [resolvedTicket]
        return prev.map((t) => (t.id === resolvedTicket.id ? resolvedTicket : t))
      })
    },
  })
}

