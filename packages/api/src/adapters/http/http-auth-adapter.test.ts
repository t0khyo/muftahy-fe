import { describe, expect, it, vi } from 'vitest'
import { NativeFetchClient } from './fetch-client'
import { HttpAuthAdapter } from './http-auth-adapter'

describe('HttpAuthAdapter', () => {
  const mockTokenResponse = {
    access_token: 'access-token-123',
    refresh_token: 'refresh-token-456',
    token_type: 'bearer',
    expires_in: 900,
  }

  it('calls POST /auth/login with credentials and returns tokens', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockTokenResponse,
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpAuthAdapter(client)

    const res = await adapter.login({
      email: 'customer@example.com',
      password: 'StrongPassword123',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'customer@example.com',
          password: 'StrongPassword123',
        }),
      }),
    )
    expect(res.access_token).toBe('access-token-123')
  })

  it('calls POST /auth/register with user info and returns registration result', async () => {
    const registerResponse = {
      status: 'success',
      message: 'Account created successfully',
      user_id: '18f9103c-829d-47be-a567-2794ebef4023',
    }

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => registerResponse,
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpAuthAdapter(client)

    const res = await adapter.register({
      email: 'newuser@example.com',
      password: 'StrongPassword123',
      full_name: 'New User',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/auth/register',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'StrongPassword123',
          full_name: 'New User',
        }),
      }),
    )
    expect(res.user_id).toBe('18f9103c-829d-47be-a567-2794ebef4023')
  })

  it('calls POST /auth/refresh with refresh_token and returns updated tokens', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockTokenResponse,
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpAuthAdapter(client)

    const res = await adapter.refreshToken('old-refresh-token')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/auth/refresh',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ refresh_token: 'old-refresh-token' }),
      }),
    )
    expect(res.access_token).toBe('access-token-123')
  })

  it('calls POST /auth/logout with refresh_token and returns status', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Logged out successfully' }),
    })

    const client = new NativeFetchClient({
      baseURL: 'http://localhost:8000/api/v1',
      fetchFn: mockFetch as unknown as typeof fetch,
    })
    const adapter = new HttpAuthAdapter(client)

    const res = await adapter.logout('refresh-token-456')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/auth/logout',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ refresh_token: 'refresh-token-456' }),
      }),
    )
    expect(res.message).toBe('Logged out successfully')
  })
})
