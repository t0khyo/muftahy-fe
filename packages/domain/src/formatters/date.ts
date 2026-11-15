import { normalizeLocaleWithWesternDigits } from './locale'

export interface FormatDateOptions extends Intl.DateTimeFormatOptions {
  locale?: string
}

export const formatDate = (
  value: Date | number | string,
  options: FormatDateOptions = {},
): string => {
  const { locale = 'en', ...formatOptions } = options
  const dateObj = value instanceof Date ? value : new Date(value)
  const normalizedLocale = normalizeLocaleWithWesternDigits(locale)
  return new Intl.DateTimeFormat(normalizedLocale, formatOptions).format(dateObj)
}
