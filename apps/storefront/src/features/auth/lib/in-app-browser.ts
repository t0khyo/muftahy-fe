/**
 * Detects if the current user agent is an embedded mobile WebView
 * (e.g., Instagram, Facebook, TikTok, Twitter/X, Snapchat, Line).
 * Google OAuth popups strictly fail with 403 disallowed_useragent in these environments.
 */
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
  const ua = (navigator.userAgent || navigator.vendor || '').toLowerCase()
  return /fban|fbav|instagram|tiktok|line|twitter|snapchat/i.test(ua)
}
