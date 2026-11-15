/**
 * Resolves and normalizes a navigation href for the current language context.
 *
 * Rules:
 * 1. Empty strings, in-page hash links (#...), and non-HTTP protocols (mailto:, tel:) are returned as-is.
 * 2. Absolute external URLs (http://, https://) are returned as-is.
 * 3. Parameterized path tokens (/:lang/...) replace ':lang' with the target language.
 * 4. Already-localized paths (e.g. '/en/products' with lang 'en') are returned as-is to prevent double prefixing.
 * 5. Relative paths with or without leading slash are prefixed with '/${lang}/...'.
 */
export function resolveLocaleHref(href: string, lang: string): string {
  if (
    !href ||
    href.startsWith('#') ||
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  ) {
    return href
  }

  if (href.includes(':lang')) {
    return href.replace(':lang', lang)
  }

  if (href.startsWith(`/${lang}/`) || href === `/${lang}`) {
    return href
  }

  const cleanPath = href.startsWith('/') ? href : `/${href}`
  return `/${lang}${cleanPath}`
}
