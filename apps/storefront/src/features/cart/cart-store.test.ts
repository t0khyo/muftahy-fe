import { beforeEach, describe, expect, it } from 'vitest'
import { useCartStore, type CartItem, type CartInputItem } from './stores/cart-store'
import { getCurrencySubtotals, resolveLocalizedName } from './lib/cart-selectors'

describe('Cart Store & Selectors', () => {
  beforeEach(() => {
    useCartStore.getState().clear()
  })

  it('adds items with compound id and computes count', () => {
    useCartStore.getState().addItem({
      productId: 'prod-001',
      planId: 'plan-1pc',
      slug: 'windows-11-pro',
      name: { en: 'Windows 11', ar: 'ويندوز 11' },
      planName: { en: '1 PC', ar: 'جهاز 1' },
      priceMinor: 65000,
      currency: 'EGP',
    }, 1)

    expect(useCartStore.getState().items.length).toBe(1)
    expect(useCartStore.getState().count).toBe(1)
    expect(useCartStore.getState().items[0].id).toBe('prod-001:plan-1pc')
  })

  it('is idempotent: adding an existing item does not increment quantity', () => {
    const item: CartInputItem = {
      productId: 'prod-001',
      planId: 'plan-1pc',
      slug: 'windows-11-pro',
      name: 'Windows 11',
      priceMinor: 65000,
      currency: 'EGP',
    }

    useCartStore.getState().addItem(item, 1)
    useCartStore.getState().addItem(item, 1)

    expect(useCartStore.getState().items.length).toBe(1)
    expect(useCartStore.getState().items[0].quantity).toBe(1)
    expect(useCartStore.getState().count).toBe(1)
  })

  it('updates quantity bounded by maxStock and minimum 1', () => {
    useCartStore.getState().addItem({
      id: 'item-1',
      productId: 'prod-001',
      planId: 'plan-1',
      slug: 'test',
      name: 'Test',
      priceMinor: 1000,
      currency: 'USD',
    }, 1)

    // Increase with maxStock 5
    useCartStore.getState().updateQuantity('item-1', 4, 5)
    expect(useCartStore.getState().items[0].quantity).toBe(4)

    // Attempt to exceed maxStock 5
    useCartStore.getState().updateQuantity('item-1', 10, 5)
    expect(useCartStore.getState().items[0].quantity).toBe(5)

    // Decrease towards 1
    useCartStore.getState().updateQuantity('item-1', 1, 5)
    expect(useCartStore.getState().items[0].quantity).toBe(1)

    // Attempt to drop below 1 clamps to 1
    useCartStore.getState().updateQuantity('item-1', 0, 5)
    expect(useCartStore.getState().items[0].quantity).toBe(1)
  })

  it('removes item and recalculates total count', () => {
    useCartStore.getState().addItem({
      id: 'i1',
      productId: 'p1',
      planId: 'pl1',
      slug: 's1',
      name: 'Item 1',
      priceMinor: 500,
      currency: 'EGP',
    }, 3)

    useCartStore.getState().addItem({
      id: 'i2',
      productId: 'p2',
      planId: 'pl2',
      slug: 's2',
      name: 'Item 2',
      priceMinor: 1000,
      currency: 'EGP',
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
        unit_price_egp: '500.00',
      },
      {
        id: '2',
        product_id: 'p2',
        product_name: 'Product 2',
        quantity: 1,
        is_preorder: true,
        unit_price_egp: '250.50',
      },
    ]

    const subtotals = getCurrencySubtotals(items, 'en')
    expect(subtotals.length).toBe(1)

    const egp = subtotals[0]
    expect(egp.currency).toBe('EGP')
    // (500.00 * 2) + 250.50 = 1250.50 EGP = 125050 piasters
    expect(egp.amountMinor).toBe(125050)
  })

  it('preserves metadata fields (platform, region, coverImage) on added items', () => {
    useCartStore.getState().addItem({
      id: 'p-meta',
      productId: 'p-meta',
      slug: 'meta-slug',
      name: 'Game with Meta',
      priceMinor: 1999,
      currency: 'USD',
      platform: 'steam',
      region: 'global',
      coverImage: 'https://images.unsplash.com/photo-1234',
    })

    const item = useCartStore.getState().items.find((i) => i.id === 'p-meta')
    expect(item?.platform).toBe('steam')
    expect(item?.region).toBe('global')
    expect(item?.coverImage).toBe('https://images.unsplash.com/photo-1234')
  })

  it('resolves localized names correctly according to language', () => {
    const bilingual = { en: 'English Title', ar: 'عنوان عربي' }
    expect(resolveLocalizedName(bilingual, 'en')).toBe('English Title')
    expect(resolveLocalizedName(bilingual, 'ar')).toBe('عنوان عربي')

    const stringOnly = 'Static String'
    expect(resolveLocalizedName(stringOnly, 'en')).toBe('Static String')
    expect(resolveLocalizedName(stringOnly, 'ar')).toBe('Static String')
  })
})
