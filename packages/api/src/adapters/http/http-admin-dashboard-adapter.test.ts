import { describe, expect, it, vi } from 'vitest'
import type { NativeFetchClient } from './fetch-client'
import { HttpAdminDashboardAdapter } from './http-admin-dashboard-adapter'

describe('HttpAdminDashboardAdapter', () => {
  const createMockClient = (responseData: unknown): NativeFetchClient => {
    return {
      request: vi.fn().mockResolvedValue(responseData),
    } as unknown as NativeFetchClient
  }

  it('fetches and parses overview data', async () => {
    const mockOverview = {
      pending_orders_count: 3,
      open_tickets_count: 1,
      low_stock_products: [],
      today_sales_count: 10,
      today_revenue_egp: 5500.0,
    }
    const client = createMockClient(mockOverview)
    const adapter = new HttpAdminDashboardAdapter(client)

    const result = await adapter.getOverview()
    expect(client.request).toHaveBeenCalledWith('/admin/dashboard/overview', {
      method: 'GET',
    })
    expect(result.today_revenue_egp).toBe('5500.00')
    expect(result.pending_orders_count).toBe(3)
  })

  it('fetches sales breakdown with date query parameters', async () => {
    const mockSales = {
      date_from: '2026-11-01T00:00:00Z',
      date_to: '2026-11-07T00:00:00Z',
      total_orders: 20,
      total_sales_egp: 18000.0,
      daily_breakdown: [],
    }
    const client = createMockClient(mockSales)
    const adapter = new HttpAdminDashboardAdapter(client)

    const result = await adapter.getSales('2026-11-01', '2026-11-07')
    expect(client.request).toHaveBeenCalledWith(
      '/admin/dashboard/sales?date_from=2026-11-01&date_to=2026-11-07',
      { method: 'GET' },
    )
    expect(result.total_sales_egp).toBe('18000.00')
  })

  it('fetches preorder summaries', async () => {
    const mockPreorders = {
      total_pending_preorders: 2,
      per_product_preorders: [],
    }
    const client = createMockClient(mockPreorders)
    const adapter = new HttpAdminDashboardAdapter(client)

    const result = await adapter.getPreorders()
    expect(client.request).toHaveBeenCalledWith('/admin/dashboard/preorders', {
      method: 'GET',
    })
    expect(result.total_pending_preorders).toBe(2)
  })
})

