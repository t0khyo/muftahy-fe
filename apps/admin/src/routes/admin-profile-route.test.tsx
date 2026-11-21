import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { i18n } from '@workspace/i18n/config'
import { I18nProvider } from '../app/i18n-provider'
import { AdminProfileRoute } from './admin-profile-route'
import * as useAdminAuthModule from '../features/auth/hooks/use-admin-auth'
import * as apiFactory from '@workspace/api/factory'
import type { UserService } from '@workspace/api/services/user-service'

const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('AdminProfileRoute Workstation', () => {
  let testQueryClient: QueryClient
  const mockLogout = vi.fn().mockResolvedValue(undefined)
  const mockRefreshProfile = vi.fn().mockResolvedValue(undefined)

  const mockUser = {
    id: 'usr-admin-42',
    email: 'operator@souqmuftah.com',
    full_name: 'Lead Administrator',
    phone: '+201001112222',
    is_active: true,
    created_at: '2026-01-15T10:00:00Z',
  }

  const mockUserService = {
    getProfile: vi.fn().mockResolvedValue(mockUser),
    updateProfile: vi.fn().mockImplementation((payload) =>
      Promise.resolve({ ...mockUser, ...payload })
    ),
    getUserKeys: vi.fn().mockResolvedValue([]),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    i18n.changeLanguage('en')
    testQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    })

    vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
      user: mockUser,
      role: 'admin',
      isAuthenticated: true,
      isLoading: false,
      isInitializing: false,
      login: vi.fn(),
      logout: mockLogout,
      refreshProfile: mockRefreshProfile,
    })

    vi.spyOn(apiFactory, 'getUserService').mockReturnValue(mockUserService as unknown as UserService)
  })

  afterEach(() => {
    i18n.changeLanguage('en')
  })

  it('renders operator identity hero with Blobatar and copyable ID in English LTR (/en)', async () => {
    render(
      <I18nProvider>
        <QueryClientProvider client={testQueryClient}>
          <MemoryRouter initialEntries={['/en/profile']}>
            <Routes>
              <Route path="/:lang/profile" element={<AdminProfileRoute />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </I18nProvider>
    )

    // Heading and identity hero
    expect(screen.getByRole('heading', { level: 1, name: /operator profile/i })).toBeInTheDocument()
    expect(screen.getByText('Lead Administrator')).toBeInTheDocument()
    expect(screen.getByText('operator@souqmuftah.com')).toBeInTheDocument()
    expect(screen.getByText('System Administrator')).toBeInTheDocument()
    expect(screen.getByText('usr-admin-42')).toBeInTheDocument()

    // Administrative scopes
    expect(screen.getByText('Administrative Scopes')).toBeInTheDocument()
    expect(screen.getByText('Product Catalog & SKU Registry')).toBeInTheDocument()
    expect(screen.getByText('Key Pool Vault Management')).toBeInTheDocument()
    expect(screen.getByText('Order Adjudication & Fulfillment')).toBeInTheDocument()
    expect(screen.getByText('Security Trail & Audit Logging')).toBeInTheDocument()
  })

  it('allows copying operator system ID to clipboard', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: { writeText: writeTextSpy },
    })

    render(
      <I18nProvider>
        <QueryClientProvider client={testQueryClient}>
          <MemoryRouter initialEntries={['/en/profile']}>
            <Routes>
              <Route path="/:lang/profile" element={<AdminProfileRoute />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </I18nProvider>
    )

    const copyBtn = screen.getByRole('button', { name: /copy operator id/i })
    fireEvent.click(copyBtn)

    expect(writeTextSpy).toHaveBeenCalledWith('usr-admin-42')
  })

  it('allows editing full name and phone number and submits form', async () => {
    render(
      <I18nProvider>
        <QueryClientProvider client={testQueryClient}>
          <MemoryRouter initialEntries={['/en/profile']}>
            <Routes>
              <Route path="/:lang/profile" element={<AdminProfileRoute />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </I18nProvider>
    )

    const nameInput = screen.getByLabelText(/full name/i)
    fireEvent.change(nameInput, { target: { value: 'Updated Lead Admin' } })

    const saveBtn = screen.getByRole('button', { name: /save changes/i })
    expect(saveBtn).not.toBeDisabled()

    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockUserService.updateProfile).toHaveBeenCalledWith({
        full_name: 'Updated Lead Admin',
        phone: '+201001112222',
      })
      expect(mockRefreshProfile).toHaveBeenCalled()
      expect(screen.getByText(/operator profile updated successfully/i)).toBeInTheDocument()
    })
  })

  it('terminates session immediately when clicking Logout', async () => {
    render(
      <I18nProvider>
        <QueryClientProvider client={testQueryClient}>
          <MemoryRouter initialEntries={['/en/profile']}>
            <Routes>
              <Route path="/:lang/profile" element={<AdminProfileRoute />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </I18nProvider>
    )

    const logoutBtn = screen.getByRole('button', { name: /^logout$/i })
    fireEvent.click(logoutBtn)

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith('/en/login', { replace: true })
    })
  })

  it('renders in Arabic RTL (/ar/profile)', async () => {
    await i18n.changeLanguage('ar')

    render(
      <I18nProvider>
        <QueryClientProvider client={testQueryClient}>
          <MemoryRouter initialEntries={['/ar/profile']}>
            <Routes>
              <Route path="/:lang/profile" element={<AdminProfileRoute />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </I18nProvider>
    )

    expect(screen.getByRole('heading', { level: 1, name: /الملف الشخصي للمشغل/i })).toBeInTheDocument()
    expect(screen.getByText('Lead Administrator')).toBeInTheDocument()
    expect(screen.getByText('usr-admin-42')).toBeInTheDocument()
  })
})
