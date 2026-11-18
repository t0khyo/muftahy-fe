import { create } from 'zustand'
import type { SupportedCurrency } from '@workspace/domain/formatters/money'

export interface CartItem {
  id: string
  productId: string
  planId: string
  slug: string
  name: { en: string; ar: string } | string
  planName?: { en: string; ar: string } | string
  priceMinor: number
  currency: SupportedCurrency
  quantity: number
}

export interface CartInputItem {
  id?: string
  productId?: string
  planId?: string
  slug?: string
  name: { en: string; ar: string } | string
  planName?: { en: string; ar: string } | string
  priceMinor: number
  currency?: SupportedCurrency
}

export interface CartState {
  items: CartItem[]
  count: number
  addItem: (item: CartInputItem, quantity?: number) => void
  updateQuantity: (id: string, quantity: number, maxStock?: number) => void
  removeItem: (id: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  count: 0,
  addItem: (item, quantity = 1) =>
    set((state) => {
      const productId = item.productId ?? item.id ?? 'unknown'
      const planId = item.planId ?? 'default'
      const itemId = item.id ?? `${productId}:${planId}`

      const existing = state.items.find((i) => i.id === itemId)
      if (existing) {
        // Idempotent: adding a plan already in the cart never increases its quantity
        return state
      }

      const newItem: CartItem = {
        id: itemId,
        productId,
        planId,
        slug: item.slug ?? productId,
        name: item.name,
        planName: item.planName,
        priceMinor: item.priceMinor,
        currency: item.currency ?? 'EGP',
        quantity: Math.max(1, quantity),
      }

      const nextItems = [...state.items, newItem]
      const nextCount = nextItems.reduce((acc, i) => acc + i.quantity, 0)
      return { items: nextItems, count: nextCount }
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
      const nextCount = nextItems.reduce((acc, i) => acc + i.quantity, 0)
      return { items: nextItems, count: nextCount }
    }),
  removeItem: (id) =>
    set((state) => {
      const nextItems = state.items.filter((i) => i.id !== id)
      const nextCount = nextItems.reduce((acc, i) => acc + i.quantity, 0)
      return { items: nextItems, count: nextCount }
    }),
  clear: () => set({ items: [], count: 0 }),
}))
