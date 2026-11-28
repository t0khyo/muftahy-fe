import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { ThemeProvider } from '../../../app/theme-provider'
import { SidebarProvider } from '@workspace/ui/components/sidebar'
import { SiteHeader } from './site-header'

function renderWithProviders(initialPath: string) {
  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <SidebarProvider>
          <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
              <Route path="/:lang" element={<SiteHeader />} />
              <Route path="/:lang/*" element={<SiteHeader />} />
            </Routes>
          </MemoryRouter>
        </SidebarProvider>
      </ThemeProvider>
    </I18nextProvider>,
  )
}

describe('SiteHeader Breadcrumbs', () => {
  it('renders Dashboard as root and only page item at /en without Muftahy', () => {
    renderWithProviders('/en')

    // Muftahy should not be in the breadcrumbs
    expect(screen.queryByText('Muftahy')).not.toBeInTheDocument()

    // Dashboard should be present as the current page
    const dashboardItem = screen.getByText('Dashboard')
    expect(dashboardItem).toBeInTheDocument()
    expect(dashboardItem.closest('a')).toBeNull() // It's a BreadcrumbPage, not a link
  })

  it('renders Dashboard as link and Products as current page at /en/products without Muftahy', () => {
    renderWithProviders('/en/products')

    // Muftahy should not be in the breadcrumbs
    expect(screen.queryByText('Muftahy')).not.toBeInTheDocument()

    // Dashboard should be a link pointing to /en
    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' })
    expect(dashboardLink).toBeInTheDocument()
    expect(dashboardLink).toHaveAttribute('href', '/en')

    // Products should be the active page
    expect(screen.getByText('Products')).toBeInTheDocument()
  })

  it('renders in Arabic at /ar/products without Muftahy', async () => {
    await i18n.changeLanguage('ar')
    renderWithProviders('/ar/products')

    expect(screen.queryByText('Muftahy')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'لوحة التحكم' })).toHaveAttribute('href', '/ar')
    expect(screen.getByText('المنتجات')).toBeInTheDocument()
    await i18n.changeLanguage('en')
  })

  it('preserves the current sub-route in the language switcher link', async () => {
    await i18n.changeLanguage('en')
    renderWithProviders('/en/settings?tab=social')

    const switcher = screen.getByRole('button', { name: 'العربية' })
    expect(switcher).toHaveAttribute('href', '/ar/settings?tab=social')
  })
})
