import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { i18n } from '@workspace/i18n/config'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import * as apiFactory from '@workspace/api/factory'
import type { AdminProfileService } from '@workspace/api/services/admin-profile-service'
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

describe('AdminProfileRoute Workstation', () => {
  let testQueryClient: QueryClient
  const mockLogout = vi.fn().mockResolvedValue(undefined)
  const mockRefreshProfile = vi.fn().mockResolvedValue(undefined)

  const mockAdmin = {
    id: 'b8c4e120-5e77-4f8b-8b0c-1234567890ab',
    email: 'operator@souqmuftah.com',
    display_name: 'Lead Administrator',
    role: 'admin',
    is_active: true,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-11-26T14:30:00Z',
  }

  const mockAdminProfileService = {
    getMyProfile: vi.fn().mockResolvedValue(mockAdmin),
    updateMyProfile: vi.fn().mockImplementation((payload) =>
      Promise.resolve({ ...mockAdmin, ...payload }),
    ),
    listAdmins: vi.fn().mockResolvedValue([mockAdmin]),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAdminProfileService.getMyProfile.mockReset().mockResolvedValue(mockAdmin)
    mockAdminProfileService.updateMyProfile
      .mockReset()
      .mockImplementation((payload) => Promise.resolve({ ...mockAdmin, ...payload }))
    i18n.changeLanguage('en')
    testQueryClient = createAdminQueryClient()

    vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
      user: mockAdmin,
      role: 'admin',
      isAuthenticated: true,
      isLoading: false,
      isInitializing: false,
      login: vi.fn(),
      logout: mockLogout,
      refreshProfile: mockRefreshProfile,
    })

    vi.spyOn(apiFactory, 'getAdminProfileService').mockReturnValue(
      mockAdminProfileService as unknown as AdminProfileService,
    )
  })

  afterEach(() => {
    i18n.changeLanguage('en')
  })

  it('renders admin display_name and read-only email without phone or OTP fields', async () => {
    render(
      <I18nProvider>
        <QueryClientProvider client={testQueryClient}>
          <MemoryRouter initialEntries={['/en/profile']}>
            <Routes>
              <Route path="/:lang/profile" element={<AdminProfileRoute />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </I18nProvider>,
    )

    expect(screen.getByRole('heading', { level: 1, name: /^profile$/i })).toBeInTheDocument()
    expect(screen.getByText('Lead Administrator')).toBeInTheDocument()
    expect(screen.getByText('operator@souqmuftah.com')).toBeInTheDocument()
    expect(screen.getByText('System Administrator')).toBeInTheDocument()

    expect(screen.getByLabelText(/display name/i)).toHaveValue('Lead Administrator')
    const emailInput = screen.getByLabelText(/email address/i)
    expect(emailInput).toHaveValue('operator@souqmuftah.com')
    expect(emailInput).toBeDisabled()

    expect(screen.queryByLabelText(/phone/i)).not.toBeInTheDocument()
  })

  it('updates display_name via PATCH /admin/me without OTP and shows success toast', async () => {
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
      </I18nProvider>,
    )

    const nameInput = screen.getByLabelText(/display name/i)
    fireEvent.change(nameInput, { target: { value: '  Updated  Lead Admin  ' } })

    const saveBtn = screen.getByRole('button', { name: /save changes/i })
    expect(saveBtn).not.toBeDisabled()

    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockAdminProfileService.updateMyProfile).toHaveBeenCalledWith({
        display_name: 'Updated Lead Admin',
      })
      expect(mockRefreshProfile).toHaveBeenCalled()
      expect(successSpy).toHaveBeenCalledTimes(1)
    })
  })

  it('displays inline FormErrorAlert on 422 validation error without firing error toast', async () => {
    Element.prototype.scrollIntoView = vi.fn()
    const errorSpy = vi.spyOn(toast, 'error')
    mockAdminProfileService.updateMyProfile.mockRejectedValueOnce(
      new ApiClientError(422, 'VALIDATION_ERROR', 'Display name rejected by server', undefined, undefined, {
        fieldErrors: [{ field: 'display_name', message: 'Display name rejected by server' }],
      }),
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
      </I18nProvider>,
    )

    const nameInput = screen.getByLabelText(/display name/i)
    fireEvent.change(nameInput, { target: { value: 'Valid Server Test' } })
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Display name rejected by server')
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
      </I18nProvider>,
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
      </I18nProvider>,
    )

    expect(screen.getByRole('heading', { level: 1, name: /الملف الشخصي/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/الاسم الظاهر/i)).toHaveValue('Lead Administrator')
  })
})
