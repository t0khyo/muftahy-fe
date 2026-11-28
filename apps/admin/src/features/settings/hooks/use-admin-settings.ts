import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getSettingsService } from '@workspace/api/factory'
import type {
  AdminSettingsResponse,
  AdminSettingsUpdateRequest,
} from '@workspace/domain/schemas/settings'
import { useAdminMutation } from '../../../hooks/use-admin-mutation'

export const ADMIN_SETTINGS_QUERY_KEY = ['admin-settings'] as const

export function useAdminSettings(options?: { errorMode?: 'toast' | 'inline' }) {
  const queryClient = useQueryClient()
  const settingsService = getSettingsService('admin')

  const {
    data: settings,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AdminSettingsResponse>({
    queryKey: ADMIN_SETTINGS_QUERY_KEY,
    queryFn: () => settingsService.getAdminSettings(),
    staleTime: 1000 * 60 * 2,
  })

  const updateMutation = useAdminMutation({
    mutationFn: async (payload: AdminSettingsUpdateRequest) => {
      return await settingsService.updateAdminSettings(payload)
    },
    onSuccess: async (updated) => {
      queryClient.setQueryData(ADMIN_SETTINGS_QUERY_KEY, updated)
    },
    feedback: {
      successKey: 'admin:feedback.settingsUpdated',
      errorMode: options?.errorMode ?? 'inline',
    },
  })

  return {
    settings,
    isLoading,
    isError,
    error,
    refetch,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    resetUpdateError: updateMutation.reset,
  }
}

