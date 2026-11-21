import { describe, expect, it, vi } from 'vitest'
import type { NativeFetchClient } from './fetch-client'
import { HttpLedgerAdapter } from './http-ledger-adapter'

describe('HttpLedgerAdapter', () => {
  const createMockClient = (responseData: unknown): NativeFetchClient => {
    return {
      request: vi.fn().mockResolvedValue(responseData),
    } as unknown as NativeFetchClient
  }

  it('fetches balance response and normalizes decimal strings', async () => {
    const mockBalance = {
      egp_cash_balance: 50000.0,
      usd_wallet_balance: 2000.0,
      held_deferred_revenue_egp: 8000.0,
      last_updated: '2026-11-21T06:00:00Z',
    }
    const client = createMockClient(mockBalance)
    const adapter = new HttpLedgerAdapter(client)

    const result = await adapter.getBalance()
    expect(client.request).toHaveBeenCalledWith('/ledger/balance', { method: 'GET' })
    expect(result.egp_cash_balance).toBe('50000.00')
    expect(result.usd_wallet_balance).toBe('2000.00')
  })

  it('fetches financial summary', async () => {
    const mockSummary = {
      total_revenue_egp: 100000.0,
      total_cogs_egp: 60000.0,
      total_gateway_fees_egp: 2000.0,
      net_gross_profit_egp: 38000.0,
      egp_cash_on_hand: 40000.0,
      usd_wallet_balance: 1500.0,
      held_funds_egp: 5000.0,
      total_equity_deposits_by_admin: {},
      total_withdrawals_by_admin: {},
    }
    const client = createMockClient(mockSummary)
    const adapter = new HttpLedgerAdapter(client)

    const result = await adapter.getSummary()
    expect(client.request).toHaveBeenCalledWith('/ledger/summary', { method: 'GET' })
    expect(result.net_gross_profit_egp).toBe('38000.00')
  })

  it('fetches ledger entries with query filters', async () => {
    const mockEntries = [
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        entry_type: 'ORDER_PAYMENT',
        currency: 'EGP',
        amount: 500.0,
        running_balance: 50000.0,
        is_deferred_revenue: false,
        exchange_rate: null,
        description: 'Payment #1',
        admin_id: null,
        order_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        order_item_id: null,
        correction_of: null,
        created_at: '2026-11-21T05:00:00Z',
      },
    ]
    const client = createMockClient(mockEntries)
    const adapter = new HttpLedgerAdapter(client)

    const result = await adapter.getEntries({ currency: 'EGP', limit: 25 })
    expect(client.request).toHaveBeenCalledWith('/ledger/entries?currency=EGP&limit=25', {
      method: 'GET',
    })
    expect(result.length).toBe(1)
    expect(result[0].amount).toBe('500.00')
  })
})

