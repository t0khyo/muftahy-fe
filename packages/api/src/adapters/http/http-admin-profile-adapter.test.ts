import { describe, expect, it, vi } from 'vitest'
import type { NativeFetchClient } from './fetch-client'
import { HttpAdminProfileAdapter } from './http-admin-profile-adapter'

describe('HttpAdminProfileAdapter', () => {
  const sampleAdmin = {
    id: 'b8c4e120-5e77-4f8b-8b0c-1234567890ab',
    email: 'admin@souqmuftah.com',
    display_name: 'Zeyad Hemeda',
    role: 'admin',
    is_active: true,
    created_at: '2026-11-13T20:00:00Z',
    updated_at: '2026-11-26T14:30:00Z',
  }

  const createMockClient = (responseData: unknown): NativeFetchClient => {
    return {
      request: vi.fn().mockResolvedValue(responseData),
    } as unknown as NativeFetchClient
  }

  it('fetches authenticated admin profile from /admin/me', async () => {
    const client = createMockClient(sampleAdmin)
    const adapter = new HttpAdminProfileAdapter(client)

    const result = await adapter.getMyProfile()
    expect(client.request).toHaveBeenCalledWith('/admin/me', { method: 'GET' })
    expect(result.display_name).toBe('Zeyad Hemeda')
    expect(result.role).toBe('admin')
  })

  it('updates admin display_name via PATCH /admin/me', async () => {
    const updated = { ...sampleAdmin, display_name: 'Updated Name' }
    const client = createMockClient(updated)
    const adapter = new HttpAdminProfileAdapter(client)

    const result = await adapter.updateMyProfile({ display_name: 'Updated Name' })
    expect(client.request).toHaveBeenCalledWith('/admin/me', {
      method: 'PATCH',
      body: { display_name: 'Updated Name' },
    })
    expect(result.display_name).toBe('Updated Name')
  })

  it('lists administrators with optional filters from /admin/admins', async () => {
    const client = createMockClient([sampleAdmin])
    const adapter = new HttpAdminProfileAdapter(client)

    const result = await adapter.listAdmins({ isActive: true, limit: 50, offset: 0 })
    expect(client.request).toHaveBeenCalledWith(
      '/admin/admins?is_active=true&limit=50&offset=0',
      { method: 'GET' },
    )
    expect(result).toHaveLength(1)
  })
})

