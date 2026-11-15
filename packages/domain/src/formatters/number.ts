import { normalizeLocaleWithWesternDigits } from './locale'

export interface FormatNumberOptions extends Intl.NumberFormatOptions {
  locale?: string
}

export const formatNumber = (
  value: number,
  options: FormatNumberOptions = {},
): string => {
  const { locale = 'en', ...formatOptions } = options
  const normalizedLocale = normalizeLocaleWithWesternDigits(locale)
  return new Intl.NumberFormat(normalizedLocale, formatOptions).format(value)
}
