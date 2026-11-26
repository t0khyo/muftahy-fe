import * as React from 'react'
import type { AdminProfileResponse } from '@workspace/domain/schemas/admin-profile'
import type { LoginRequest } from '@workspace/domain/schemas/auth'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import {
  getAdminProfileService,
  getAuthService,
  getTokenStorage,
} from '@workspace/api/factory'
import { queryClient } from '../../../app/query-client'
import { AdminAuthContext, type AdminAuthContextValue } from './admin-auth-context'

export interface AdminAuthProviderProps {
  children: React.ReactNode
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [user, setUser] = React.useState<AdminProfileResponse | null>(null)
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isInitializing, setIsInitializing] = React.useState<boolean>(true)

  const authService = React.useMemo(() => getAuthService('admin'), [])
  const adminProfileService = React.useMemo(() => getAdminProfileService(), [])
  const tokenStorage = React.useMemo(() => getTokenStorage('admin'), [])

  const refreshProfile = React.useCallback(async (): Promise<AdminProfileResponse | null> => {
    try {
      if (tokenStorage.getAudience() !== 'admin') {
        throw new Error('Invalid audience for admin app')
      }

      const profile = await adminProfileService.getMyProfile()
      setUser(profile)
      setIsAuthenticated(true)
      return profile
    } catch {
      setUser(null)
      setIsAuthenticated(false)
      tokenStorage.clearTokens()
      return null
    }
  }, [adminProfileService, tokenStorage])

  // Silent session hydration on mount
  React.useEffect(() => {
    let mounted = true

    async function hydrate() {
      if (tokenStorage.hasRefreshToken()) {
        try {
          if (tokenStorage.getAudience() !== 'admin') {
            throw new Error('Token audience is not admin')
          }

          const profile = await adminProfileService.getMyProfile()
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
  }, [tokenStorage, adminProfileService, isAuthenticated, refreshProfile])

  const login = React.useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      setIsLoading(true)
      try {
        const tokens = await authService.adminLogin(credentials)
        tokenStorage.setTokens(tokens)

        if (tokenStorage.getAudience() !== 'admin') {
          tokenStorage.clearTokens()
          throw new ApiClientError(403, 'PERMISSION_DENIED', 'Access denied: not an administrator token')
        }

        const profile = await adminProfileService.getMyProfile()
        setUser(profile)
        setIsAuthenticated(true)
      } finally {
        setIsLoading(false)
      }
    },
    [authService, tokenStorage, adminProfileService],
  )

  const logout = React.useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      const refreshToken = tokenStorage.getRefreshToken()
      if (refreshToken) {
        await authService.logout(refreshToken).catch(() => {})
      }
    } finally {
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
    [user, isAuthenticated, isLoading, isInitializing, login, logout, refreshProfile],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
