import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { useCartStore } from '../features/cart/stores/cart-store'
import { CheckoutRoute } from './checkout-route'
import '../test-setup'

function renderCheckoutRoute(initialEntry = '/en/checkout') {
  const lang = initialEntry.startsWith('/ar') ? 'ar' : 'en'
  i18n.changeLanguage(lang)
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'

  const client = new QueryClient({
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
            <Route path="/:lang/checkout" element={<CheckoutRoute />} />
            <Route path="/:lang/cart" element={<div>Cart Destination</div>} />
            <Route path="/:lang/products" element={<div>Products Catalog Destination</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </I18nextProvider>,
  )
}

describe('CheckoutRoute (Digital Goods Checkout)', () => {
  beforeEach(() => {
    useCartStore.getState().clear()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('renders empty cart prompt if accessed with no items', () => {
    renderCheckoutRoute('/en/checkout')

    expect(screen.getByRole('heading', { name: /your bag is empty/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /explore products/i })).toBeInTheDocument()
  })

  it('renders checkout form, validates inputs, and processes order with reveal-and-copy key pattern', async () => {
    act(() => {
      useCartStore.getState().addItem({
        id: 'elden-ring:standard',
        productId: 'elden-ring',
        slug: 'elden-ring',
        name: 'Elden Ring',
        planName: 'Steam Global Key',
        priceMinor: 5999,
        currency: 'USD',
      })
    })

    renderCheckoutRoute('/en/checkout')

    // Form headers and order review
    expect(screen.getByRole('heading', { name: /customer & delivery details/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /order review/i })).toBeInTheDocument()
    expect(screen.getByText('Elden Ring')).toBeInTheDocument()

    const submitBtn = screen.getByRole('button', { name: /complete order & receive keys/i })
    const emailInput = screen.getByLabelText(/delivery email address/i)
    const nameInput = screen.getByLabelText(/full name/i)

    // Trigger validation error on empty submit
    fireEvent.click(submitBtn)
    expect(await screen.findAllByText(/this field is required/i)).toHaveLength(2)

    // Fill valid form
    fireEvent.change(emailInput, { target: { value: 'gamer@example.com' } })
    fireEvent.change(nameInput, { target: { value: 'Alex Morgan' } })

    // Submit order with timer simulation
    vi.useFakeTimers()
    fireEvent.click(submitBtn)

    act(() => {
      vi.advanceTimersByTime(700)
    })

    vi.useRealTimers()

    // Post-payment Order Confirmation view
    expect(await screen.findByText(/order placed successfully!/i)).toBeInTheDocument()
    expect(screen.getByText(/gamer@example.com/)).toBeInTheDocument()

    // Explicit Key Reveal & Copy Pattern verification (Mandatory AGENTS.md rule)
    expect(screen.getByText('•••••-•••••-•••••')).toBeInTheDocument()
    expect(screen.queryByText('XXXXX-XXXXX-XXXXX')).not.toBeInTheDocument()

    // Click "Reveal code"
    const revealBtn = screen.getByRole('button', { name: /reveal code/i })
    fireEvent.click(revealBtn)

    // Obvious safe mock key is now visible
    expect(screen.getByText('XXXXX-XXXXX-XXXXX')).toBeInTheDocument()

    // Cart store is cleared after successful purchase
    expect(useCartStore.getState().count).toBe(0)
  })

  it('renders checkout in Arabic RTL mode', () => {
    act(() => {
      useCartStore.getState().addItem({
        id: 'office:home',
        productId: 'office',
        slug: 'microsoft-office',
        name: { en: 'Microsoft Office', ar: 'مايكروسوفت أوفيس' },
        priceMinor: 7999,
        currency: 'USD',
      })
    })

    renderCheckoutRoute('/ar/checkout')

    expect(document.documentElement.dir).toBe('rtl')
    expect(screen.getByRole('heading', { name: /بيانات العميل والتسليم/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /طريقة الدفع/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /مراجعة الطلب/i })).toBeInTheDocument()
    expect(screen.getByText('مايكروسوفت أوفيس')).toBeInTheDocument()
  })
})
