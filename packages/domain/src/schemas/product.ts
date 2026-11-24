import { z } from 'zod'

/**
 * Validation regex patterns
 */
export const CATEGORY_CODE_REGEX = /^[A-Z0-9]{2,10}$/
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const SKU_REGEX = /^[A-Z0-9]{2,10}-[A-Z0-9]{2,10}-[A-Z0-9]{2,10}-[A-Z0-9]{2,10}$/
export const DECIMAL_PRICE_REGEX = /^\d+(\.\d{1,2})?$/
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Pure validation & slug derivation helpers
 */
export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value)
}

export function slugify(text: string, maxLength = 110): string {
  const slug = text
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove non-ascii alphanumeric characters
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!slug) {
    return ''
  }

  return slug.slice(0, maxLength).replace(/-+$/, '')
}

export function validateSkuForCategory(sku: string, categoryCode: string): boolean {
  if (!SKU_REGEX.test(sku)) {
    return false
  }
  const prefix = `${categoryCode.toUpperCase()}-`
  return sku.startsWith(prefix)
}

/**
 * Category Schemas
 */
export const categoryResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  code: z.string().regex(CATEGORY_CODE_REGEX),
  slug: z.string().regex(SLUG_REGEX),
  description: z.string().nullable().optional(),
  display_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
  product_count: z.number().int().nonnegative().optional().default(0),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type CategoryResponse = z.infer<typeof categoryResponseSchema>
export type Category = CategoryResponse

/**
 * Backward compatibility type alias during migration
 * @deprecated Use CategoryResponse or string category slug
 */
export type ProductCategory = string

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(100),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(CATEGORY_CODE_REGEX, 'Code must be 2-10 uppercase alphanumeric characters'),
  slug: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().trim().toLowerCase().regex(SLUG_REGEX, 'Slug must be lowercase alphanumeric with hyphens').optional(),
  ),
  description: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().trim().max(500).nullable().optional(),
  ),
  display_order: z.coerce.number().int().optional().default(0),
  is_active: z.boolean().optional().default(true),
})

export type CategoryCreateInput = z.input<typeof categoryCreateSchema>

export const categoryUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(CATEGORY_CODE_REGEX, 'Code must be 2-10 uppercase alphanumeric characters')
    .optional(),
  slug: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().trim().toLowerCase().regex(SLUG_REGEX, 'Slug must be lowercase alphanumeric with hyphens').optional(),
  ),
  description: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().trim().max(500).nullable().optional(),
  ),
  display_order: z.coerce.number().int().optional(),
  is_active: z.boolean().optional(),
})

export type CategoryUpdateInput = z.input<typeof categoryUpdateSchema>

/**
 * Product Image Schemas
 */
export const productImageResponseSchema = z.object({
  id: z.string().uuid(),
  file_path: z.string().min(1),
  alt_text: z.string().nullable().optional(),
  is_primary: z.boolean().default(false),
  display_order: z.number().int().default(0),
  file_size: z.number().int().nonnegative(),
  mime_type: z.enum(['image/jpeg', 'image/png', 'image/webp']).or(z.string()),
  width: z.number().int().nullable().optional(),
  height: z.number().int().nullable().optional(),
  url: z.string().min(1),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type ProductImageResponse = z.infer<typeof productImageResponseSchema>
export type ProductImage = ProductImageResponse

export const imageReorderItemSchema = z.object({
  image_id: z.string().uuid(),
  display_order: z.number().int(),
})

export type ImageReorderItem = z.infer<typeof imageReorderItemSchema>

export const imageReorderRequestSchema = z.object({
  items: z.array(imageReorderItemSchema).min(1),
})

export type ImageReorderRequest = z.infer<typeof imageReorderRequestSchema>

/**
 * Product Enums & Primitives
 */
export const productVariantSchema = z.enum(['oem', 'retail']).nullable()
export type ProductVariant = z.infer<typeof productVariantSchema>

export const stockStatusSchema = z.enum(['in_stock', 'preorder', 'out_of_stock'])
export type StockStatus = z.infer<typeof stockStatusSchema>

/**
 * Product Response Schema
 */
export const productResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(255),
  category: categoryResponseSchema,
  sku: z.string().regex(SKU_REGEX),
  slug: z.string().regex(SLUG_REGEX),
  variant: productVariantSchema,
  base_price: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'number' ? val.toFixed(2) : val.trim()))
    .pipe(z.string().regex(DECIMAL_PRICE_REGEX)),
  sale_price: z
    .union([z.string(), z.number()])
    .nullable()
    .optional()
    .transform((val) =>
      val === null || val === undefined || val === ''
        ? null
        : typeof val === 'number'
          ? val.toFixed(2)
          : val.trim(),
    )
    .pipe(z.string().regex(DECIMAL_PRICE_REGEX).nullable()),
  effective_price: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'number' ? val.toFixed(2) : val.trim()))
    .pipe(z.string().regex(DECIMAL_PRICE_REGEX)),
  discount_percentage: z
    .union([z.number(), z.string()])
    .nullable()
    .optional()
    .transform((val) =>
      val === null || val === undefined || val === '' ? null : Number(val),
    ),
  stock_status: stockStatusSchema,
  available_count: z.number().int().nonnegative(),
  preorder_enabled: z.boolean(),
  description: z.string().nullable(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().optional(),
  primary_image_url: z.string().nullable().optional(),
  images: z.array(productImageResponseSchema).default([]),
})

export type ProductResponse = z.infer<typeof productResponseSchema>
export const productSchema = productResponseSchema
export type Product = ProductResponse

export const categoryDetailResponseSchema = categoryResponseSchema.extend({
  products: z.array(productResponseSchema).default([]),
})

export type CategoryDetailResponse = z.infer<typeof categoryDetailResponseSchema>

/**
 * Product Creation Schema (Admin)
 */
export const productCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(255),
    category_id: z.string().uuid(),
    sku: z.string().trim().toUpperCase().regex(SKU_REGEX),
    slug: z.preprocess(
      (val) => (val === '' ? undefined : val),
      z.string().trim().toLowerCase().regex(SLUG_REGEX).optional(),
    ),
    variant: productVariantSchema.optional(),
    base_price: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'number' ? val.toFixed(2) : val.trim()))
      .pipe(z.string().regex(DECIMAL_PRICE_REGEX)),
    sale_price: z.preprocess(
      (val) =>
        val === '' || val === undefined
          ? null
          : typeof val === 'number'
            ? val.toFixed(2)
            : typeof val === 'string'
              ? val.trim()
              : val,
      z.string().regex(DECIMAL_PRICE_REGEX).nullable().optional(),
    ),
    preorder_enabled: z.boolean().optional().default(true),
    is_active: z.boolean().optional().default(true),
    is_featured: z.boolean().optional().default(false),
    description: z.preprocess(
      (val) => (val === '' ? null : val),
      z.string().trim().nullable().optional(),
    ),
  })
  .refine((data) => Number(data.base_price) > 0, {
    message: 'Base price must be greater than zero',
    path: ['base_price'],
  })
  .refine(
    (data) => {
      if (data.sale_price !== null && data.sale_price !== undefined) {
        const sale = Number(data.sale_price)
        const base = Number(data.base_price)
        return sale > 0 && sale < base
      }
      return true
    },
    {
      message: 'Sale price must be greater than zero and less than base price',
      path: ['sale_price'],
    },
  )

export type ProductCreateInput = z.input<typeof productCreateSchema>

/**
 * Product Update Schema (Admin)
 */
export const productUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(255).optional(),
    category_id: z.string().uuid().optional(),
    sku: z.string().trim().toUpperCase().regex(SKU_REGEX).optional(),
    slug: z.preprocess(
      (val) => (val === '' ? undefined : val),
      z.string().trim().toLowerCase().regex(SLUG_REGEX).optional(),
    ),
    variant: productVariantSchema.optional(),
    base_price: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'number' ? val.toFixed(2) : val.trim()))
      .pipe(z.string().regex(DECIMAL_PRICE_REGEX))
      .optional(),
    sale_price: z.preprocess(
      (val) =>
        val === '' || val === undefined
          ? null
          : typeof val === 'number'
            ? val.toFixed(2)
            : typeof val === 'string'
              ? val.trim()
              : val,
      z.string().regex(DECIMAL_PRICE_REGEX).nullable().optional(),
    ),
    is_active: z.boolean().optional(),
    is_featured: z.boolean().optional(),
    preorder_enabled: z.boolean().optional(),
    description: z.preprocess(
      (val) => (val === '' ? null : val),
      z.string().trim().nullable().optional(),
    ),
  })
  .refine(
    (data) => {
      if (data.base_price !== undefined) {
        return Number(data.base_price) > 0
      }
      return true
    },
    {
      message: 'Base price must be greater than zero',
      path: ['base_price'],
    },
  )
  .refine(
    (data) => {
      if (data.sale_price !== null && data.sale_price !== undefined) {
        const sale = Number(data.sale_price)
        if (sale <= 0) return false
        if (data.base_price !== undefined) {
          return sale < Number(data.base_price)
        }
      }
      return true
    },
    {
      message: 'Sale price must be greater than zero and less than base price',
      path: ['sale_price'],
    },
  )

export type ProductUpdateInput = z.input<typeof productUpdateSchema>
