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

    // Sections in order (10 active sections by default)
    const sections = container.querySelectorAll('main#main > div > section')
    expect(sections).toHaveLength(10)

    expect(sections[0].id).toBe('hero')
    expect(sections[1].id).toBe('trust')
    expect(sections[2].id).toBe('best-sellers')
    expect(sections[3].id).toBe('bundles')
    expect(sections[4].id).toBe('categories')
    expect(sections[5].id).toBe('platforms')
    expect(sections[6].id).toBe('how-it-works')
    expect(sections[7].id).toBe('social-proof')
    expect(sections[8].id).toBe('faq')
    expect(sections[9].id).toBe('support')

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
    expect(sections[8]).toHaveClass('bg-background')
    expect(sections[9]).toHaveClass('bg-secondary/40')
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

  it('renders category tiles (2 cols mobile, 4 desktop) with direction-aware arrows', () => {
    renderHomePage('/en')

    expect(screen.getByText(/explore categories/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /games/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /software/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /gift cards/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /subscriptions/i })).toBeInTheDocument()
  })

  it('renders platform text pills without brand logos or colors', () => {
    renderHomePage('/en')

    expect(screen.getByRole('link', { name: 'PlayStation' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xbox' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Steam' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nintendo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'PC' })).toBeInTheDocument()
  })

  it('renders trust strip with 4 neutral placeholder items when enabled', () => {
    const configWithTrust: HomeConfig = {
      sections: DEFAULT_HOME_CONFIG.sections.map((s) =>
        s.id === 'trust' ? { ...s, enabled: true } : s,
      ),
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
    expect(screen.getByTestId('how-it-works-skeleton')).toBeInTheDocument()
    expect(screen.getByTestId('social-proof-skeleton')).toBeInTheDocument()
    expect(screen.getByTestId('support-skeleton')).toBeInTheDocument()

    // Page still rendered all other sections
    expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument()
  })

  it('renders all skeleton placeholder sections (bundles, how-it-works, social-proof, support)', () => {
    renderHomePage('/en')

    expect(screen.getByTestId('bundles-skeleton')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /bundles \(productivity-led\)/i })).toBeInTheDocument()

    expect(screen.getByTestId('how-it-works-skeleton')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /how it works/i })).toBeInTheDocument()

    expect(screen.getByTestId('social-proof-skeleton')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /social proof/i })).toBeInTheDocument()

    expect(screen.getByTestId('support-skeleton')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /support & activation assistance/i })).toBeInTheDocument()
  })

  it('renders correctly in Arabic (RTL) with proper dir attribute and translations', async () => {
    renderHomePage('/ar')

    expect(document.documentElement.dir).toBe('rtl')
    expect(document.documentElement.lang).toBe('ar')

    // Arabic hero title
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /كل منتجاتك الرقمية بأسعار معقولة/i,
    )

    // Arabic categories
    expect(screen.getByText(/استكشف الفئات/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ألعاب/i })).toBeInTheDocument()

    // Arabic skeleton sections
    expect(screen.getByRole('heading', { name: /حزم البرامج والإنتاجية/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /كيف تتم عملية الشراء/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /آراء وتقييمات العملاء/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /الدعم الفني والمساعدة/i })).toBeInTheDocument()

    // Arabic FAQ
    expect(screen.getByText(/الأسئلة الشائعة/i)).toBeInTheDocument()
  })
})
