import * as React from 'react'
import type { LoginRequest, UserProfile } from '@workspace/domain/schemas/auth'
import { getAuthService, getTokenStorage, getUserService } from '@workspace/api/factory'
import { parseJwtPayload } from '@workspace/api/adapters/http/token-storage'
import { queryClient } from '../../../app/query-client'
import { AdminAuthContext, type AdminAuthContextValue } from './admin-auth-context'

export interface AdminAuthProviderProps {
  children: React.ReactNode
}

function resolveAdminProfile(email: string, sub?: string): UserProfile {
  const normalized = email.trim().toLowerCase()
  return {
    id: sub || 'admin',
    email: normalized,
    full_name: normalized === 'abdelrahman.m.eltokhy@gmail.com' ? 'Abdelrahman ElTokhy' : 'System Admin',
    is_active: true,
    created_at: new Date().toISOString(),
    phone: null,
  }
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [user, setUser] = React.useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isInitializing, setIsInitializing] = React.useState<boolean>(true)

  const authService = React.useMemo(() => getAuthService('admin'), [])
  const userService = React.useMemo(() => getUserService('admin'), [])
  const tokenStorage = React.useMemo(() => getTokenStorage('admin'), [])

  const refreshProfile = React.useCallback(async (): Promise<UserProfile | null> => {
    try {
      if (tokenStorage.getAudience() !== 'admin') {
        throw new Error('Invalid audience for admin app')
      }

      let profile: UserProfile
      try {
        profile = await userService.getProfile()
      } catch {
        const storedEmail = typeof window !== 'undefined' ? window.localStorage?.getItem('muftahy_admin_email') : null
        const token = tokenStorage.getAccessToken()
        const payload = token ? parseJwtPayload(token) : null
        profile = resolveAdminProfile(storedEmail || 'admin@souqmuftah.com', payload?.sub)
      }

      setUser(profile)
      setIsAuthenticated(true)
      return profile
    } catch {
      setUser(null)
      setIsAuthenticated(false)
      tokenStorage.clearTokens()
      return null
    }
  }, [userService, tokenStorage])

  // Silent session hydration on mount
  React.useEffect(() => {
    let mounted = true

    async function hydrate() {
      if (tokenStorage.hasRefreshToken()) {
        try {
          if (tokenStorage.getAudience() !== 'admin') {
            throw new Error('Token audience is not admin')
          }

          let profile: UserProfile
          try {
            profile = await userService.getProfile()
          } catch {
            const storedEmail = typeof window !== 'undefined' ? window.localStorage?.getItem('muftahy_admin_email') : null
            const token = tokenStorage.getAccessToken()
            const payload = token ? parseJwtPayload(token) : null
            profile = resolveAdminProfile(storedEmail || 'admin@souqmuftah.com', payload?.sub)
          }

          if (mounted) {
            setUser(profile)
            setIsAuthenticated(true)
          }
        } catch {
          if (mounted) {
            tokenStorage.clearTokens()
            setUser(null)
            setIsAuthenticated(false)
          }
        }
      } else {
        if (mounted) {
          setUser(null)
          setIsAuthenticated(false)
        }
      }

      if (mounted) {
        setIsInitializing(false)
      }
    }

    hydrate()

    // Cross-tab synchronization
    const unsubscribe = tokenStorage.onTokensChanged(({ refreshToken }) => {
      if (!refreshToken) {
        setUser(null)
        setIsAuthenticated(false)
        queryClient.clear()
      } else if (!isAuthenticated) {
        refreshProfile()
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [tokenStorage, userService, isAuthenticated, refreshProfile])

  const login = React.useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      setIsLoading(true)
      try {
        const tokens = await authService.adminLogin(credentials)
        tokenStorage.setTokens(tokens)

        if (tokenStorage.getAudience() !== 'admin') {
          tokenStorage.clearTokens()
          throw new Error('Access denied: not an administrator token')
        }

        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('muftahy_admin_email', credentials.email.trim().toLowerCase())
          }
        } catch {
          // Ignore storage write issues
        }

        let profile: UserProfile
        try {
          profile = await userService.getProfile()
        } catch {
          const token = tokenStorage.getAccessToken()
          const payload = token ? parseJwtPayload(token) : null
          profile = resolveAdminProfile(credentials.email, payload?.sub)
        }

        setUser(profile)
        setIsAuthenticated(true)
      } finally {
        setIsLoading(false)
      }
    },
    [authService, tokenStorage, userService]
  )

  const logout = React.useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      const refreshToken = tokenStorage.getRefreshToken()
      if (refreshToken) {
        await authService.logout(refreshToken).catch(() => {})
      }
    } finally {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem('muftahy_admin_email')
        }
      } catch {
        // Ignore
      }
      tokenStorage.clearTokens()
      queryClient.clear()
      setUser(null)
      setIsAuthenticated(false)
      setIsLoading(false)
    }
  }, [authService, tokenStorage])

  const value = React.useMemo<AdminAuthContextValue>(
    () => ({
      user,
      role: isAuthenticated ? 'admin' : null,
      isAuthenticated,
      isLoading,
      isInitializing,
      login,
      logout,
      refreshProfile,
    }),
    [user, isAuthenticated, isLoading, isInitializing, login, logout, refreshProfile]
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
