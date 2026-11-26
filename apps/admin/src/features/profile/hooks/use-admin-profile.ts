import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminProfileService } from '@workspace/api/factory'
import type {
  AdminProfileResponse,
  AdminProfileUpdate,
} from '@workspace/domain/schemas/admin-profile'
import { useAdminMutation } from '../../../hooks/use-admin-mutation'
import { useAdminAuth } from '../../auth/hooks/use-admin-auth'

export const ADMIN_PROFILE_QUERY_KEY = ['admin-profile'] as const

export function useAdminProfile(options?: { errorMode?: 'toast' | 'inline' }) {
  const queryClient = useQueryClient()
  const { user: authUser, refreshProfile } = useAdminAuth()
  const adminProfileService = getAdminProfileService()

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AdminProfileResponse>({
    queryKey: ADMIN_PROFILE_QUERY_KEY,
    queryFn: () => adminProfileService.getMyProfile(),
    initialData: authUser ?? undefined,
    staleTime: 1000 * 60 * 5,
  })

  const updateMutation = useAdminMutation({
    mutationFn: async (payload: AdminProfileUpdate) => {
      return await adminProfileService.updateMyProfile(payload)
    },
    onSuccess: async (updated) => {
      queryClient.setQueryData(ADMIN_PROFILE_QUERY_KEY, updated)
      await refreshProfile()
    },
    feedback: {
      successKey: 'admin:profile.updateSuccess',
      errorMode: options?.errorMode,
    },
  })

  return {
    profile: profile ?? authUser,
    isLoading: isLoading && !profile && !authUser,
    isError,
    error,
    refetch,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    resetUpdateError: updateMutation.reset,
  }
}
