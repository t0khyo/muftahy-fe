import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCartService } from '@workspace/api/factory'
import type { CartCheckoutRequest } from '@workspace/domain/schemas/cart'
import type { ProductVariant } from '@workspace/domain/schemas/product'
import { useAuth } from '../../auth/hooks/use-auth'
import { useCartStore } from '../stores/cart-store'

export const CART_QUERY_KEY = ['cart'] as const

export interface UnifiedCartItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  is_preorder: boolean
  unit_price: number
  category?: string
  variant?: ProductVariant | null
  coverImage?: string
  slug?: string
  name?: string | { en: string; ar: string }
}

export interface UnifiedCart {
  items: UnifiedCartItem[]
  subtotal_egp: number
  item_count: number
  isLoading: boolean
  isError: boolean
}

export function useCart(): UnifiedCart {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const cartService = getCartService('storefront')
  const guestItems = useCartStore((s) => s.items)
  const syncGuestCart = useCartStore((s) => s.syncGuestCart)

  useEffect(() => {
    if (isAuthenticated && guestItems.length > 0) {
      syncGuestCart(cartService).then(({ synced }) => {
        if (synced > 0) {
          queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
        }
      })
    }
  }, [isAuthenticated, guestItems.length, syncGuestCart, cartService, queryClient])

  const cartQuery = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: () => cartService.getCart(),
    enabled: isAuthenticated,
  })

  if (isAuthenticated) {
    const data = cartQuery.data
    return {
      items: data?.items ?? [],
      subtotal_egp: data?.subtotal_egp ?? 0,
      item_count: data?.item_count ?? 0,
      isLoading: cartQuery.isLoading,
      isError: cartQuery.isError,
    }
  }

  const subtotal = guestItems.reduce((acc, i) => acc + i.unit_price * i.quantity, 0)
  const count = guestItems.reduce((acc, i) => acc + i.quantity, 0)

  return {
    items: guestItems.map((i) => ({
      id: i.id,
      product_id: i.product_id,
      product_name: i.product_name,
      quantity: i.quantity,
      is_preorder: i.is_preorder,
      unit_price: i.unit_price,
      category: i.category,
      variant: i.variant,
      coverImage: i.coverImage,
      slug: i.slug,
      name: i.name,
    })),
    subtotal_egp: subtotal,
    item_count: count,
    isLoading: false,
    isError: false,
  }
}

export function useAddToCart() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const cartService = getCartService('storefront')
  const addGuestItem = useCartStore((s) => s.addItem)

  return useMutation({
    onMutate: ({
      productId,
      quantity = 1,
      productName,
      unitPrice,
      isPreorder = false,
      slug,
      coverImage,
      category,
      variant,
    }: {
      productId: string
      quantity?: number
      productName?: string
      unitPrice?: number
      isPreorder?: boolean
      slug?: string
      coverImage?: string
      category?: string
      variant?: ProductVariant | null
    }) => {
      if (!isAuthenticated) {
        addGuestItem({
          product_id: productId,
          product_name: productName,
          quantity,
          unit_price: unitPrice,
          is_preorder: isPreorder,
          slug,
          coverImage,
          category,
          variant: variant ?? undefined,
        })
      }
    },
    mutationFn: async ({
      productId,
      quantity = 1,
    }: {
      productId: string
      quantity?: number
      productName?: string
      unitPrice?: number
      isPreorder?: boolean
      slug?: string
      coverImage?: string
      category?: string
      variant?: ProductVariant | null
    }) => {
      if (isAuthenticated) {
        return cartService.addItem(productId, quantity)
      }
      return null
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
      }
    },
  })
}

export function useRemoveCartItem() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const cartService = getCartService('storefront')
  const removeGuestItem = useCartStore((s) => s.removeItem)

  return useMutation({
    onMutate: (itemId: string) => {
      if (!isAuthenticated) {
        removeGuestItem(itemId)
      }
    },
    mutationFn: async (itemId: string) => {
      if (isAuthenticated) {
        return cartService.removeItem(itemId)
      }
      return null
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
      }
    },
  })
}

export function useApplyPromoCode() {
  const cartService = getCartService('storefront')
  return useMutation({
    mutationFn: (promoCode: string) => cartService.validatePromo(promoCode),
  })
}

export function useCheckout() {
  const queryClient = useQueryClient()
  const cartService = getCartService('storefront')
  const clearGuest = useCartStore((s) => s.clear)

  return useMutation({
    mutationFn: (payload?: CartCheckoutRequest) => cartService.checkout(payload),
    onSuccess: () => {
      clearGuest()
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
    },
  })
}
