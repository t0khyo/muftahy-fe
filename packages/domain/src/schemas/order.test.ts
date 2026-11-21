import { describe, expect, it } from 'vitest'
import {
  orderResponseSchema,
  userOrderSummarySchema,
  uploadReceiptFormSchema,
  orderReviewRequestSchema,
  orderItemRefundRequestSchema,
} from './order'

describe('order schemas', () => {
  describe('userOrderSummarySchema', () => {
    it('validates a correct order summary payload', () => {
      const payload = {
        id: '9f6b90d2-8b82-4e4b-97e3-0590a9e2d539',
        reference_code: 'SM-20261120-001',
        status: 'pending_payment',
        total_egp: 299.99,
        created_at: '2026-11-20T04:00:00Z',
        item_count: 2,
      }

      const parsed = userOrderSummarySchema.parse(payload)
      expect(parsed.reference_code).toBe('SM-20261120-001')
      expect(parsed.total_egp).toBe(299.99)
      expect(parsed.status).toBe('pending_payment')
    })

    it('coerces string total_egp to number', () => {
      const payload = {
        id: '9f6b90d2-8b82-4e4b-97e3-0590a9e2d539',
        reference_code: 'SM-20261120-001',
        status: 'completed',
        total_egp: '350.50',
        created_at: '2026-11-20T04:00:00Z',
        item_count: 1,
      }

      const parsed = userOrderSummarySchema.parse(payload)
      expect(parsed.total_egp).toBe(350.5)
    })

    it('rejects invalid status', () => {
      const payload = {
        id: '9f6b90d2-8b82-4e4b-97e3-0590a9e2d539',
        reference_code: 'SM-20261120-001',
        status: 'invalid_status',
        total_egp: 100,
        created_at: '2026-11-20T04:00:00Z',
        item_count: 1,
      }

      expect(() => userOrderSummarySchema.parse(payload)).toThrow()
    })
  })

  describe('orderResponseSchema', () => {
    it('validates a complete order response with items and payment instructions', () => {
      const payload = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        reference_code: 'SM-20261120-002',
        status: 'under_review',
        subtotal_egp: 500,
        discount_total_egp: 50,
        total_egp: 450,
        payment_method: 'vodafone_cash',
        payment_instructions: {
          vodafone_cash_number: '01012345678',
          instapay_ipa: 'user@instapay',
          reference_code: 'SM-20261120-002',
        },
        payment_deadline: '2026-11-20T06:00:00Z',
        review_deadline: '2026-11-20T12:00:00Z',
        wrong_amount_attempts: 0,
        items: [
          {
            id: '660e8400-e29b-41d4-a716-446655440001',
            product_id: '770e8400-e29b-41d4-a716-446655440002',
            product_name: 'Windows 11 Pro Retail',
            is_preorder: false,
            unit_price_egp: 500,
            discount_amount_egp: 50,
            final_price_egp: 450,
            key_serial: 'W269N-WFGWX-YVC9B-4J6C9-T83GX',
            is_refunded: false,
            replacement_entitlement_used: false,
          },
        ],
        payment_attempts: [
          {
            id: '880e8400-e29b-41d4-a716-446655440003',
            order_id: '550e8400-e29b-41d4-a716-446655440000',
            receipt_image_path: '/receipts/r1.jpg',
            payment_method: 'vodafone_cash',
            amount_claimed_egp: 450,
            status: 'submitted',
            created_at: '2026-11-20T04:15:00Z',
          },
        ],
        created_at: '2026-11-20T04:00:00Z',
      }

      const parsed = orderResponseSchema.parse(payload)
      expect(parsed.id).toBe('550e8400-e29b-41d4-a716-446655440000')
      expect(parsed.items).toHaveLength(1)
      expect(parsed.payment_attempts).toHaveLength(1)
      expect(parsed.payment_instructions.vodafone_cash_number).toBe('01012345678')
    })
  })

  describe('uploadReceiptFormSchema', () => {
    it('validates a receipt upload payload with a File instance', () => {
      const file = new File(['dummy receipt content'], 'receipt.png', { type: 'image/png' })
      const payload = {
        payment_method: 'vodafone_cash',
        amount_claimed: 450,
        receipt: file,
      }

      const parsed = uploadReceiptFormSchema.parse(payload)
      expect(parsed.payment_method).toBe('vodafone_cash')
      expect(parsed.amount_claimed).toBe(450)
      expect(parsed.receipt).toBe(file)
    })

    it('rejects missing or invalid file', () => {
      const payload = {
        payment_method: 'instapay',
        receipt: 'not-a-file',
      }

      expect(() => uploadReceiptFormSchema.parse(payload)).toThrow()
    })
  })

  describe('orderReviewRequestSchema', () => {
    it('validates approve action', () => {
      const parsed = orderReviewRequestSchema.parse({ action: 'approve' })
      expect(parsed.action).toBe('approve')
    })

    it('validates reject_wrong_amount with reason', () => {
      const parsed = orderReviewRequestSchema.parse({
        action: 'reject_wrong_amount',
        reason: 'Receipt shows 200 EGP instead of 500 EGP',
      })
      expect(parsed.action).toBe('reject_wrong_amount')
      expect(parsed.reason).toContain('200 EGP')
    })

    it('rejects unrecognized action', () => {
      expect(() => orderReviewRequestSchema.parse({ action: 'unknown' })).toThrow()
    })
  })

  describe('orderItemRefundRequestSchema', () => {
    it('validates refund request with default gateway fee', () => {
      const parsed = orderItemRefundRequestSchema.parse({})
      expect(parsed.gateway_fee_egp).toBe(0)
    })

    it('validates custom gateway fee', () => {
      const parsed = orderItemRefundRequestSchema.parse({ gateway_fee_egp: 15.5 })
      expect(parsed.gateway_fee_egp).toBe(15.5)
    })
  })
})

