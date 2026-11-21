import { describe, expect, it, vi } from 'vitest'
import { NativeFetchClient } from './fetch-client'
import { HttpTicketAdapter } from './http-ticket-adapter'

describe('HttpTicketAdapter', () => {
  const mockTicketResponse = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: '223e4567-e89b-12d3-a456-426614174001',
    order_item_id: '323e4567-e89b-12d3-a456-426614174002',
    key_serial: 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX',
    status: 'open',
    outcome: null,
    is_locked: false,
    admin_override: false,
    replacement_key_serial: null,
    comments: [
      {
        id: '423e4567-e89b-12d3-a456-426614174003',
        author_type: 'customer',
        author_name: 'Customer Test',
        content: 'Key failed to activate',
        created_at: '2026-11-20T04:00:00Z',
      },
    ],
    attachments: [],
    created_at: '2026-11-20T04:00:00Z',
    resolved_at: null,
  }

  it('calls GET /tickets without status query', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => [mockTicketResponse],
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpTicketAdapter(client)

    const result = await adapter.listTickets()

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/tickets',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('123e4567-e89b-12d3-a456-426614174000')
  })

  it('calls GET /tickets?status=open when status filter is provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => [mockTicketResponse],
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpTicketAdapter(client)

    await adapter.listTickets('open')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/tickets?status=open',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('calls GET /tickets/:id and parses ticket detail', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockTicketResponse,
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpTicketAdapter(client)

    const result = await adapter.getTicket('123e4567-e89b-12d3-a456-426614174000')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/tickets/123e4567-e89b-12d3-a456-426614174000',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(result.key_serial).toBe('XXXXX-XXXXX-XXXXX-XXXXX-XXXXX')
  })

  it('calls POST /tickets with FormData containing files and fields', async () => {
    const file = new File(['screenshot data'], 'screenshot.png', { type: 'image/png' })

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockTicketResponse,
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpTicketAdapter(client)

    const result = await adapter.openTicket({
      order_item_id: '323e4567-e89b-12d3-a456-426614174002',
      initial_comment: 'Activation key fails on clean install',
      attachments: [file],
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/tickets',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    )
    expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174000')
  })

  it('calls POST /tickets/:id/comments with JSON content', async () => {
    const commentResponse = {
      id: '923e4567-e89b-12d3-a456-426614174009',
      author_type: 'customer',
      author_name: 'Customer Test',
      content: 'Here is the requested clarification.',
      created_at: '2026-11-20T04:20:00Z',
    }

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => commentResponse,
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpTicketAdapter(client)

    const result = await adapter.addComment(
      '123e4567-e89b-12d3-a456-426614174000',
      'Here is the requested clarification.',
    )

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/tickets/123e4567-e89b-12d3-a456-426614174000/comments',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ content: 'Here is the requested clarification.' }),
      }),
    )
    expect(result.id).toBe('923e4567-e89b-12d3-a456-426614174009')
  })

  it('calls POST /tickets/:id/resolve with adjudication payload', async () => {
    const resolvedResponse = {
      ...mockTicketResponse,
      status: 'closed',
      outcome: 'replacement',
      is_locked: true,
      replacement_key_serial: 'REPLACEMENT-KEY-1234',
    }
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => resolvedResponse,
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpTicketAdapter(client)

    const result = await adapter.resolveTicket('123e4567-e89b-12d3-a456-426614174000', {
      outcome: 'replacement',
      replacement_key_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      admin_override: true,
      customer_message: 'Defective key replaced.',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/tickets/123e4567-e89b-12d3-a456-426614174000/resolve',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          outcome: 'replacement',
          replacement_key_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          admin_override: true,
          customer_message: 'Defective key replaced.',
        }),
      }),
    )
    expect(result.status).toBe('closed')
    expect(result.outcome).toBe('replacement')
  })
})

