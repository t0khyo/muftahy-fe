import type {
  CommentResponse,
  TicketDetail,
  TicketResolveRequest,
} from '@workspace/domain/schemas/ticket'

export interface OpenTicketPayload {
  order_item_id: string
  initial_comment: string
  attachments?: File[]
}

export interface TicketService {
  listTickets(status?: string): Promise<TicketDetail[]>
  getTicket(ticketId: string): Promise<TicketDetail>
  openTicket(payload: OpenTicketPayload): Promise<TicketDetail>
  addComment(ticketId: string, content: string): Promise<CommentResponse>
  resolveTicket(ticketId: string, payload: TicketResolveRequest): Promise<TicketDetail>
}

