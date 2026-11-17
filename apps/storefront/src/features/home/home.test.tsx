import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider, type UseQueryResult } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import type { Product } from '@workspace/domain/schemas/product'
import { ThemeProvider } from '../../app/theme-provider'
import { HomePage } from './components/home-page'
import { ProductRail } from '../products/components/product-rail'
import { DEFAULT_HOME_CONFIG, type HomeConfig } from './home.config'
import * as useProductCollectionModule from '../products/hooks/use-product-collection'

function renderHomePage(
  initialRoute = '/en',
  config: HomeConfig = DEFAULT_HOME_CONFIG,
) {
  const isAr = initialRoute.startsWith('/ar')
  i18n.changeLanguage(isAr ? 'ar' : 'en')
  document.documentElement.lang = isAr ? 'ar' : 'en'
  document.documentElement.dir = isAr ? 'rtl' : 'ltr'

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
          <MemoryRouter initialEntries={[initialRoute]}>
            <Routes>
              <Route
                path="/:lang"
                element={
                  <main id="main">
                    <HomePage
                      config={config}
                      renderProductRail={(props) => <ProductRail {...props} />}
                    />
                  </main>
                }
              />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </I18nextProvider>
    </ThemeProvider>,
  )
}

describe('Home Page Skeleton', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders sections in exact config order and contains exactly one h1', async () => {
    const { container } = renderHomePage('/en')

    // Exactly one h1 on the entire page
    const h1Elements = screen.getAllByRole('heading', { level: 1 })
    expect(h1Elements).toHaveLength(1)
    expect(h1Elements[0]).toHaveTextContent(/all your digital products at fair prices/i)

    // Sections in order (8 active sections by default with unified Browse block)
    const sections = container.querySelectorAll('main#main > div > section')
    expect(sections).toHaveLength(8)

    expect(sections[0].id).toBe('hero')
    expect(sections[1].id).toBe('best-sellers')
    expect(sections[2].id).toBe('bundles')
    expect(sections[3].id).toBe('browse')
    expect(sections[4].id).toBe('how-it-works')
    expect(sections[5].id).toBe('social-proof')
    expect(sections[6].id).toBe('faq')
    expect(sections[7].id).toBe('support')

    // Each section has aria-labelledby
    sections.forEach((section) => {
      const labelledBy = section.getAttribute('aria-labelledby')
      expect(labelledBy).toBeTruthy()
      expect(container.querySelector(`#${labelledBy}`)).toBeInTheDocument()
    })
  })

  it('skips disabled sections when configured', () => {
    const customConfig: HomeConfig = {
      sections: DEFAULT_HOME_CONFIG.sections.map((s) => {
        if (s.id === 'faq' || s.id === 'bundles') {
          return { ...s, enabled: false }
        }
        return s
      }),
    }

    const { container } = renderHomePage('/en', customConfig)

    expect(container.querySelector('#faq')).not.toBeInTheDocument()
    expect(container.querySelector('#bundles')).not.toBeInTheDocument()
    expect(container.querySelector('#hero')).toBeInTheDocument()
    expect(container.querySelector('#best-sellers')).toBeInTheDocument()
  })

  it('alternates background and secondary bands between consecutive sections', () => {
    const { container } = renderHomePage('/en')
    const sections = container.querySelectorAll('main#main > div > section')

    expect(sections[0]).toHaveClass('bg-background')
    expect(sections[1]).toHaveClass('bg-secondary/40')
    expect(sections[2]).toHaveClass('bg-background')
    expect(sections[3]).toHaveClass('bg-secondary/40')
    expect(sections[4]).toHaveClass('bg-background')
    expect(sections[5]).toHaveClass('bg-secondary/40')
    expect(sections[6]).toHaveClass('bg-background')
    expect(sections[7]).toHaveClass('bg-secondary/40')
  })

  it('renders hero with one primary button, one quiet text link, and visual placeholder block', () => {
    renderHomePage('/en')

    // Primary CTA button (renders with button role)
    const primaryCta = screen.getByRole('button', { name: /browse products/i })
    expect(primaryCta).toBeInTheDocument()

    // Quiet text link
    const quietLink = screen.getByRole('link', { name: /learn how it works/i })
    expect(quietLink).toBeInTheDocument()

    // Visual placeholder block (no external images)
    expect(screen.getByTestId('hero-visual-placeholder')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders unified Browse block with heading, subtitle, category bento tiles and platform pills', async () => {
    const { container } = renderHomePage('/en')
    const browseSection = container.querySelector<HTMLElement>('#browse')!
    expect(browseSection).toBeInTheDocument()

    expect(within(browseSection).getByText(/browse catalog/i)).toBeInTheDocument()
    expect(within(browseSection).getByText(/explore keys, licenses, and subscriptions/i)).toBeInTheDocument()

    // 4 Category tiles in prioritized order: Software, Subscriptions, Gift cards, Games
    const categoryLinks = within(browseSection)
      .getAllByRole('link')
      .filter((l) => l.getAttribute('href')?.includes('category='))
    expect(categoryLinks.map((l) => l.getAttribute('href'))).toEqual([
      '/en/products?category=software',
      '/en/products?category=subscriptions',
      '/en/products?category=gift-cards',
      '/en/products?category=games',
    ])

    // Platform pill row with All Platforms
    expect(within(browseSection).getByRole('link', { name: /all platforms/i })).toBeInTheDocument()
  })

  it('renders unified Browse block in Arabic RTL', async () => {
    const { container } = renderHomePage('/ar')
    const browseSection = container.querySelector<HTMLElement>('#browse')!
    expect(browseSection).toBeInTheDocument()

    expect(within(browseSection).getByRole('heading', { name: /تصفح المنتجات/i })).toBeInTheDocument()
    expect(within(browseSection).getByRole('link', { name: /^ألعاب/i })).toBeInTheDocument()
    expect(within(browseSection).getByRole('link', { name: /^برمجيات/i })).toBeInTheDocument()
    expect(within(browseSection).getByRole('link', { name: /جميع المنصات/i })).toBeInTheDocument()
    expect(document.documentElement.dir).toBe('rtl')
  })

  it('renders trust strip with 4 neutral placeholder items when enabled', () => {
    const configWithTrust: HomeConfig = {
      sections: [
        {
          id: 'trust',
          type: 'trust-strip',
          enabled: true,
          items: [
            {
              id: 'instant-delivery',
              titleKey: 'instantDelivery',
              descKey: 'instantDeliveryDesc',
              icon: 'zap',
            },
            {
              id: 'secure-payment',
              titleKey: 'securePayment',
              descKey: 'securePaymentDesc',
              icon: 'shield-check',
            },
            {
              id: 'customer-support',
              titleKey: 'customerSupport',
              descKey: 'customerSupportDesc',
              icon: 'headphones',
            },
            {
              id: 'region-clarity',
              titleKey: 'regionClarity',
              descKey: 'regionClarityDesc',
              icon: 'globe',
            },
          ],
        },
      ],
    }
    renderHomePage('/en', configWithTrust)

    const trustSection = screen.getByRole('region', { name: /why choose muftahy/i })
    expect(trustSection).toBeInTheDocument()
    expect(within(trustSection).getByText(/instant delivery/i)).toBeInTheDocument()
    expect(within(trustSection).getByText(/secure payment/i)).toBeInTheDocument()
    expect(within(trustSection).getByText(/dedicated support/i)).toBeInTheDocument()
    expect(within(trustSection).getByText(/region clarity/i)).toBeInTheDocument()
  })

  it('renders FAQ section with 5 accordion items', () => {
    renderHomePage('/en')

    expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument()
    expect(screen.getByText(/how are digital keys delivered\?/i)).toBeInTheDocument()
    expect(screen.getByText(/how do i know if a key works in my region\?/i)).toBeInTheDocument()
    expect(screen.getByText(/what payment methods are supported\?/i)).toBeInTheDocument()
    expect(screen.getByText(/what is the policy regarding refunds\?/i)).toBeInTheDocument()
    expect(screen.getByText(/how can i get help if my key does not activate\?/i)).toBeInTheDocument()
  })

  it('renders real ProductCard components in product rail and bundles', async () => {
    renderHomePage('/en')

    // Rail and bundles asynchronously resolve products and render real ProductCard articles
    const articles = await screen.findAllByRole('article')
    expect(articles.length).toBeGreaterThan(0)

    // Add to cart buttons exist on product cards with Lucide shopping bag icon
    const addToCartButtons = await screen.findAllByRole('button', { name: /add to cart/i })
    expect(addToCartButtons.length).toBeGreaterThan(0)
  })

  it('renders carousel controls: prominent desktop side arrows and pagination dots', async () => {
    const { container } = renderHomePage('/en')

    const railSection = container.querySelector<HTMLElement>('#best-sellers')!
    expect(railSection).toBeInTheDocument()

    await screen.findAllByRole('article')

    // Track does not have negative margin -mx-4, preserving 16px container padding before cards
    const track = within(railSection).getByTestId('rail-content-best-sellers')
    expect(track.className).not.toContain('-mx-4')

    // Desktop side arrows
    const prevBtn = within(railSection).getByRole('button', { name: /previous products/i })
    const nextBtn = within(railSection).getByRole('button', { name: /next products/i })

    expect(prevBtn).toBeInTheDocument()
    expect(nextBtn).toBeInTheDocument()

    // Side arrows are external flex items (NOT absolute on top of cards) and hidden on mobile
    expect(prevBtn.className).toMatch(/hidden\s+lg:flex/)
    expect(prevBtn.className).not.toContain('absolute')
    expect(nextBtn.className).toMatch(/hidden\s+lg:flex/)
    expect(nextBtn.className).not.toContain('absolute')
    expect(prevBtn).not.toBeDisabled()
    expect(nextBtn).not.toBeDisabled()

    // Pagination dots (mapped to Embla scroll snap points or product count)
    const dotsNav = within(railSection).getByTestId('rail-dots-best-sellers')
    expect(dotsNav).toBeInTheDocument()
    const dots = within(dotsNav).getAllByRole('button')
    expect(dots.length).toBeGreaterThan(0)
    expect(dots[0]).toHaveAttribute('aria-current', 'true')
    expect(dots[1]).not.toHaveAttribute('aria-current')

    // Clicking next button advances active slide / dot or triggers carousel navigation
    fireEvent.click(nextBtn)

    // Clicking a dot activates it
    fireEvent.click(dots[2])
    expect(dots[2]).toHaveAttribute('aria-current', 'true')
    expect(dots[0]).not.toHaveAttribute('aria-current')
  })

  it('renders carousel controls in Arabic RTL with mirrored chevrons and localized labels', async () => {
    const { container } = renderHomePage('/ar')

    const railSection = container.querySelector<HTMLElement>('#best-sellers')!
    expect(railSection).toBeInTheDocument()

    await screen.findAllByRole('article')

    const prevBtn = within(railSection).getByRole('button', { name: /المنتجات السابقة/i })
    const nextBtn = within(railSection).getByRole('button', { name: /المنتجات التالية/i })

    expect(prevBtn).toBeInTheDocument()
    expect(nextBtn).toBeInTheDocument()

    // Chevrons inside have rtl:rotate-180
    const prevSvg = prevBtn.querySelector('svg')
    const nextSvg = nextBtn.querySelector('svg')
    expect(prevSvg?.getAttribute('class') || prevSvg?.className.baseVal).toContain('rtl:rotate-180')
    expect(nextSvg?.getAttribute('class') || nextSvg?.className.baseVal).toContain('rtl:rotate-180')
  })

  it('shows skeleton cards when a rail is loading', () => {
    vi.spyOn(useProductCollectionModule, 'useProductCollection').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<Product[], Error>)

    renderHomePage('/en')

    const skeletons = screen.getAllByTestId('product-rail-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
    skeletons.forEach((skeleton) => {
      expect(skeleton).toHaveAttribute('aria-hidden', 'true')
    })
  })

  it('shows empty message when a rail has no products', async () => {
    vi.spyOn(useProductCollectionModule, 'useProductCollection').mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<Product[], Error>)

    renderHomePage('/en')

    expect(
      screen.getAllByText(/no products currently available in this section/i).length,
    ).toBeGreaterThan(0)
  })

  it('shows error state with retry button, and one failing rail does not break other sections or page', async () => {
    const refetchMock = vi.fn()

    // best-sellers fails
    vi.spyOn(useProductCollectionModule, 'useProductCollection').mockImplementation(
      ({ collection }) => {
        if (collection === 'best-sellers') {
          return {
            data: undefined,
            isLoading: false,
            isError: true,
            refetch: refetchMock,
          } as unknown as UseQueryResult<Product[], Error>
        }
        return {
          data: [],
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        } as unknown as UseQueryResult<Product[], Error>
      },
    )

    renderHomePage('/en')

    // Error message and retry button in failing rail
    expect(screen.getByTestId('rail-error-best-sellers')).toBeInTheDocument()
    const retryBtn = screen.getByRole('button', { name: /try again/i })
    expect(retryBtn).toBeInTheDocument()

    fireEvent.click(retryBtn)
    expect(refetchMock).toHaveBeenCalled()

    // Other home sections still rendered their content!
    expect(screen.getByTestId('bundles-skeleton')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /how it works/i })).toBeInTheDocument()
    expect(screen.getByTestId('social-proof-skeleton')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /need help\? contact us/i })).toBeInTheDocument()

    // Page still rendered all other sections
    expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument()
  })

  it('renders all skeleton placeholder sections (bundles, social-proof)', () => {
    renderHomePage('/en')

    expect(screen.getByTestId('bundles-skeleton')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /bundles \(productivity-led\)/i })).toBeInTheDocument()

    expect(screen.getByTestId('social-proof-skeleton')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /social proof/i })).toBeInTheDocument()
  })

  it('renders Support section in Apple-store visual language with WhatsApp card and topic chips', () => {
    const { container } = renderHomePage('/en')
    const support = container.querySelector<HTMLElement>('#support')!
    expect(support).toBeInTheDocument()

    // Heading and subline
    expect(within(support).getByRole('heading', { name: /need help\? contact us/i })).toBeInTheDocument()
    expect(within(support).getByText(/our support team is ready to help/i)).toBeInTheDocument()

    // WhatsApp card
    expect(within(support).getByRole('heading', { name: /chat with support/i })).toBeInTheDocument()
    expect(within(support).getByText(/get help with activation, your order, or any question\./i)).toBeInTheDocument()
    const ctaBtn = within(support).getByRole('link', { name: /chat on whatsapp/i })
    expect(ctaBtn).toHaveAttribute('href', 'https://wa.me/1234567890')

    // 3 topic chips
    const activationChip = within(support).getByRole('link', { name: /activation help/i })
    expect(activationChip.getAttribute('href')).toContain('https://wa.me/1234567890?text=')
    expect(decodeURIComponent(activationChip.getAttribute('href')!)).toContain('Hello, I need help activating my product')

    const orderChip = within(support).getByRole('link', { name: /order issue/i })
    expect(decodeURIComponent(orderChip.getAttribute('href')!)).toContain('Hello, I have a question about my order')

    const productChip = within(support).getByRole('link', { name: /product question/i })
    expect(decodeURIComponent(productChip.getAttribute('href')!)).toContain('Hello, I have a question about a product')
  })

  it('does not render support section when whatsappNumber is not configured', () => {
    const customConfig: HomeConfig = {
      sections: [
        {
          id: 'support',
          type: 'support',
          enabled: true,
          titleKey: 'support.title',
          subtitleKey: 'support.subtitle',
        },
      ],
    }
    const { container } = renderHomePage('/en', customConfig)
    expect(container.querySelector('#support')).toBeNull()
  })

  it('renders How It Works section in Apple-store visual language with 3 steps and help link', () => {
    const { container } = renderHomePage('/en')
    const howItWorks = container.querySelector<HTMLElement>('#how-it-works')!
    expect(howItWorks).toBeInTheDocument()

    // Centered heading and subline
    expect(within(howItWorks).getByRole('heading', { name: /^how it works$/i })).toBeInTheDocument()
    expect(
      within(howItWorks).getByText(/from choosing to using, in three simple steps\./i),
    ).toBeInTheDocument()

    // 3 steps
    expect(within(howItWorks).getAllByText(/choose your product/i).length).toBeGreaterThanOrEqual(1)
    expect(within(howItWorks).getAllByText(/pay securely/i).length).toBeGreaterThanOrEqual(1)
    expect(within(howItWorks).getAllByText(/receive it instantly/i).length).toBeGreaterThanOrEqual(1)

    // Western digits numbers
    expect(within(howItWorks).getAllByText('01').length).toBeGreaterThanOrEqual(1)
    expect(within(howItWorks).getAllByText('02').length).toBeGreaterThanOrEqual(1)
    expect(within(howItWorks).getAllByText('03').length).toBeGreaterThanOrEqual(1)

    // Activation help link pointing to #faq
    const helpLink = within(howItWorks).getByRole('link', {
      name: /need help activating\? read the guides/i,
    })
    expect(helpLink).toBeInTheDocument()
    expect(helpLink).toHaveAttribute('href', '#faq')
  })

  it('renders correctly in Arabic (RTL) with proper dir attribute and translations', async () => {
    const { container } = renderHomePage('/ar')

    expect(document.documentElement.dir).toBe('rtl')
    expect(document.documentElement.lang).toBe('ar')

    // Arabic hero title
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /كل منتجاتك الرقمية بأسعار معقولة/i,
    )

    // Arabic browse block
    const browseSection = container.querySelector<HTMLElement>('#browse')!
    expect(within(browseSection).getByRole('heading', { name: /تصفح المنتجات/i })).toBeInTheDocument()
    expect(within(browseSection).getByRole('link', { name: /^ألعاب/i })).toBeInTheDocument()

    // Arabic How It Works section
    const howItWorks = container.querySelector<HTMLElement>('#how-it-works')!
    expect(within(howItWorks).getByRole('heading', { name: /خطوات الشراء/i })).toBeInTheDocument()
    expect(
      within(howItWorks).getByText(/من الاختيار إلى الاستخدام في ثلاث خطوات بسيطة\./i),
    ).toBeInTheDocument()
    expect(within(howItWorks).getAllByText(/اختر منتجك/i).length).toBeGreaterThanOrEqual(1)
    expect(
      within(howItWorks).getByRole('link', {
        name: /تحتاج مساعدة في التفعيل؟ اقرأ الأدلة/i,
      }),
    ).toHaveAttribute('href', '#faq')

    // Arabic Support section
    const support = container.querySelector<HTMLElement>('#support')!
    expect(within(support).getByRole('heading', { name: /تحتاج مساعدة؟ تواصل معنا/i })).toBeInTheDocument()
    expect(within(support).getByRole('heading', { name: /تحدث مع الدعم/i })).toBeInTheDocument()
    expect(within(support).getByRole('link', { name: /(تواصل|محادثة) عبر واتساب/i })).toHaveAttribute(
      'href',
      'https://wa.me/1234567890',
    )
    expect(within(support).getByRole('link', { name: /مساعدة في التفعيل/i })).toBeInTheDocument()

    // Arabic skeleton sections
    expect(screen.getByRole('heading', { name: /حزم البرامج والإنتاجية/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /آراء وتقييمات العملاء/i })).toBeInTheDocument()

    // Arabic FAQ
    expect(screen.getByText(/الأسئلة الشائعة/i)).toBeInTheDocument()
  })
})
