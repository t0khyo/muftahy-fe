import { describe, expect, it, vi } from 'vitest'
import { NativeFetchClient } from './fetch-client'
import { HttpProductAdapter } from './http-product-adapter'

describe('HttpProductAdapter', () => {
  it('calls GET /products with query parameters', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => [],
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpProductAdapter(client)

    await adapter.getProducts({ category: 'windows', only_active: true })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/products?category=windows&only_active=true',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('calls GET /products/categories', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ['windows', 'office'],
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpProductAdapter(client)

    const categories = await adapter.getCategories()
    expect(categories).toEqual(['windows', 'office'])
  })

  it('calls GET /products/:id', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ id: 'prod-123', name: 'Windows 11' }),
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpProductAdapter(client)

    const product = await adapter.getProductById('prod-123')
    expect(product.id).toBe('prod-123')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/products/prod-123',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('calls POST /products', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ id: 'new-id', name: 'Office 2021' }),
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpProductAdapter(client)

    await adapter.createProduct({
      name: 'Office 2021',
      category: 'office',
      base_price: '899.00',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/products',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('calls PATCH /products/:id', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ id: 'prod-123', sale_price: '299.00' }),
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpProductAdapter(client)

    await adapter.updateProduct('prod-123', { sale_price: '299.00' })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/products/prod-123',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })

  it('calls DELETE /products/:id', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Product deactivated' }),
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpProductAdapter(client)

    const res = await adapter.deleteProduct('prod-123')
    expect(res.message).toBe('Product deactivated')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/products/prod-123',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})

