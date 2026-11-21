import { formatMoney, type SupportedCurrency } from '@workspace/domain/formatters/money'
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

export function getCartTotalEgp(
  items: Array<{ unit_price?: number; unit_price_egp?: string | number; quantity: number }>,
): number {
  return items.reduce((acc, item) => {
    const price =
      typeof item.unit_price === 'number'
        ? item.unit_price
        : item.unit_price_egp
          ? Number(item.unit_price_egp)
          : 0
    return acc + price * item.quantity
  }, 0)
}

export function getCurrencySubtotals(
  items: Array<{ unit_price?: number; unit_price_egp?: string | number; quantity: number }>,
  lang: string,
): CurrencySubtotal[] {
  const total = getCartTotalEgp(items)
  return [
    {
      currency: 'EGP',
      amountMinor: Math.round(total * 100),
      formatted: formatMoney(total, { currency: 'EGP', locale: lang }),
    },
  ]
}

export function getCartTotalMinor(
  items: Array<{ unit_price?: number; unit_price_egp?: string | number; quantity: number }>,
): number {
  return Math.round(getCartTotalEgp(items) * 100)
}
