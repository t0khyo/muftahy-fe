import * as React from 'react'
import type { LoginRequest, UserProfile } from '@workspace/domain/schemas/auth'

export interface AdminAuthContextValue {
  user: UserProfile | null
  role: 'admin' | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitializing: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<UserProfile | null>
}

export const defaultAdminAuthContextValue: AdminAuthContextValue = {
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: false,
  login: async () => {},
  logout: async () => {},
  refreshProfile: async () => null,
}

export const AdminAuthContext = React.createContext<AdminAuthContextValue | null>(null)
