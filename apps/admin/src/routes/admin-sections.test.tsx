import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { AdminLayout } from '../features/dashboard/components/admin-layout'
import { AdminProductsRoute } from './admin-products-route'
import { AdminOrdersRoute } from './admin-orders-route'
import { AdminInventoryRoute } from './admin-inventory-route'
import { AdminCustomersRoute } from './admin-customers-route'
import { AdminAuditRoute } from './admin-audit-route'
import * as useAdminAuthModule from '../features/auth/hooks/use-admin-auth'

describe('Admin Section Empty State Pages', () => {
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

  it('renders Products empty state at /en/products', () => {
    mockAuth()
    render(
      <MemoryRouter initialEntries={['/en/products']}>
        <Routes>
          <Route path="/:lang" element={<AdminLayout />}>
            <Route path="products" element={<AdminProductsRoute />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Products & SKUs' })).toBeInTheDocument()
    expect(screen.getByText('No products yet')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /add product/i }).length).toBeGreaterThan(0)
  })

  it('renders Orders empty state at /en/orders', () => {
    mockAuth()
    render(
      <MemoryRouter initialEntries={['/en/orders']}>
        <Routes>
          <Route path="/:lang" element={<AdminLayout />}>
            <Route path="orders" element={<AdminOrdersRoute />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Orders & Fulfillment' })).toBeInTheDocument()
    expect(screen.getByText('No orders yet')).toBeInTheDocument()
  })

  it('renders Inventory empty state at /en/inventory', () => {
    mockAuth()
    render(
      <MemoryRouter initialEntries={['/en/inventory']}>
        <Routes>
          <Route path="/:lang" element={<AdminLayout />}>
            <Route path="inventory" element={<AdminInventoryRoute />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Key Pool Inventory' })).toBeInTheDocument()
    expect(screen.getByText('Key pool repository is empty')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /ingest key batch/i }).length).toBeGreaterThan(0)
  })

  it('renders Customers empty state at /en/customers', () => {
    mockAuth()
    render(
      <MemoryRouter initialEntries={['/en/customers']}>
        <Routes>
          <Route path="/:lang" element={<AdminLayout />}>
            <Route path="customers" element={<AdminCustomersRoute />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Customer Accounts' })).toBeInTheDocument()
    expect(screen.getByText('No customer accounts yet')).toBeInTheDocument()
  })

  it('renders Audit Log empty state at /en/audit', () => {
    mockAuth()
    render(
      <MemoryRouter initialEntries={['/en/audit']}>
        <Routes>
          <Route path="/:lang" element={<AdminLayout />}>
            <Route path="audit" element={<AdminAuditRoute />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Security & Audit Log' })).toBeInTheDocument()
    expect(screen.getByText('No audit records found')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /refresh log/i }).length).toBeGreaterThan(0)
  })
})

