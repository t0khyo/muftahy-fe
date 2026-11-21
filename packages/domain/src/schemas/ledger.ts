import { z } from 'zod'
import { decimalStringSchema } from './common'

export const ledgerEntryResponseSchema = z.object({
  id: z.string().uuid(),
  entry_type: z.string(),
  currency: z.string(),
  amount: decimalStringSchema,
  running_balance: decimalStringSchema,
  is_deferred_revenue: z.boolean().default(false),
  exchange_rate: decimalStringSchema.nullable().optional(),
  description: z.string(),
  admin_id: z.string().uuid().nullable().optional(),
  order_id: z.string().uuid().nullable().optional(),
  order_item_id: z.string().uuid().nullable().optional(),
  correction_of: z.string().uuid().nullable().optional(),
  created_at: z.string().min(1),
})

export type LedgerEntryResponse = z.infer<typeof ledgerEntryResponseSchema>

export const ledgerEntryListResponseSchema = z.array(ledgerEntryResponseSchema)
export type LedgerEntryListResponse = z.infer<typeof ledgerEntryListResponseSchema>

export const balanceResponseSchema = z.object({
  egp_cash_balance: decimalStringSchema,
  usd_wallet_balance: decimalStringSchema,
  held_deferred_revenue_egp: decimalStringSchema,
  last_updated: z.string().min(1),
})

export type BalanceResponse = z.infer<typeof balanceResponseSchema>

export const financialSummaryResponseSchema = z.object({
  total_revenue_egp: decimalStringSchema,
  total_cogs_egp: decimalStringSchema,
  total_gateway_fees_egp: decimalStringSchema,
  net_gross_profit_egp: decimalStringSchema,
  egp_cash_on_hand: decimalStringSchema,
  usd_wallet_balance: decimalStringSchema,
  held_funds_egp: decimalStringSchema,
  total_equity_deposits_by_admin: z.record(z.string(), decimalStringSchema).default({}),
  total_withdrawals_by_admin: z.record(z.string(), decimalStringSchema).default({}),
})

export type FinancialSummaryResponse = z.infer<typeof financialSummaryResponseSchema>

