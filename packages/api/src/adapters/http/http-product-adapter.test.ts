import { describe, expect, it, vi } from 'vitest'
import { NativeFetchClient } from './fetch-client'
import { HttpProductAdapter } from './http-product-adapter'
import { getProductMainImageUrl, resolveStorageUrl } from '../../factory'
import type { ProductResponse } from '@workspace/domain/schemas/product'

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

    await adapter.getProducts({ category: 'operating-systems', only_active: true })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/products?category=operating-systems&only_active=true',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('calls GET /categories (public categories)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => [{ id: 'cat-1', name: 'Operating Systems', slug: 'operating-systems' }],
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpProductAdapter(client)

    const categories = await adapter.getPublicCategories()
    expect(categories).toHaveLength(1)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/categories',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('calls GET /categories/slug/{slug}', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ id: 'cat-1', name: 'Operating Systems', slug: 'operating-systems', products: [] }),
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpProductAdapter(client)

    const cat = await adapter.getCategoryBySlug('operating-systems')
    expect(cat.slug).toBe('operating-systems')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/categories/slug/operating-systems',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('calls GET /products/slug/{slug}', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ id: 'prod-123', slug: 'win-11-pro', name: 'Windows 11' }),
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpProductAdapter(client)

    const product = await adapter.getProductBySlug('win-11-pro')
    expect(product.slug).toBe('win-11-pro')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/products/slug/win-11-pro',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('calls GET /admin/categories', async () => {
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

    await adapter.getAdminCategories()
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/admin/categories',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('calls POST /admin/categories', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ id: 'cat-new', name: 'Office', code: 'OFF' }),
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpProductAdapter(client)

    await adapter.createCategory({
      name: 'Office',
      code: 'OFF',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/admin/categories',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('calls PATCH and DELETE /admin/categories/{id}', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ id: 'cat-1', name: 'Updated' }),
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpProductAdapter(client)

    await adapter.updateCategory('cat-1', { name: 'Updated' })
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/admin/categories/cat-1',
      expect.objectContaining({ method: 'PATCH' }),
    )

    await adapter.deleteCategory('cat-1')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/admin/categories/cat-1',
      expect.objectContaining({ method: 'DELETE' }),
    )
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

  it('calls POST /products and PATCH /products/:id', async () => {
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
      category_id: 'cat-uuid',
      sku: 'OFF-2021-PRO-RET',
      base_price: '899.00',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/products',
      expect.objectContaining({ method: 'POST' }),
    )

    await adapter.updateProduct('new-id', { sale_price: '299.00' })
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/products/new-id',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })

  it('handles image operations (upload, delete, set primary, reorder)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ id: 'img-1', is_primary: true }),
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpProductAdapter(client)

    const blob = new Blob(['fake image content'], { type: 'image/webp' })
    await adapter.uploadProductImage('prod-1', {
      file: blob,
      alt_text: 'Test image',
      is_primary: true,
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/products/prod-1/images',
      expect.objectContaining({ method: 'POST' }),
    )

    await adapter.setPrimaryProductImage('prod-1', 'img-1')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/products/prod-1/images/img-1/primary',
      expect.objectContaining({ method: 'PATCH' }),
    )

    await adapter.reorderProductImages('prod-1', {
      items: [{ image_id: 'img-1', display_order: 0 }],
    })
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/products/prod-1/images/reorder',
      expect.objectContaining({ method: 'PATCH' }),
    )

    await adapter.deleteProductImage('prod-1', 'img-1')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/products/prod-1/images/img-1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})

describe('resolveStorageUrl & getProductMainImageUrl', () => {
  it('handles empty and legacy image paths', () => {
    expect(resolveStorageUrl(null)).toBeNull()
    expect(resolveStorageUrl('')).toBeNull()
    expect(resolveStorageUrl('   ')).toBeNull()
    expect(resolveStorageUrl('/images/products/windows-11.webp')).toBeNull()
  })

  it('leaves absolute and blob URLs unchanged', () => {
    expect(resolveStorageUrl('https://example.com/photo.webp')).toBe('https://example.com/photo.webp')
    expect(resolveStorageUrl('blob:http://localhost:5173/abc-123')).toBe('blob:http://localhost:5173/abc-123')
  })

  it('normalizes relative storage paths with base origin', () => {
    const base = 'http://localhost:8000/api/v1'
    expect(resolveStorageUrl('products/img.webp', base)).toBe('http://localhost:8000/storage/products/img.webp')
    expect(resolveStorageUrl('/storage/products/img.webp', base)).toBe('http://localhost:8000/storage/products/img.webp')
  })

  it('resolves primary image with fallback in getProductMainImageUrl', () => {
    const product: Pick<ProductResponse, 'primary_image_url' | 'images'> = {
      primary_image_url: 'products/primary.webp',
      images: [
        {
          id: '1',
          file_path: 'products/other.webp',
          alt_text: null,
          is_primary: false,
          display_order: 0,
          file_size: 100,
          mime_type: 'image/webp',
          width: null,
          height: null,
          url: 'products/other.webp',
        },
      ],
    }

    expect(getProductMainImageUrl(product, 'http://localhost:8000/api/v1')).toBe(
      'http://localhost:8000/storage/products/primary.webp',
    )

    const noPrimaryProduct: Pick<ProductResponse, 'primary_image_url' | 'images'> = {
      primary_image_url: null,
      images: product.images,
    }

    expect(getProductMainImageUrl(noPrimaryProduct, 'http://localhost:8000/api/v1')).toBe(
      'http://localhost:8000/storage/products/other.webp',
    )
  })
})
