import * as React from 'react'
import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminAuthProvider } from '../context/admin-auth-provider'
import { useAdminAuth } from './use-admin-auth'

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
