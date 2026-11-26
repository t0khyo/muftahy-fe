import * as React from 'react'
import type { AdminProfileResponse } from '@workspace/domain/schemas/admin-profile'
import type { LoginRequest } from '@workspace/domain/schemas/auth'

export interface AdminAuthContextValue {
  user: AdminProfileResponse | null
  role: 'admin' | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitializing: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<AdminProfileResponse | null>
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
