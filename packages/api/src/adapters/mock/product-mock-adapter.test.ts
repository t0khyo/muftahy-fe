import { describe, expect, it } from 'vitest'
import { getProductService } from '../../factory'
import { MockProductAdapter } from './product-mock-adapter'

describe('MockProductAdapter', () => {
  const adapter = new MockProductAdapter()

  it('lists all products without filter', async () => {
    const result = await adapter.list()
    expect(result.items.length).toBeGreaterThanOrEqual(4)
    expect(result.total).toBeGreaterThanOrEqual(4)
    expect(result.page).toBe(1)
  })

  it('filters by category (single and array)', async () => {
    const games = await adapter.list({ category: 'games' })
    expect(games.items.length).toBeGreaterThan(0)
    expect(games.items.every((p) => p.category === 'games')).toBe(true)

    const multi = await adapter.list({ category: ['games', 'software'] })
    expect(multi.items.length).toBeGreaterThan(games.items.length)
    expect(multi.items.every((p) => p.category === 'games' || p.category === 'software')).toBe(true)
  })

  it('filters by inStock, onSale, and price range', async () => {
    const inStock = await adapter.list({ inStock: true })
    expect(inStock.items.every((p) => p.inStock)).toBe(true)

    const onSale = await adapter.list({ onSale: true })
    expect(
      onSale.items.every(
        (p) => p.originalPrice && p.originalPrice.amountMinor > p.price.amountMinor,
      ),
    ).toBe(true)

    const priceFiltered = await adapter.list({ priceMin: 50, priceMax: 1000 })
    expect(
      priceFiltered.items.every(
        (p) => (p.price.amountMinor / 100) >= 50 && (p.price.amountMinor / 100) <= 1000,
      ),
    ).toBe(true)
  })

  it('sorts by price asc and desc', async () => {
    const asc = await adapter.list({ sort: 'price-asc' })
    for (let i = 1; i < asc.items.length; i++) {
      expect(asc.items[i].price.amountMinor).toBeGreaterThanOrEqual(
        asc.items[i - 1].price.amountMinor,
      )
    }

    const desc = await adapter.list({ sort: 'price-desc' })
    for (let i = 1; i < desc.items.length; i++) {
      expect(desc.items[i].price.amountMinor).toBeLessThanOrEqual(
        desc.items[i - 1].price.amountMinor,
      )
    }
  })

  it('returns filter counts for only available options', async () => {
    const counts = await adapter.getFilterCounts()
    expect(counts.total).toBeGreaterThan(0)
    expect(counts.categories.length).toBeGreaterThan(0)
    // Steam, Microsoft, Xbox, PlayStation exist; Nintendo has 0 products and must NOT be in platforms list
    expect(counts.platforms.some((p) => p.value === 'nintendo')).toBe(false)
    expect(counts.platforms.some((p) => p.value === 'steam')).toBe(true)
  })

  it('retrieves product by slug', async () => {
    const product = await adapter.getBySlug('windows-11-pro')
    expect(product).not.toBeNull()
    expect(product?.slug).toBe('windows-11-pro')
  })

  it('lists products by collection (best-sellers, deals, new)', async () => {
    const bestSellers = await adapter.listByCollection('best-sellers')
    expect(bestSellers.length).toBeGreaterThan(0)

    const deals = await adapter.listByCollection('deals')
    expect(deals.length).toBeGreaterThan(0)
    expect(
      deals.every(
        (p) => p.originalPrice && p.originalPrice.amountMinor > p.price.amountMinor,
      ),
    ).toBe(true)

    const newReleases = await adapter.listByCollection('new')
    expect(newReleases.length).toBeGreaterThan(0)
  })

  it('returns safe mock keys matching XXXXX-XXXXX-XXXXX pattern', async () => {
    const key = await adapter.getSampleLicenseKey('prod-001')
    expect(key).toBe('XXXXX-XXXXX-XXXXX')
  })

  it('returns singleton service from factory', () => {
    const s1 = getProductService()
    const s2 = getProductService()
    expect(s1).toBe(s2)
  })

  it('provides bilingual detail sections and plans for all products', async () => {
    const list = await adapter.list()
    for (const p of list.items) {
      expect(p.plans?.length).toBeGreaterThan(0)
      expect(p.specs).toBeDefined()
      expect(p.activationSteps?.length).toBeGreaterThan(0)
      expect(p.includes?.length).toBeGreaterThan(0)
      expect(p.faq?.length).toBeGreaterThan(0)
      expect(p.relatedSlugs?.length).toBeGreaterThan(0)
      // Every relatedSlug must point to a valid product slug
      for (const relSlug of p.relatedSlugs ?? []) {
        const rel = await adapter.getBySlug(relSlug)
        expect(rel).not.toBeNull()
      }
    }

    const w11 = await adapter.getBySlug('windows-11-pro')
    expect(w11?.plans?.length).toBe(2)
    expect(w11?.plans?.some((plan) => plan.stock <= 5)).toBe(true)

    const psn = await adapter.getBySlug('playstation-network-card-100-sar')
    expect(psn?.plans?.every((plan) => plan.stock === 0)).toBe(true)
    expect(psn?.regionNote).toBeDefined()
  })
})

