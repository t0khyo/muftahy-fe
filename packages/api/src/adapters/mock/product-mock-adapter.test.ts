import { describe, expect, it } from 'vitest'
import { getProductService } from '../../factory'
import { MockProductAdapter } from './product-mock-adapter'

describe('MockProductAdapter', () => {
  const adapter = new MockProductAdapter()

  it('lists all products without filter', async () => {
    const products = await adapter.list()
    expect(products.length).toBeGreaterThanOrEqual(4)
  })

  it('filters by category', async () => {
    const games = await adapter.list({ category: 'games' })
    expect(games.length).toBeGreaterThan(0)
    expect(games.every((p) => p.category === 'games')).toBe(true)
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
})

