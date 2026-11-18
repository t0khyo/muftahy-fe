import * as React from 'react'
import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/auth-provider'
import { useAuth } from './use-auth'

describe('useAuth hook', () => {
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

  it('returns unauthenticated default state when rendered outside AuthProvider', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('provides default unauthenticated state when no tokens exist', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('authenticates user on login and clears on logout', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login({
        email: 'customer@example.com',
        password: 'SecurePassword123!',
      })
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.email).toBe('customer@example.com')

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })
})
