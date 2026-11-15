/**
 * Ensures Western digits (0-9) are always used even for Arabic locales
 * by appending the Unicode `-u-nu-latn` extension if not already present.
 */
export const normalizeLocaleWithWesternDigits = (locale = 'en'): string => {
  if (locale.startsWith('ar') && !locale.includes('-u-nu-')) {
    return `${locale}-u-nu-latn`
  }
  return locale
}

