import { describe, expect, it } from 'vitest'
import { getProductService } from '../../factory'
import { MockProductAdapter } from './product-mock-adapter'

describe('MockProductAdapter', () => {
  it('lists all products without filter', async () => {
    const adapter = new MockProductAdapter()
    const products = await adapter.getProducts()
    expect(products.length).toBe(6)
    expect(products.every((p) => p.is_active)).toBe(true)
  })

  it('filters by category (windows vs office)', async () => {
    const adapter = new MockProductAdapter()
    const windows = await adapter.getProducts({ category: 'windows' })
    expect(windows.length).toBe(4)
    expect(windows.every((p) => p.category === 'windows')).toBe(true)

    const office = await adapter.getProducts({ category: 'office' })
    expect(office.length).toBe(2)
    expect(office.every((p) => p.category === 'office')).toBe(true)
  })

  it('returns canonical categories', async () => {
    const adapter = new MockProductAdapter()
    const categories = await adapter.getCategories()
    expect(categories).toEqual(['windows', 'office'])
  })

  it('retrieves a product by valid UUID', async () => {
    const adapter = new MockProductAdapter()
    const product = await adapter.getProductById('00000000-0000-4000-8000-000000000001')
    expect(product.name).toBe('Windows 11 Professional')
    expect(product.variant).toBe('retail')
    expect(product.effective_price).toBe('349.00')
  })

  it('throws on non-existent product ID', async () => {
    const adapter = new MockProductAdapter()
    await expect(
      adapter.getProductById('00000000-0000-4000-8000-999999999999'),
    ).rejects.toThrow('Product not found')
  })

  it('creates and appends a new product', async () => {
    const adapter = new MockProductAdapter()
    const created = await adapter.createProduct({
      name: 'Windows 11 Enterprise',
      category: 'windows',
      variant: 'retail',
      base_price: '599.00',
      sale_price: '499.00',
      preorder_enabled: true,
      description: 'Enterprise edition for corporate workstations.',
    })

    expect(created.id).toBeDefined()
    expect(created.name).toBe('Windows 11 Enterprise')
    expect(created.discount_percentage).toBe(17)
    expect(created.effective_price).toBe('499.00')

    const all = await adapter.getProducts()
    expect(all.length).toBe(7)
  })

  it('updates an existing product', async () => {
    const adapter = new MockProductAdapter()
    const updated = await adapter.updateProduct(
      '00000000-0000-4000-8000-000000000001',
      {
        sale_price: '319.00',
      },
    )

    expect(updated.sale_price).toBe('319.00')
    expect(updated.effective_price).toBe('319.00')
    expect(updated.discount_percentage).toBe(36)
  })

  it('soft-deactivates product on delete', async () => {
    const adapter = new MockProductAdapter()
    const result = await adapter.deleteProduct('00000000-0000-4000-8000-000000000001')
    expect(result.message).toContain('deactivated')

    const activeOnly = await adapter.getProducts({ only_active: true })
    expect(activeOnly.some((p) => p.id === '00000000-0000-4000-8000-000000000001')).toBe(false)

    const all = await adapter.getProducts({ only_active: false })
    expect(all.some((p) => p.id === '00000000-0000-4000-8000-000000000001')).toBe(true)
  })

  it('returns safe mock keys matching XXXXX-XXXXX-XXXXX pattern', async () => {
    const adapter = new MockProductAdapter()
    const key = await adapter.getSampleLicenseKey('00000000-0000-4000-8000-000000000001')
    expect(key).toBe('XXXXX-XXXXX-XXXXX')
  })

  it('returns singleton service from factory', () => {
    const s1 = getProductService()
    const s2 = getProductService()
    expect(s1).toBe(s2)
  })
})
