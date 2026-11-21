import { describe, expect, it } from 'vitest'
import {
  keyBatchImportRequestSchema,
  keyImportResponseSchema,
  keyResponseSchema,
  keyStatsResponseSchema,
  keyUpdateSchema,
} from './inventory'

describe('Inventory Schemas', () => {
  it('validates keyBatchImportRequestSchema', () => {
    const raw = {
      product_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      total_cost_usd: 150.0,
      serials: ['KEY-1111-2222', 'KEY-3333-4444'],
      replacement_only: false,
    }

    const parsed = keyBatchImportRequestSchema.parse(raw)
    expect(parsed.serials.length).toBe(2)
    expect(parsed.total_cost_usd).toBe(150.0)
  })

  it('validates keyImportResponseSchema with failures', () => {
    const raw = {
      total_submitted: 2,
      successful_count: 1,
      failed_count: 1,
      imported_keys: [
        {
          id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
          serial: 'KEY-1111-2222',
          status: 'available',
        },
      ],
      failures: [
        {
          serial: 'KEY-3333-4444',
          error_code: 'DUPLICATE_KEY',
          error_message: 'Key serial already exists in database',
        },
      ],
    }

    const parsed = keyImportResponseSchema.parse(raw)
    expect(parsed.successful_count).toBe(1)
    expect(parsed.failures[0].error_code).toBe('DUPLICATE_KEY')
  })

  it('validates keyResponseSchema and coerces cost_usd', () => {
    const raw = {
      id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      product_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      product_name: 'Windows 11 Pro',
      serial: 'W11-XXXX-YYYY',
      status: 'available',
      replacement_only: false,
      cancel_reason: null,
      cost_usd: 12.5,
      created_at: '2026-11-20T10:00:00Z',
    }

    const parsed = keyResponseSchema.parse(raw)
    expect(parsed.cost_usd).toBe('12.50')
    expect(parsed.status).toBe('available')
  })

  it('validates keyStatsResponseSchema', () => {
    const raw = {
      product_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      product_name: 'Windows 11 Pro',
      available_count: 25,
      sold_count: 100,
      reported_count: 2,
      replaced_count: 1,
      cancelled_count: 0,
    }

    const parsed = keyStatsResponseSchema.parse(raw)
    expect(parsed.available_count).toBe(25)
  })

  it('validates keyUpdateSchema', () => {
    const raw = {
      status: 'cancelled',
      cancel_reason: 'Defective batch from supplier',
    }

    const parsed = keyUpdateSchema.parse(raw)
    expect(parsed.status).toBe('cancelled')
  })
})

