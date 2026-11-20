import { z } from 'zod'

export const userKeySchema = z.object({
  key_id: z.string().uuid(),
  product_name: z.string().min(1),
  serial: z.string().min(1),
  sold_at: z.string().nullable().optional(),
})

export type UserKey = z.infer<typeof userKeySchema>

export const userKeyListSchema = z.array(userKeySchema)
