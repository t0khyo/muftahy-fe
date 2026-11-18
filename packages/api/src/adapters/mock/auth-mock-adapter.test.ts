import { describe, expect, it } from 'vitest'
import { ApiClientError } from '../http/fetch-client'
import { MockAuthAdapter } from './mock-auth-adapter'
import { MockUserAdapter } from './mock-user-adapter'

describe('MockAuthAdapter & MockUserAdapter', () => {
  it('authenticates customer credentials and issues customer token', async () => {
    const auth = new MockAuthAdapter()
    const tokens = await auth.login({
      email: 'customer@example.com',
      password: 'SecurePassword123!',
    })

    expect(tokens.token_type).toBe('bearer')
    expect(tokens.access_token).toBeDefined()
    expect(tokens.refresh_token).toBeDefined()
  })

  it('rejects invalid credentials with 401 AUTHENTICATION_FAILED', async () => {
    const auth = new MockAuthAdapter()
    await expect(
      auth.login({
        email: 'customer@example.com',
        password: 'WrongPassword!',
      })
    ).rejects.toThrow(ApiClientError)
  })

  it('registers a new customer and rejects duplicate email registration', async () => {
    const auth = new MockAuthAdapter()
    const result = await auth.register({
      email: 'newuser@example.com',
      password: 'StrongPassword123!',
      full_name: 'New Customer',
    })

    expect(result.status).toBe('success')
    expect(result.user_id).toBeDefined()

    // Second registration with same email fails with 400
    await expect(
      auth.register({
        email: 'newuser@example.com',
        password: 'StrongPassword123!',
        full_name: 'Duplicate Customer',
      })
    ).rejects.toThrow(ApiClientError)
  })

  it('authenticates admin credentials', async () => {
    const auth = new MockAuthAdapter()
    const tokens = await auth.adminLogin({
      email: 'admin1@souqmuftah.com',
      password: 'change-me-immediately-1',
    })

    expect(tokens.access_token).toBeDefined()
    expect(tokens.refresh_token).toBeDefined()
  })

  it('updates and retrieves user profile in MockUserAdapter', async () => {
    const user = new MockUserAdapter()
    const initial = await user.getProfile()
    expect(initial.email).toBe('customer@example.com')

    const updated = await user.updateProfile({
      full_name: 'Updated Name',
      phone: '01234567890',
    })

    expect(updated.full_name).toBe('Updated Name')
    expect(updated.phone).toBe('01234567890')
  })
})
