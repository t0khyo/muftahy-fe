import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
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
            <Route path="/:lang/products/:slug" element={<ProductDetailPage />} />
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

  it('renders product detail sections, title, specs, and related rail', async () => {
    renderProductDetail('/en/products/windows-11-pro')

    // Title
    expect(await screen.findByRole('heading', { level: 1, name: /Windows 11 Professional/i })).toBeInTheDocument()

    // Breadcrumb
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument()

    // Plan picker for multi-plan product
    expect(screen.getByText(/Choose a plan/i)).toBeInTheDocument()
    expect(screen.getByText(/1 PC License/i)).toBeInTheDocument()
    expect(screen.getByText(/5 PCs Family/i)).toBeInTheDocument()

    // Sections
    expect(screen.getByRole('heading', { level: 2, name: /What you get/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Activation steps/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Product details/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Common questions/i })).toBeInTheDocument()

    // Specs table values
    expect(screen.getByText(/Retail \/ Digital/i)).toBeInTheDocument()

    // WhatsApp Ask us link
    const askUsLink = screen.getByRole('link', { name: /Not sure this works for you\? Ask us/i })
    expect(askUsLink).toHaveAttribute('href', expect.stringContaining('wa.me/201158172869'))
  })

  it('renders properly in Arabic RTL mode', async () => {
    renderProductDetail('/ar/products/windows-11-pro')

    // Arabic title
    expect(await screen.findByRole('heading', { level: 1, name: /ويندوز 11/i })).toBeInTheDocument()

    // Arabic plan picker label
    expect(screen.getByText(/اختر الخطة/i)).toBeInTheDocument()

    // Arabic sections
    expect(screen.getByRole('heading', { level: 2, name: /ما ستحصل عليه/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /خطوات التفعيل/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /تفاصيل المنتج/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /أسئلة شائعة/i })).toBeInTheDocument()
  })

  it('hides plan picker when product has only one plan', async () => {
    renderProductDetail('/en/products/cyberpunk-2077')

    expect(await screen.findByRole('heading', { level: 1, name: /Cyberpunk 2077/i })).toBeInTheDocument()
    expect(screen.queryByText(/Choose a plan/i)).not.toBeInTheDocument()
  })

  it('normalizes missing plan query to default in-stock plan', async () => {
    renderProductDetail('/en/products/windows-11-pro')

    // Windows 11 default is 1-pc (650.00 EGP)
    expect(await screen.findByRole('heading', { level: 1, name: /Windows 11 Professional/i })).toBeInTheDocument()
    expect(screen.getAllByText(/650\.00/).length).toBeGreaterThan(0)
  })

  it('switches plan when specified in URL or selected', async () => {
    renderProductDetail('/en/products/windows-11-pro?plan=5-pc')

    // 5 PCs plan price is 2,400.00 EGP
    expect(await screen.findByRole('heading', { level: 1, name: /Windows 11 Professional/i })).toBeInTheDocument()
    expect(screen.getAllByText(/2,400\.00/).length).toBeGreaterThan(0)
  })

  it('disables purchase action and shows out-of-stock for unavailable plan', async () => {
    renderProductDetail('/en/products/playstation-network-card-100-sar')

    expect(await screen.findByRole('heading', { level: 1, name: /PlayStation Store/i })).toBeInTheDocument()

    const outOfStockBtn = screen.getByRole('button', { name: /Out of stock/i })
    expect(outOfStockBtn).toBeDisabled()

    // Region restriction note
    expect(screen.getByText(/Saudi Arabia region/i)).toBeInTheDocument()
  })

  it('adds plan to cart, provides transient feedback, and shows in-cart status', async () => {
    renderProductDetail('/en/products/windows-11-pro?plan=1-pc')

    const addBtn = await screen.findByRole('button', { name: /Add to cart/i })
    expect(addBtn).toBeInTheDocument()

    vi.useFakeTimers()

    // Click Add to cart
    fireEvent.click(addBtn)

    // Store updated
    expect(useCartStore.getState().items.length).toBe(1)
    expect(useCartStore.getState().items[0].planId).toBe('plan-w11-1pc')

    // Visual feedback: Added!
    expect(screen.getByRole('button', { name: /Added/i })).toBeInTheDocument()

    // Advance timer by 2 seconds
    act(() => {
      vi.advanceTimersByTime(2100)
    })

    // Transitions to "In your cart"
    expect(screen.getByText(/In your cart/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View cart/i })).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('navigates to cart when clicking in-your-cart button', async () => {
    // Pre-populate cart
    useCartStore.getState().addItem({
      id: 'prod-001:plan-w11-1pc',
      productId: 'prod-001',
      planId: 'plan-w11-1pc',
      slug: 'windows-11-pro',
      name: 'Windows 11 Pro',
      priceMinor: 65000,
      currency: 'EGP',
    })

    renderProductDetail('/en/products/windows-11-pro?plan=1-pc')

    const inCartBtn = await screen.findByRole('button', { name: /In your cart/i })
    fireEvent.click(inCartBtn)

    expect(screen.getByText('Cart Destination Page')).toBeInTheDocument()
  })

  it('renders not-found view for unknown product slug', async () => {
    renderProductDetail('/en/products/non-existent-product')

    expect(await screen.findByText(/We couldn't find this product/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Browse products/i })).toBeInTheDocument()
  })
})
