import * as React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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
  { lang = 'en' }: { lang?: 'en' | 'ar' } = {},
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
          <MemoryRouter>{ui}</MemoryRouter>
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

    // Loading state is rendered first
    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    // Wait for items to be loaded
    await waitFor(() => {
      expect(
        screen.getByText('Windows 11 Professional Retail Key'),
      ).toBeInTheDocument()
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
