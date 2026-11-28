/**
 * Centralized helpers for reading storefront runtime configuration from
 * Vite environment variables (`import.meta.env`).
 */

function readEnv(key: keyof ImportMetaEnv): string | null {
  const raw = import.meta.env?.[key]
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : null
}

/** Returns the configured Google OAuth client ID, or an empty string if unset. */
export function getGoogleClientId(): string {
  return readEnv('VITE_GOOGLE_CLIENT_ID') ?? ''
}

/** Returns digits-only WhatsApp phone number from `VITE_WHATSAPP_NUMBER`, or null if unset. */
export function getWhatsAppNumber(): string | null {
  const raw = readEnv('VITE_WHATSAPP_NUMBER')
  if (!raw) return null
  const digits = raw.replace(/[^0-9]/g, '')
  return digits.length > 0 ? digits : null
}

/**
 * Builds a `https://wa.me/...` URL using an optional override number or
 * `VITE_WHATSAPP_NUMBER`. Returns `null` when no valid number is configured.
 */
export function buildWhatsAppUrl(message?: string, overrideNumber?: string): string | null {
  const digits =
    overrideNumber !== undefined
      ? overrideNumber.replace(/[^0-9]/g, '') || null
      : getWhatsAppNumber()

  if (!digits) return null
  if (!message) return `https://wa.me/${digits}`
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

/** Returns the configured support email from `VITE_SUPPORT_EMAIL`, or null if unset. */
export function getSupportEmail(): string | null {
  return readEnv('VITE_SUPPORT_EMAIL')
}

/** Returns a `mailto:` URL for the configured support email, or null if unset. */
export function buildSupportEmailUrl(): string | null {
  const email = getSupportEmail()
  return email ? `mailto:${email}` : null
}

export interface SocialLinksConfig {
  instagramUrl: string | null
  facebookUrl: string | null
  handle: string | null
}

/** Returns configured social media URLs and display handle. */
export function getSocialLinks(): SocialLinksConfig {
  return {
    instagramUrl: readEnv('VITE_SOCIAL_INSTAGRAM_URL'),
    facebookUrl: readEnv('VITE_SOCIAL_FACEBOOK_URL'),
    handle: readEnv('VITE_SOCIAL_HANDLE'),
  }
}

