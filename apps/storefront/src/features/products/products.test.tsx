import * as React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter } from 'react-router'
import { i18n } from '@workspace/i18n/config'
import type { ProductResponse } from '@workspace/domain/schemas/product'
import * as apiFactory from '@workspace/api/factory'
import type { ProductFilterParams, ProductService } from '@workspace/api/services/product-service'
import { ThemeProvider } from '../../app/theme-provider'
import { ProductCard } from './components/product-card'
import { ProductGrid } from './components/product-grid'
import { ProductsRoute } from '../../routes/products-route'

const mockProduct: ProductResponse = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Windows 11 Professional',
  slug: 'windows-11-professional',
  sku: 'OS-WIN11-PRO-RET',
  category: {
    id: 'cat-1',
    name: 'Windows',
    slug: 'windows',
    code: 'OS',
    display_order: 0,
    is_active: true,
    product_count: 2,
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

const mockProductOffice: ProductResponse = {
  id: '00000000-0000-4000-8000-000000000002',
  name: 'Office 2021 Professional Plus',
  slug: 'office-2021-professional-plus',
  sku: 'OFF-OFF21-PRO-RET',
  category: {
    id: 'cat-2',
    name: 'Office',
    slug: 'office',
    code: 'OFF',
    display_order: 1,
    is_active: true,
    product_count: 1,
  },
  variant: 'retail',
  base_price: '599.00',
  sale_price: '499.00',
  effective_price: '499.00',
  discount_percentage: 17,
  stock_status: 'in_stock',
  available_count: 8,
  preorder_enabled: true,
  description: 'Word, Excel, PowerPoint, Outlook.',
  is_active: true,
  images: [],
}

const mockCatalog = [mockProduct, mockProductOffice]

function renderWithProviders(
  ui: React.ReactElement,
  { lang = 'en', initialEntries = ['/'] }: { lang?: 'en' | 'ar'; initialEntries?: string[] } = {},
) {
  i18n.changeLanguage(lang)
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <ThemeProvider defaultTheme="light">
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
        </QueryClientProvider>
      </I18nextProvider>
    </ThemeProvider>,
  )
}

describe('ProductCard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(apiFactory, 'getProductService').mockReturnValue({
      getProducts: vi.fn().mockImplementation((filter?: ProductFilterParams) => {
        let prods = [...mockCatalog]
        if (filter?.category) {
          prods = prods.filter((p) => p.category.slug === filter.category || p.category.name === filter.category)
        }
        return Promise.resolve(prods)
      }),
      getPublicCategories: vi.fn().mockResolvedValue([
        { id: 'cat-1', name: 'Windows', slug: 'windows', code: 'OS', display_order: 0, is_active: true, product_count: 2 },
        { id: 'cat-2', name: 'Office', slug: 'office', code: 'OFF', display_order: 1, is_active: true, product_count: 1 },
      ]),
      getCategoryBySlug: vi.fn().mockImplementation((slug) =>
        Promise.resolve({
          id: slug === 'windows' ? 'cat-1' : 'cat-2',
          name: slug === 'windows' ? 'Windows' : 'Office',
          slug,
          code: slug === 'windows' ? 'OS' : 'OFF',
          display_order: 0,
          is_active: true,
          products: mockCatalog.filter((p) => p.category.slug === slug),
        }),
      ),
      getProductById: vi.fn().mockImplementation((id) =>
        Promise.resolve(mockCatalog.find((p) => p.id === id) || mockCatalog[0]),
      ),
      getProductBySlug: vi.fn().mockImplementation((slug) =>
        Promise.resolve(mockCatalog.find((p) => p.slug === slug) || mockCatalog[0]),
      ),
    } as unknown as ProductService)
  })

  it('renders correctly in English (LTR)', () => {
    renderWithProviders(<ProductCard product={mockProduct} />, { lang: 'en' })

    expect(screen.getByText('Windows 11 Professional')).toBeInTheDocument()
    expect(screen.getByText('Windows')).toBeInTheDocument()
    expect(screen.getByText('Retail')).toBeInTheDocument()
    expect(screen.getByText('In Stock')).toBeInTheDocument()
    expect(screen.getByText('-30%')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
    expect(document.documentElement.dir).toBe('ltr')
  })

  it('renders correctly in Arabic (RTL) with Western digits and adds to cart on click', async () => {
    renderWithProviders(<ProductCard product={mockProduct} />, { lang: 'ar' })

    expect(screen.getByText('Windows 11 Professional')).toBeInTheDocument()
    expect(screen.getByText('ويندوز')).toBeInTheDocument()
    expect(screen.getByText('متوفر')).toBeInTheDocument()

    const btn = screen.getByRole('button', { name: /أضف إلى السلة/i })
    expect(btn).toBeInTheDocument()

    // Must use Western digits 349, not Eastern Arabic numerals
    expect(screen.getByText((content) => content.includes('349'))).toBeInTheDocument()
    expect(document.documentElement.dir).toBe('rtl')

    fireEvent.click(btn)
    expect(screen.getByText('تمت الإضافة')).toBeInTheDocument()
  })

  it('renders out of stock state disabled when preorder is disabled', () => {
    const outOfStockProduct: ProductResponse = {
      ...mockProduct,
      stock_status: 'out_of_stock',
      preorder_enabled: false,
    }
    renderWithProviders(<ProductCard product={outOfStockProduct} />, { lang: 'en' })

    const button = screen.getByRole('button', { name: /out of stock/i })
    expect(button).toBeDisabled()
  })

  it('renders preorder button when item is preorder', () => {
    const preorderProduct: ProductResponse = {
      ...mockProduct,
      stock_status: 'preorder',
      preorder_enabled: true,
    }
    renderWithProviders(<ProductCard product={preorderProduct} />, { lang: 'en' })

    expect(screen.getAllByText('Preorder').length).toBeGreaterThan(0)
    const button = screen.getByRole('button', { name: /preorder/i })
    expect(button).toBeEnabled()
  })
})

describe('ProductGrid', () => {
  it('fetches and renders products from the service', async () => {
    renderWithProviders(<ProductGrid />, { lang: 'en' })

    await waitFor(() => {
      expect(screen.getAllByText('Windows 11 Professional').length).toBeGreaterThan(0)
      expect(screen.getByText('Office 2021 Professional Plus')).toBeInTheDocument()
    })
  })
})

describe('ProductsRoute (Listing Page)', () => {
  it('renders default heading, breadcrumbs, category row, and catalog products in English', async () => {
    renderWithProviders(<ProductsRoute />, { lang: 'en' })

    expect(screen.getByRole('heading', { level: 1, name: /all products/i })).toBeInTheDocument()

    const breadcrumbNav = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(breadcrumbNav).toBeInTheDocument()

    const categoryNav = screen.getByRole('navigation', { name: /category/i })
    expect(categoryNav).toBeInTheDocument()

    const sidebar = screen.getByRole('complementary', { name: /filters/i })
    expect(sidebar).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getAllByText('Windows 11 Professional').length).toBeGreaterThan(0)
      expect(screen.getByText('Office 2021 Professional Plus')).toBeInTheDocument()
    })
  })

  it('renders filtered products by category in Arabic', async () => {
    renderWithProviders(<ProductsRoute />, {
      lang: 'ar',
      initialEntries: ['/ar/products?category=windows'],
    })

    await waitFor(() => {
      expect(screen.getAllByText('Windows 11 Professional').length).toBeGreaterThan(0)
    })
  })
})
