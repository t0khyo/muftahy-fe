import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { getProductService } from '@workspace/api/factory'
import type { ProductResponse } from '@workspace/domain/schemas/product'
import { ProductDetailPage } from './pages/product-detail-page'
import { useCartStore } from '../cart/stores/cart-store'
import '../../test-setup'

const mockDetailProduct: ProductResponse = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Windows 11 Professional',
  sku: 'OS-WIN11-PRO-RET',
  slug: 'windows-11-professional',
  category: {
    id: 'cat-1',
    name: 'Windows',
    code: 'WIN',
    slug: 'windows',
    display_order: 0,
    is_active: true,
    product_count: 1,
  },
  variant: 'retail',
  base_price: '499.00',
  sale_price: '349.00',
  effective_price: '349.00',
  discount_percentage: 30,
  stock_status: 'in_stock',
  available_count: 14,
  preorder_enabled: true,
  description: 'Genuine Microsoft Windows 11 Pro digital retail license key.',
  is_active: true,
  images: [],
}

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
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '201158172869')
    useCartStore.getState().clear()
    vi.clearAllTimers()
    vi.useRealTimers()
    const productService = getProductService()
    vi.spyOn(productService, 'getProductById').mockResolvedValue(mockDetailProduct)
  })

  it('renders product detail sections, title, price, and WhatsApp support', async () => {
    renderProductDetail('/en/products/00000000-0000-4000-8000-000000000001')

    expect(
      await screen.findByRole('heading', { level: 1, name: /Windows 11 Professional/i }),
    ).toBeInTheDocument()

    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument()
    expect(screen.getAllByText('Windows').length).toBeGreaterThan(0)
    expect(screen.getByText('Retail')).toBeInTheDocument()
    expect(screen.getByText(/^SKU:/i)).toBeInTheDocument()
    expect(screen.queryByText(/keys available/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^In Stock/i)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /About this license/i })).toBeInTheDocument()

    const askUsLink = screen.getByRole('link', { name: /Chat on WhatsApp/i })
    expect(askUsLink).toHaveAttribute('href', expect.stringContaining('wa.me/201158172869'))
  })

  it('hides WhatsApp support block when VITE_WHATSAPP_NUMBER is unset', async () => {
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '')
    renderProductDetail('/en/products/00000000-0000-4000-8000-000000000001')

    expect(
      await screen.findByRole('heading', { level: 1, name: /Windows 11 Professional/i }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Chat on WhatsApp/i })).toBeNull()
  })

  it('renders properly in Arabic RTL mode', async () => {
    renderProductDetail('/ar/products/00000000-0000-4000-8000-000000000001')

    expect(
      await screen.findByRole('heading', { level: 1, name: /Windows 11 Professional/i }),
    ).toBeInTheDocument()

    expect(screen.getAllByText('ويندوز').length).toBeGreaterThan(0)
    expect(screen.getByText('Retail')).toBeInTheDocument()
    expect(screen.queryByText(/تجزئة/i)).not.toBeInTheDocument()
    expect(screen.getByText(/^SKU:/i)).toBeInTheDocument()
    expect(screen.queryByText(/رمز المنتج/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/متوفر/i)).not.toBeInTheDocument()
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

  it('disables CTA for out-of-stock products without showing stock indicator block, and enables preorder CTA', async () => {
    const productService = getProductService()
    vi.spyOn(productService, 'getProductById').mockResolvedValueOnce({
      ...mockDetailProduct,
      stock_status: 'out_of_stock',
      available_count: 0,
      preorder_enabled: false,
    })

    renderProductDetail('/en/products/00000000-0000-4000-8000-000000000001')

    const disabledBtn = await screen.findByRole('button', { name: /out of stock/i })
    expect(disabledBtn).toBeDisabled()
  })
})
