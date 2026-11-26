import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { i18n } from '@workspace/i18n/config'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import * as apiFactory from '@workspace/api/factory'
import type { UserService } from '@workspace/api/services/user-service'
import { toast } from '@workspace/ui/components/sonner'
import { createAdminQueryClient } from '../app/query-client'
import * as useAdminAuthModule from '../features/auth/hooks/use-admin-auth'
import { I18nProvider } from '../app/i18n-provider'
import { AdminProfileRoute } from './admin-profile-route'

const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('AdminProfileRoute Workstation (Minimal Taste)', () => {
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
    mockUserService.getProfile.mockReset().mockResolvedValue(mockUser)
    mockUserService.updateProfile
      .mockReset()
      .mockImplementation((payload) => Promise.resolve({ ...mockUser, ...payload }))
    i18n.changeLanguage('en')
    testQueryClient = createAdminQueryClient()

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

  it('renders minimal profile details and does not display AI slop (scopes, telemetry, copyable IDs)', async () => {
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

    // Minimal Heading and identity
    expect(screen.getByRole('heading', { level: 1, name: /^profile$/i })).toBeInTheDocument()
    expect(screen.getByText('Lead Administrator')).toBeInTheDocument()
    expect(screen.getByText('operator@souqmuftah.com')).toBeInTheDocument()
    expect(screen.getByText('System Administrator')).toBeInTheDocument()

    // Form fields
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Lead Administrator')
    expect(screen.getByLabelText(/email address/i)).toHaveValue('operator@souqmuftah.com')

    // Verify AI slop is completely gone
    expect(screen.queryByText('usr-admin-42')).not.toBeInTheDocument()
    expect(screen.queryByText('Administrative Scopes')).not.toBeInTheDocument()
    expect(screen.queryByText('Product Catalog & SKU Registry')).not.toBeInTheDocument()
    expect(screen.queryByText('Key Pool Vault Management')).not.toBeInTheDocument()
    expect(screen.queryByText('Bearer / Refresh Rotation')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument()
  })

  it('allows editing full name and phone number and submits form with toast confirmation', async () => {
    const successSpy = vi.spyOn(toast, 'success')
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
      expect(successSpy).toHaveBeenCalledTimes(1)
    })
  })

  it('displays inline FormErrorAlert on 422 profile update error without firing error toast', async () => {
    Element.prototype.scrollIntoView = vi.fn()
    const errorSpy = vi.spyOn(toast, 'error')
    mockUserService.updateProfile.mockRejectedValueOnce(
      new ApiClientError(422, 'VALIDATION_ERROR', 'Invalid phone number format', undefined, undefined, {
        fieldErrors: [{ field: 'phone', message: 'Phone must be E.164 format' }],
      })
    )

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

    const phoneInput = screen.getByLabelText(/phone number/i)
    fireEvent.change(phoneInput, { target: { value: '12345' } })
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Phone must be E.164 format')
    expect(errorSpy).not.toHaveBeenCalled()
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

    const logoutBtn = screen.getByRole('button', { name: /logout/i })
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

    expect(screen.getByRole('heading', { level: 1, name: /الملف الشخصي/i })).toBeInTheDocument()
    expect(screen.getByText('Lead Administrator')).toBeInTheDocument()
  })
})
