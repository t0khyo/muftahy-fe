import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { RegisterForm } from './register-form'
import { AuthProvider } from '../context/auth-provider'

function renderRegisterForm(initialRoute = '/en/register') {
  const lang = initialRoute.startsWith('/ar') ? 'ar' : 'en'
  i18n.changeLanguage(lang)
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'

  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <Routes>
            <Route path="/:lang/register" element={<RegisterForm />} />
            <Route path="/:lang/login" element={<div>Login Page</div>} />
            <Route path="/:lang/account/profile" element={<div>Profile Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </I18nextProvider>
  )
}

describe('RegisterForm (signup-03 adaptation with Google Sign Up)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Google sign-up button, separator, responsive password grid, and disclaimer', () => {
    renderRegisterForm('/en/register')

    // Card header
    expect(screen.getByText(/^create your account$/i)).toBeInTheDocument()
    expect(screen.getByText(/enter your details below to create your account/i)).toBeInTheDocument()

    // Google Sign Up button present, Apple button absent
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /apple/i })).not.toBeInTheDocument()

    // Separator
    expect(screen.getByText(/or continue with/i)).toBeInTheDocument()

    // Form inputs
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByText(/must be at least 8 characters long/i)).toBeInTheDocument()

    // Submit button & link to sign in
    expect(screen.getByRole('button', { name: /create an account/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()

    // Terms disclaimer
    expect(screen.getByText(/by clicking continue, you agree to our/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument()
  })

  it('renders correctly in Arabic mode', () => {
    renderRegisterForm('/ar/register')

    expect(screen.getByText(/^إنشاء حسابك$/i)).toBeInTheDocument()
    expect(screen.getByText(/أدخل بياناتك أدناه لإنشاء حسابك/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /المتابعة باستخدام Google/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /apple/i })).not.toBeInTheDocument()
    expect(screen.getByText(/أو المتابعة عبر/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/الاسم بالكامل/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/البريد الإلكتروني/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^كلمة المرور/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/تأكيد كلمة المرور/i)).toBeInTheDocument()
    expect(screen.getByText(/يجب أن تتكون كلمة المرور من 8 أحرف على الأقل/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /إنشاء حساب جديد/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /تسجيل الدخول/i })).toBeInTheDocument()
  })

  it('validates password mismatch on submission', async () => {
    renderRegisterForm('/en/register')

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Password123!' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'DifferentPassword!' } })

    const submitBtn = screen.getByRole('button', { name: /create an account/i })
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
  })
})
