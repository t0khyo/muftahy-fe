import { describe, expect, it } from 'vitest'
import { resolveLocaleHref } from './resolve-locale-href'

describe('resolveLocaleHref', () => {
  it('returns external URLs unchanged', () => {
    expect(resolveLocaleHref('https://example.com', 'en')).toBe('https://example.com')
    expect(resolveLocaleHref('http://example.com/page', 'ar')).toBe('http://example.com/page')
  })

  it('returns in-page anchor links unchanged', () => {
    expect(resolveLocaleHref('#how-it-works', 'en')).toBe('#how-it-works')
    expect(resolveLocaleHref('#faq', 'ar')).toBe('#faq')
  })

  it('returns mailto and tel protocol schemes unchanged', () => {
    expect(resolveLocaleHref('mailto:support@muftahy.com', 'en')).toBe('mailto:support@muftahy.com')
    expect(resolveLocaleHref('tel:+966500000000', 'ar')).toBe('tel:+966500000000')
  })

  it('handles empty or falsy strings safely', () => {
    expect(resolveLocaleHref('', 'en')).toBe('')
  })

  it('replaces :lang parameter token with active language', () => {
    expect(resolveLocaleHref('/:lang/products', 'en')).toBe('/en/products')
    expect(resolveLocaleHref('/:lang/how-it-works', 'ar')).toBe('/ar/how-it-works')
  })

  it('does not double-prefix already localized paths', () => {
    expect(resolveLocaleHref('/en/products', 'en')).toBe('/en/products')
    expect(resolveLocaleHref('/ar/deals', 'ar')).toBe('/ar/deals')
    expect(resolveLocaleHref('/en', 'en')).toBe('/en')
    expect(resolveLocaleHref('/ar', 'ar')).toBe('/ar')
  })

  it('prefixes un-prefixed relative paths with the active language', () => {
    expect(resolveLocaleHref('/products', 'en')).toBe('/en/products')
    expect(resolveLocaleHref('products', 'en')).toBe('/en/products')
    expect(resolveLocaleHref('/categories/software', 'ar')).toBe('/ar/categories/software')
  })
})
