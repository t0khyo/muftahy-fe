import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { LoginForm } from './login-form'
import { AuthProvider } from '../context/auth-provider'

function renderLoginForm(initialRoute = '/en/login') {
  const lang = initialRoute.startsWith('/ar') ? 'ar' : 'en'
  i18n.changeLanguage(lang)
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'

  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <Routes>
            <Route path="/:lang/login" element={<LoginForm />} />
            <Route path="/:lang/account/profile" element={<div>Profile Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </I18nextProvider>
  )
}

describe('LoginForm (login-03 adaptation)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the login-03 card structure, Google button, and fields', () => {
    renderLoginForm('/en/login')

    // Card header
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
    expect(screen.getByText(/login with your google account/i)).toBeInTheDocument()

    // Google button present, Apple button hidden
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /login with apple/i })).not.toBeInTheDocument()

    // Field Separator
    expect(screen.getByText(/or continue with/i)).toBeInTheDocument()

    // Email & Password inputs
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('dir', 'ltr')
    expect(passwordInput).toBeInTheDocument()
    expect(passwordInput).toHaveAttribute('dir', 'ltr')
    expect(screen.getByRole('link', { name: /forgot password\?/i })).toBeInTheDocument()

    // Submit button & link to register
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /create an account/i })).toBeInTheDocument()

    // Terms disclaimer
    expect(screen.getByText(/by clicking continue, you agree to our/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument()
  })

  it('renders correctly in Arabic mode', () => {
    renderLoginForm('/ar/login')

    expect(screen.getByText(/مرحبًا بعودتك/i)).toBeInTheDocument()
    expect(screen.getByText(/سجّل الدخول باستخدام حساب Google/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /المتابعة باستخدام Google/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /المتابعة باستخدام Apple/i })).not.toBeInTheDocument()
    expect(screen.getByText(/أو المتابعة عبر/i)).toBeInTheDocument()
    const arEmailInput = screen.getByLabelText(/البريد الإلكتروني/i)
    const arPasswordInput = screen.getByLabelText(/كلمة المرور/i)
    expect(arEmailInput).toBeInTheDocument()
    expect(arEmailInput).toHaveAttribute('dir', 'ltr')
    expect(arPasswordInput).toBeInTheDocument()
    expect(arPasswordInput).toHaveAttribute('dir', 'ltr')
    expect(screen.getByRole('link', { name: /نسيت كلمة المرور؟/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /تسجيل الدخول/i })).toBeInTheDocument()
  })

  it('validates required fields before submitting', async () => {
    renderLoginForm('/en/login')

    const submitBtn = screen.getByRole('button', { name: /sign in/i })
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument()
  })
})
