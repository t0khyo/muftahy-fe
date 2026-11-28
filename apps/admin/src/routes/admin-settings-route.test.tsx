import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import * as apiFactory from '@workspace/api/factory'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import type { SettingsService } from '@workspace/api/services/settings-service'
import type { AdminSettingsResponse } from '@workspace/domain/schemas/settings'
import { createAdminQueryClient } from '../app/query-client'
import * as useAdminAuthModule from '../features/auth/hooks/use-admin-auth'
import { AdminSettingsRoute } from './admin-settings-route'

const mockSettings: AdminSettingsResponse = {
  whatsapp_number: '201158172869',
  support_email: 'support@muftahy.com',
  social_handle: '@muftahy',
  social_links: {
    instagram: 'https://instagram.com/muftahy',
    facebook: 'https://facebook.com/muftahy',
    x: null,
    tiktok: null,
    youtube: null,
    discord: null,
  },
  updated_at: '2026-11-28T10:00:00Z',
  updated_by: {
    id: 'admin-1',
    display_name: 'Lead Admin',
    email: 'admin@muftahy.com',
  },
}

function renderAdminSettings(initialEntry = '/en/settings') {
  const lang = initialEntry.startsWith('/ar') ? 'ar' : 'en'
  i18n.changeLanguage(lang)
  const queryClient = createAdminQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/:lang/settings" element={<AdminSettingsRoute />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  )
}

describe('AdminSettingsRoute', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
      user: {
        id: 'admin-1',
        email: 'admin@muftahy.com',
        display_name: 'Lead Admin',
        role: 'admin',
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      role: 'admin',
      isAuthenticated: true,
      isLoading: false,
      isInitializing: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
    })
  })

  it('renders current settings and submits updates with cleared fields converted to null', async () => {
    const getAdminSettings = vi.fn().mockResolvedValue(mockSettings)
    const updateAdminSettings = vi.fn().mockResolvedValue({
      ...mockSettings,
      support_email: null,
      whatsapp_number: '201001234567',
    })
    vi.spyOn(apiFactory, 'getSettingsService').mockReturnValue({
      getPublicSettings: vi.fn(),
      getAdminSettings,
      updateAdminSettings,
    } as unknown as SettingsService)

    renderAdminSettings('/en/settings')

    const whatsappInput = await screen.findByLabelText('WhatsApp Number')
    expect(whatsappInput).toHaveValue('201158172869')
    expect(screen.getByText(/Lead Admin/)).toBeInTheDocument()

    const emailInput = screen.getByLabelText('Support Email')
    fireEvent.change(whatsappInput, { target: { value: '+20 100-123-4567' } })
    fireEvent.change(emailInput, { target: { value: '   ' } })

    const saveButton = screen.getByRole('button', { name: 'Save Settings' })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(updateAdminSettings).toHaveBeenCalledWith({
        whatsapp_number: '201001234567',
        support_email: null,
        social_handle: '@muftahy',
        social_links: {
          instagram: 'https://instagram.com/muftahy',
          facebook: 'https://facebook.com/muftahy',
          x: null,
          tiktok: null,
          youtube: null,
          discord: null,
        },
      })
    })
  })

  it('renders in Arabic and displays inline FormErrorAlert on 422 backend error', async () => {
    const getAdminSettings = vi.fn().mockResolvedValue(mockSettings)
    const updateAdminSettings = vi.fn().mockRejectedValue(
      new ApiClientError(422, 'VALIDATION_ERROR', 'Validation failed', {
        fieldErrors: [{ field: 'instagram', message: 'Invalid social link hostname' }],
      }),
    )
    vi.spyOn(apiFactory, 'getSettingsService').mockReturnValue({
      getPublicSettings: vi.fn(),
      getAdminSettings,
      updateAdminSettings,
    } as unknown as SettingsService)

    renderAdminSettings('/ar/settings')

    const whatsappInput = await screen.findByLabelText('رقم واتساب')
    fireEvent.change(whatsappInput, { target: { value: '201158172860' } })
    fireEvent.click(screen.getByRole('button', { name: 'حفظ الإعدادات' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'يرجى التحقق من الحقول المطلوبة وإعادة المحاولة.',
    )
  })
})

