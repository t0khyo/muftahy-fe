import { z } from 'zod'

export const AUDIT_TARGET_TYPES = [
  'admin',
  'category',
  'product',
  'product_image',
  'key',
  'order',
  'order_item',
  'ticket',
  'promo',
  'ledger',
] as const

export const auditFilterIdentifierSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/)

export const auditLogResponseSchema = z.object({
  id: z.string().uuid(),
  admin_id: z.string().uuid(),
  admin_name: z.string(),
  action: z.string(),
  target_type: z.string(),
  target_id: z.string().uuid(),
  old_value: z.record(z.string(), z.unknown()).nullable().optional(),
  new_value: z.record(z.string(), z.unknown()).nullable().optional(),
  success: z.boolean(),
  failure_reason: z.string().nullable().optional(),
  ip_address: z.string().nullable().optional(),
  created_at: z.string().min(1),
})

export type AuditLogResponse = z.infer<typeof auditLogResponseSchema>

export const auditLogListResponseSchema = z.object({
  items: z.array(auditLogResponseSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
})

export type AuditLogListResponse = z.infer<typeof auditLogListResponseSchema>

