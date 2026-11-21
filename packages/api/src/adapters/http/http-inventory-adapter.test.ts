import { describe, expect, it, vi } from 'vitest'
import type { NativeFetchClient } from './fetch-client'
import { HttpInventoryAdapter } from './http-inventory-adapter'

describe('HttpInventoryAdapter', () => {
  const createMockClient = (responseData: unknown): NativeFetchClient => {
    return {
      request: vi.fn().mockResolvedValue(responseData),
    } as unknown as NativeFetchClient
  }

  it('imports batch keys', async () => {
    const mockResponse = {
      total_submitted: 1,
      successful_count: 1,
      failed_count: 0,
      imported_keys: [{ serial: 'KEY-1234', cost_usd: '10.00' }],
      failures: [],
    }
    const client = createMockClient(mockResponse)
    const adapter = new HttpInventoryAdapter(client)

    const result = await adapter.importKeys({
      product_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      total_cost_usd: 10,
      serials: ['KEY-1234'],
      replacement_only: false,
    })

    expect(client.request).toHaveBeenCalledWith('/keys/import', {
      method: 'POST',
      body: expect.objectContaining({ total_cost_usd: 10 }),
    })
    expect(result.successful_count).toBe(1)
  })

  it('fetches inventory stats with optional product filter', async () => {
    const mockStats = [
      {
        product_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        product_name: 'Windows 11 Pro',
        available_count: 10,
        sold_count: 50,
        reported_count: 1,
        replaced_count: 1,
        cancelled_count: 0,
      },
    ]
    const client = createMockClient(mockStats)
    const adapter = new HttpInventoryAdapter(client)

    const result = await adapter.getStats('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    expect(client.request).toHaveBeenCalledWith(
      '/keys/stats?product_id=a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      { method: 'GET' },
    )
    expect(result[0].available_count).toBe(10)
  })

  it('updates key status', async () => {
    const mockKey = {
      id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      product_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      product_name: 'Windows 11 Pro',
      serial: 'KEY-1234',
      status: 'cancelled',
      replacement_only: false,
      cancel_reason: 'Supplier recalled',
      cost_usd: 10.0,
      created_at: '2026-11-20T10:00:00Z',
    }
    const client = createMockClient(mockKey)
    const adapter = new HttpInventoryAdapter(client)

    const result = await adapter.updateKey('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', {
      status: 'cancelled',
      cancel_reason: 'Supplier recalled',
    })

    expect(client.request).toHaveBeenCalledWith('/keys/b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', {
      method: 'PATCH',
      body: { status: 'cancelled', cancel_reason: 'Supplier recalled' },
    })
    expect(result.status).toBe('cancelled')
    expect(result.cost_usd).toBe('10.00')
  })
})

