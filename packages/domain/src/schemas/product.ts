import { z } from 'zod'
import { SUPPORTED_CURRENCIES } from '../formatters/money'

export const supportedCurrencySchema = z.enum(SUPPORTED_CURRENCIES)

export const moneySchema = z.object({
  amountMinor: z.number().int().nonnegative(),
  currency: supportedCurrencySchema,
})

export type MoneyValue = z.infer<typeof moneySchema>

export const productCategorySchema = z.enum([
  'games',
  'software',
  'subscriptions',
  'gift-cards',
])

export type ProductCategory = z.infer<typeof productCategorySchema>

export const productPlatformSchema = z.enum([
  'steam',
  'playstation',
  'xbox',
  'nintendo',
  'pc',
  'microsoft',
])

export type ProductPlatform = z.infer<typeof productPlatformSchema>

export const productRegionSchema = z.enum([
  'global',
  'gcc',
  'eg',
  'mena',
  'us',
  'eu',
])

export type ProductRegion = z.infer<typeof productRegionSchema>

export const localizedStringSchema = z.object({
  en: z.string().min(1),
  ar: z.string().min(1),
})

export type LocalizedString = z.infer<typeof localizedStringSchema>

export const productSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: localizedStringSchema,
  description: localizedStringSchema,
  price: moneySchema,
  originalPrice: moneySchema.optional(),
  category: productCategorySchema,
  platform: productPlatformSchema,
  region: productRegionSchema,
  coverImage: z.string().url().or(z.string().startsWith('/')),
  inStock: z.boolean(),
  featured: z.boolean().default(false),
  deliveryType: z.enum(['instant', 'manual']).default('instant'),
})

export type Product = z.infer<typeof productSchema>

export const productListFilterSchema = z.object({
  category: productCategorySchema.optional(),
  platform: productPlatformSchema.optional(),
  region: productRegionSchema.optional(),
  search: z.string().optional(),
  featured: z.boolean().optional(),
})

export type ProductListFilter = z.infer<typeof productListFilterSchema>
