import { describe, expect, it, vi } from 'vitest'
import { NativeFetchClient } from './fetch-client'
import { HttpUserAdapter } from './http-user-adapter'

describe('HttpUserAdapter', () => {
  it('calls GET /users/me to fetch profile and parses schema with default is_active', async () => {
    const mockProfileResponse = {
      id: '18f9103c-829d-47be-a567-2794ebef4023',
      email: 'customer@example.com',
      full_name: 'Ahmed Hassan',
      phone: '+201012345678',
      created_at: '2026-11-15T09:20:00Z',
    }

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockProfileResponse,
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpUserAdapter(client)

    const profile = await adapter.getProfile()

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/users/me',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(profile.id).toBe('18f9103c-829d-47be-a567-2794ebef4023')
    expect(profile.full_name).toBe('Ahmed Hassan')
    expect(profile.email).toBe('customer@example.com')
    expect(profile.is_active).toBe(true) // defaults to true from userProfileSchema
  })

  it('calls PATCH /users/me with payload and returns updated profile', async () => {
    const updatedResponse = {
      id: '18f9103c-829d-47be-a567-2794ebef4023',
      email: 'customer@example.com',
      full_name: 'Ahmed Updated',
      phone: '+201099998888',
      created_at: '2026-11-15T09:20:00Z',
    }

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => updatedResponse,
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpUserAdapter(client)

    const result = await adapter.updateProfile({
      full_name: 'Ahmed Updated',
      phone: '+201099998888',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/users/me',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          full_name: 'Ahmed Updated',
          phone: '+201099998888',
        }),
      }),
    )
    expect(result.full_name).toBe('Ahmed Updated')
    expect(result.phone).toBe('+201099998888')
  })
})

