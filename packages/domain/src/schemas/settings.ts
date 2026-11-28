import { z } from 'zod'

export const SOCIAL_PLATFORMS = [
  'instagram',
  'facebook',
  'x',
  'tiktok',
  'youtube',
  'discord',
] as const

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]

export const socialLinksSchema = z
  .object({
    instagram: z.string().nullable(),
    facebook: z.string().nullable(),
    x: z.string().nullable(),
    tiktok: z.string().nullable(),
    youtube: z.string().nullable(),
    discord: z.string().nullable(),
  })
  .strict()

export type SocialLinks = z.infer<typeof socialLinksSchema>

export const publicSettingsResponseSchema = z.object({
  whatsapp_number: z.string().nullable(),
  support_email: z.string().nullable(),
  social_handle: z.string().nullable(),
  social_links: socialLinksSchema,
  google_client_id: z.string().nullable(),
  updated_at: z.string().min(1),
})

export type PublicSettingsResponse = z.infer<typeof publicSettingsResponseSchema>

export const adminSettingsUpdatedBySchema = z.object({
  id: z.string().min(1),
  display_name: z.string().min(1),
  email: z.string().email(),
})

export type AdminSettingsUpdatedBy = z.infer<typeof adminSettingsUpdatedBySchema>

export const adminSettingsResponseSchema = z.object({
  whatsapp_number: z.string().nullable(),
  support_email: z.string().nullable(),
  social_handle: z.string().nullable(),
  social_links: socialLinksSchema,
  updated_at: z.string().min(1),
  updated_by: adminSettingsUpdatedBySchema.nullable(),
})

export type AdminSettingsResponse = z.infer<typeof adminSettingsResponseSchema>

export const socialLinksUpdateSchema = z
  .object({
    instagram: z.string().nullable().optional(),
    facebook: z.string().nullable().optional(),
    x: z.string().nullable().optional(),
    tiktok: z.string().nullable().optional(),
    youtube: z.string().nullable().optional(),
    discord: z.string().nullable().optional(),
  })
  .strict()

export const adminSettingsUpdateRequestSchema = z
  .object({
    whatsapp_number: z.string().nullable().optional(),
    support_email: z.string().nullable().optional(),
    social_handle: z.string().nullable().optional(),
    social_links: socialLinksUpdateSchema.optional(),
  })
  .strict()

export type AdminSettingsUpdateRequest = z.infer<typeof adminSettingsUpdateRequestSchema>

/**
 * Strips spaces, hyphens, and leading '+' from a WhatsApp number string.
 */
export function normalizeWhatsAppNumber(value: string): string {
  return value.replace(/[\s\-+]/g, '')
}

/**
 * Validates E.164 digits without '+' or leading '0' (7 to 15 digits).
 */
export function isValidWhatsAppNumber(value: string): boolean {
  const cleaned = normalizeWhatsAppNumber(value)
  return /^[1-9]\d{6,14}$/.test(cleaned)
}

/**
 * Validates that a social link is a clean https:// URL with a public hostname,
 * no credentials, no whitespace, and no HTML/control characters.
 */
export function isValidHttpsSocialUrl(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed.length === 0 || trimmed.length > 500) return false
  if (/\s/.test(trimmed)) return false
  if (trimmed.includes('<') || trimmed.includes('>')) return false
  if (/\p{C}/u.test(trimmed)) return false

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'https:') return false
    if (parsed.username || parsed.password) return false
    const host = parsed.hostname
    if (!host || !host.includes('.') || host.startsWith('.') || host.endsWith('.')) {
      return false
    }
    return true
  } catch {
    return false
  }
}

/**
 * Validates social handle (NFKC-normalized, trimmed, 1..64 chars, no <, >, or control/bidi chars).
 */
export function isValidSocialHandle(value: string): boolean {
  const normalized = value.normalize('NFKC').trim()
  if (normalized.length < 1 || normalized.length > 64) return false
  if (normalized.includes('<') || normalized.includes('>')) return false
  if (/\p{C}/u.test(normalized)) return false
  return true
}

const optionalHttpsUrlFormField = z.string().superRefine((val, ctx) => {
  const trimmed = val.trim()
  if (trimmed === '') return
  if (!isValidHttpsSocialUrl(trimmed)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Must be a valid https:// URL with a public domain',
    })
  }
})

export const adminSettingsFormSchema = z.object({
  whatsapp_number: z.string().superRefine((val, ctx) => {
    const trimmed = val.trim()
    if (trimmed === '') return
    if (!isValidWhatsAppNumber(trimmed)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Must be 7–15 digits in international format without leading 0',
      })
    }
  }),
  support_email: z.string().superRefine((val, ctx) => {
    const trimmed = val.trim()
    if (trimmed === '') return
    if (trimmed.length > 255 || /\p{C}/u.test(trimmed) || !z.string().email().safeParse(trimmed).success) {
      ctx.addIssue({
        code: 'custom',
        message: 'Must be a valid email address',
      })
    }
  }),
  social_handle: z.string().superRefine((val, ctx) => {
    const trimmed = val.trim()
    if (trimmed === '') return
    if (!isValidSocialHandle(trimmed)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Handle must be 1–64 characters without HTML or control characters',
      })
    }
  }),
  social_links: z.object({
    instagram: optionalHttpsUrlFormField,
    facebook: optionalHttpsUrlFormField,
    x: optionalHttpsUrlFormField,
    tiktok: optionalHttpsUrlFormField,
    youtube: optionalHttpsUrlFormField,
    discord: optionalHttpsUrlFormField,
  }),
})

export type AdminSettingsFormValues = z.infer<typeof adminSettingsFormSchema>

/**
 * Converts form values to the PATCH /admin/settings payload, turning blank strings into explicit null.
 */
export function toAdminSettingsUpdatePayload(
  values: AdminSettingsFormValues,
): AdminSettingsUpdateRequest {
  const cleanWhatsApp = normalizeWhatsAppNumber(values.whatsapp_number.trim())
  const cleanEmail = values.support_email.trim()
  const cleanHandle = values.social_handle.normalize('NFKC').trim()
  const toNullableUrl = (v: string): string | null => {
    const t = v.trim()
    return t === '' ? null : t
  }

  return {
    whatsapp_number: cleanWhatsApp === '' ? null : cleanWhatsApp,
    support_email: cleanEmail === '' ? null : cleanEmail,
    social_handle: cleanHandle === '' ? null : cleanHandle,
    social_links: {
      instagram: toNullableUrl(values.social_links.instagram),
      facebook: toNullableUrl(values.social_links.facebook),
      x: toNullableUrl(values.social_links.x),
      tiktok: toNullableUrl(values.social_links.tiktok),
      youtube: toNullableUrl(values.social_links.youtube),
      discord: toNullableUrl(values.social_links.discord),
    },
  }
}

/**
 * Builds a https://wa.me/<digits> URL from a WhatsApp number and optional prefilled message.
 * Returns null if the number is missing or contains no digits.
 */
export function buildWhatsAppUrl(
  whatsappNumber: string | null | undefined,
  message?: string,
): string | null {
  if (!whatsappNumber) return null
  const digits = whatsappNumber.replace(/[^0-9]/g, '')
  if (!digits) return null
  const base = `https://wa.me/${digits}`
  if (message && message.trim().length > 0) {
    return `${base}?text=${encodeURIComponent(message)}`
  }
  return base
}

