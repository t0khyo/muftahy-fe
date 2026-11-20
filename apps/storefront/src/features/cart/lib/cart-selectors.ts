import { formatMoneyFromMinor, toPiasters, type SupportedCurrency } from '@workspace/domain/formatters/money'
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
  const totalMinor = items.reduce((acc, item) => {
    const piasters = item.unit_price_egp
      ? toPiasters(item.unit_price_egp)
      : (item.priceMinor ?? 0)
    return acc + piasters * item.quantity
  }, 0)

  return [
    {
      currency: 'EGP',
      amountMinor: totalMinor,
      formatted: formatMoneyFromMinor(totalMinor, 'EGP', lang),
    },
  ]
}

export function getCartTotalMinor(items: CartItem[]): number {
  return items.reduce((acc, item) => {
    const piasters = item.unit_price_egp
      ? toPiasters(item.unit_price_egp)
      : (item.priceMinor ?? 0)
    return acc + piasters * item.quantity
  }, 0)
}
