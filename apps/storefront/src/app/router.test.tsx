import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { CatchAllRedirect } from './catch-all-redirect'
import { NotFoundRoute } from '../routes/not-found-route'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location-display">{location.pathname}</div>
}

describe('Storefront routing fallback & 404', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders 404 page for unmatched /en/* routes', async () => {
    await i18n.changeLanguage('en')
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/en/unknown-page']}>
          <Routes>
            <Route path="/:lang/*" element={<NotFoundRoute />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Browse products' })).toHaveAttribute('href', '/en/products')
  })

  it('renders 404 page in Arabic for unmatched /ar/* routes', async () => {
    await i18n.changeLanguage('ar')
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/ar/unknown-page']}>
          <Routes>
            <Route path="/:lang/*" element={<NotFoundRoute />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'الصفحة غير موجودة' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'تصفح المنتجات' })).toHaveAttribute('href', '/ar/products')
  })

  it('redirects unsupported language to device language when supported (en)', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US', 'en'])

    render(
      <MemoryRouter initialEntries={['/fr/something']}>
        <Routes>
          <Route path="/:lang/*" element={<CatchAllRedirect />} />
          <Route path="/en" element={<LocationDisplay />} />
          <Route path="/ar" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('location-display')).toHaveTextContent('/en')
  })

  it('defaults to Arabic when device language is unsupported', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['fr-FR', 'de-DE'])

    render(
      <MemoryRouter initialEntries={['/fr/something']}>
        <Routes>
          <Route path="/:lang/*" element={<CatchAllRedirect />} />
          <Route path="/en" element={<LocationDisplay />} />
          <Route path="/ar" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('location-display')).toHaveTextContent('/ar')
  })
})
