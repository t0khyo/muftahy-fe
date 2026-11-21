import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartService } from '@workspace/api/services/cart-service'
import type { ProductCategory, ProductVariant } from '@workspace/domain/schemas/product'

export interface CartItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  is_preorder: boolean
  unit_price: number
  unit_price_egp?: string
  category?: ProductCategory
  variant?: ProductVariant
  coverImage?: string
  slug?: string
  name?: string | { en: string; ar: string }
}

export interface CartInputItem {
  id?: string
  product_id?: string
  productId?: string
  product_name?: string
  name?: string | { en: string; ar: string }
  quantity?: number
  is_preorder?: boolean
  unit_price?: number
  unit_price_egp?: string | number
  priceMinor?: number
  category?: ProductCategory
  variant?: ProductVariant
  coverImage?: string
  slug?: string
  planId?: string
  planName?: string | { en: string; ar: string }
  platform?: string
  region?: string
}

export interface CartState {
  items: CartItem[]
  count: number
  isSyncing: boolean
  addItem: (item: CartInputItem, quantity?: number) => void
  updateQuantity: (id: string, quantity: number, maxStock?: number) => void
  removeItem: (id: string) => void
  clear: () => void
  syncGuestCart: (cartService: CartService) => Promise<{ synced: number; failed: number }>
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,
      isSyncing: false,
      addItem: (item, quantity) =>
        set((state) => {
          const productId = item.product_id ?? item.productId ?? item.id ?? 'unknown'
          const itemId = item.id ?? productId

          const existingIndex = state.items.findIndex(
            (i) => i.id === itemId || i.product_id === productId,
          )
          const qty = Math.max(1, quantity ?? item.quantity ?? 1)

          let unitPrice = 0
          if (typeof item.unit_price === 'number') {
            unitPrice = item.unit_price
          } else if (item.unit_price_egp !== undefined) {
            unitPrice = Number(item.unit_price_egp) || 0
          } else if (item.priceMinor !== undefined) {
            unitPrice = item.priceMinor / 100
          }

          const nameStr =
            item.product_name ??
            (typeof item.name === 'string'
              ? item.name
              : (item.name?.en ?? 'Product'))

          if (existingIndex >= 0) {
            const nextItems = state.items.map((it, idx) =>
              idx === existingIndex ? { ...it, quantity: it.quantity + qty } : it,
            )
            return {
              items: nextItems,
              count: nextItems.reduce((acc, i) => acc + i.quantity, 0),
            }
          }

          const newItem: CartItem = {
            id: itemId,
            product_id: productId,
            product_name: nameStr,
            quantity: qty,
            is_preorder: Boolean(item.is_preorder),
            unit_price: unitPrice,
            unit_price_egp: unitPrice.toFixed(2),
            category: item.category,
            variant: item.variant,
            coverImage: item.coverImage,
            slug: item.slug ?? productId,
            name: item.name ?? nameStr,
          }

          const nextItems = [...state.items, newItem]
          return {
            items: nextItems,
            count: nextItems.reduce((acc, i) => acc + i.quantity, 0),
          }
        }),
      updateQuantity: (id, quantity, maxStock) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === id)
          if (!existing) return state

          let newQty = Math.max(1, quantity)
          if (maxStock !== undefined && maxStock > 0) {
            if (newQty > existing.quantity && newQty > maxStock) {
              newQty = Math.max(existing.quantity, maxStock)
            }
          }

          const nextItems = state.items.map((i) =>
            i.id === id ? { ...i, quantity: newQty } : i,
          )
          return {
            items: nextItems,
            count: nextItems.reduce((acc, i) => acc + i.quantity, 0),
          }
        }),
      removeItem: (id) =>
        set((state) => {
          const nextItems = state.items.filter((i) => i.id !== id && i.product_id !== id)
          return {
            items: nextItems,
            count: nextItems.reduce((acc, i) => acc + i.quantity, 0),
          }
        }),
      clear: () => set({ items: [], count: 0 }),
      syncGuestCart: async (cartService: CartService) => {
        const state = get()
        if (state.isSyncing || state.items.length === 0) {
          return { synced: 0, failed: 0 }
        }
        set({ isSyncing: true })
        let synced = 0
        let failed = 0
        const remaining: CartItem[] = []

        try {
          for (const item of state.items) {
            try {
              await cartService.addItem(item.product_id, item.quantity)
              synced++
            } catch {
              failed++
              remaining.push(item)
            }
          }
          set({
            items: remaining,
            count: remaining.reduce((acc, i) => acc + i.quantity, 0),
          })
        } finally {
          set({ isSyncing: false })
        }

        return { synced, failed }
      },
    }),
    {
      name: 'muftahy_guest_cart',
      partialize: (state) => ({ items: state.items, count: state.count }),
    },
  ),
)
