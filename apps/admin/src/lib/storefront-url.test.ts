import { describe, expect, it, vi, beforeEach } from 'vitest'
import { getStorefrontUrl } from './storefront-url'

describe('getStorefrontUrl', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('prepends configured VITE_STOREFRONT_URL when present', () => {
    vi.stubEnv('VITE_STOREFRONT_URL', 'https://store.muftahy.com')
    expect(getStorefrontUrl('/en/products/elden-ring')).toBe('https://store.muftahy.com/en/products/elden-ring')
  })

  it('handles trailing slash on VITE_STOREFRONT_URL cleanly', () => {
    vi.stubEnv('VITE_STOREFRONT_URL', 'https://store.muftahy.com/')
    expect(getStorefrontUrl('/en/products/elden-ring')).toBe('https://store.muftahy.com/en/products/elden-ring')
  })

  it('handles paths missing leading slash cleanly', () => {
    vi.stubEnv('VITE_STOREFRONT_URL', 'https://store.muftahy.com')
    expect(getStorefrontUrl('ar/products/123')).toBe('https://store.muftahy.com/ar/products/123')
  })

  it('defaults to http://localhost:5173 in development mode when unset', () => {
    vi.stubEnv('VITE_STOREFRONT_URL', '')
    // In test environment DEV is true by default
    expect(getStorefrontUrl('/en/products/test')).toBe('http://localhost:5173/en/products/test')
  })
})

