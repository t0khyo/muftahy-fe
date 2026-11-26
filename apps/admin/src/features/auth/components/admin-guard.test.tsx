import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { AdminGuard } from './admin-guard'
import * as useAdminAuthModule from '../hooks/use-admin-auth'

describe('AdminGuard', () => {
  it('renders loading spinner while isInitializing is true', () => {
    vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/en']}>
        <Routes>
          <Route
            path="/:lang"
            element={
              <AdminGuard>
                <div>Protected Admin Dashboard</div>
              </AdminGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByTestId('admin-guard-loading')).toBeInTheDocument()
    expect(screen.queryByText('Protected Admin Dashboard')).not.toBeInTheDocument()
  })

  it('redirects unauthenticated user to login with returnUrl', () => {
    vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/en']}>
        <Routes>
          <Route
            path="/:lang"
            element={
              <AdminGuard>
                <div>Protected Admin Dashboard</div>
              </AdminGuard>
            }
          />
          <Route path="/:lang/login" element={<div>Admin Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Admin Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Admin Dashboard')).not.toBeInTheDocument()
  })

  it('renders protected children when admin is authenticated', () => {
    vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
      user: {
        id: 'admin-1',
        email: 'admin1@souqmuftah.com',
        display_name: 'System Admin',
        role: 'admin',
        is_active: true,
        created_at: '2026-11-18T00:00:00Z',
        updated_at: '2026-11-18T00:00:00Z',
      },
      role: 'admin',
      isAuthenticated: true,
      isLoading: false,
      isInitializing: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/en']}>
        <Routes>
          <Route
            path="/:lang"
            element={
              <AdminGuard>
                <div>Protected Admin Dashboard</div>
              </AdminGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Admin Dashboard')).toBeInTheDocument()
  })
})
