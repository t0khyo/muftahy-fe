import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { AccountGuard } from './account-guard'
import * as useAuthModule from '../../auth/hooks/use-auth'

describe('AccountGuard', () => {
  it('renders loading spinner while isInitializing is true', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: true,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/en/account/profile']}>
        <Routes>
          <Route
            path="/:lang/account/profile"
            element={
              <AccountGuard>
                <div>Protected Content</div>
              </AccountGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByTestId('account-guard-loading')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects unauthenticated user to login with returnUrl', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: false,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/en/account/profile']}>
        <Routes>
          <Route
            path="/:lang/account/profile"
            element={
              <AccountGuard>
                <div>Protected Content</div>
              </AccountGuard>
            }
          />
          <Route path="/:lang/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders protected children when user is authenticated', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        id: '1',
        email: 'user@example.com',
        full_name: 'Test User',
        phone: null,
        is_active: true,
        created_at: '2026-11-18',
      },
      isAuthenticated: true,
      isLoading: false,
      isInitializing: false,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/en/account/profile']}>
        <Routes>
          <Route
            path="/:lang/account/profile"
            element={
              <AccountGuard>
                <div>Protected Content</div>
              </AccountGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
