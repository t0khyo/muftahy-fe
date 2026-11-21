import * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { getCartService } from '@workspace/api/factory'
import type { CartService } from '@workspace/api/services/cart-service'
import { AuthContext, type AuthContextValue } from '../features/auth/context/auth-context'
import { useCartStore } from '../features/cart/stores/cart-store'
import { CheckoutRoute } from './checkout-route'
import '../test-setup'

vi.mock('@workspace/api/factory', () => ({
  getCartService: vi.fn(),
}))

function createAuthContextValue(isAuthenticated: boolean): AuthContextValue {
  return {
    user: isAuthenticated
      ? {
          id: '18f9103c-829d-47be-a567-2794ebef4023',
          email: 'customer@example.com',
          full_name: 'Alex Morgan',
          phone: null,
          created_at: '2026-11-20T00:00:00Z',
        }
      : null,
    isAuthenticated,
    isLoading: false,
    isInitializing: false,
    login: vi.fn(),
    register: vi.fn(),
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
    refreshProfile: vi.fn(),
  }
}

function renderCheckoutRoute(initialEntry = '/en/checkout', isAuthenticated = true) {
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

  const authValue = createAuthContextValue(isAuthenticated)

  return render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={client}>
        <AuthContext.Provider value={authValue}>
          <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
              <Route path="/:lang/checkout" element={<CheckoutRoute />} />
              <Route path="/:lang/login" element={<div>Login Destination</div>} />
              <Route path="/:lang/cart" element={<div>Cart Destination</div>} />
              <Route path="/:lang/products" element={<div>Products Destination</div>} />
              <Route
                path="/:lang/account/orders/:id"
                element={<div>Order Detail Destination</div>}
              />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    </I18nextProvider>,
  )
}

describe('CheckoutRoute (Digital Goods Checkout)', () => {
  const mockCartService = {
    getCart: vi.fn(),
    addItem: vi.fn(),
    removeItem: vi.fn(),
    validatePromo: vi.fn(),
    checkout: vi.fn(),
  }

  beforeEach(() => {
    useCartStore.getState().clear()
    vi.clearAllMocks()
    vi.mocked(getCartService).mockReturnValue(mockCartService as unknown as CartService)
  })

  it('redirects unauthenticated user to login', () => {
    renderCheckoutRoute('/en/checkout', false)

    expect(screen.getByText('Login Destination')).toBeInTheDocument()
  })

  it('renders empty cart prompt if accessed with no items', () => {
    mockCartService.getCart.mockResolvedValue({
      id: 'cart-1',
      items: [],
      subtotal_egp: 0,
      item_count: 0,
    })

    renderCheckoutRoute('/en/checkout', true)

    expect(screen.getByRole('heading', { name: /your bag is empty/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /explore products/i })).toBeInTheDocument()
  })

  it('renders checkout form and processes order redirecting to order details', async () => {
    mockCartService.getCart.mockResolvedValue({
      id: 'cart-1',
      items: [
        {
          id: 'item-1',
          product_id: 'prod-1',
          product_name: 'Windows 11 Pro',
          quantity: 1,
          is_preorder: false,
          unit_price: 299.99,
        },
      ],
      subtotal_egp: 299.99,
      item_count: 1,
    })

    mockCartService.checkout.mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440000',
      reference_code: 'SM-20261120-001',
      status: 'pending_payment',
    })

    renderCheckoutRoute('/en/checkout', true)

    // Form headers and order review
    expect(await screen.findByText('Windows 11 Pro')).toBeInTheDocument()
    expect(screen.getByText('Customer & Delivery Account')).toBeInTheDocument()
    expect(screen.getByText('Alex Morgan')).toBeInTheDocument()
    expect(screen.getByText('customer@example.com')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /order review/i })).toBeInTheDocument()

    const submitBtn = screen.getByRole('button', { name: /confirm order & proceed to payment/i })
    expect(submitBtn).toBeInTheDocument()

    // Click confirm order
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(mockCartService.checkout).toHaveBeenCalled()
    expect(await screen.findByText('Order Detail Destination')).toBeInTheDocument()
  })

  it('renders checkout in Arabic RTL mode', async () => {
    mockCartService.getCart.mockResolvedValue({
      id: 'cart-1',
      items: [
        {
          id: 'item-1',
          product_id: 'prod-1',
          product_name: 'مايكروسوفت أوفيس',
          quantity: 1,
          is_preorder: false,
          unit_price: 499.99,
        },
      ],
      subtotal_egp: 499.99,
      item_count: 1,
    })

    renderCheckoutRoute('/ar/checkout', true)

    expect(document.documentElement.dir).toBe('rtl')
    expect(await screen.findByText('مايكروسوفت أوفيس')).toBeInTheDocument()
    expect(screen.getByText('بيانات الحساب والتسليم')).toBeInTheDocument()
    expect(screen.getByText(/طريقة الدفع: تحويل محلي/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /مراجعة الطلب/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /تأكيد الطلب والانتقال للدفع/i })).toBeInTheDocument()
  })
})
