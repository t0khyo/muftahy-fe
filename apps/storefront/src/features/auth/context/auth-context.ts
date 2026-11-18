import * as React from 'react'
import type { LoginRequest, RegisterRequest, UserProfile } from '@workspace/domain/schemas/auth'

export interface AuthContextValue {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitializing: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (payload: RegisterRequest) => Promise<{ autoLoginFailed: boolean }>
  loginWithGoogle: (code: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<UserProfile | null>
}

export const defaultAuthContextValue: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: false,
  login: async () => {},
  register: async () => ({ autoLoginFailed: false }),
  loginWithGoogle: async () => {},
  logout: async () => {},
  refreshProfile: async () => null,
}

export const AuthContext = React.createContext<AuthContextValue | null>(null)
