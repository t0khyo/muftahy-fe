import { describe, expect, it, vi } from 'vitest'
import type { NativeFetchClient } from './fetch-client'
import { HttpPromoAdapter } from './http-promo-adapter'

describe('HttpPromoAdapter', () => {
  const createMockClient = (responseData: unknown): NativeFetchClient => {
    return {
      request: vi.fn().mockResolvedValue(responseData),
    } as unknown as NativeFetchClient
  }

  it('creates promo code and normalizes response', async () => {
    const mockPromo = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      code: 'WINTER25',
      discount_percentage: 25.0,
      is_active: true,
      max_total_uses: 100,
      max_uses_per_user: 1,
      current_total_uses: 0,
      expires_at: null,
      created_at: '2026-11-20T10:00:00Z',
    }
    const client = createMockClient(mockPromo)
    const adapter = new HttpPromoAdapter(client)

    const result = await adapter.createPromo({
      code: 'WINTER25',
      discount_percentage: 25,
    })

    expect(client.request).toHaveBeenCalledWith('/promos', {
      method: 'POST',
      body: { code: 'WINTER25', discount_percentage: 25 },
    })
    expect(result.discount_percentage).toBe('25.00')
  })

  it('lists active promo codes', async () => {
    const mockList = [
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        code: 'WINTER25',
        discount_percentage: 25.0,
        is_active: true,
        max_total_uses: 100,
        max_uses_per_user: 1,
        current_total_uses: 5,
        expires_at: null,
        created_at: '2026-11-20T10:00:00Z',
      },
    ]
    const client = createMockClient(mockList)
    const adapter = new HttpPromoAdapter(client)

    const result = await adapter.listPromos({ isActive: true, limit: 10 })
    expect(client.request).toHaveBeenCalledWith('/promos?is_active=true&limit=10', {
      method: 'GET',
    })
    expect(result.length).toBe(1)
  })

  it('updates promo code status', async () => {
    const mockPromo = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      code: 'WINTER25',
      discount_percentage: 25.0,
      is_active: false,
      max_total_uses: 100,
      max_uses_per_user: 1,
      current_total_uses: 5,
      expires_at: null,
      created_at: '2026-11-20T10:00:00Z',
    }
    const client = createMockClient(mockPromo)
    const adapter = new HttpPromoAdapter(client)

    const result = await adapter.updatePromo('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', {
      is_active: false,
    })
    expect(client.request).toHaveBeenCalledWith('/promos/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', {
      method: 'PATCH',
      body: { is_active: false },
    })
    expect(result.is_active).toBe(false)
  })
})

