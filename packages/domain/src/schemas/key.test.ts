import { describe, expect, it } from 'vitest'
import { userKeySchema } from './key'

describe('key schemas', () => {
  it('validates a correct user key payload', () => {
    const payload = {
      key_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      product_name: 'Microsoft Office 2024 Home & Business',
      serial: 'X229N-48FGX-YVC9B-4J6C9-AAAAA',
      sold_at: '2026-11-20T04:00:00Z',
    }

    const parsed = userKeySchema.parse(payload)
    expect(parsed.key_id).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
    expect(parsed.product_name).toBe('Microsoft Office 2024 Home & Business')
    expect(parsed.serial).toBe('X229N-48FGX-YVC9B-4J6C9-AAAAA')
    expect(parsed.sold_at).toBe('2026-11-20T04:00:00Z')
  })

  it('allows null sold_at', () => {
    const payload = {
      key_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      product_name: 'Windows 11 Pro',
      serial: 'VK7JG-NPHTM-C97JM-9MPGT-3V66T',
      sold_at: null,
    }

    const parsed = userKeySchema.parse(payload)
    expect(parsed.sold_at).toBeNull()
  })

  it('rejects invalid key_id format', () => {
    const payload = {
      key_id: 'not-a-uuid',
      product_name: 'Windows 11 Pro',
      serial: 'VK7JG-NPHTM-C97JM-9MPGT-3V66T',
    }

    expect(() => userKeySchema.parse(payload)).toThrow()
  })
})

