import * as React from 'react'
import {
  AdminAuthContext,
  defaultAdminAuthContextValue,
  type AdminAuthContextValue,
} from '../context/admin-auth-context'

export function useAdminAuth(): AdminAuthContextValue {
  const context = React.useContext(AdminAuthContext)
  if (!context) {
    return defaultAdminAuthContextValue
  }
  return context
}
