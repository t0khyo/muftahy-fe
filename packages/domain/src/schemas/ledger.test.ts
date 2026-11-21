import { describe, expect, it } from 'vitest'
import {
  balanceResponseSchema,
  financialSummaryResponseSchema,
  ledgerEntryResponseSchema,
} from './ledger'

describe('Ledger Schemas', () => {
  it('validates balanceResponseSchema and coerces decimals', () => {
    const raw = {
      egp_cash_balance: 125000.5,
      usd_wallet_balance: 4200.75,
      held_deferred_revenue_egp: 18500.0,
      last_updated: '2026-11-21T06:00:00Z',
    }

    const parsed = balanceResponseSchema.parse(raw)
    expect(parsed.egp_cash_balance).toBe('125000.50')
    expect(parsed.usd_wallet_balance).toBe('4200.75')
    expect(parsed.held_deferred_revenue_egp).toBe('18500.00')
  })

  it('validates financialSummaryResponseSchema', () => {
    const raw = {
      total_revenue_egp: 350000.0,
      total_cogs_egp: 210000.0,
      total_gateway_fees_egp: 7000.0,
      net_gross_profit_egp: 133000.0,
      egp_cash_on_hand: 95000.0,
      usd_wallet_balance: 3500.0,
      held_funds_egp: 12000.0,
      total_equity_deposits_by_admin: {
        'admin-1': 50000.0,
      },
      total_withdrawals_by_admin: {},
    }

    const parsed = financialSummaryResponseSchema.parse(raw)
    expect(parsed.net_gross_profit_egp).toBe('133000.00')
    expect(parsed.total_equity_deposits_by_admin['admin-1']).toBe('50000.00')
  })

  it('validates ledgerEntryResponseSchema', () => {
    const raw = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      entry_type: 'ORDER_PAYMENT',
      currency: 'EGP',
      amount: 650.0,
      running_balance: 125000.0,
      is_deferred_revenue: false,
      exchange_rate: null,
      description: 'Order #ORD-101 payment completed',
      admin_id: null,
      order_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      order_item_id: null,
      correction_of: null,
      created_at: '2026-11-21T05:30:00Z',
    }

    const parsed = ledgerEntryResponseSchema.parse(raw)
    expect(parsed.amount).toBe('650.00')
    expect(parsed.entry_type).toBe('ORDER_PAYMENT')
  })
})

