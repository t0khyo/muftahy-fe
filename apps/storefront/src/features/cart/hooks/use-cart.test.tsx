import * as React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCartService } from '@workspace/api/factory'
import type { CartService } from '@workspace/api/services/cart-service'
import { AuthContext, type AuthContextValue } from '../../auth/context/auth-context'
import { useCartStore } from '../stores/cart-store'
import {
  useAddToCart,
  useApplyPromoCode,
  useCart,
  useCheckout,
  useRemoveCartItem,
  useUpdateCartItemQuantity,
} from './use-cart'

vi.mock('@workspace/api/factory', () => ({
  getCartService: vi.fn(),
}))

function createAuthContextValue(isAuthenticated: boolean): AuthContextValue {
  return {
    user: isAuthenticated
      ? {
          id: '18f9103c-829d-47be-a567-2794ebef4023',
          email: 'customer@example.com',
          full_name: 'Ahmed Hassan',
          phone: null,
          is_active: true,
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

function createWrapper(isAuthenticated = false) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  const authValue = createAuthContextValue(isAuthenticated)

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  )
}

describe('useCart hooks', () => {
  const mockCartService = {
    getCart: vi.fn(),
    addItem: vi.fn(),
    updateItemQuantity: vi.fn(),
    removeItem: vi.fn(),
    validatePromo: vi.fn(),
    checkout: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useCartStore.getState().clear()
    vi.mocked(getCartService).mockReturnValue(mockCartService as unknown as CartService)
  })

  it('returns guest cart state when unauthenticated', () => {
    useCartStore.getState().addItem({
      product_id: 'guest-p1',
      product_name: 'Windows 11',
      unit_price: 299.99,
      quantity: 2,
    })

    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(false),
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.item_count).toBe(2)
    expect(result.current.subtotal_egp).toBeCloseTo(599.98)
    expect(result.current.isLoading).toBe(false)
  })

  it('fetches server cart state when authenticated', async () => {
    mockCartService.getCart.mockResolvedValue({
      id: 'server-cart-1',
      items: [
        {
          id: 'item-1',
          product_id: 'prod-1',
          product_name: 'Office 2021',
          quantity: 1,
          is_preorder: false,
          unit_price: 499.99,
        },
      ],
      subtotal_egp: 499.99,
      item_count: 1,
    })

    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(true),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].product_name).toBe('Office 2021')
    expect(result.current.subtotal_egp).toBe(499.99)
    expect(mockCartService.getCart).toHaveBeenCalled()
  })

  it('useAddToCart adds to guest store when unauthenticated', async () => {
    const { result } = renderHook(() => useAddToCart(), {
      wrapper: createWrapper(false),
    })

    await act(async () => {
      await result.current.mutateAsync({
        productId: 'prod-guest',
        productName: 'Guest Item',
        unitPrice: 150,
        quantity: 1,
      })
    })

    expect(mockCartService.addItem).not.toHaveBeenCalled()
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].product_id).toBe('prod-guest')
  })

  it('useAddToCart calls server cartService when authenticated', async () => {
    mockCartService.addItem.mockResolvedValue({
      id: 'server-cart-1',
      items: [],
      subtotal_egp: 300,
      item_count: 1,
    })

    const { result } = renderHook(() => useAddToCart(), {
      wrapper: createWrapper(true),
    })

    await act(async () => {
      await result.current.mutateAsync({
        productId: 'prod-server',
        productName: 'Server Item',
        unitPrice: 300,
        quantity: 1,
      })
    })

    expect(mockCartService.addItem).toHaveBeenCalledWith('prod-server', 1)
  })

  it('useRemoveCartItem calls removeItem on server when authenticated', async () => {
    mockCartService.removeItem.mockResolvedValue({
      id: 'server-cart-1',
      items: [],
      subtotal_egp: 0,
      item_count: 0,
    })

    const { result } = renderHook(() => useRemoveCartItem(), {
      wrapper: createWrapper(true),
    })

    await act(async () => {
      await result.current.mutateAsync('line-item-123')
    })

    expect(mockCartService.removeItem).toHaveBeenCalledWith('line-item-123')
  })

  it('useUpdateCartItemQuantity updates guest store when unauthenticated', async () => {
    useCartStore.getState().addItem({
      id: 'guest-item-1',
      product_id: 'guest-p1',
      product_name: 'Windows 11',
      unit_price: 300,
      quantity: 1,
    })

    const { result } = renderHook(() => useUpdateCartItemQuantity(), {
      wrapper: createWrapper(false),
    })

    await act(async () => {
      await result.current.mutateAsync({ itemId: 'guest-item-1', quantity: 3 })
    })

    expect(mockCartService.updateItemQuantity).not.toHaveBeenCalled()
    expect(useCartStore.getState().items[0].quantity).toBe(3)
  })

  it('useUpdateCartItemQuantity calls cartService.updateItemQuantity when authenticated', async () => {
    mockCartService.updateItemQuantity.mockResolvedValue({
      id: 'server-cart-1',
      items: [
        {
          id: 'line-item-123',
          product_id: 'prod-1',
          product_name: 'Office 2021',
          quantity: 2,
          is_preorder: false,
          unit_price: 499.99,
        },
      ],
      subtotal_egp: 999.98,
      item_count: 2,
    })

    const { result } = renderHook(() => useUpdateCartItemQuantity(), {
      wrapper: createWrapper(true),
    })

    await act(async () => {
      await result.current.mutateAsync({ itemId: 'line-item-123', quantity: 2 })
    })

    expect(mockCartService.updateItemQuantity).toHaveBeenCalledWith('line-item-123', 2)
  })

  it('useApplyPromoCode calls cartService.validatePromo', async () => {
    mockCartService.validatePromo.mockResolvedValue({
      valid: true,
      promo_code: 'SAVE10',
      items: [],
      original_subtotal: 300,
      total_discount: 30,
      final_total: 270,
      error_message: null,
    })

    const { result } = renderHook(() => useApplyPromoCode(), {
      wrapper: createWrapper(true),
    })

    let promoResult: { valid: boolean } | undefined
    await act(async () => {
      promoResult = (await result.current.mutateAsync('SAVE10')) as { valid: boolean }
    })

    expect(mockCartService.validatePromo).toHaveBeenCalledWith('SAVE10')
    expect(promoResult?.valid).toBe(true)
  })

  it('useCheckout executes checkout and clears guest cart', async () => {
    useCartStore.getState().addItem({
      product_id: 'old-guest',
      product_name: 'Old',
      unit_price: 100,
    })

    mockCartService.checkout.mockResolvedValue({
      id: 'order-123',
      reference_code: 'SM-123',
      status: 'pending_payment',
    })

    const { result } = renderHook(() => useCheckout(), {
      wrapper: createWrapper(true),
    })

    await act(async () => {
      await result.current.mutateAsync({ promo_code: 'DISCOUNT' })
    })

    expect(mockCartService.checkout).toHaveBeenCalledWith({ promo_code: 'DISCOUNT' })
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})
