import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { ThemeProvider } from '../../app/theme-provider'
import { useCartStore } from '../../features/cart/stores/cart-store'
import { SiteHeader } from './site-header'
import { SITE_HEADER_CONFIG } from './site-header.config'
import { getNavKey } from './nav-links'

function renderSiteHeader(
  initialRoute = '/en/products',
  headerProps = {},
) {
  i18n.changeLanguage(initialRoute.startsWith('/ar') ? 'ar' : 'en')
  document.documentElement.lang = initialRoute.startsWith('/ar') ? 'ar' : 'en'
  document.documentElement.dir = initialRoute.startsWith('/ar') ? 'rtl' : 'ltr'

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
                path="/:lang/*"
                element={
                  <div>
                    <div id="nav-sentinel" />
                    <SiteHeader {...headerProps} />
                    <main id="main">Page Content</main>
                  </div>
                }
              />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </I18nextProvider>
    </ThemeProvider>,
  )
}

describe('SiteHeader Component', () => {
  beforeEach(() => {
    act(() => {
      useCartStore.getState().clear()
    })
  })

  it('renders brand logo and links from SITE_HEADER_CONFIG', () => {
    renderSiteHeader('/en/products')

    // Logo
    expect(screen.getByRole('link', { name: /muftahy/i })).toBeInTheDocument()

    // Nav links configured in site-header.config.ts
    for (const link of SITE_HEADER_CONFIG.navLinks) {
      const expectedText = i18n.t(getNavKey(link.labelKey), { ns: 'nav' })
      const linkElements = screen.getAllByRole('link', {
        name: new RegExp(expectedText, 'i'),
      })
      expect(linkElements.length).toBeGreaterThan(0)
    }
  })

  it('highlights category navbar link when on matching category route and does not double-highlight all products', () => {
    renderSiteHeader('/en/products?category=windows')

    const windowsLink = screen.getByRole('link', { name: /^windows$/i })
    expect(windowsLink).toHaveClass('font-medium')
    expect(windowsLink).toHaveClass('text-foreground')

    const allProductsLink = screen.getByRole('link', { name: /^all products$/i })
    expect(allProductsLink).not.toHaveClass('font-medium')
    expect(allProductsLink).toHaveClass('text-foreground/80')
  })

  it('toggles mobile menu and aria-expanded state on hamburger click', () => {
    renderSiteHeader('/en/products')

    const hamburger = screen.getByRole('button', { name: /open menu/i })
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')

    // Open menu
    fireEvent.click(hamburger)
    expect(hamburger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument()

    // Close menu
    fireEvent.click(hamburger)
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes mobile menu on Esc key press', () => {
    renderSiteHeader('/en/products')

    const hamburger = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(hamburger)
    expect(hamburger).toHaveAttribute('aria-expanded', 'true')

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' })
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens desktop search takeover, focuses input, and closes on Esc', async () => {
    renderSiteHeader('/en/products')

    const searchTrigger = screen.getByRole('button', { name: /^search$/i })
    expect(searchTrigger).toHaveAttribute('aria-expanded', 'false')

    // Click search trigger
    fireEvent.click(searchTrigger)
    expect(searchTrigger).toHaveAttribute('aria-expanded', 'true')

    const searchInput = screen.getByRole('searchbox', { name: /^search$/i })
    expect(searchInput).toBeInTheDocument()

    await waitFor(() => {
      expect(document.activeElement).toBe(searchInput)
    })

    // Press Escape to close search takeover
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' })
    expect(searchTrigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('handles cart badge visibility: hides at 0, shows count, and shows 9+ when > 9', () => {
    renderSiteHeader('/en/products')

    // 0 count: badge text does not exist
    expect(screen.queryByText('0')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cart is empty/i })).toBeInTheDocument()

    // Set count to 3
    act(() => {
      useCartStore.getState().addItem({ id: 'item-1', name: 'Item 1', priceMinor: 100 }, 3)
    })
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cart, 3 items/i })).toBeInTheDocument()

    // Set count to 15 -> should show 9+
    act(() => {
      useCartStore.getState().addItem({ id: 'item-2', name: 'Item 2', priceMinor: 100 }, 12)
    })
    expect(screen.getByText('9+')).toBeInTheDocument()
  })

  it('toggles cart slide-over panel and displays empty state and populated state with stepper controls', () => {
    renderSiteHeader('/en/products')

    const cartButton = screen.getByRole('button', { name: /cart is empty/i })
    expect(cartButton).toHaveAttribute('aria-expanded', 'false')

    // Click cart button to open
    fireEvent.click(cartButton)
    expect(cartButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByText(/your bag is empty/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /explore products/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /browse bundles/i })).toBeInTheDocument()

    // Close on Escape
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' })
    expect(cartButton).toHaveAttribute('aria-expanded', 'false')

    // Add an item to cart store
    act(() => {
      useCartStore.getState().addItem({
        id: 'p1',
        name: 'Cyberpunk 2077 Key',
        priceMinor: 2999,
        currency: 'USD',
      })
    })

    // Reopen cart
    fireEvent.click(cartButton)
    expect(screen.getAllByText('Cyberpunk 2077 Key').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /checkout/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /view full bag/i })).toBeInTheDocument()

    // Verify quantity badge and stepper controls
    expect(screen.getByLabelText(/quantity: 1/i)).toBeInTheDocument()
    const increaseBtn = screen.getByRole('button', { name: /increase quantity/i })
    const decreaseBtn = screen.getByRole('button', { name: /decrease quantity/i })
    expect(decreaseBtn).toBeDisabled()

    fireEvent.click(increaseBtn)
    expect(screen.getByLabelText(/quantity: 2/i)).toBeInTheDocument()
    expect(decreaseBtn).not.toBeDisabled()

    fireEvent.click(decreaseBtn)
    expect(screen.getByLabelText(/quantity: 1/i)).toBeInTheDocument()

    // Test remove item
    const removeBtn = screen.getByRole('button', { name: /remove/i })
    fireEvent.click(removeBtn)
    expect(screen.getAllByText(/your bag is empty/i).length).toBeGreaterThan(0)
  })

  it('respects sticky=false prop', () => {
    const { container } = renderSiteHeader('/en/products', { sticky: false })
    const header = container.querySelector('header')
    expect(header).toHaveClass('relative')
    expect(header).not.toHaveClass('sticky')
  })

  it('hides other header elements when mobile menu is open, leaving only the close X button', () => {
    const { container } = renderSiteHeader('/en/products')

    const hamburger = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(hamburger)

    // Close button is visible
    expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument()

    // Logo container is marked invisible
    const logoContainer = container.querySelector('header > div > div:first-child')
    expect(logoContainer).toHaveClass('invisible')

    // Search and Cart are hidden
    expect(screen.queryByRole('button', { name: /^search$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /cart/i })).not.toBeInTheDocument()
  })

  it('keeps navbar visible on desktop when search is open, with 400px sheet under it and solid background', () => {
    const { container } = renderSiteHeader('/en/products')

    const searchTrigger = screen.getByRole('button', { name: /^search$/i })
    fireEvent.click(searchTrigger)

    // Logo remains visible on desktop
    expect(screen.getByRole('link', { name: /muftahy/i })).toBeInTheDocument()

    // Nav links remain visible on desktop
    for (const link of SITE_HEADER_CONFIG.navLinks) {
      const expectedText = i18n.t(getNavKey(link.labelKey), { ns: 'nav' })
      expect(screen.getAllByRole('link', { name: new RegExp(expectedText, 'i') }).length).toBeGreaterThan(0)
    }

    // Cart button remains visible on desktop
    expect(screen.getByRole('button', { name: /cart/i })).toBeInTheDocument()

    // Search sheet has exactly 400px height token for desktop
    const searchSheet = container.querySelector('#search-sheet')
    expect(searchSheet).toHaveClass('lg:h-[400px]')

    // Header has solid bg-background (no transparency)
    const header = container.querySelector('header')
    expect(header).toHaveClass('bg-background')
    expect(header).not.toHaveClass('header-glass')

    // Searchbox is completely borderless
    const searchbox = screen.getByRole('searchbox', { name: /^search$/i })
    expect(searchbox).toBeInTheDocument()
    expect(searchbox).toHaveClass('border-0')
    expect(searchbox).toHaveClass('outline-none')

    // Type text and test clear button
    fireEvent.change(searchbox, { target: { value: 'Steam' } })
    expect(searchbox).toHaveValue('Steam')

    const clearBtn = screen.getByRole('button', { name: /clear/i })
    expect(clearBtn).toBeInTheDocument()
    expect(clearBtn).toHaveClass('rounded-full')

    // Verify filled CircleX SVG structure inside clear button
    const circle = clearBtn.querySelector('circle')
    expect(circle).toBeInTheDocument()
    expect(circle).toHaveClass('fill-muted-foreground/40')

    fireEvent.click(clearBtn)
    expect(searchbox).toHaveValue('')
  })

  it('animates MenuToggle to X on mobile when search is open and closes search on click', () => {
    const { container } = renderSiteHeader('/en/products')

    const searchTrigger = screen.getByRole('button', { name: /^search$/i })
    fireEvent.click(searchTrigger)

    // On mobile, the MenuToggle button controls the search exit
    const menuToggle = screen.getByRole('button', { name: /close menu/i })
    expect(menuToggle).toBeInTheDocument()
    expect(menuToggle).toHaveAttribute('aria-expanded', 'true')
    expect(menuToggle).toHaveAttribute('aria-controls', 'search-sheet')

    // Logo container has max-lg:invisible on mobile
    const logoContainer = container.querySelector('header > div > div:first-child')
    expect(logoContainer).toHaveClass('max-lg:invisible')

    // Clicking the MenuToggle ('X') closes search and never opens mobile menu
    fireEvent.mouseDown(menuToggle)
    fireEvent.click(menuToggle)
    expect(container.querySelector('#search-sheet')).not.toBeInTheDocument()
    expect(container.querySelector('#mobile-menu')).not.toBeInTheDocument()
    expect(menuToggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('aligns search sheet content container width with header container', () => {
    const { container } = renderSiteHeader('/en/products')

    const searchTrigger = screen.getByRole('button', { name: /^search$/i })
    fireEvent.click(searchTrigger)

    const searchSheet = container.querySelector('#search-sheet')
    const contentContainer = searchSheet?.querySelector('div')
    expect(contentContainer).toHaveClass('site-container')
  })

  it('renders properly in RTL Arabic mode', () => {
    renderSiteHeader('/ar/products')
    expect(document.documentElement.dir).toBe('rtl')
    expect(document.documentElement.lang).toBe('ar')

    // Logo in Arabic
    expect(screen.getByRole('link', { name: /مفتاحي/i })).toBeInTheDocument()

    // Cart button in Arabic
    const cartButton = screen.getByRole('button', { name: /سلة التسوق فارغة/i })
    expect(cartButton).toBeInTheDocument()

    // Open cart in RTL
    fireEvent.click(cartButton)
    expect(screen.getAllByText(/السلة/i).length).toBeGreaterThan(0)
  })

  it('guarantees zero transparency (bg-background, no header-glass) when mobile menu or cart is open', () => {
    const { container } = renderSiteHeader('/en/products')
    const header = container.querySelector('header')

    // 1. Open mobile menu
    const hamburger = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(hamburger)
    expect(header).toHaveClass('bg-background')
    expect(header).not.toHaveClass('header-glass')

    const mobileMenu = container.querySelector('#mobile-menu')
    expect(mobileMenu).toBeInTheDocument()
    expect(mobileMenu).toHaveClass('bg-background')
    expect(mobileMenu).not.toHaveClass('header-glass')

    // Close mobile menu
    fireEvent.click(screen.getByRole('button', { name: /close menu/i }))

    // 2. Open cart
    const cartButton = screen.getByRole('button', { name: /cart/i })
    fireEvent.click(cartButton)
    expect(header).toHaveClass('bg-background')
    expect(header).not.toHaveClass('header-glass')

    const cartDropdown = screen.getByRole('dialog', { name: /bag|السلة/i })
    expect(cartDropdown).toHaveClass('bg-background')
    expect(cartDropdown).not.toHaveClass('header-glass')
  })

  it('renders theme toggle and compact language switcher at the bottom of the mobile menu', () => {
    const { container } = renderSiteHeader('/en/products')

    // Open mobile menu
    const hamburger = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(hamburger)

    const mobileMenu = container.querySelector<HTMLElement>('#mobile-menu')!
    expect(mobileMenu).toBeInTheDocument()

    // Language switcher and theme toggle inside mobile menu
    const langBtn = within(mobileMenu).getByRole('button', { name: /التبديل إلى العربية|switch to arabic/i })
    expect(langBtn).toBeInTheDocument()
    expect(langBtn).toHaveTextContent('ع')

    const themeBtn = within(mobileMenu).getByRole('button', { name: /switch to dark mode|dark/i })
    expect(themeBtn).toBeInTheDocument()
  })
})
