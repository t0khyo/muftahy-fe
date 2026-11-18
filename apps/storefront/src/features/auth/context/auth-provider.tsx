import * as React from 'react'
import type { LoginRequest, RegisterRequest, UserProfile } from '@workspace/domain/schemas/auth'
import { getAuthService, getTokenStorage, getUserService } from '@workspace/api/factory'
import { queryClient } from '../../../app/query-client'
import { AuthContext, type AuthContextValue } from './auth-context'

export interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = React.useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isInitializing, setIsInitializing] = React.useState<boolean>(true)

  const authService = React.useMemo(() => getAuthService('storefront'), [])
  const userService = React.useMemo(() => getUserService('storefront'), [])
  const tokenStorage = React.useMemo(() => getTokenStorage('storefront'), [])

  const refreshProfile = React.useCallback(async (): Promise<UserProfile | null> => {
    try {
      const profile = await userService.getProfile()
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
          const profile = await userService.getProfile()
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

    // Listen to cross-tab storage synchronization
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
        const tokens = await authService.login(credentials)
        tokenStorage.setTokens(tokens)
        const profile = await userService.getProfile()
        setUser(profile)
        setIsAuthenticated(true)
      } finally {
        setIsLoading(false)
      }
    },
    [authService, tokenStorage, userService]
  )

  const register = React.useCallback(
    async (payload: RegisterRequest): Promise<{ autoLoginFailed: boolean }> => {
      setIsLoading(true)
      try {
        await authService.register(payload)
        // Background auto-login
        try {
          const tokens = await authService.login({
            email: payload.email,
            password: payload.password,
          })
          tokenStorage.setTokens(tokens)
          const profile = await userService.getProfile()
          setUser(profile)
          setIsAuthenticated(true)
          return { autoLoginFailed: false }
        } catch {
          // Registration succeeded, but auto-login encountered an error
          return { autoLoginFailed: true }
        }
      } finally {
        setIsLoading(false)
      }
    },
    [authService, tokenStorage, userService]
  )

  const loginWithGoogle = React.useCallback(
    async (code: string): Promise<void> => {
      setIsLoading(true)
      try {
        const tokens = await authService.loginWithGoogle({ code })
        tokenStorage.setTokens(tokens)
        const profile = await userService.getProfile()
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
      tokenStorage.clearTokens()
      queryClient.clear()
      setUser(null)
      setIsAuthenticated(false)
      setIsLoading(false)
    }
  }, [authService, tokenStorage])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      isInitializing,
      login,
      register,
      loginWithGoogle,
      logout,
      refreshProfile,
    }),
    [user, isAuthenticated, isLoading, isInitializing, login, register, loginWithGoogle, logout, refreshProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
