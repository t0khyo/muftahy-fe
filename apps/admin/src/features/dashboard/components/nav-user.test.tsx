import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { SidebarProvider } from '@workspace/ui/components/sidebar'
import { NavUser } from './nav-user'
import * as useAdminAuthModule from '../../auth/hooks/use-admin-auth'

const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('NavUser Component', () => {
  const mockLogout = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
      user: {
        id: 'usr-admin-1',
        email: 'operator@souqmuftah.com',
        full_name: 'Lead Operator',
        is_active: true,
        created_at: '2026-01-01',
      },
      role: 'admin',
      isAuthenticated: true,
      isLoading: false,
      isInitializing: false,
      login: vi.fn(),
      logout: mockLogout,
      refreshProfile: vi.fn(),
    })
  })

  it('renders trigger with operator name and avatar', () => {
    render(
      <MemoryRouter initialEntries={['/en']}>
        <Routes>
          <Route
            path="/:lang"
            element={
              <SidebarProvider>
                <NavUser side="left" />
              </SidebarProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Lead Operator')).toBeInTheDocument()
    expect(screen.getByText('operator@souqmuftah.com')).toBeInTheDocument()
  })

  it('opens dropdown menu without zero-trust item and provides clean profile link', async () => {
    render(
      <MemoryRouter initialEntries={['/en']}>
        <Routes>
          <Route
            path="/:lang"
            element={
              <SidebarProvider>
                <NavUser side="left" />
              </SidebarProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    const trigger = screen.getByRole('button', { name: /lead operator/i })
    fireEvent.click(trigger)

    // Verify dropdown content mounts without zero-trust buzzwords
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /profile/i })).toBeInTheDocument()
    })

    expect(screen.queryByText('Zero-Trust Session Active')).not.toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /profile/i })).toHaveAttribute('href', '/en/profile')
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('triggers logout and redirects to login page when Logout is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/en']}>
        <Routes>
          <Route
            path="/:lang"
            element={
              <SidebarProvider>
                <NavUser side="left" />
              </SidebarProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    const trigger = screen.getByRole('button', { name: /lead operator/i })
    fireEvent.click(trigger)

    const logoutButton = await screen.findByRole('menuitem', { name: /logout/i })
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith('/en/login', { replace: true })
    })
  })
})
