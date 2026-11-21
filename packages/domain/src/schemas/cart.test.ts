import { describe, expect, it } from 'vitest'
import {
  cartCheckoutRequestSchema,
  cartItemAddRequestSchema,
  cartItemResponseSchema,
  cartResponseSchema,
  promoCheckRequestSchema,
  promoCheckResponseSchema,
} from './cart'

describe('cartItemAddRequestSchema', () => {
  it('validates a valid add request with default quantity', () => {
    const input = {
      product_id: '18f9103c-829d-47be-a567-2794ebef4023',
    }
    const result = cartItemAddRequestSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.quantity).toBe(1)
    }
  })

  it('rejects invalid uuid or non-positive quantity', () => {
    expect(
      cartItemAddRequestSchema.safeParse({
        product_id: 'invalid-id',
        quantity: 1,
      }).success,
    ).toBe(false)

    expect(
      cartItemAddRequestSchema.safeParse({
        product_id: '18f9103c-829d-47be-a567-2794ebef4023',
        quantity: 0,
      }).success,
    ).toBe(false)
  })
})

describe('cartItemResponseSchema', () => {
  it('validates and coerces a valid cart item response', () => {
    const item = {
      id: '28f9103c-829d-47be-a567-2794ebef4024',
      product_id: '18f9103c-829d-47be-a567-2794ebef4023',
      product_name: 'Windows 11 Professional',
      quantity: 2,
      is_preorder: false,
      unit_price: '349.99',
    }
    const result = cartItemResponseSchema.safeParse(item)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.unit_price).toBe(349.99)
    }
  })

  it('rejects missing or invalid fields', () => {
    expect(
      cartItemResponseSchema.safeParse({
        id: '28f9103c-829d-47be-a567-2794ebef4024',
        product_id: '18f9103c-829d-47be-a567-2794ebef4023',
        product_name: '',
        quantity: 1,
        is_preorder: false,
        unit_price: 100,
      }).success,
    ).toBe(false)
  })
})

describe('cartResponseSchema', () => {
  it('validates a complete cart response', () => {
    const raw = {
      id: '38f9103c-829d-47be-a567-2794ebef4025',
      items: [
        {
          id: '28f9103c-829d-47be-a567-2794ebef4024',
          product_id: '18f9103c-829d-47be-a567-2794ebef4023',
          product_name: 'Windows 11 Pro',
          quantity: 1,
          is_preorder: false,
          unit_price: 299.99,
        },
      ],
      subtotal_egp: '299.99',
      item_count: 1,
    }
    const result = cartResponseSchema.safeParse(raw)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.subtotal_egp).toBe(299.99)
      expect(result.data.items).toHaveLength(1)
    }
  })
})

describe('promoCheckRequestSchema and promoCheckResponseSchema', () => {
  it('validates valid promo check request', () => {
    expect(promoCheckRequestSchema.safeParse({ promo_code: 'SAVE10' }).success).toBe(true)
    expect(promoCheckRequestSchema.safeParse({ promo_code: '' }).success).toBe(false)
  })

  it('validates promo check response with discount items', () => {
    const payload = {
      valid: true,
      promo_code: 'SAVE10',
      items: [
        {
          product_id: '18f9103c-829d-47be-a567-2794ebef4023',
          product_name: 'Office 2021',
          original_price: '500.00',
          discount_percentage: '10.00',
          discount_amount: '50.00',
          discounted_price: '450.00',
        },
      ],
      original_subtotal: '500.00',
      total_discount: '50.00',
      final_total: '450.00',
      error_message: null,
    }
    const result = promoCheckResponseSchema.safeParse(payload)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.total_discount).toBe(50)
      expect(result.data.final_total).toBe(450)
    }
  })
})

describe('cartCheckoutRequestSchema', () => {
  it('accepts optional promo code', () => {
    expect(cartCheckoutRequestSchema.safeParse({ promo_code: 'OFFER' }).success).toBe(true)
    expect(cartCheckoutRequestSchema.safeParse({}).success).toBe(true)
    expect(cartCheckoutRequestSchema.safeParse(undefined).success).toBe(true)
  })
})
