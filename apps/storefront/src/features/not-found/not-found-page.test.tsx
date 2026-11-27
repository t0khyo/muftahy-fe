import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { NotFoundPage } from './not-found-page'

describe('NotFoundPage', () => {
  it('renders English 404 page with Western digits and expected navigation links', async () => {
    await i18n.changeLanguage('en')
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/en/missing']}>
          <Routes>
            <Route path="/:lang/*" element={<NotFoundPage />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>,
    )

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Browse products' })).toHaveAttribute('href', '/en/products')
    expect(screen.getByRole('button', { name: 'Return home' })).toHaveAttribute('href', '/en')
  })

  it('renders Arabic 404 page with Western digits (404) and Arabic links', async () => {
    await i18n.changeLanguage('ar')
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/ar/missing']}>
          <Routes>
            <Route path="/:lang/*" element={<NotFoundPage />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>,
    )

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'الصفحة غير موجودة' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'تصفح المنتجات' })).toHaveAttribute('href', '/ar/products')
    expect(screen.getByRole('button', { name: 'العودة للرئيسية' })).toHaveAttribute('href', '/ar')
  })
})

