import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import * as apiFactory from '@workspace/api/factory'
import type { AdminDashboardService } from '@workspace/api/services/admin-dashboard-service'
import type { AuditService } from '@workspace/api/services/audit-service'
import { createAdminQueryClient } from '../app/query-client'
import * as useAdminAuthModule from '../features/auth/hooks/use-admin-auth'
import { AdminLayout } from '../features/dashboard/components/admin-layout'
import { AdminDashboardRoute } from './admin-dashboard-route'

describe('Admin Layout & Dashboard Route', () => {
  let testQueryClient: QueryClient

  beforeEach(() => {
    vi.restoreAllMocks()
    testQueryClient = createAdminQueryClient()

    const mockDashboardService = {
      getOverview: vi.fn().mockResolvedValue({
        pending_orders_count: 14,
        open_tickets_count: 3,
        low_stock_products: [],
        today_sales_count: 14,
        today_revenue_egp: '458250.00',
      }),
      getSales: vi.fn().mockResolvedValue({
        date_from: '2026-01-01',
        date_to: '2026-01-07',
        total_orders: 14,
        total_sales_egp: '458250.00',
        daily_breakdown: [],
      }),
      getPreorders: vi.fn().mockResolvedValue({
        total_pending_preorders: 0,
        per_product_preorders: [],
      }),
    }

    const mockAuditService = {
      getLogs: vi.fn().mockResolvedValue({ items: [], total: 0 }),
      exportLogs: vi.fn().mockResolvedValue(new Blob([])),
    }

    vi.spyOn(apiFactory, 'getAdminDashboardService').mockReturnValue(mockDashboardService as unknown as AdminDashboardService)
    vi.spyOn(apiFactory, 'getAuditService').mockReturnValue(mockAuditService as unknown as AuditService)
  })

  it('renders persistent sidebar and dashboard metrics in English LTR (/en)', async () => {
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

    const { container } = render(
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter initialEntries={['/en']}>
          <Routes>
            <Route path="/:lang" element={<AdminLayout />}>
              <Route index element={<AdminDashboardRoute />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Verify LTR sidebar container attribute
    const sidebarContainer = container.querySelector('[data-slot="sidebar-container"]')
    expect(sidebarContainer).toHaveAttribute('data-side', 'left')

    // Sidebar Branding & Nav Items
    expect(screen.getByText('Muftahy Admin')).toBeInTheDocument()
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getAllByText('Orders').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Inventory')).toBeInTheDocument()
    expect(screen.getByText('Customer Support')).toBeInTheDocument()
    expect(screen.getByText('Discounts')).toBeInTheDocument()
    expect(screen.getByText('Finance')).toBeInTheDocument()
    expect(screen.getByText('Audit Log')).toBeInTheDocument()

    // Operator Details
    expect(screen.getByText('Lead Admin')).toBeInTheDocument()

    // Dashboard Cards & Metric Details
    expect(await screen.findByText("Today's Revenue")).toBeInTheDocument()
    expect(screen.getByText('Orders Created Today')).toBeInTheDocument()
    expect(screen.getByText('Pending Review')).toBeInTheDocument()
    expect(screen.getByText('Open Support Tickets')).toBeInTheDocument()
  })

  it('renders sidebar on the right in Arabic RTL (/ar)', () => {
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

    const { container } = render(
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter initialEntries={['/ar']}>
          <Routes>
            <Route path="/:lang" element={<AdminLayout />}>
              <Route index element={<AdminDashboardRoute />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Verify RTL sidebar container attribute
    const sidebarContainer = container.querySelector('[data-slot="sidebar-container"]')
    expect(sidebarContainer).toHaveAttribute('data-side', 'right')

    expect(screen.getByText('Muftahy Admin')).toBeInTheDocument()
  })

  it('renders independent AdminQueryError cards when dashboard queries fail without blocking healthy widgets', async () => {
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

    vi.spyOn(apiFactory, 'getAdminDashboardService').mockReturnValue({
      getOverview: vi.fn().mockRejectedValue(
        new ApiClientError(404, 'ENTITY_NOT_FOUND', 'Overview unavailable')
      ),
      getSales: vi.fn().mockRejectedValue(
        new ApiClientError(403, 'PERMISSION_DENIED', 'Forbidden')
      ),
      getPreorders: vi.fn().mockResolvedValue({
        total_pending_preorders: 0,
        per_product_preorders: [],
      }),
    } as unknown as AdminDashboardService)

    render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={testQueryClient}>
          <MemoryRouter initialEntries={['/en']}>
            <Routes>
              <Route path="/:lang" element={<AdminLayout />}>
                <Route index element={<AdminDashboardRoute />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </I18nextProvider>
    )

    expect(await screen.findByText(/no pending preorders/i)).toBeInTheDocument()
    expect(await screen.findAllByRole('button', { name: /back to dashboard/i })).toHaveLength(2)
  })
})
