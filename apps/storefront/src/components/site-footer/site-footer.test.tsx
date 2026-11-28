import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { ThemeProvider } from '../../app/theme-provider'
import { SiteFooter } from './site-footer'

function renderSiteFooter(initialRoute = '/en/products') {
  i18n.changeLanguage(initialRoute.startsWith('/ar') ? 'ar' : 'en')
  document.documentElement.lang = initialRoute.startsWith('/ar') ? 'ar' : 'en'
  document.documentElement.dir = initialRoute.startsWith('/ar') ? 'rtl' : 'ltr'

  return render(
    <ThemeProvider defaultTheme="light">
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/:lang/*" element={<SiteFooter />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    </ThemeProvider>,
  )
}

describe('SiteFooter Component', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '201158172869')
    vi.stubEnv('VITE_SOCIAL_INSTAGRAM_URL', 'https://instagram.com/muftahy')
    vi.stubEnv('VITE_SOCIAL_FACEBOOK_URL', 'https://facebook.com/muftahy')
    vi.stubEnv('VITE_SOCIAL_HANDLE', '@muftahy')
    vi.stubEnv('VITE_SUPPORT_EMAIL', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('renders copyright and theme & language controls in English', () => {
    renderSiteFooter('/en/products')

    // Horizontal LTR logo
    expect(document.querySelector('img[src="/logo-horizontal-ltr.svg"]')).toBeInTheDocument()

    // Copyright
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument()

    // Compact language switcher showing 'ع' in English mode
    const langBtn = screen.getByRole('button', { name: /التبديل إلى العربية|switch to arabic/i })
    expect(langBtn).toBeInTheDocument()
    expect(langBtn).toHaveTextContent('ع')

    // Single icon-only theme toggle button
    const themeBtn = screen.getByRole('button', { name: /switch to dark mode|dark/i })
    expect(themeBtn).toBeInTheDocument()

    // Payment method logos with localized accessible labels
    expect(screen.getByRole('group', { name: /accepted payment methods/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Vodafone Cash' }).getAttribute('src')).toMatch(
      /vodafone-cash/,
    )
    expect(screen.getByRole('img', { name: 'InstaPay' }).getAttribute('src')).toMatch(/instapay/)
  })

  it('renders RTL horizontal logo in Arabic mode', () => {
    renderSiteFooter('/ar/products')
    expect(document.querySelector('img[src="/logo-horizontal-rtl.svg"]')).toBeInTheDocument()
  })

  it('updates theme selection when theme button is clicked', () => {
    renderSiteFooter('/en/products')

    const themeBtn = screen.getByRole('button', { name: /switch to dark mode|dark/i })
    fireEvent.click(themeBtn)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    // After switching to dark mode, button allows switching to light mode
    const lightThemeBtn = screen.getByRole('button', { name: /switch to light mode|light/i })
    fireEvent.click(lightThemeBtn)
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('renders WhatsApp contact link and does NOT render call button', () => {
    renderSiteFooter('/en/products')

    // Phone call button is deleted
    expect(screen.queryByRole('link', { name: /call us|اتصل بنا/i })).toBeNull()

    // WhatsApp direct contact button
    const whatsappLink = screen.getByRole('link', { name: /chat on whatsapp/i })
    expect(whatsappLink).toBeInTheDocument()
    expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/201158172869')
  })

  it('renders social media links for Instagram, Facebook and WhatsApp with @muftahy', () => {
    renderSiteFooter('/en/products')

    const instagramLink = screen.getByRole('link', { name: /instagram @muftahy/i })
    expect(instagramLink).toBeInTheDocument()
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/muftahy')

    const facebookLink = screen.getByRole('link', { name: /facebook @muftahy/i })
    expect(facebookLink).toBeInTheDocument()
    expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/muftahy')

    expect(screen.getByText('@muftahy')).toBeInTheDocument()
  })

  it('renders category and support navigation in a 2-column mobile grid', () => {
    renderSiteFooter('/en/products')

    const navColumns = screen.getByTestId('footer-nav-columns')
    expect(navColumns).toBeInTheDocument()
    expect(navColumns.className).toContain('grid-cols-2')

    expect(screen.getByRole('heading', { name: /categories/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /support & help/i })).toBeInTheDocument()

    const softwareLink = screen.getByRole('link', { name: /software/i })
    expect(softwareLink).toHaveAttribute('href', '/en/products?category=software')

    const subscriptionsLink = screen.getByRole('link', { name: /subscriptions/i })
    expect(subscriptionsLink).toHaveAttribute('href', '/en/products?category=subscriptions')
  })

  it('renders in Arabic (RTL) with Arabic language toggle button showing EN and Arabic translations', () => {
    renderSiteFooter('/ar/products')

    expect(screen.getByText(/جميع الحقوق محفوظة/i)).toBeInTheDocument()
    const langBtn = screen.getByRole('button', { name: /switch to english/i })
    expect(langBtn).toBeInTheDocument()
    expect(langBtn).toHaveTextContent('EN')
    expect(document.documentElement.dir).toBe('rtl')

    // Arabic categories & headings
    expect(screen.getByRole('heading', { name: /الأقسام/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /الدعم والمساعدة/i })).toBeInTheDocument()

    // Arabic WhatsApp button
    expect(screen.getByRole('link', { name: /راسلنا عبر واتساب/i })).toHaveAttribute(
      'href',
      'https://wa.me/201158172869',
    )

    // Arabic payment method logos
    expect(screen.getByRole('group', { name: /وسائل الدفع المتاحة/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'فودافون كاش' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'إنستاباي' })).toBeInTheDocument()
  })

  it('hides WhatsApp and social links when env vars are unset and shows support email when configured', () => {
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '')
    vi.stubEnv('VITE_SOCIAL_INSTAGRAM_URL', '')
    vi.stubEnv('VITE_SOCIAL_FACEBOOK_URL', '')
    vi.stubEnv('VITE_SOCIAL_HANDLE', '')
    vi.stubEnv('VITE_SUPPORT_EMAIL', 'support@example.com')

    renderSiteFooter('/en/products')

    expect(screen.queryByRole('link', { name: /chat on whatsapp/i })).toBeNull()
    expect(screen.queryByRole('link', { name: /instagram/i })).toBeNull()
    expect(screen.queryByRole('link', { name: /facebook/i })).toBeNull()
    expect(screen.queryByText('@muftahy')).toBeNull()

    const emailLink = screen.getByRole('link', { name: 'support@example.com' })
    expect(emailLink).toHaveAttribute('href', 'mailto:support@example.com')
  })
})
