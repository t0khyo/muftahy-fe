import { create } from 'zustand'
import { toPiasters } from '@workspace/domain/formatters/money'
import type { ProductCategory, ProductVariant } from '@workspace/domain/schemas/product'

export interface CartItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  is_preorder: boolean
  unit_price_egp: string
  category?: ProductCategory
  variant?: ProductVariant
  coverImage?: string
  // Compatibility fields
  slug?: string
  name?: string | { en: string; ar: string }
  planId?: string
  planName?: string | { en: string; ar: string }
  priceMinor?: number
  currency?: string
  platform?: string
  region?: string
}

export interface CartInputItem {
  id?: string
  product_id?: string
  productId?: string
  product_name?: string
  name?: string | { en: string; ar: string }
  quantity?: number
  is_preorder?: boolean
  unit_price_egp?: string
  priceMinor?: number
  currency?: string
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
      const productId = item.product_id ?? item.productId ?? item.id ?? 'unknown'
      const itemId =
        item.id ??
        (item.planId && (item.productId ?? item.product_id)
          ? `${item.productId ?? item.product_id}:${item.planId}`
          : productId)

      const existing = state.items.find((i) => i.id === itemId)
      if (existing) {
        return state
      }

      const unitPrice =
        item.unit_price_egp ??
        (item.priceMinor !== undefined ? (item.priceMinor / 100).toFixed(2) : '0.00')

      const nameStr =
        item.product_name ??
        (typeof item.name === 'string'
          ? item.name
          : (item.name?.en ?? 'Product'))

      const newItem: CartItem = {
        id: itemId,
        product_id: productId,
        product_name: nameStr,
        quantity: Math.max(1, quantity),
        is_preorder: Boolean(item.is_preorder),
        unit_price_egp: unitPrice,
        category: item.category,
        variant: item.variant,
        coverImage: item.coverImage,
        slug: item.slug ?? productId,
        name: item.name ?? nameStr,
        planId: item.planId,
        planName: item.planName,
        priceMinor: toPiasters(unitPrice),
        currency: 'EGP',
        platform: item.platform,
        region: item.region,
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
