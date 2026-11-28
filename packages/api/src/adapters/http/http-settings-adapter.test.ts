import { describe, expect, it, vi } from 'vitest'
import type { NativeFetchClient } from './fetch-client'
import { HttpSettingsAdapter } from './http-settings-adapter'

function createMockClient(responseData: unknown) {
  return {
    request: vi.fn().mockResolvedValue(responseData),
  } as unknown as NativeFetchClient
}

describe('HttpSettingsAdapter', () => {
  it('fetches public settings with skipAuth: true', async () => {
    const mockPublic = {
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
    }
    const client = createMockClient(mockPublic)
    const adapter = new HttpSettingsAdapter(client)

    const result = await adapter.getPublicSettings()
    expect(result).toEqual(mockPublic)
    expect(client.request).toHaveBeenCalledWith('/settings/public', {
      method: 'GET',
      skipAuth: true,
    })
  })

  it('fetches admin settings from /admin/settings', async () => {
    const mockAdmin = {
      whatsapp_number: '201158172869',
      support_email: 'support@muftahy.com',
      social_handle: '@muftahy',
      social_links: {
        instagram: 'https://instagram.com/muftahy',
        facebook: null,
        x: null,
        tiktok: null,
        youtube: null,
        discord: null,
      },
      updated_at: '2026-11-28T10:00:00Z',
      updated_by: {
        id: 'admin-1',
        display_name: 'Admin Name',
        email: 'admin@muftahy.com',
      },
    }
    const client = createMockClient(mockAdmin)
    const adapter = new HttpSettingsAdapter(client)

    const result = await adapter.getAdminSettings()
    expect(result).toEqual(mockAdmin)
    expect(client.request).toHaveBeenCalledWith('/admin/settings', {
      method: 'GET',
    })
  })

  it('updates admin settings via PATCH /admin/settings', async () => {
    const mockUpdated = {
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
      updated_at: '2026-11-28T11:00:00Z',
      updated_by: {
        id: 'admin-1',
        display_name: 'Admin Name',
        email: 'admin@muftahy.com',
      },
    }
    const client = createMockClient(mockUpdated)
    const adapter = new HttpSettingsAdapter(client)

    const payload = {
      whatsapp_number: '201158172869',
      support_email: null,
      social_links: {
        facebook: null,
      },
    }
    const result = await adapter.updateAdminSettings(payload)
    expect(result).toEqual(mockUpdated)
    expect(client.request).toHaveBeenCalledWith('/admin/settings', {
      method: 'PATCH',
      body: payload,
    })
  })
})

