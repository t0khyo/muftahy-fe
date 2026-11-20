import {
  type CommentResponse,
  type TicketDetail,
  commentResponseSchema,
  ticketDetailListSchema,
  ticketDetailSchema,
} from '@workspace/domain/schemas/ticket'
import type {
  OpenTicketPayload,
  TicketService,
} from '../../services/ticket-service'
import type { NativeFetchClient } from './fetch-client'

export class HttpTicketAdapter implements TicketService {
  private readonly client: NativeFetchClient

  constructor(client: NativeFetchClient) {
    this.client = client
  }

  async listTickets(status?: string): Promise<TicketDetail[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : ''
    const raw = await this.client.request<unknown>(`/tickets${query}`, {
      method: 'GET',
    })
    return ticketDetailListSchema.parse(raw)
  }

  async getTicket(ticketId: string): Promise<TicketDetail> {
    const raw = await this.client.request<unknown>(`/tickets/${ticketId}`, {
      method: 'GET',
    })
    return ticketDetailSchema.parse(raw)
  }

  async openTicket(payload: OpenTicketPayload): Promise<TicketDetail> {
    const formData = new FormData()
    formData.append('order_item_id', payload.order_item_id)
    formData.append('initial_comment', payload.initial_comment)

    if (payload.attachments && payload.attachments.length > 0) {
      for (const file of payload.attachments) {
        formData.append('attachments', file)
      }
    }

    const raw = await this.client.request<unknown>('/tickets', {
      method: 'POST',
      body: formData,
    })
    return ticketDetailSchema.parse(raw)
  }

  async addComment(ticketId: string, content: string): Promise<CommentResponse> {
    const raw = await this.client.request<unknown>(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: { content },
    })
    return commentResponseSchema.parse(raw)
  }
}
