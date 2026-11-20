import { describe, expect, it } from 'vitest'
import { cartItemSchema } from './cart'

describe('cartItemSchema', () => {
  it('validates a valid cart item', () => {
    const item = {
      product_id: '00000000-0000-4000-8000-000000000001',
      product_name: 'Windows 11 Professional',
      quantity: 2,
      is_preorder: false,
      unit_price_egp: '349.00',
    }
    const result = cartItemSchema.safeParse(item)
    expect(result.success).toBe(true)
  })

  it('rejects invalid uuid or non-positive quantity', () => {
    const invalidId = {
      product_id: 'not-a-uuid',
      product_name: 'Windows 11',
      quantity: 1,
      is_preorder: false,
      unit_price_egp: '349.00',
    }
    expect(cartItemSchema.safeParse(invalidId).success).toBe(false)

    const invalidQty = {
      product_id: '00000000-0000-0000-0000-000000000001',
      product_name: 'Windows 11',
      quantity: 0,
      is_preorder: false,
      unit_price_egp: '349.00',
    }
    expect(cartItemSchema.safeParse(invalidQty).success).toBe(false)
  })
})
