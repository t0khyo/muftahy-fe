import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { LanguageSwitcher } from '../components/language-switcher'
import { CatchAllRedirect } from './catch-all-redirect'
import { NotFoundRoute } from '../routes/not-found-route'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location-display">{location.pathname}</div>
}

function SwitchProbe() {
  const { t } = useTranslation('notFound')
  const location = useLocation()
  return (
    <div>
      <LanguageSwitcher />
      <span data-testid="probe-title">{t('title')}</span>
      <span data-testid="probe-path">{location.pathname}</span>
    </div>
  )
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

  it('synchronously updates i18n language, document dir, and translated text when switching language', async () => {
    await i18n.changeLanguage('en')
    document.documentElement.lang = 'en'
    document.documentElement.dir = 'ltr'

    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/en/products']}>
          <Routes>
            <Route path="/:lang/*" element={<SwitchProbe />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>,
    )

    expect(screen.getByTestId('probe-title')).toHaveTextContent('Page not found')
    fireEvent.click(screen.getByRole('button', { name: 'التبديل إلى العربية' }))

    expect(document.documentElement.lang).toBe('ar')
    expect(document.documentElement.dir).toBe('rtl')
    expect(screen.getByTestId('probe-path')).toHaveTextContent('/ar/products')
    expect(screen.getByTestId('probe-title')).toHaveTextContent('الصفحة غير موجودة')
  })
})
