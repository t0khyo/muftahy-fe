import { z } from 'zod'
import { decimalStringSchema } from './common'

export const promoCreateRequestSchema = z.object({
  code: z.string().trim().min(2).max(50).toUpperCase(),
  discount_percentage: z.coerce.number().gt(0).lte(100),
  max_total_uses: z.number().int().positive().nullable().optional(),
  max_uses_per_user: z.number().int().positive().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  eligible_product_ids: z.array(z.string().uuid()).nullable().optional(),
  eligible_user_ids: z.array(z.string().uuid()).nullable().optional(),
})

export type PromoCreateRequest = z.infer<typeof promoCreateRequestSchema>

export const promoUpdateRequestSchema = z.object({
  is_active: z.boolean().nullable().optional(),
  max_total_uses: z.number().int().positive().nullable().optional(),
  max_uses_per_user: z.number().int().positive().nullable().optional(),
  expires_at: z.string().nullable().optional(),
})

export type PromoUpdateRequest = z.infer<typeof promoUpdateRequestSchema>

export const promoDetailResponseSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1),
  discount_percentage: decimalStringSchema,
  is_active: z.boolean(),
  max_total_uses: z.number().int().nullable().optional(),
  max_uses_per_user: z.number().int().nullable().optional(),
  current_total_uses: z.number().int().nonnegative().default(0),
  expires_at: z.string().nullable().optional(),
  created_at: z.string().min(1),
})

export type PromoDetailResponse = z.infer<typeof promoDetailResponseSchema>

export const promoListResponseSchema = z.array(promoDetailResponseSchema)
export type PromoListResponse = z.infer<typeof promoListResponseSchema>

