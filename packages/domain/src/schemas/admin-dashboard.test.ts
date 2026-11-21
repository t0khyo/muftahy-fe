import { describe, expect, it } from 'vitest'
import {
  dashboardOverviewResponseSchema,
  salesSummaryResponseSchema,
  preorderSummaryResponseSchema,
} from './admin-dashboard'

describe('Admin Dashboard Schemas', () => {
  it('validates and coerces dashboardOverviewResponseSchema', () => {
    const raw = {
      pending_orders_count: 5,
      open_tickets_count: 2,
      low_stock_products: [
        {
          product_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          product_name: 'Windows 11 Pro',
          net_stock: 3,
        },
      ],
      today_sales_count: 12,
      today_revenue_egp: 7800.5,
    }

    const parsed = dashboardOverviewResponseSchema.parse(raw)
    expect(parsed.pending_orders_count).toBe(5)
    expect(parsed.today_revenue_egp).toBe('7800.50')
    expect(parsed.low_stock_products[0].net_stock).toBe(3)
  })

  it('validates and parses salesSummaryResponseSchema with daily breakdown', () => {
    const raw = {
      date_from: '2026-11-14T00:00:00Z',
      date_to: '2026-11-21T00:00:00Z',
      total_orders: 45,
      total_sales_egp: 54250.0,
      daily_breakdown: [
        {
          date: '2026-11-14',
          orders_count: 8,
          sales_egp: '6500.00',
        },
      ],
    }

    const parsed = salesSummaryResponseSchema.parse(raw)
    expect(parsed.total_sales_egp).toBe('54250.00')
    expect(parsed.daily_breakdown[0].sales_egp).toBe('6500.00')
  })

  it('validates preorderSummaryResponseSchema', () => {
    const raw = {
      total_pending_preorders: 4,
      per_product_preorders: [
        {
          product_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          product_name: 'Office 2024 Pro',
          count: 4,
          oldest_preorder_age_hours: 12.5,
        },
      ],
    }

    const parsed = preorderSummaryResponseSchema.parse(raw)
    expect(parsed.total_pending_preorders).toBe(4)
    expect(parsed.per_product_preorders[0].oldest_preorder_age_hours).toBe(12.5)
  })
})

