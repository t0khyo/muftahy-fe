import { formatMoneyFromMinor, type SupportedCurrency } from '@workspace/domain/formatters/money'
import type { CartItem } from '../stores/cart-store'

export function resolveLocalizedName(
  value: { en: string; ar: string } | string | undefined,
  lang: string,
): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  return (lang === 'ar' ? value.ar : value.en) ?? value.en ?? ''
}

export interface CurrencySubtotal {
  currency: SupportedCurrency
  amountMinor: number
  formatted: string
}

export function getCurrencySubtotals(
  items: CartItem[],
  lang: string,
): CurrencySubtotal[] {
  const map = new Map<SupportedCurrency, number>()

  for (const item of items) {
    const cur: SupportedCurrency = item.currency || 'EGP'
    const current = map.get(cur) ?? 0
    map.set(cur, current + item.priceMinor * item.quantity)
  }

  return Array.from(map.entries()).map(([currency, amountMinor]) => ({
    currency,
    amountMinor,
    formatted: formatMoneyFromMinor(amountMinor, currency, lang),
  }))
}
