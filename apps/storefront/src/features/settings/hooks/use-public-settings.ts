import * as React from 'react'
import { QueryClient, QueryClientContext, useQuery } from '@tanstack/react-query'
import { getSettingsService } from '@workspace/api/factory'
import type { PublicSettingsResponse } from '@workspace/domain/schemas/settings'

export const PUBLIC_SETTINGS_QUERY_KEY = ['public-settings'] as const

const fallbackQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

export function usePublicSettings() {
  const contextClient = React.useContext(QueryClientContext)
  const settingsService = getSettingsService('storefront')

  return useQuery<PublicSettingsResponse>(
    {
      queryKey: PUBLIC_SETTINGS_QUERY_KEY,
      queryFn: () => settingsService.getPublicSettings(),
      staleTime: 1000 * 60 * 5,
      retry: 1,
      enabled: Boolean(contextClient),
    },
    contextClient ?? fallbackQueryClient,
  )
}

