import { z } from 'zod'

export function normalizeAdminDisplayName(value: string): string {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ')
}

export const adminProfileResponseSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  display_name: z.string().min(1),
  role: z.string().min(1),
  is_active: z.boolean(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
})

export type AdminProfileResponse = z.infer<typeof adminProfileResponseSchema>

export const adminProfileListResponseSchema = z.array(adminProfileResponseSchema)

export const adminProfileUpdateSchema = z
  .object({
    display_name: z.string().superRefine((val, ctx) => {
      const normalized = val.normalize('NFKC')
      for (const ch of normalized) {
        const code = ch.codePointAt(0) ?? 0
        if (code < 32 || /\p{C}/u.test(ch)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Display name contains forbidden control characters',
          })
          return
        }
      }
      if (normalized.includes('<') || normalized.includes('>')) {
        ctx.addIssue({
          code: 'custom',
          message: "Display name cannot contain '<' or '>' characters",
        })
        return
      }
      const cleaned = normalized.trim().replace(/\s+/g, ' ')
      if (cleaned.length < 2 || cleaned.length > 255) {
        ctx.addIssue({
          code: 'custom',
          message: 'Display name must be between 2 and 255 characters',
        })
        return
      }
      if (!/[\p{L}\p{N}]/u.test(cleaned)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Display name must contain at least one letter or number',
        })
      }
    }),
  })
  .strict()

export type AdminProfileUpdate = z.infer<typeof adminProfileUpdateSchema>

