import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import * as useAdminAuthModule from '../hooks/use-admin-auth'
import { AdminLoginForm } from './admin-login-form'

describe('AdminLoginForm', () => {
  const mockLogin = vi.fn()

  beforeEach(() => {
    vi.restoreAllMocks()
    mockLogin.mockReset()
    vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      isAuthenticated: false,
      isLoading: false,
      user: null,
    } as unknown as ReturnType<typeof useAdminAuthModule.useAdminAuth>)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function renderLogin() {
    return render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/en/login']}>
          <Routes>
            <Route path="/:lang/login" element={<AdminLoginForm />} />
            <Route path="/:lang" element={<div>Dashboard Home</div>} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    )
  }

  it('displays localized permission denied alert for non-admin token errors', async () => {
    mockLogin.mockRejectedValueOnce(
      new ApiClientError(403, 'PERMISSION_DENIED', 'Access denied: not an administrator token')
    )

    renderLogin()

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'operator@muftahy.test' },
    })
    fireEvent.change(screen.getByPlaceholderText(/••••••••|password/i), {
      target: { value: 'OperatorPass123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toBeInTheDocument()
  })

  it('displays localized authentication failed alert on invalid credentials', async () => {
    mockLogin.mockRejectedValueOnce(
      new ApiClientError(401, 'AUTHENTICATION_FAILED', 'Invalid email or password')
    )

    renderLogin()

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'operator@muftahy.test' },
    })
    fireEvent.change(screen.getByPlaceholderText(/••••••••|password/i), {
      target: { value: 'WrongPassword123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(i18n.t('auth:errors.AUTHENTICATION_FAILED'))
  })

  it('locks submit button with a live retry countdown on 429 RATE_LIMIT_EXCEEDED', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockLogin.mockRejectedValueOnce(
      new ApiClientError(429, 'RATE_LIMIT_EXCEEDED', 'Too many requests', undefined, 5)
    )

    renderLogin()

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'operator@muftahy.test' },
    })
    fireEvent.change(screen.getByPlaceholderText(/••••••••|password/i), {
      target: { value: 'OperatorPass123!' },
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    })

    expect(screen.getByRole('alert')).toBeInTheDocument()
    const disabledButton = await screen.findByRole('button', { name: /5/ })
    expect(disabledButton).toBeDisabled()

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled()
    })
  })
})
