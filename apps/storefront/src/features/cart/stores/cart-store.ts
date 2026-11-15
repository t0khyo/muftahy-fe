import { create } from 'zustand'

export interface CartItem {
  id: string
  name: string
  priceMinor: number
  quantity: number
}

export interface CartState {
  items: CartItem[]
  count: number
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (id: string) => void
  setCount: (count: number) => void
  clear: () => void
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  count: 0,
  addItem: (item, quantity = 1) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id)
      let nextItems: CartItem[]
      if (existing) {
        nextItems = state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i,
        )
      } else {
        nextItems = [...state.items, { ...item, quantity }]
      }
      const nextCount = nextItems.reduce((acc, i) => acc + i.quantity, 0)
      return { items: nextItems, count: nextCount }
    }),
  removeItem: (id) =>
    set((state) => {
      const nextItems = state.items.filter((i) => i.id !== id)
      const nextCount = nextItems.reduce((acc, i) => acc + i.quantity, 0)
      return { items: nextItems, count: nextCount }
    }),
  setCount: (count) => set({ count: Math.max(0, count) }),
  clear: () => set({ items: [], count: 0 }),
}))

