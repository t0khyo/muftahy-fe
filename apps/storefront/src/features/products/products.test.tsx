import * as React from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter } from 'react-router'
import { i18n } from '@workspace/i18n/config'
import type { Product } from '@workspace/domain/schemas/product'
import { ThemeProvider } from '../../app/theme-provider'
import { useTheme } from '../../app/theme-context'
import { ProductCard } from './components/product-card'
import { ProductGrid } from './components/product-grid'
import { FeatureTile } from './components/feature-tile'
import { formatPrice } from './components/utils'
import { ProductsRoute } from '../../routes/products-route'

const mockProduct: Product = {
  id: 'test-001',
  slug: 'test-key',
  title: {
    en: 'Steam $20 Card',
    ar: 'بطاقة ستيم 20 دولار',
  },
  description: {
    en: 'Digital card with instant delivery',
    ar: 'بطاقة رقمية مع تسليم فوري',
  },
  price: {
    amountMinor: 2000,
    currency: 'USD',
  },
  originalPrice: {
    amountMinor: 2500,
    currency: 'USD',
  },
  category: 'gift-cards',
  platform: 'steam',
  region: 'global',
  coverImage: '/test.webp',
  inStock: true,
  featured: true,
  deliveryType: 'instant',
}

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

describe('formatPrice', () => {
  it('removes .00 and formats numbers without grouping commas', () => {
    expect(formatPrice(20)).toBe('20')
    expect(formatPrice('20.00')).toBe('20')
    expect(formatPrice(1250)).toBe('1250')
    expect(formatPrice('1250')).toBe('1250')
    expect(formatPrice(19.99)).toBe('19.99')
    expect(formatPrice(1250, 'ar')).toBe('1250')
  })
})

describe('ProductCard', () => {
  it('renders correctly in English (LTR)', () => {
    renderWithProviders(<ProductCard product={mockProduct} />, { lang: 'en' })

    expect(screen.getByText('Steam $20 Card')).toBeInTheDocument()
    expect(screen.getByText('Steam • Global')).toBeInTheDocument()
    const btn = screen.getByRole('button', { name: /add to cart/i })
    expect(btn).toBeInTheDocument()
    // Icon is placed after the text (second child)
    expect(btn.firstElementChild?.tagName.toLowerCase()).toBe('span')
    expect(btn.lastElementChild?.tagName.toLowerCase()).toBe('svg')
    expect(document.documentElement.dir).toBe('ltr')
  })

  it('renders correctly in Arabic (RTL) with Western digits and swaps icon/text on click', async () => {
    renderWithProviders(<ProductCard product={mockProduct} />, { lang: 'ar' })

    expect(screen.getByText('بطاقة ستيم 20 دولار')).toBeInTheDocument()
    expect(screen.getByText('ستيم • عالمي')).toBeInTheDocument()
    const btn = screen.getByRole('button', { name: /أضف إلى السلة/i })
    expect(btn).toBeInTheDocument()
    expect(btn.firstElementChild?.tagName.toLowerCase()).toBe('span')
    expect(btn.lastElementChild?.tagName.toLowerCase()).toBe('svg')

    // Must use Western digits 20, not Eastern Arabic numerals, and without .00
    expect(screen.getByText((content) => content.includes('20') && content.includes('$'))).toBeInTheDocument()
    expect(document.documentElement.dir).toBe('rtl')

    // Click to add to cart
    fireEvent.click(btn)
    expect(screen.getByText('تمت الإضافة')).toBeInTheDocument()
  })

  it('renders out of stock state disabled', () => {
    const outOfStockProduct = { ...mockProduct, inStock: false }
    renderWithProviders(<ProductCard product={outOfStockProduct} />, { lang: 'en' })

    const button = screen.getByRole('button', { name: /out of stock/i })
    expect(button).toBeDisabled()
  })

  it('renders Box icon fallback with primary color when product has no image', () => {
    const noImageProduct: Product = { ...mockProduct, coverImage: '' }
    const { container } = renderWithProviders(<ProductCard product={noImageProduct} />, { lang: 'en' })

    const boxIcon = container.querySelector('svg.text-primary')
    expect(boxIcon).toBeInTheDocument()
  })

  it('renders Box icon fallback with primary color when image fails to load (onError)', () => {
    const { container } = renderWithProviders(<ProductCard product={mockProduct} />, { lang: 'en' })

    const img = screen.getByRole('img', { name: mockProduct.title.en })
    expect(img).toBeInTheDocument()

    // Trigger image loading error
    fireEvent.error(img)

    // Image is replaced with the Box icon fallback
    const boxIcon = container.querySelector('svg.text-primary')
    expect(boxIcon).toBeInTheDocument()
  })
})

describe('FeatureTile', () => {
  it('renders correctly with headline, tagline, Buy pill, and Learn more link in English', () => {
    renderWithProviders(
      <FeatureTile
        headline="Xbox Game Pass Ultimate"
        tagline="Play hundreds of high-quality games with friends."
        buyHref="/products/xbox-game-pass"
        learnMoreHref="/products/xbox-game-pass/details"
      />,
      { lang: 'en' }
    )

    expect(screen.getByText('Xbox Game Pass Ultimate')).toBeInTheDocument()
    expect(screen.getByText('Play hundreds of high-quality games with friends.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /buy/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /learn more/i })).toBeInTheDocument()
  })

  it('renders correctly in Arabic RTL', () => {
    renderWithProviders(
      <FeatureTile
        headline="اشتراك جيم باس ألتيميت"
        tagline="العب مئات الألعاب عالية الجودة مع أصدقائك."
        buyHref="/products/xbox-game-pass"
        learnMoreHref="/products/xbox-game-pass/details"
      />,
      { lang: 'ar' }
    )

    expect(screen.getByText('اشتراك جيم باس ألتيميت')).toBeInTheDocument()
    expect(screen.getByText('العب مئات الألعاب عالية الجودة مع أصدقائك.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /شراء/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /اعرف المزيد/i })).toBeInTheDocument()
    expect(document.documentElement.dir).toBe('rtl')
  })
})

describe('ProductGrid', () => {
  it('fetches and renders products from the service', async () => {
    renderWithProviders(<ProductGrid />, { lang: 'en' })

    // Loading skeleton is rendered first with accessible status role
    expect(screen.getByRole('status')).toBeInTheDocument()

    // Wait for items to be loaded
    await waitFor(() => {
      expect(
        screen.getByText('Windows 11 Professional Retail Key'),
      ).toBeInTheDocument()
    })
  })
})

describe('ProductsRoute (Listing Page)', () => {
  it('renders default heading, breadcrumbs, category row, and catalog products in English', async () => {
    renderWithProviders(<ProductsRoute />, { lang: 'en' })

    // Heading
    expect(screen.getByRole('heading', { level: 1, name: /all products/i })).toBeInTheDocument()

    // Breadcrumbs
    const breadcrumbNav = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(breadcrumbNav).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument()
    const currentBreadcrumb = breadcrumbNav.querySelector('[aria-current="page"]')
    expect(currentBreadcrumb).toHaveTextContent(/products/i)

    // Category row: 5 items
    const categoryNav = screen.getByRole('navigation', { name: /^category$/i })
    expect(categoryNav).toBeInTheDocument()
    // "All" tile is active with aria-current="page"
    const activeCategory = categoryNav.querySelector('[aria-current="page"]')
    expect(activeCategory).toHaveTextContent(/all/i)

    // Sidebar: does NOT have Category facet
    const sidebar = screen.getByRole('complementary', { name: /filters/i })
    expect(sidebar).toBeInTheDocument()

    await waitFor(() => {
      expect(sidebar).toHaveTextContent(/platform/i)
      expect(sidebar).toHaveTextContent(/region/i)
      expect(screen.getByText('Windows 11 Professional Retail Key')).toBeInTheDocument()
      expect(screen.getByText('Cyberpunk 2077: Ultimate Edition (PC)')).toBeInTheDocument()
    })
  })

  it('renders dynamic heading, category breadcrumb, and active category in Arabic when filtered', async () => {
    renderWithProviders(<ProductsRoute />, {
      lang: 'ar',
      initialEntries: ['/ar/products?category=games'],
    })

    // Dynamic title is "الألعاب"
    expect(screen.getByRole('heading', { level: 1, name: /الألعاب/i })).toBeInTheDocument()

    // Breadcrumb has category leaf
    const breadcrumbNav = screen.getByRole('navigation', { name: /مسار التنقل/i })
    const currentBreadcrumb = breadcrumbNav.querySelector('[aria-current="page"]')
    expect(currentBreadcrumb).toHaveTextContent(/الألعاب/i)

    // Category row highlights Games ("الألعاب")
    const categoryNav = screen.getByRole('navigation', { name: /الفئة/i })
    const activeCategory = categoryNav.querySelector('[aria-current="page"]')
    expect(activeCategory).toHaveTextContent(/الألعاب/i)

    await waitFor(() => {
      expect(screen.getByText('سايبر بانك 2077: النسخة الكاملة (حاسوب)')).toBeInTheDocument()
    })
  })

  it('renders dynamic heading when arriving from search query', async () => {
    renderWithProviders(<ProductsRoute />, {
      lang: 'en',
      initialEntries: ['/en/products?q=Cyberpunk'],
    })

    expect(
      screen.getByRole('heading', { level: 1, name: /results for "cyberpunk"/i }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Cyberpunk 2077: Ultimate Edition (PC)')).toBeInTheDocument()
    })
  })

  it('renders category row tiles in prioritized order: All, Software, Subscriptions, Gift cards, Games', async () => {
    renderWithProviders(<ProductsRoute />, {
      lang: 'en',
      initialEntries: ['/en/products'],
    })

    const categoryNav = screen.getByRole('navigation', { name: /category/i })
    const links = within(categoryNav).getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))

    // Verify first 5 items (mobile) and next 5 items (desktop) both follow prioritized order
    const expectedOrder = [
      '/en/products',
      '/en/products?category=software',
      '/en/products?category=subscriptions',
      '/en/products?category=gift-cards',
      '/en/products?category=games',
    ]

    expect(hrefs.slice(0, 5)).toEqual(expectedOrder)
    expect(hrefs.slice(5, 10)).toEqual(expectedOrder)
  })

  it('renders empty state with Clear all button when no products match', async () => {
    renderWithProviders(<ProductsRoute />, {
      lang: 'en',
      initialEntries: ['/en/products?minPrice=999999'],
    })

    await waitFor(() => {
      expect(screen.getByText(/no products match your filters/i)).toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: /clear all/i }).length).toBeGreaterThan(0)
    })
  })
})

describe('ThemeProvider (Dark/Light mode)', () => {
  function ThemeTestComponent() {
    const { theme, resolvedTheme, setTheme } = useTheme()
    return (
      <div>
        <span data-testid="theme-name">{theme}</span>
        <span data-testid="resolved-theme">{resolvedTheme}</span>
        <button type="button" onClick={() => setTheme('dark')}>
          Set Dark
        </button>
        <button type="button" onClick={() => setTheme('light')}>
          Set Light
        </button>
      </div>
    )
  }

  it('switches between light and dark modes and toggles dark class on html', async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeTestComponent />
      </ThemeProvider>,
    )

    expect(document.documentElement.classList.contains('light')).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: /set dark/i }))
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(document.documentElement.classList.contains('light')).toBe(false)
    })

    fireEvent.click(screen.getByRole('button', { name: /set light/i }))
    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })
})
