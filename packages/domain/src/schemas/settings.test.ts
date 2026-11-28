import { describe, expect, it } from 'vitest'
import {
  adminSettingsFormSchema,
  adminSettingsResponseSchema,
  buildWhatsAppUrl,
  isValidHttpsSocialUrl,
  isValidSocialHandle,
  isValidWhatsAppNumber,
  publicSettingsResponseSchema,
  toAdminSettingsUpdatePayload,
} from './settings'

describe('settings schemas and helpers', () => {
  it('parses valid public settings response', () => {
    const parsed = publicSettingsResponseSchema.parse({
      whatsapp_number: '201158172869',
      support_email: 'support@muftahy.com',
      social_handle: '@muftahy',
      social_links: {
        instagram: 'https://instagram.com/muftahy',
        facebook: 'https://facebook.com/muftahy',
        x: null,
        tiktok: null,
        youtube: null,
        discord: null,
      },
      google_client_id: '1234567890-xxxx.apps.googleusercontent.com',
      updated_at: '2026-11-28T10:00:00Z',
    })

    expect(parsed.whatsapp_number).toBe('201158172869')
    expect(parsed.google_client_id).toBe('1234567890-xxxx.apps.googleusercontent.com')
  })

  it('parses valid admin settings response with nullable updated_by', () => {
    const initial = adminSettingsResponseSchema.parse({
      whatsapp_number: null,
      support_email: null,
      social_handle: null,
      social_links: {
        instagram: null,
        facebook: null,
        x: null,
        tiktok: null,
        youtube: null,
        discord: null,
      },
      updated_at: '2026-11-28T10:00:00Z',
      updated_by: null,
    })
    expect(initial.updated_by).toBeNull()

    const withActor = adminSettingsResponseSchema.parse({
      ...initial,
      updated_by: {
        id: 'admin-1',
        display_name: 'Admin Name',
        email: 'admin@muftahy.com',
      },
    })
    expect(withActor.updated_by?.display_name).toBe('Admin Name')
  })

  it('validates WhatsApp numbers according to backend E.164 rules', () => {
    expect(isValidWhatsAppNumber('201158172869')).toBe(true)
    expect(isValidWhatsAppNumber('+20 115-817-2869')).toBe(true)
    expect(isValidWhatsAppNumber('01158172869')).toBe(false) // leading 0 rejected
    expect(isValidWhatsAppNumber('123456')).toBe(false) // too short (<7)
    expect(isValidWhatsAppNumber('1234567890123456')).toBe(false) // too long (>15)
  })

  it('validates https social URLs and rejects unsafe schemes or credentials', () => {
    expect(isValidHttpsSocialUrl('https://instagram.com/muftahy')).toBe(true)
    expect(isValidHttpsSocialUrl('http://instagram.com/muftahy')).toBe(false)
    expect(isValidHttpsSocialUrl('javascript:alert(1)')).toBe(false)
    expect(isValidHttpsSocialUrl('https://user:pass@instagram.com/muftahy')).toBe(false)
    expect(isValidHttpsSocialUrl('https://localhost/muftahy')).toBe(false)
    expect(isValidHttpsSocialUrl('https://instagram.com/muftahy<script>')).toBe(false)
  })

  it('validates social handle and rejects angle brackets or control characters', () => {
    expect(isValidSocialHandle('@muftahy')).toBe(true)
    expect(isValidSocialHandle('<script>')).toBe(false)
    expect(isValidSocialHandle('bad\u0000handle')).toBe(false)
  })

  it('converts blank form fields to explicit null in PATCH payload', () => {
    const formValues = adminSettingsFormSchema.parse({
      whatsapp_number: '+20 115-817-2869',
      support_email: '   ',
      social_handle: ' @muftahy ',
      social_links: {
        instagram: 'https://instagram.com/muftahy',
        facebook: '',
        x: '  ',
        tiktok: '',
        youtube: '',
        discord: '',
      },
    })

    const payload = toAdminSettingsUpdatePayload(formValues)
    expect(payload).toEqual({
      whatsapp_number: '201158172869',
      support_email: null,
      social_handle: '@muftahy',
      social_links: {
        instagram: 'https://instagram.com/muftahy',
        facebook: null,
        x: null,
        tiktok: null,
        youtube: null,
        discord: null,
      },
    })
  })

  it('builds WhatsApp URLs cleanly or returns null when unset', () => {
    expect(buildWhatsAppUrl(null)).toBeNull()
    expect(buildWhatsAppUrl('')).toBeNull()
    expect(buildWhatsAppUrl('201158172869')).toBe('https://wa.me/201158172869')
    expect(buildWhatsAppUrl('201158172869', 'Hello world')).toBe(
      'https://wa.me/201158172869?text=Hello%20world',
    )
  })
})

