import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { queryClient as defaultClient } from './query-client'

export interface QueryProviderProps {
  children: React.ReactNode
  client?: QueryClient
}

export function QueryProvider({
  children,
  client = defaultClient,
}: QueryProviderProps) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
