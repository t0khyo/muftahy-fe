import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from '../context/auth-context'

const defaultAuthValue: AuthContextValue = {
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

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  return context ?? defaultAuthValue
}
