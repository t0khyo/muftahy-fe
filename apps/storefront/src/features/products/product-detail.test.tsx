import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { ProductDetailPage } from './pages/product-detail-page'
import { useCartStore } from '../cart/stores/cart-store'
import '../../test-setup'

function renderProductDetail(initialEntry: string, queryClient?: QueryClient) {
  const lang = initialEntry.startsWith('/ar') ? 'ar' : 'en'
  i18n.changeLanguage(lang)
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'

  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    })

  return render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/:lang/products/:id" element={<ProductDetailPage />} />
            <Route path="/:lang/cart" element={<div>Cart Destination Page</div>} />
            <Route path="/:lang/products" element={<div>Products Listing Page</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </I18nextProvider>,
  )
}

describe('ProductDetailPage', () => {
  beforeEach(() => {
    useCartStore.getState().clear()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('renders product detail sections, title, price, and WhatsApp support', async () => {
    renderProductDetail('/en/products/00000000-0000-4000-8000-000000000001')

    expect(
      await screen.findByRole('heading', { level: 1, name: /Windows 11 Professional/i }),
    ).toBeInTheDocument()

    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument()
    expect(screen.getAllByText('Windows').length).toBeGreaterThan(0)
    expect(screen.getByText('Retail')).toBeInTheDocument()
    expect(screen.getByText('In Stock (14 keys available)')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /About this license/i })).toBeInTheDocument()

    const askUsLink = screen.getByRole('link', { name: /Chat on WhatsApp/i })
    expect(askUsLink).toHaveAttribute('href', expect.stringContaining('wa.me/201158172869'))
  })

  it('renders properly in Arabic RTL mode', async () => {
    renderProductDetail('/ar/products/00000000-0000-4000-8000-000000000001')

    expect(
      await screen.findByRole('heading', { level: 1, name: /Windows 11 Professional/i }),
    ).toBeInTheDocument()

    expect(screen.getAllByText('ويندوز').length).toBeGreaterThan(0)
    expect(screen.getByText(/حول الترخيص/i)).toBeInTheDocument()
    expect(screen.getByText(/التسليم والتفعيل/i)).toBeInTheDocument()
    expect(document.documentElement.dir).toBe('rtl')
  })

  it('adds item to cart on button click and allows navigating to cart', async () => {
    renderProductDetail('/en/products/00000000-0000-4000-8000-000000000001')

    const button = await screen.findByRole('button', { name: /Add to Cart/i })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)

    expect(screen.getByText('Added!')).toBeInTheDocument()
    expect(useCartStore.getState().items.length).toBe(1)
    expect(useCartStore.getState().items[0].product_name).toBe('Windows 11 Professional')
  })
})
