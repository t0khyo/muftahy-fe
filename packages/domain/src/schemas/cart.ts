import { z } from 'zod'

export const cartItemAddRequestSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
})

export type CartItemAddRequest = z.infer<typeof cartItemAddRequestSchema>

export const cartItemUpdateRequestSchema = z.object({
  quantity: z.number().int().positive(),
})

export type CartItemUpdateRequest = z.infer<typeof cartItemUpdateRequestSchema>

export const cartItemResponseSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  product_name: z.string().min(1),
  quantity: z.number().int().positive(),
  is_preorder: z.boolean(),
  unit_price: z.coerce.number().nonnegative(),
})

export type CartItemResponse = z.infer<typeof cartItemResponseSchema>

export const cartResponseSchema = z.object({
  id: z.string().uuid(),
  items: z.array(cartItemResponseSchema),
  subtotal_egp: z.coerce.number().nonnegative(),
  item_count: z.number().int().nonnegative(),
})

export type CartResponse = z.infer<typeof cartResponseSchema>

export const promoCheckRequestSchema = z.object({
  promo_code: z.string().min(1),
})

export type PromoCheckRequest = z.infer<typeof promoCheckRequestSchema>

export const promoDiscountItemSchema = z.object({
  product_id: z.string().uuid(),
  product_name: z.string().min(1),
  original_price: z.coerce.number().nonnegative(),
  discount_percentage: z.coerce.number().nonnegative(),
  discount_amount: z.coerce.number().nonnegative(),
  discounted_price: z.coerce.number().nonnegative(),
})

export type PromoDiscountItem = z.infer<typeof promoDiscountItemSchema>

export const promoCheckResponseSchema = z.object({
  valid: z.boolean(),
  promo_code: z.string().min(1),
  items: z.array(promoDiscountItemSchema),
  original_subtotal: z.coerce.number().nonnegative(),
  total_discount: z.coerce.number().nonnegative(),
  final_total: z.coerce.number().nonnegative(),
  error_message: z.string().nullable().optional(),
})

export type PromoCheckResponse = z.infer<typeof promoCheckResponseSchema>

export const cartCheckoutRequestSchema = z
  .object({
    promo_code: z.string().nullable().optional(),
  })
  .optional()
  .default({})

export type CartCheckoutRequest = z.infer<typeof cartCheckoutRequestSchema>
