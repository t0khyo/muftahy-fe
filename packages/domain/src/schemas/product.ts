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

export const productCollectionSchema = z.enum([
  'best-sellers',
  'deals',
  'new',
])

export type ProductCollection = z.infer<typeof productCollectionSchema>

export const productSortOptionSchema = z.enum([
  'featured',
  'best-selling',
  'price-asc',
  'price-desc',
  'newest',
])

export type ProductSortOption = z.infer<typeof productSortOptionSchema>

export const productListFilterSchema = z.object({
  category: z.union([productCategorySchema, z.array(productCategorySchema)]).optional(),
  platform: z.union([productPlatformSchema, z.array(productPlatformSchema)]).optional(),
  region: z.union([productRegionSchema, z.array(productRegionSchema)]).optional(),
  collection: productCollectionSchema.optional(),
  search: z.string().optional(),
  featured: z.boolean().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  inStock: z.boolean().optional(),
  onSale: z.boolean().optional(),
  sort: productSortOptionSchema.optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
})

export type ProductListFilter = z.infer<typeof productListFilterSchema>

export interface ProductListResult {
  items: Product[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface FilterOptionCount {
  value: string
  count: number
}

export interface ProductFilterCounts {
  categories: FilterOptionCount[]
  platforms: FilterOptionCount[]
  regions: FilterOptionCount[]
  inStockCount: number
  onSaleCount: number
  total: number
}
