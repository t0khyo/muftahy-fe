import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { AdminLayout } from '../features/dashboard/components/admin-layout'
import { AdminDashboardRoute } from './admin-dashboard-route'
import * as useAdminAuthModule from '../features/auth/hooks/use-admin-auth'

describe('Admin Layout & Dashboard Route', () => {
  it('renders persistent sidebar and dashboard metrics in English LTR (/en)', () => {
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
      <MemoryRouter initialEntries={['/en']}>
        <Routes>
          <Route path="/:lang" element={<AdminLayout />}>
            <Route index element={<AdminDashboardRoute />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    // Verify LTR sidebar container attribute
    const sidebarContainer = container.querySelector('[data-slot="sidebar-container"]')
    expect(sidebarContainer).toHaveAttribute('data-side', 'left')

    // Sidebar Branding & Nav Items
    expect(screen.getByText('Muftahy Admin')).toBeInTheDocument()
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Products & SKUs')).toBeInTheDocument()
    expect(screen.getAllByText('Orders & Fulfillment').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Key Pool Inventory')).toBeInTheDocument()
    expect(screen.getByText('Customer Accounts')).toBeInTheDocument()
    expect(screen.getByText('Security & Audit Log')).toBeInTheDocument()

    // Operator Details
    expect(screen.getByText('Lead Admin')).toBeInTheDocument()

    // Dashboard Cards & Metric Details
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('EGP 458,250')).toBeInTheDocument()
    expect(screen.getByText('Active Licenses')).toBeInTheDocument()
    expect(screen.getByText('1,842')).toBeInTheDocument()
    expect(screen.getByText('Pending Orders')).toBeInTheDocument()
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
      <MemoryRouter initialEntries={['/ar']}>
        <Routes>
          <Route path="/:lang" element={<AdminLayout />}>
            <Route index element={<AdminDashboardRoute />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    // Verify RTL sidebar container attribute
    const sidebarContainer = container.querySelector('[data-slot="sidebar-container"]')
    expect(sidebarContainer).toHaveAttribute('data-side', 'right')

    expect(screen.getByText('Muftahy Admin')).toBeInTheDocument()
  })
})
