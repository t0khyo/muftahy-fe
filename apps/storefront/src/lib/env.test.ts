import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildSupportEmailUrl,
  buildWhatsAppUrl,
  getGoogleClientId,
  getSocialLinks,
  getSupportEmail,
  getWhatsAppNumber,
} from './env'

describe('storefront env helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('reads Google client ID and trims whitespace', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '  client-123.apps.googleusercontent.com  ')
    expect(getGoogleClientId()).toBe('client-123.apps.googleusercontent.com')

    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '')
    expect(getGoogleClientId()).toBe('')
  })

  it('sanitizes WhatsApp number to digits only and returns null when empty', () => {
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '+20 115-817-2869')
    expect(getWhatsAppNumber()).toBe('201158172869')

    vi.stubEnv('VITE_WHATSAPP_NUMBER', '   ')
    expect(getWhatsAppNumber()).toBeNull()
  })

  it('builds WhatsApp URL with or without message and supports explicit override', () => {
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '201158172869')
    expect(buildWhatsAppUrl()).toBe('https://wa.me/201158172869')
    expect(buildWhatsAppUrl('Hello world')).toBe('https://wa.me/201158172869?text=Hello%20world')
    expect(buildWhatsAppUrl('Hi', '123-456')).toBe('https://wa.me/123456?text=Hi')
    expect(buildWhatsAppUrl('Hi', '')).toBeNull()

    vi.stubEnv('VITE_WHATSAPP_NUMBER', '')
    expect(buildWhatsAppUrl('Hi')).toBeNull()
  })

  it('reads support email and builds mailto URL when set', () => {
    vi.stubEnv('VITE_SUPPORT_EMAIL', 'support@example.com')
    expect(getSupportEmail()).toBe('support@example.com')
    expect(buildSupportEmailUrl()).toBe('mailto:support@example.com')

    vi.stubEnv('VITE_SUPPORT_EMAIL', '')
    expect(getSupportEmail()).toBeNull()
    expect(buildSupportEmailUrl()).toBeNull()
  })

  it('reads social links and handle or returns nulls when unset', () => {
    vi.stubEnv('VITE_SOCIAL_INSTAGRAM_URL', 'https://instagram.com/example')
    vi.stubEnv('VITE_SOCIAL_FACEBOOK_URL', 'https://facebook.com/example')
    vi.stubEnv('VITE_SOCIAL_HANDLE', '@example')

    expect(getSocialLinks()).toEqual({
      instagramUrl: 'https://instagram.com/example',
      facebookUrl: 'https://facebook.com/example',
      handle: '@example',
    })

    vi.stubEnv('VITE_SOCIAL_INSTAGRAM_URL', '')
    vi.stubEnv('VITE_SOCIAL_FACEBOOK_URL', '')
    vi.stubEnv('VITE_SOCIAL_HANDLE', '')

    expect(getSocialLinks()).toEqual({
      instagramUrl: null,
      facebookUrl: null,
      handle: null,
    })
  })
})

