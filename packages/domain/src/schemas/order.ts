import { z } from 'zod'

export const orderStatusSchema = z.enum([
  'pending_payment',
  'payment_uploaded',
  'under_review',
  'approved',
  'completed',
  'auto_cancelled',
  'cancelled',
  'rejected_refund',
  'refunded',
])

export type OrderStatus = z.infer<typeof orderStatusSchema>

export const userOrderSummarySchema = z.object({
  id: z.string().uuid(),
  reference_code: z.string().min(1),
  status: orderStatusSchema,
  total_egp: z.coerce.number().nonnegative(),
  created_at: z.string().min(1),
  item_count: z.number().int().positive(),
})

export type UserOrderSummary = z.infer<typeof userOrderSummarySchema>

export const userOrderSummariesSchema = z.array(userOrderSummarySchema)

export const orderItemDetailSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  product_name: z.string().min(1),
  is_preorder: z.boolean(),
  unit_price_egp: z.coerce.number().nonnegative(),
  discount_amount_egp: z.coerce.number().nonnegative(),
  final_price_egp: z.coerce.number().nonnegative(),
  key_serial: z.string().nullable().optional(),
  exchange_rate_at_sale: z.coerce.number().nullable().optional(),
  is_refunded: z.boolean().default(false),
  replacement_entitlement_used: z.boolean().default(false),
})

export type OrderItemDetail = z.infer<typeof orderItemDetailSchema>

export const paymentAttemptSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  receipt_image_path: z.string(),
  payment_method: z.string(),
  amount_claimed_egp: z.coerce.number().nullable().optional(),
  status: z.string(),
  rejection_reason: z.string().nullable().optional(),
  created_at: z.string().min(1),
})

export type PaymentAttempt = z.infer<typeof paymentAttemptSchema>

export const paymentInstructionsSchema = z.object({
  vodafone_cash_number: z.string(),
  instapay_ipa: z.string(),
  reference_code: z.string(),
})

export type PaymentInstructions = z.infer<typeof paymentInstructionsSchema>

export const orderResponseSchema = z.object({
  id: z.string().uuid(),
  reference_code: z.string().min(1),
  status: orderStatusSchema,
  subtotal_egp: z.coerce.number().nonnegative(),
  discount_total_egp: z.coerce.number().nonnegative(),
  total_egp: z.coerce.number().nonnegative(),
  payment_method: z.string().nullable().optional(),
  payment_instructions: paymentInstructionsSchema,
  payment_deadline: z.string().nullable().optional(),
  review_deadline: z.string().nullable().optional(),
  wrong_amount_attempts: z.number().int().default(0),
  rejection_reason: z.string().nullable().optional(),
  items: z.array(orderItemDetailSchema),
  payment_attempts: z.array(paymentAttemptSchema).default([]),
  created_at: z.string().min(1),
})

export type OrderResponse = z.infer<typeof orderResponseSchema>

export const uploadReceiptFormSchema = z.object({
  payment_method: z.enum(['vodafone_cash', 'instapay']),
  amount_claimed: z.coerce.number().positive().optional(),
  receipt: z.custom<File>(
    (val) => typeof File !== 'undefined' && val instanceof File,
    { message: 'A receipt image screenshot is required' },
  ),
})

export type UploadReceiptFormInput = z.infer<typeof uploadReceiptFormSchema>

export const orderReviewRequestSchema = z.object({
  action: z.enum(['approve', 'reject_wrong_amount', 'reject_refund']),
  reason: z.string().optional(),
})

export type OrderReviewRequest = z.infer<typeof orderReviewRequestSchema>

export const orderItemRefundRequestSchema = z.object({
  gateway_fee_egp: z.number().nonnegative().default(0),
})

export type OrderItemRefundRequest = z.infer<typeof orderItemRefundRequestSchema>

export const orderListResponseSchema = z.array(orderResponseSchema)
export type OrderListResponse = z.infer<typeof orderListResponseSchema>

export const paymentAttemptListSchema = z.array(paymentAttemptSchema)
export type PaymentAttemptList = z.infer<typeof paymentAttemptListSchema>

export const refundItemResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
})
export type RefundItemResponse = z.infer<typeof refundItemResponseSchema>


