import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { i18n } from '@workspace/i18n/config'
import { getUserService } from '@workspace/api/factory'
import { ProfilePage } from './profile-page'
import { AuthProvider } from '../../auth/context/auth-provider'

function renderProfilePage(initialRoute = '/en/account/profile') {
  const lang = initialRoute.startsWith('/ar') ? 'ar' : 'en'
  i18n.changeLanguage(lang)
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'

  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={testQueryClient}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <AuthProvider>
            <Routes>
              <Route path="/:lang/account/profile" element={<ProfilePage />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>
  )
}

describe('ProfilePage (Design Taste & API Integration)', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    if (!document.elementFromPoint) {
      document.elementFromPoint = vi.fn().mockReturnValue(null)
    }
    const userService = getUserService('storefront')
    await userService.updateProfile({
      full_name: 'Ahmed Mohamed',
      phone: '01012345678',
    })
  })

  it('renders profile hero, personal details, security card, and shortcuts hub in English', async () => {
    renderProfilePage('/en/account/profile')

    // Wait for mock user profile data to load
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Ahmed Mohamed' })).toBeInTheDocument()
    })

    // Initials fallback
    expect(screen.getByText('AM')).toBeInTheDocument()

    // Verified badge & status
    expect(screen.getByText('Verified Account')).toBeInTheDocument()
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0)

    // Bento Sections
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('Security & Authentication')).toBeInTheDocument()
    expect(screen.getByText('Account Services')).toBeInTheDocument()

    // Email & ID
    expect(screen.getAllByText('customer@example.com').length).toBeGreaterThan(0)
    expect(screen.getByText('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d')).toBeInTheDocument()

    // Shortcuts Hub
    expect(screen.getByText('View Orders')).toBeInTheDocument()
    expect(screen.getByText('Key Vault')).toBeInTheDocument()
    expect(screen.getByText('Customer Support')).toBeInTheDocument()
  })

  it('renders correctly in Arabic RTL', async () => {
    renderProfilePage('/ar/account/profile')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Ahmed Mohamed' })).toBeInTheDocument()
    })

    expect(screen.getByText('حساب موثق')).toBeInTheDocument()
    expect(screen.getByText('البيانات الشخصية')).toBeInTheDocument()
    expect(screen.getByText('الأمان وبيانات تسجيل الدخول')).toBeInTheDocument()
    expect(screen.getByText('خدمات الحساب')).toBeInTheDocument()
  })

  it('switches to edit mode, edits name and phone, and updates successfully', async () => {
    const userService = getUserService('storefront')
    const updateSpy = vi.spyOn(userService, 'updateProfile')

    renderProfilePage('/en/account/profile')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Ahmed Mohamed' })).toBeInTheDocument()
    })

    // Click "Edit Profile"
    const editBtn = screen.getByRole('button', { name: /edit profile/i })
    fireEvent.click(editBtn)

    // Form fields appear
    const nameInput = screen.getByLabelText(/full name/i)
    const phoneInput = screen.getByLabelText(/phone number/i)
    expect(nameInput).toHaveValue('Ahmed Mohamed')

    // Change values
    fireEvent.change(nameInput, { target: { value: 'Ahmed Ali' } })
    fireEvent.change(phoneInput, { target: { value: '01099998888' } })

    // Submit
    const saveBtn = screen.getByRole('button', { name: /save changes/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith({
        full_name: 'Ahmed Ali',
        phone: '01099998888',
      })
    })

    // Success banner appears
    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully.')).toBeInTheDocument()
    })
  })

  it('copies user ID to clipboard when copy button is clicked', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    renderProfilePage('/en/account/profile')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Ahmed Mohamed' })).toBeInTheDocument()
    })

    const copyBtn = screen.getByRole('button', { name: /copy id/i })
    fireEvent.click(copyBtn)

    expect(writeTextMock).toHaveBeenCalledWith('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d')
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
  })

  it('opens Change Password Dialog on clicking Change Password', async () => {
    renderProfilePage('/en/account/profile')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Ahmed Mohamed' })).toBeInTheDocument()
    })

    const changePassBtn = screen.getByRole('button', { name: /change password/i })
    fireEvent.click(changePassBtn)

    await waitFor(() => {
      expect(screen.getByText(/we will send a 6-digit verification code/i)).toBeInTheDocument()
    })

    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^confirm new password$/i)).toBeInTheDocument()
  })

  it('opens Email Verification Dialog on clicking Verify Email', async () => {
    renderProfilePage('/en/account/profile')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Ahmed Mohamed' })).toBeInTheDocument()
    })

    const verifyEmailBtn = screen.getByRole('button', { name: /verify email/i })
    fireEvent.click(verifyEmailBtn)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /verify your email/i })).toBeInTheDocument()
    })
  })
})
