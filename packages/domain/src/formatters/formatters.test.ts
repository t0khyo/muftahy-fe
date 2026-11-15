import { describe, expect, it } from 'vitest'
import { formatDate } from './date'
import { formatMoney, formatMoneyFromMinor } from './money'
import { formatNumber } from './number'

describe('formatMoney', () => {
  it('formats USD in English', () => {
    const formatted = formatMoney(29.99, { currency: 'USD', locale: 'en' })
    expect(formatted).toContain('29.99')
    expect(formatted).toContain('$')
  })

  it('formats EGP in Arabic using Western digits', () => {
    const formatted = formatMoney(150, { currency: 'EGP', locale: 'ar' })
    // Must contain Western digits 150
    expect(formatted).toMatch(/150/)
    // Must NOT contain Eastern Arabic digits (٠-٩)
    expect(formatted).not.toMatch(/[٠-٩]/)
  })

  it('formats KWD with 3 decimal places', () => {
    const formatted = formatMoney(10.5, { currency: 'KWD', locale: 'en' })
    expect(formatted).toContain('10.500')
  })

  it('formats from minor units correctly', () => {
    const formatted = formatMoneyFromMinor(1999, 'USD', 'en')
    expect(formatted).toContain('19.99')
  })

  it('formats 3-decimal currencies from minor units', () => {
    const formatted = formatMoneyFromMinor(1500, 'BHD', 'en')
    expect(formatted).toContain('1.500')
  })
})

describe('formatNumber', () => {
  it('formats numbers in English', () => {
    const formatted = formatNumber(1234567.89, { locale: 'en' })
    expect(formatted).toBe('1,234,567.89')
  })

  it('formats numbers in Arabic with Western digits', () => {
    const formatted = formatNumber(1234567, { locale: 'ar' })
    expect(formatted).toMatch(/1.*234.*567/)
    expect(formatted).not.toMatch(/[٠-٩]/)
  })
})

describe('formatDate', () => {
  it('formats dates in English', () => {
    const date = new Date(2026, 0, 15) // Jan 15, 2026
    const formatted = formatDate(date, { locale: 'en', dateStyle: 'medium' })
    expect(formatted).toContain('2026')
    expect(formatted).toContain('15')
  })

  it('formats dates in Arabic with Western digits', () => {
    const date = new Date(2026, 0, 15)
    const formatted = formatDate(date, { locale: 'ar', dateStyle: 'short' })
    expect(formatted).toContain('2026')
    expect(formatted).not.toMatch(/[٠-٩]/)
  })
})
