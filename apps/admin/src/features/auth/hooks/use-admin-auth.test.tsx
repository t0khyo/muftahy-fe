import * as React from 'react'
import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminAuthProvider } from '../context/admin-auth-provider'
import { useAdminAuth } from './use-admin-auth'
import * as apiFactory from '@workspace/api/factory'
import type { AuthService } from '@workspace/api/services/auth-service'
import type { AdminProfileService } from '@workspace/api/services/admin-profile-service'

// Valid JWT payload for testing: { sub: 'usr-1', role: 'admin', aud: 'admin' }
const MOCK_ADMIN_ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItMSIsInJvbGUiOiJhZG1pbiIsImF1ZCI6ImFkbWluIn0.mock_signature'
const MOCK_ADMIN_REFRESH_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItMSIsInJvbGUiOiJhZG1pbiIsImF1ZCI6ImFkbWluIn0.mock_refresh'

describe('useAdminAuth hook', () => {
  let mockStorage: Record<string, string> = {}

  beforeEach(() => {
    mockStorage = {}
    const storageMock = {
      getItem: (k: string) => mockStorage[k] ?? null,
      setItem: (k: string, v: string) => {
        mockStorage[k] = v
      },
      removeItem: (k: string) => {
        delete mockStorage[k]
      },
      clear: () => {
        mockStorage = {}
      },
      length: 0,
      key: () => null,
    } as unknown as Storage

    vi.stubGlobal('localStorage', storageMock)
    vi.stubGlobal('window', { localStorage: storageMock, addEventListener: vi.fn(), removeEventListener: vi.fn() })
  })

  it('returns unauthenticated default state when rendered outside AdminAuthProvider', () => {
    const { result } = renderHook(() => useAdminAuth())
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.role).toBeNull()
  })

  it('provides default unauthenticated state when no tokens exist', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <AdminAuthProvider>{children}</AdminAuthProvider>
    const { result } = renderHook(() => useAdminAuth(), { wrapper })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.role).toBeNull()
  })

  it('authenticates admin operator on valid credentials and clears on logout', async () => {
    const mockAuthService = {
      login: vi.fn(),
      adminLogin: vi.fn().mockResolvedValue({
        access_token: MOCK_ADMIN_ACCESS_TOKEN,
        refresh_token: MOCK_ADMIN_REFRESH_TOKEN,
        token_type: 'bearer',
      }),
      register: vi.fn(),
      refreshToken: vi.fn(),
      logout: vi.fn().mockResolvedValue(undefined),
    }

    const mockAdminProfileService = {
      getMyProfile: vi.fn().mockResolvedValue({
        id: 'usr-1',
        email: 'admin1@souqmuftah.com',
        display_name: 'Lead Admin',
        role: 'admin',
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      }),
      updateMyProfile: vi.fn(),
      listAdmins: vi.fn().mockResolvedValue([]),
    }

    vi.spyOn(apiFactory, 'getAuthService').mockReturnValue(mockAuthService as unknown as AuthService)
    vi.spyOn(apiFactory, 'getAdminProfileService').mockReturnValue(
      mockAdminProfileService as unknown as AdminProfileService,
    )

    const wrapper = ({ children }: { children: React.ReactNode }) => <AdminAuthProvider>{children}</AdminAuthProvider>
    const { result } = renderHook(() => useAdminAuth(), { wrapper })

    await act(async () => {
      await result.current.login({
        email: 'admin1@souqmuftah.com',
        password: 'change-me-immediately-1',
      })
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.role).toBe('admin')
    expect(result.current.user?.email).toBe('admin1@souqmuftah.com')

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.role).toBeNull()
    expect(result.current.user).toBeNull()
  })
})
