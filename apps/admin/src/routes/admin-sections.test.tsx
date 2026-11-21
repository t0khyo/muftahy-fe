import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminLayout } from '../features/dashboard/components/admin-layout'
import { AdminProductsRoute } from './admin-products-route'
import { AdminOrdersRoute } from './admin-orders-route'
import { AdminInventoryRoute } from './admin-inventory-route'
import { AdminTicketsRoute } from './admin-tickets-route'
import { AdminPromosRoute } from './admin-promos-route'
import { AdminLedgerRoute } from './admin-ledger-route'
import { AdminAuditRoute } from './admin-audit-route'
import { AdminProfileRoute } from './admin-profile-route'
import * as useAdminAuthModule from '../features/auth/hooks/use-admin-auth'
import * as apiFactory from '@workspace/api/factory'
import type { AdminDashboardService } from '@workspace/api/services/admin-dashboard-service'
import type { ProductService } from '@workspace/api/services/product-service'
import type { AdminOrderService } from '@workspace/api/services/admin-order-service'
import type { InventoryService } from '@workspace/api/services/inventory-service'
import type { TicketService } from '@workspace/api/services/ticket-service'
import type { PromoService } from '@workspace/api/services/promo-service'
import type { LedgerService } from '@workspace/api/services/ledger-service'
import type { AuditService } from '@workspace/api/services/audit-service'

describe('Admin Section Workstation Pages', () => {
  let testQueryClient: QueryClient

  const mockAuth = () => {
    vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
      user: {
        id: 'usr-1',
        email: 'admin1@souqmuftah.com',
        full_name: 'Lead Admin',
        is_active: true,
        created_at: '2026-01-01',
      },
      role: 'admin',
      isAuthenticated: true,
      isLoading: false,
      isInitializing: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
    })
  }

  beforeEach(() => {
    testQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    })

    vi.spyOn(apiFactory, 'getAdminDashboardService').mockReturnValue({
      getOverview: vi.fn().mockResolvedValue({
        pending_orders_count: 0,
        open_tickets_count: 0,
        low_stock_products: [],
        today_sales_count: 0,
        today_revenue_egp: '0.00',
      }),
    } as unknown as AdminDashboardService)

    vi.spyOn(apiFactory, 'getProductService').mockReturnValue({
      getProducts: vi.fn().mockResolvedValue([]),
    } as unknown as ProductService)

    vi.spyOn(apiFactory, 'getAdminOrderService').mockReturnValue({
      getOrders: vi.fn().mockResolvedValue({ items: [], total: 0 }),
      getPendingOrders: vi.fn().mockResolvedValue([]),
      getReceiptImageBlob: vi.fn().mockResolvedValue(new Blob([])),
    } as unknown as AdminOrderService)

    vi.spyOn(apiFactory, 'getInventoryService').mockReturnValue({
      getKeys: vi.fn().mockResolvedValue([]),
      listKeys: vi.fn().mockResolvedValue([]),
      getStats: vi.fn().mockResolvedValue([]),
    } as unknown as InventoryService)

    vi.spyOn(apiFactory, 'getTicketService').mockReturnValue({
      getTickets: vi.fn().mockResolvedValue([]),
      listTickets: vi.fn().mockResolvedValue([]),
    } as unknown as TicketService)

    vi.spyOn(apiFactory, 'getPromoService').mockReturnValue({
      getPromos: vi.fn().mockResolvedValue([]),
      listPromos: vi.fn().mockResolvedValue([]),
    } as unknown as PromoService)

    vi.spyOn(apiFactory, 'getLedgerService').mockReturnValue({
      getEntries: vi.fn().mockResolvedValue([]),
      getSummary: vi.fn().mockResolvedValue({
        total_revenue_egp: '0.00',
        total_cogs_egp: '0.00',
        total_gateway_fees_egp: '0.00',
        net_gross_profit_egp: '0.00',
        egp_cash_on_hand: '0.00',
        usd_wallet_balance: '0.00',
        held_funds_egp: '0.00',
        total_equity_deposits_by_admin: {},
        total_withdrawals_by_admin: {},
      }),
    } as unknown as LedgerService)

    vi.spyOn(apiFactory, 'getAuditService').mockReturnValue({
      getLogs: vi.fn().mockResolvedValue({ items: [], total: 0 }),
      exportLogs: vi.fn().mockResolvedValue(new Blob([])),
    } as unknown as AuditService)
  })

  it('renders Products workstation at /en/products', async () => {
    mockAuth()
    render(
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter initialEntries={['/en/products']}>
          <Routes>
            <Route path="/:lang" element={<AdminLayout />}>
              <Route path="products" element={<AdminProductsRoute />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByRole('heading', { name: 'Products & SKUs' })).toBeInTheDocument()
    expect(await screen.findByText('No products found')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /add product/i }).length).toBeGreaterThan(0)
  })

  it('renders Orders workstation at /en/orders', async () => {
    mockAuth()
    render(
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter initialEntries={['/en/orders']}>
          <Routes>
            <Route path="/:lang" element={<AdminLayout />}>
              <Route path="orders" element={<AdminOrdersRoute />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByRole('heading', { name: 'Orders & Fulfillment' })).toBeInTheDocument()
    expect(await screen.findByText('No orders found')).toBeInTheDocument()
  })

  it('renders Inventory workstation at /en/inventory', async () => {
    mockAuth()
    render(
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter initialEntries={['/en/inventory']}>
          <Routes>
            <Route path="/:lang" element={<AdminLayout />}>
              <Route path="inventory" element={<AdminInventoryRoute />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByRole('heading', { name: 'Key Pool Inventory' })).toBeInTheDocument()
    expect(await screen.findByText('No keys found')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /ingest key batch/i }).length).toBeGreaterThan(0)
  })

  it('renders Support Tickets workstation at /en/tickets', async () => {
    mockAuth()
    render(
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter initialEntries={['/en/tickets']}>
          <Routes>
            <Route path="/:lang" element={<AdminLayout />}>
              <Route path="tickets" element={<AdminTicketsRoute />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByRole('heading', { name: 'Customer Dispute Tickets' })).toBeInTheDocument()
    expect(await screen.findByText('No tickets found')).toBeInTheDocument()
  })

  it('renders Promotions workstation at /en/promos', async () => {
    mockAuth()
    render(
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter initialEntries={['/en/promos']}>
          <Routes>
            <Route path="/:lang" element={<AdminLayout />}>
              <Route path="promos" element={<AdminPromosRoute />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByRole('heading', { name: 'Promotions & Coupons' })).toBeInTheDocument()
    expect(await screen.findByText('No promotions yet')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /create coupon/i }).length).toBeGreaterThan(0)
  })

  it('renders Financial Ledger workstation at /en/ledger', async () => {
    mockAuth()
    render(
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter initialEntries={['/en/ledger']}>
          <Routes>
            <Route path="/:lang" element={<AdminLayout />}>
              <Route path="ledger" element={<AdminLedgerRoute />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByRole('heading', { name: 'Financial Ledger & Escrow' })).toBeInTheDocument()
    expect(await screen.findByText('No journal entries')).toBeInTheDocument()
  })

  it('renders Audit Log workstation at /en/audit', async () => {
    mockAuth()
    render(
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter initialEntries={['/en/audit']}>
          <Routes>
            <Route path="/:lang" element={<AdminLayout />}>
              <Route path="audit" element={<AdminAuditRoute />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByRole('heading', { name: 'Security & Audit Log' })).toBeInTheDocument()
    expect(await screen.findByText('No audit logs found')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
  })

  it('renders Operator Profile workstation at /en/profile', async () => {
    mockAuth()
    render(
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter initialEntries={['/en/profile']}>
          <Routes>
            <Route path="/:lang" element={<AdminLayout />}>
              <Route path="profile" element={<AdminProfileRoute />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
    expect(screen.getAllByText('Lead Admin').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('admin1@souqmuftah.com').length).toBeGreaterThanOrEqual(1)
  })
})
