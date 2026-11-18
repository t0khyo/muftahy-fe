import { describe, expect, it } from 'vitest'
import { getSanitizedReturnUrl, sanitizeReturnTo } from './sanitize-return-to'

describe('sanitizeReturnTo', () => {
  it('allows safe relative paths and prepends active lang prefix', () => {
    expect(sanitizeReturnTo('/account/profile', 'ar')).toBe('/ar/account/profile')
    expect(sanitizeReturnTo('/checkout', 'en')).toBe('/en/checkout')
  })

  it('preserves existing valid language prefix', () => {
    expect(sanitizeReturnTo('/en/account/profile', 'ar')).toBe('/en/account/profile')
    expect(sanitizeReturnTo('/ar/products', 'en')).toBe('/ar/products')
  })

  it('rejects external URLs with protocols', () => {
    expect(sanitizeReturnTo('https://evil.com', 'ar')).toBe('/ar/account/profile')
    expect(sanitizeReturnTo('http://attacker.com/steal', 'en')).toBe('/en/account/profile')
    expect(sanitizeReturnTo('javascript:alert(1)', 'ar')).toBe('/ar/account/profile')
  })

  it('rejects protocol-relative and backslash injection attacks', () => {
    expect(sanitizeReturnTo('//evil.com', 'ar')).toBe('/ar/account/profile')
    expect(sanitizeReturnTo('/\\evil.com', 'ar')).toBe('/ar/account/profile')
    expect(sanitizeReturnTo('///malicious', 'ar')).toBe('/ar/account/profile')
  })

  it('falls back when rawPath is null, undefined, or empty', () => {
    expect(sanitizeReturnTo(null, 'ar')).toBe('/ar/account/profile')
    expect(sanitizeReturnTo(undefined, 'en')).toBe('/en/account/profile')
    expect(sanitizeReturnTo('', 'ar')).toBe('/ar/account/profile')
    expect(sanitizeReturnTo('   ', 'ar')).toBe('/ar/account/profile')
  })

  it('extracts from search params supporting both returnUrl and returnTo', () => {
    const params1 = new URLSearchParams('returnUrl=%2Fcheckout')
    expect(getSanitizedReturnUrl(params1, 'ar')).toBe('/ar/checkout')

    const params2 = new URLSearchParams('returnTo=%2Faccount%2Forders')
    expect(getSanitizedReturnUrl(params2, 'en')).toBe('/en/account/orders')
  })
})
