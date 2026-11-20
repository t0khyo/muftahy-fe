import { z } from 'zod'

export const productCategorySchema = z.enum(['windows', 'office'])
export type ProductCategory = z.infer<typeof productCategorySchema>

export const productVariantSchema = z.enum(['oem', 'retail']).nullable()
export type ProductVariant = z.infer<typeof productVariantSchema>

export const stockStatusSchema = z.enum(['in_stock', 'preorder', 'out_of_stock'])
export type StockStatus = z.infer<typeof stockStatusSchema>

export const productResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(255),
  category: productCategorySchema,
  variant: productVariantSchema,
  base_price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  sale_price: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable(),
  effective_price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  discount_percentage: z.number().nullable(),
  stock_status: stockStatusSchema,
  available_count: z.number().int().nonnegative(),
  preorder_enabled: z.boolean(),
  description: z.string().nullable(),
  is_active: z.boolean().default(true),
})

export type ProductResponse = z.infer<typeof productResponseSchema>
export const productSchema = productResponseSchema
export type Product = ProductResponse

export const productCreateSchema = z.object({
  name: z.string().min(2).max(255),
  category: productCategorySchema,
  variant: productVariantSchema.optional(),
  base_price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  sale_price: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable().optional(),
  preorder_enabled: z.boolean().optional().default(true),
  description: z.string().nullable().optional(),
})

export type ProductCreateInput = z.input<typeof productCreateSchema>

export const productUpdateSchema = z.object({
  base_price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  sale_price: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable().optional(),
  is_active: z.boolean().optional(),
  preorder_enabled: z.boolean().optional(),
  description: z.string().nullable().optional(),
})

export type ProductUpdateInput = z.input<typeof productUpdateSchema>
