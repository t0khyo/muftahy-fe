import { describe, expect, it, vi } from 'vitest'
import type { NativeFetchClient } from './fetch-client'
import { HttpAdminOrderAdapter } from './http-admin-order-adapter'

describe('HttpAdminOrderAdapter', () => {
  const createMockClient = (responseData: unknown): NativeFetchClient => {
    return {
      request: vi.fn().mockResolvedValue(responseData),
    } as unknown as NativeFetchClient
  }

  const sampleOrder = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    reference_code: 'SM-20261121-001',
    status: 'payment_uploaded',
    subtotal_egp: 500.0,
    discount_total_egp: 0.0,
    total_egp: 500.0,
    payment_method: 'instapay',
    payment_instructions: {
      vodafone_cash_number: '01000000000',
      instapay_ipa: 'ipa@instapay',
      reference_code: 'SM-20261121-001',
    },
    payment_deadline: null,
    review_deadline: null,
    wrong_amount_attempts: 0,
    rejection_reason: null,
    items: [],
    payment_attempts: [],
    created_at: '2026-11-21T06:00:00Z',
  }

  it('fetches orders collection with optional status, limit, and offset filters', async () => {
    const client = createMockClient([{ ...sampleOrder, status: 'approved' }])
    const adapter = new HttpAdminOrderAdapter(client)

    const result = await adapter.getOrders({ status: 'approved', limit: 25, offset: 0 })
    expect(client.request).toHaveBeenCalledWith('/orders?status=approved&limit=25&offset=0', {
      method: 'GET',
    })
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('approved')
  })

  it('fetches pending orders queue', async () => {
    const client = createMockClient([sampleOrder])
    const adapter = new HttpAdminOrderAdapter(client)

    const result = await adapter.getPendingOrders()
    expect(client.request).toHaveBeenCalledWith('/orders/pending', { method: 'GET' })
    expect(result.length).toBe(1)
    expect(result[0].reference_code).toBe('SM-20261121-001')
  })

  it('claims review lock via startReview', async () => {
    const client = createMockClient({ ...sampleOrder, status: 'under_review' })
    const adapter = new HttpAdminOrderAdapter(client)

    const result = await adapter.startReview('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    expect(client.request).toHaveBeenCalledWith(
      '/orders/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/start-review',
      { method: 'POST' },
    )
    expect(result.status).toBe('under_review')
  })

  it('adjudicates review decision via reviewOrder', async () => {
    const client = createMockClient({ ...sampleOrder, status: 'completed' })
    const adapter = new HttpAdminOrderAdapter(client)

    const result = await adapter.reviewOrder('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', {
      action: 'approve',
    })
    expect(client.request).toHaveBeenCalledWith(
      '/orders/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/review',
      { method: 'POST', body: { action: 'approve' } },
    )
    expect(result.status).toBe('completed')
  })

  it('refunds an individual order item', async () => {
    const client = createMockClient({ status: 'refunded', message: 'Item refunded successfully' })
    const adapter = new HttpAdminOrderAdapter(client)

    const result = await adapter.refundItem(
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      { gateway_fee_egp: 10 },
    )
    expect(client.request).toHaveBeenCalledWith(
      '/orders/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/items/b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22/refund',
      { method: 'POST', body: { gateway_fee_egp: 10 } },
    )
    expect(result.status).toBe('refunded')
  })

  it('fetches binary receipt image blob', async () => {
    const dummyBlob = new Blob(['test-receipt-binary'], { type: 'image/jpeg' })
    const client = {
      requestBlob: vi.fn().mockResolvedValue(dummyBlob),
    } as unknown as NativeFetchClient
    const adapter = new HttpAdminOrderAdapter(client)

    const result = await adapter.getReceiptImageBlob(
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    )
    expect(client.requestBlob).toHaveBeenCalledWith(
      '/orders/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/receipts/c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33/image',
      { method: 'GET' },
    )
    expect(result).toBe(dummyBlob)
  })
})

