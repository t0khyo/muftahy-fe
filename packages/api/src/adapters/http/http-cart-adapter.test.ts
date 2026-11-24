import { describe, expect, it, vi } from 'vitest'
import { NativeFetchClient } from './fetch-client'
import { HttpCartAdapter } from './http-cart-adapter'

describe('HttpCartAdapter', () => {
  const mockCartResponse = {
    id: '330e8400-e29b-41d4-a716-446655440000',
    items: [
      {
        id: '440e8400-e29b-41d4-a716-446655440001',
        product_id: '550e8400-e29b-41d4-a716-446655440002',
        product_name: 'Windows 11 Pro',
        quantity: 1,
        is_preorder: false,
        unit_price: 299.99,
      },
    ],
    subtotal_egp: 299.99,
    item_count: 1,
  }

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
        product_id: '550e8400-e29b-41d4-a716-446655440002',
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

  it('calls GET /cart and returns parsed CartResponse', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockCartResponse,
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpCartAdapter(client)

    const cart = await adapter.getCart()

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/cart',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(cart.id).toBe('330e8400-e29b-41d4-a716-446655440000')
    expect(cart.items).toHaveLength(1)
    expect(cart.subtotal_egp).toBe(299.99)
  })

  it('calls POST /cart/items with serialized payload and returns parsed CartResponse', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockCartResponse,
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpCartAdapter(client)

    const cart = await adapter.addItem('550e8400-e29b-41d4-a716-446655440002', 2)

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/cart/items',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          product_id: '550e8400-e29b-41d4-a716-446655440002',
          quantity: 2,
        }),
      }),
    )
    expect(cart.item_count).toBe(1)
  })

  it('calls PATCH /cart/items/:id with quantity payload and returns updated CartResponse', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        ...mockCartResponse,
        items: [{ ...mockCartResponse.items[0], quantity: 3 }],
        subtotal_egp: 899.97,
        item_count: 3,
      }),
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpCartAdapter(client)

    const cart = await adapter.updateItemQuantity('440e8400-e29b-41d4-a716-446655440001', 3)

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/cart/items/440e8400-e29b-41d4-a716-446655440001',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ quantity: 3 }),
      }),
    )
    expect(cart.item_count).toBe(3)
    expect(cart.subtotal_egp).toBe(899.97)
  })

  it('calls DELETE /cart/items/:id and returns updated CartResponse', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        ...mockCartResponse,
        items: [],
        subtotal_egp: 0,
        item_count: 0,
      }),
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpCartAdapter(client)

    const cart = await adapter.removeItem('440e8400-e29b-41d4-a716-446655440001')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/cart/items/440e8400-e29b-41d4-a716-446655440001',
      expect.objectContaining({ method: 'DELETE' }),
    )
    expect(cart.items).toHaveLength(0)
    expect(cart.subtotal_egp).toBe(0)
  })

  it('calls POST /cart/promo-check and parses PromoCheckResponse', async () => {
    const promoResponse = {
      valid: true,
      promo_code: 'SAVE10',
      items: [
        {
          product_id: '550e8400-e29b-41d4-a716-446655440002',
          product_name: 'Windows 11 Pro',
          original_price: 299.99,
          discount_percentage: 10,
          discount_amount: 30,
          discounted_price: 269.99,
        },
      ],
      original_subtotal: 299.99,
      total_discount: 30,
      final_total: 269.99,
      error_message: null,
    }

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => promoResponse,
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpCartAdapter(client)

    const res = await adapter.validatePromo('SAVE10')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/cart/promo-check',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ promo_code: 'SAVE10' }),
      }),
    )
    expect(res.valid).toBe(true)
    expect(res.final_total).toBe(269.99)
  })

  it('calls POST /cart/checkout and returns parsed OrderResponse', async () => {
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
    const adapter = new HttpCartAdapter(client)

    const order = await adapter.checkout({ promo_code: 'SAVE10' })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/cart/checkout',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ promo_code: 'SAVE10' }),
      }),
    )
    expect(order.id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(order.status).toBe('pending_payment')
  })
})
