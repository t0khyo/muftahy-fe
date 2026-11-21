import { z } from 'zod'
import { decimalStringSchema } from './common'

export const lowStockProductItemSchema = z.object({
  product_id: z.string().uuid(),
  product_name: z.string().min(1),
  net_stock: z.number().int(),
})

export type LowStockProductItem = z.infer<typeof lowStockProductItemSchema>

export const dashboardOverviewResponseSchema = z.object({
  pending_orders_count: z.number().int().nonnegative(),
  open_tickets_count: z.number().int().nonnegative(),
  low_stock_products: z.array(lowStockProductItemSchema),
  today_sales_count: z.number().int().nonnegative(),
  today_revenue_egp: decimalStringSchema,
})

export type DashboardOverviewResponse = z.infer<typeof dashboardOverviewResponseSchema>

export const dailySalesItemSchema = z.object({
  date: z.string(),
  orders_count: z.number().int().nonnegative(),
  sales_egp: decimalStringSchema,
})

export type DailySalesItem = z.infer<typeof dailySalesItemSchema>

export const salesSummaryResponseSchema = z.object({
  date_from: z.string(),
  date_to: z.string(),
  total_orders: z.number().int().nonnegative(),
  total_sales_egp: decimalStringSchema,
  daily_breakdown: z.array(dailySalesItemSchema),
})

export type SalesSummaryResponse = z.infer<typeof salesSummaryResponseSchema>

export const preorderProductItemSchema = z.object({
  product_id: z.string().uuid(),
  product_name: z.string().min(1),
  count: z.number().int().nonnegative(),
  oldest_preorder_age_hours: z.number().nonnegative(),
})

export type PreorderProductItem = z.infer<typeof preorderProductItemSchema>

export const preorderSummaryResponseSchema = z.object({
  total_pending_preorders: z.number().int().nonnegative(),
  per_product_preorders: z.array(preorderProductItemSchema),
})

export type PreorderSummaryResponse = z.infer<typeof preorderSummaryResponseSchema>

