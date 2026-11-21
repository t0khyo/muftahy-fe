import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CartService } from '@workspace/api/services/cart-service'
import { useCartStore, type CartItem } from './stores/cart-store'
import { getCartTotalEgp, getCurrencySubtotals, resolveLocalizedName } from './lib/cart-selectors'

describe('Cart Store & Selectors', () => {
  beforeEach(() => {
    useCartStore.getState().clear()
  })

  it('adds items and computes count', () => {
    useCartStore.getState().addItem({
      productId: 'prod-001',
      product_name: 'Windows 11 Pro',
      unit_price: 299.99,
      quantity: 1,
    })

    expect(useCartStore.getState().items.length).toBe(1)
    expect(useCartStore.getState().count).toBe(1)
    expect(useCartStore.getState().items[0].product_id).toBe('prod-001')
    expect(useCartStore.getState().items[0].unit_price).toBe(299.99)
  })

  it('increments quantity when existing item is added', () => {
    useCartStore.getState().addItem({
      product_id: 'prod-001',
      product_name: 'Windows 11 Pro',
      unit_price: 299.99,
    }, 1)
    useCartStore.getState().addItem({
      product_id: 'prod-001',
      product_name: 'Windows 11 Pro',
      unit_price: 299.99,
    }, 2)

    expect(useCartStore.getState().items.length).toBe(1)
    expect(useCartStore.getState().items[0].quantity).toBe(3)
    expect(useCartStore.getState().count).toBe(3)
  })

  it('updates quantity bounded by maxStock and minimum 1', () => {
    useCartStore.getState().addItem({
      id: 'item-1',
      product_id: 'prod-001',
      product_name: 'Test Product',
      unit_price: 100,
    }, 1)

    // Increase with maxStock 5
    useCartStore.getState().updateQuantity('item-1', 4, 5)
    expect(useCartStore.getState().items[0].quantity).toBe(4)

    // Exceed maxStock 5
    useCartStore.getState().updateQuantity('item-1', 10, 5)
    expect(useCartStore.getState().items[0].quantity).toBe(5)

    // Drop below 1 clamps to 1
    useCartStore.getState().updateQuantity('item-1', 0, 5)
    expect(useCartStore.getState().items[0].quantity).toBe(1)
  })

  it('removes item and recalculates total count', () => {
    useCartStore.getState().addItem({
      id: 'i1',
      product_id: 'p1',
      product_name: 'Item 1',
      unit_price: 50,
    }, 3)

    useCartStore.getState().addItem({
      id: 'i2',
      product_id: 'p2',
      product_name: 'Item 2',
      unit_price: 100,
    }, 2)

    expect(useCartStore.getState().count).toBe(5)
    useCartStore.getState().removeItem('i1')
    expect(useCartStore.getState().items.length).toBe(1)
    expect(useCartStore.getState().count).toBe(2)
  })

  it('computes currency subtotal accurately in EGP', () => {
    const items: CartItem[] = [
      {
        id: '1',
        product_id: 'p1',
        product_name: 'Product 1',
        quantity: 2,
        is_preorder: false,
        unit_price: 500,
      },
      {
        id: '2',
        product_id: 'p2',
        product_name: 'Product 2',
        quantity: 1,
        is_preorder: true,
        unit_price: 250.5,
      },
    ]

    const total = getCartTotalEgp(items)
    expect(total).toBe(1250.5)

    const subtotals = getCurrencySubtotals(items, 'en')
    expect(subtotals.length).toBe(1)
    expect(subtotals[0].currency).toBe('EGP')
    expect(subtotals[0].amountMinor).toBe(125050)
  })

  it('resolves localized names correctly according to language', () => {
    const bilingual = { en: 'English Title', ar: 'عنوان عربي' }
    expect(resolveLocalizedName(bilingual, 'en')).toBe('English Title')
    expect(resolveLocalizedName(bilingual, 'ar')).toBe('عنوان عربي')

    const stringOnly = 'Static String'
    expect(resolveLocalizedName(stringOnly, 'en')).toBe('Static String')
    expect(resolveLocalizedName(stringOnly, 'ar')).toBe('Static String')
  })

  it('syncGuestCart replays items to cartService and clears synced entries', async () => {
    useCartStore.getState().addItem({
      product_id: 'prod-001',
      product_name: 'Windows 11',
      unit_price: 300,
    }, 2)
    useCartStore.getState().addItem({
      product_id: 'prod-002',
      product_name: 'Office 2021',
      unit_price: 500,
    }, 1)

    const mockCartService: CartService = {
      getCart: vi.fn(),
      addItem: vi.fn().mockResolvedValue({
        id: 'server-cart-id',
        items: [],
        subtotal_egp: 1100,
        item_count: 3,
      }),
      removeItem: vi.fn(),
      validatePromo: vi.fn(),
      checkout: vi.fn(),
    }

    const result = await useCartStore.getState().syncGuestCart(mockCartService)

    expect(result.synced).toBe(2)
    expect(result.failed).toBe(0)
    expect(mockCartService.addItem).toHaveBeenCalledTimes(2)
    expect(mockCartService.addItem).toHaveBeenCalledWith('prod-001', 2)
    expect(mockCartService.addItem).toHaveBeenCalledWith('prod-002', 1)
    expect(useCartStore.getState().items).toHaveLength(0)
    expect(useCartStore.getState().count).toBe(0)
  })

  it('syncGuestCart is protected by concurrency latch', async () => {
    useCartStore.getState().addItem({
      product_id: 'prod-001',
      product_name: 'Windows 11',
      unit_price: 300,
    }, 1)

    const mockCartService: CartService = {
      getCart: vi.fn(),
      addItem: vi.fn().mockImplementation(async () => {
        await new Promise((r) => setTimeout(r, 20))
        return {
          id: 'server-cart-id',
          items: [],
          subtotal_egp: 300,
          item_count: 1,
        }
      }),
      removeItem: vi.fn(),
      validatePromo: vi.fn(),
      checkout: vi.fn(),
    }

    // Launch two syncs concurrently
    const p1 = useCartStore.getState().syncGuestCart(mockCartService)
    const p2 = useCartStore.getState().syncGuestCart(mockCartService)

    const [r1, r2] = await Promise.all([p1, p2])

    expect(r1.synced).toBe(1)
    expect(r2.synced).toBe(0) // Second invocation exited early due to isSyncing latch
    expect(mockCartService.addItem).toHaveBeenCalledTimes(1)
  })
})
