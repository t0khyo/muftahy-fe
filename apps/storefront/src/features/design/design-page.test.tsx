import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter } from 'react-router'
import { i18n } from '@workspace/i18n/config'
import { ThemeProvider } from '../../app/theme-provider'
import { ThemeToggle } from '../../components/theme-toggle'
import { DesignPage } from './design-page'

function renderDesignPage(lang: 'en' | 'ar' = 'en') {
  i18n.changeLanguage(lang)
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'

  return render(
    <ThemeProvider defaultTheme="system">
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <DesignPage />
        </MemoryRouter>
      </I18nextProvider>
    </ThemeProvider>,
  )
}

describe('DesignPage', () => {
  it('renders design system elements in English', () => {
    renderDesignPage('en')

    // Headings & Typography
    expect(screen.getByRole('heading', { level: 1, name: /design system/i })).toBeInTheDocument()
    expect(screen.getAllByText(/the quick brown fox/i).length).toBeGreaterThan(0)

    // Buttons
    expect(screen.getByRole('button', { name: /^primary$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^secondary$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^outline$/i })).toBeInTheDocument()

    // Form controls
    expect(screen.getByLabelText(/license key/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/region/i)).toBeInTheDocument()

    // Alerts
    expect(screen.getByText(/secure delivery/i)).toBeInTheDocument()
    expect(screen.getByText(/invalid code/i)).toBeInTheDocument()

    // Table
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Windows 11 Pro Retail')).toBeInTheDocument()
    expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument()

    // Product Cards (Template Showcase)
    expect(
      screen.getByRole('heading', { level: 2, name: /product cards/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('Canva Pro - Direct Activation')).toBeInTheDocument()
    expect(screen.getByText('Google AI Pro (Gemini Advanced)')).toBeInTheDocument()
    expect(screen.getByText('Microsoft 365 Family / Personal')).toBeInTheDocument()
  })

  it('renders design system elements in Arabic (RTL) with Western digits', () => {
    renderDesignPage('ar')

    expect(screen.getByRole('heading', { level: 1, name: /نظام التصميم/i })).toBeInTheDocument()
    expect(screen.getAllByText(/مفتاحي لتجارة المفاتيح/i).length).toBeGreaterThan(0)
    expect(document.documentElement.dir).toBe('rtl')

    // Must use Western digits 0-9
    expect(screen.getAllByText(/1234567890/).length).toBeGreaterThan(0)

    // Product Cards in Arabic
    expect(
      screen.getByRole('heading', { level: 2, name: /بطاقات المنتجات/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('كانفا برو - تفعيل مباشر')).toBeInTheDocument()
    expect(screen.getByText('جوجل AI برو (جيميني أدفانسد)')).toBeInTheDocument()
    expect(screen.getByText('مايكروسوفت 365 عائلي / شخصي')).toBeInTheDocument()
  })
})

describe('ThemeToggle (toggle light and dark)', () => {
  it('toggles between light and dark modes on click', () => {
    i18n.changeLanguage('en')
    render(
      <ThemeProvider defaultTheme="light">
        <I18nextProvider i18n={i18n}>
          <ThemeToggle />
        </I18nextProvider>
      </ThemeProvider>,
    )

    const toggleBtn = screen.getByRole('button', { name: /toggle theme/i })
    expect(toggleBtn).toBeInTheDocument()
    expect(toggleBtn).toHaveAttribute('aria-label', expect.stringContaining('Dark'))

    // 1st click: light -> dark
    fireEvent.click(toggleBtn)
    expect(toggleBtn).toHaveAttribute('aria-label', expect.stringContaining('Light'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    // 2nd click: dark -> light
    fireEvent.click(toggleBtn)
    expect(toggleBtn).toHaveAttribute('aria-label', expect.stringContaining('Dark'))
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })
})
