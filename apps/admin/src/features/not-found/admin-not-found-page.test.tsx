import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { AdminNotFoundPage } from './admin-not-found-page'

describe('AdminNotFoundPage', () => {
  it('renders English admin 404 page with dashboard and quick links', async () => {
    await i18n.changeLanguage('en')
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/en/missing']}>
          <Routes>
            <Route path="/:lang/*" element={<AdminNotFoundPage />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>,
    )

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Return to dashboard' })).toHaveAttribute('href', '/en')
    expect(screen.getByRole('button', { name: 'View products' })).toHaveAttribute('href', '/en/products')
    expect(screen.getByRole('link', { name: /Orders/i })).toHaveAttribute('href', '/en/orders')
    expect(screen.getByRole('link', { name: /Inventory/i })).toHaveAttribute('href', '/en/inventory')
    expect(screen.getByRole('link', { name: /Customer Support/i })).toHaveAttribute('href', '/en/tickets')
  })

  it('renders Arabic admin 404 page with Western digits (404)', async () => {
    await i18n.changeLanguage('ar')
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/ar/missing']}>
          <Routes>
            <Route path="/:lang/*" element={<AdminNotFoundPage />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>,
    )

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'الصفحة غير موجودة' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'العودة إلى لوحة التحكم' })).toHaveAttribute('href', '/ar')
    expect(screen.getByRole('button', { name: 'عرض المنتجات' })).toHaveAttribute('href', '/ar/products')
  })
})

