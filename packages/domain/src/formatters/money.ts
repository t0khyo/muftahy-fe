import { normalizeLocaleWithWesternDigits } from './locale'

export const SUPPORTED_CURRENCIES = [
  'EGP',
  'USD',
  'SAR',
  'AED',
  'QAR',
  'KWD',
  'BHD',
  'OMR',
] as const

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

export const CURRENCY_DECIMALS: Record<SupportedCurrency, number> = {
  EGP: 2,
  USD: 2,
  SAR: 2,
  AED: 2,
  QAR: 2,
  KWD: 3,
  BHD: 3,
  OMR: 3,
}

export interface Money {
  amountMinor: number
  currency: SupportedCurrency
}

export interface FormatMoneyOptions {
  currency: SupportedCurrency
  locale?: string
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name'
}

/**
 * Format major unit currency amount (e.g. 19.99 USD or 500 EGP).
 */
export const formatMoney = (
  amount: number,
  options: FormatMoneyOptions,
): string => {
  const normalizedLocale = normalizeLocaleWithWesternDigits(options.locale ?? 'en')
  const decimals = CURRENCY_DECIMALS[options.currency] ?? 2

  const formatter = new Intl.NumberFormat(normalizedLocale, {
    style: 'currency',
    currency: options.currency,
    currencyDisplay: options.currencyDisplay ?? 'symbol',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return formatter.format(amount)
}

/**
 * Format minor unit amount (e.g. 1999 minor units for USD = 19.99).
 */
export const formatMoneyFromMinor = (
  amountMinor: number,
  currency: SupportedCurrency,
  locale?: string,
): string => {
  const decimals = CURRENCY_DECIMALS[currency] ?? 2
  const majorAmount = amountMinor / Math.pow(10, decimals)
  return formatMoney(majorAmount, { currency, locale })
}
