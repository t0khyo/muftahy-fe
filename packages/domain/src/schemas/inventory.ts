import { z } from 'zod'
import { decimalStringSchema } from './common'

export const keyBatchImportRequestSchema = z.object({
  product_id: z.string().uuid(),
  total_cost_usd: z.coerce.number().positive(),
  serials: z.array(z.string().trim().min(1)).min(1).max(500),
  replacement_only: z.boolean().default(false),
})

export type KeyBatchImportRequest = z.infer<typeof keyBatchImportRequestSchema>

export const keyImportResultItemSchema = z.object({
  id: z.string().uuid().optional(),
  serial: z.string(),
  status: z.string().optional(),
  replacement_only: z.boolean().optional(),
  cost_usd: decimalStringSchema.optional(),
}).passthrough()

export type KeyImportResultItem = z.infer<typeof keyImportResultItemSchema>

export const keyImportErrorItemSchema = z.object({
  serial: z.string(),
  error_code: z.string(),
  error_message: z.string(),
})

export type KeyImportErrorItem = z.infer<typeof keyImportErrorItemSchema>

export const keyImportResponseSchema = z.object({
  total_submitted: z.number().int().nonnegative(),
  successful_count: z.number().int().nonnegative(),
  failed_count: z.number().int().nonnegative(),
  imported_keys: z.array(keyImportResultItemSchema),
  failures: z.array(keyImportErrorItemSchema),
})

export type KeyImportResponse = z.infer<typeof keyImportResponseSchema>

export const keyResponseSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  product_name: z.string().nullable().optional(),
  serial: z.string().min(1),
  status: z.enum(['available', 'reserved', 'sold', 'reported', 'replaced', 'cancelled']),
  replacement_only: z.boolean().default(false),
  cancel_reason: z.string().nullable().optional(),
  cost_usd: decimalStringSchema,
  created_at: z.string().min(1),
})

export type KeyResponse = z.infer<typeof keyResponseSchema>

export const keyListResponseSchema = z.array(keyResponseSchema)
export type KeyListResponse = z.infer<typeof keyListResponseSchema>

export const keyUpdateSchema = z.object({
  status: z.enum(['available', 'cancelled', 'reported']).optional(),
  replacement_only: z.boolean().optional(),
  cancel_reason: z.string().nullable().optional(),
})

export type KeyUpdate = z.infer<typeof keyUpdateSchema>

export const keyStatsResponseSchema = z.object({
  product_id: z.string().uuid(),
  product_name: z.string().min(1),
  available_count: z.number().int().nonnegative(),
  sold_count: z.number().int().nonnegative(),
  reported_count: z.number().int().nonnegative(),
  replaced_count: z.number().int().nonnegative(),
  cancelled_count: z.number().int().nonnegative(),
})

export type KeyStatsResponse = z.infer<typeof keyStatsResponseSchema>
export const keyStatsListSchema = z.array(keyStatsResponseSchema)
export type KeyStatsList = z.infer<typeof keyStatsListSchema>

