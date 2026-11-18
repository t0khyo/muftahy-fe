/**
 * Sanitizes return URL to prevent open redirect vulnerabilities (CWE-601).
 * Ensures destination is a same-origin relative path and enforces or preserves the active locale prefix.
 */
export function sanitizeReturnTo(
  rawPath: string | null | undefined,
  currentLang: string = 'en',
  fallbackSubPath: string = ''
): string {
  const normalizedLang = currentLang === 'ar' ? 'ar' : 'en'
  const fallback = fallbackSubPath ? `/${normalizedLang}/${fallbackSubPath.replace(/^\//, '')}` : `/${normalizedLang}`

  if (!rawPath) return fallback

  const decoded = decodeURIComponent(rawPath).trim()

  // Must start with single '/', must NOT start with '//' or '/\', must not contain protocol
  if (!/^\/[^/\\]/.test(decoded) || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(decoded)) {
    return fallback
  }

  // If decoded path already has /ar or /en prefix, return as is
  if (/^\/(ar|en)($|\/)/.test(decoded)) {
    return decoded
  }

  // Prepend active language prefix
  return `/${normalizedLang}${decoded}`
}

/**
 * Extracts and sanitizes returnUrl or returnTo from URLSearchParams.
 */
export function getSanitizedReturnUrl(searchParams: URLSearchParams, currentLang: string = 'en'): string {
  const raw = searchParams.get('returnUrl') || searchParams.get('returnTo')
  return sanitizeReturnTo(raw, currentLang)
}
