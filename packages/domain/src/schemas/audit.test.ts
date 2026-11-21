import { describe, expect, it } from 'vitest'
import { auditLogResponseSchema, auditLogListResponseSchema } from './audit'

describe('Audit Schemas', () => {
  it('validates auditLogResponseSchema', () => {
    const raw = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      admin_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      admin_name: 'Admin Operator',
      action: 'keys.import',
      target_type: 'key',
      target_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      old_value: null,
      new_value: { serial: 'MASKED', cost_usd: '12.00' },
      success: true,
      failure_reason: null,
      ip_address: '192.168.1.10',
      created_at: '2026-11-20T12:00:00Z',
    }

    const parsed = auditLogResponseSchema.parse(raw)
    expect(parsed.action).toBe('keys.import')
    expect(parsed.success).toBe(true)
  })

  it('validates auditLogListResponseSchema', () => {
    const raw = {
      items: [
        {
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          admin_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
          admin_name: 'Admin Operator',
          action: 'order.review',
          target_type: 'order',
          target_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
          success: true,
          created_at: '2026-11-20T12:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    }

    const parsed = auditLogListResponseSchema.parse(raw)
    expect(parsed.items.length).toBe(1)
    expect(parsed.total).toBe(1)
  })
})

