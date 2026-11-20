import { describe, expect, it, vi } from 'vitest'
import { NativeFetchClient } from './fetch-client'
import { HttpOrderAdapter } from './http-order-adapter'

describe('HttpOrderAdapter', () => {
  const mockOrderResponse = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    reference_code: 'SM-20261120-001',
    status: 'pending_payment',
    subtotal_egp: 299.99,
    discount_total_egp: 0,
    total_egp: 299.99,
    payment_method: 'vodafone_cash',
    payment_instructions: {
      vodafone_cash_number: '01012345678',
      instapay_ipa: 'user@instapay',
      reference_code: 'SM-20261120-001',
    },
    payment_deadline: '2026-11-20T06:00:00Z',
    review_deadline: null,
    wrong_amount_attempts: 0,
    rejection_reason: null,
    items: [
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        product_id: '770e8400-e29b-41d4-a716-446655440002',
        product_name: 'Windows 11 Pro',
        is_preorder: false,
        unit_price_egp: 299.99,
        discount_amount_egp: 0,
        final_price_egp: 299.99,
        key_serial: null,
        is_refunded: false,
        replacement_entitlement_used: false,
      },
    ],
    payment_attempts: [],
    created_at: '2026-11-20T04:00:00Z',
  }

  it('calls GET /users/me/orders and returns parsed summaries', async () => {
    const mockSummaries = [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        reference_code: 'SM-20261120-001',
        status: 'pending_payment',
        total_egp: 299.99,
        created_at: '2026-11-20T04:00:00Z',
        item_count: 1,
      },
    ]

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockSummaries,
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpOrderAdapter(client)

    const result = await adapter.listUserOrders()

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/users/me/orders',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(result).toHaveLength(1)
    expect(result[0].reference_code).toBe('SM-20261120-001')
  })

  it('calls GET /orders/:id and returns parsed order details', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockOrderResponse,
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpOrderAdapter(client)

    const result = await adapter.getOrder('550e8400-e29b-41d4-a716-446655440000')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/orders/550e8400-e29b-41d4-a716-446655440000',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.items).toHaveLength(1)
  })

  it('calls POST /orders/:id/receipt with FormData and returns updated order', async () => {
    const file = new File(['fake receipt'], 'receipt.jpg', { type: 'image/jpeg' })
    const updatedResponse = {
      ...mockOrderResponse,
      status: 'payment_uploaded',
    }

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => updatedResponse,
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpOrderAdapter(client)

    const result = await adapter.uploadReceipt('550e8400-e29b-41d4-a716-446655440000', {
      receipt: file,
      payment_method: 'vodafone_cash',
      amount_claimed: 300,
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/orders/550e8400-e29b-41d4-a716-446655440000/receipt',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    )
    expect(result.status).toBe('payment_uploaded')
  })

  it('calls POST /orders/:id/cancel and returns cancelled order', async () => {
    const cancelledResponse = {
      ...mockOrderResponse,
      status: 'cancelled',
    }

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => cancelledResponse,
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpOrderAdapter(client)

    const result = await adapter.cancelOrder('550e8400-e29b-41d4-a716-446655440000')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/orders/550e8400-e29b-41d4-a716-446655440000/cancel',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(result.status).toBe('cancelled')
  })
})

