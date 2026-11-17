import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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
  it('renders copyright and theme & language controls in English', () => {
    renderSiteFooter('/en/products')

    // Copyright
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument()

    // Compact language switcher showing 'ع' in English mode
    const langBtn = screen.getByRole('button', { name: /التبديل إلى العربية|switch to arabic/i })
    expect(langBtn).toBeInTheDocument()
    expect(langBtn).toHaveTextContent('ع')

    // Single icon-only theme toggle button
    const themeBtn = screen.getByRole('button', { name: /switch to dark mode|dark/i })
    expect(themeBtn).toBeInTheDocument()
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

  it('renders in Arabic (RTL) with Arabic language toggle button showing EN', () => {
    renderSiteFooter('/ar/products')

    expect(screen.getByText(/جميع الحقوق محفوظة/i)).toBeInTheDocument()
    const langBtn = screen.getByRole('button', { name: /switch to english/i })
    expect(langBtn).toBeInTheDocument()
    expect(langBtn).toHaveTextContent('EN')
    expect(document.documentElement.dir).toBe('rtl')
  })
})

