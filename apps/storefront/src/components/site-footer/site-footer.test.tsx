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

    // Language switcher
    expect(
      screen.getByRole('button', { name: /switch language to العربية/i }),
    ).toBeInTheDocument()

    // Theme switcher buttons
    expect(screen.getByRole('button', { name: /^light$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^dark$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^system$/i })).toBeInTheDocument()
  })

  it('updates theme selection when theme button is clicked', () => {
    renderSiteFooter('/en/products')

    const darkBtn = screen.getByRole('button', { name: /^dark$/i })
    fireEvent.click(darkBtn)
    expect(darkBtn).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    const lightBtn = screen.getByRole('button', { name: /^light$/i })
    fireEvent.click(lightBtn)
    expect(lightBtn).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('renders in Arabic (RTL) with Arabic language toggle button', () => {
    renderSiteFooter('/ar/products')

    expect(screen.getByText(/جميع الحقوق محفوظة/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /switch language to English/i }),
    ).toBeInTheDocument()
    expect(document.documentElement.dir).toBe('rtl')
  })
})

