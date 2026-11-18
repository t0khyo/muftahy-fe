import * as React from 'react'
import { I18nProvider } from './i18n-provider'
import { QueryProvider } from './query-provider'
import { ThemeProvider } from './theme-provider'
import { AdminAuthProvider } from '../features/auth/context/admin-auth-provider'

export interface AppProvidersProps {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system">
      <I18nProvider>
        <QueryProvider>
          <AdminAuthProvider>{children}</AdminAuthProvider>
        </QueryProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
