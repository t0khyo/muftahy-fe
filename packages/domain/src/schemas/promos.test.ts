import { describe, expect, it } from 'vitest'
import { promoCreateRequestSchema, promoDetailResponseSchema, promoUpdateRequestSchema } from './promos'

describe('Promos Schemas', () => {
  it('validates and transforms promoCreateRequestSchema code to uppercase', () => {
    const raw = {
      code: 'blackfriday2026',
      discount_percentage: 20,
      max_total_uses: 100,
      max_uses_per_user: 1,
    }

    const parsed = promoCreateRequestSchema.parse(raw)
    expect(parsed.code).toBe('BLACKFRIDAY2026')
    expect(parsed.discount_percentage).toBe(20)
  })

  it('rejects invalid discount percentages', () => {
    expect(() =>
      promoCreateRequestSchema.parse({
        code: 'INVALID',
        discount_percentage: 0,
      }),
    ).toThrow()

    expect(() =>
      promoCreateRequestSchema.parse({
        code: 'INVALID',
        discount_percentage: 101,
      }),
    ).toThrow()
  })

  it('validates promoDetailResponseSchema and coerces discount', () => {
    const raw = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      code: 'SUMMER15',
      discount_percentage: 15.0,
      is_active: true,
      max_total_uses: 50,
      max_uses_per_user: 1,
      current_total_uses: 12,
      expires_at: '2026-12-31T23:59:59Z',
      created_at: '2026-06-01T00:00:00Z',
    }

    const parsed = promoDetailResponseSchema.parse(raw)
    expect(parsed.discount_percentage).toBe('15.00')
    expect(parsed.current_total_uses).toBe(12)
  })

  it('validates promoUpdateRequestSchema', () => {
    const raw = {
      is_active: false,
    }

    const parsed = promoUpdateRequestSchema.parse(raw)
    expect(parsed.is_active).toBe(false)
  })
})

