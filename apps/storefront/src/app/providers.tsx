import * as React from 'react'
import { I18nProvider } from './i18n-provider'
import { QueryProvider } from './query-provider'
import { ThemeProvider } from './theme-provider'
import { AuthProvider } from '../features/auth/context/auth-provider'

export interface AppProvidersProps {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system">
      <I18nProvider>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}

