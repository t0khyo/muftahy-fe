import { z } from 'zod'

export const cartItemSchema = z.object({
  product_id: z.string().uuid(),
  product_name: z.string().min(1),
  quantity: z.number().int().min(1),
  is_preorder: z.boolean(),
  unit_price_egp: z.string().regex(/^\d+(\.\d{1,2})?$/),
})

export type CartItem = z.infer<typeof cartItemSchema>

