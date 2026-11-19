import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserService } from '@workspace/api/factory'
import type { UpdateProfileRequest, UserProfile } from '@workspace/domain/schemas/auth'
import { useAuth } from '../../auth/hooks/use-auth'

export const USER_PROFILE_QUERY_KEY = ['user', 'profile'] as const

export function useProfile() {
  const queryClient = useQueryClient()
  const userService = getUserService('storefront')
  const { refreshProfile } = useAuth()

  const query = useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: () => userService.getProfile(),
  })

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProfileRequest) => userService.updateProfile(payload),
    onSuccess: async (updated: UserProfile) => {
      queryClient.setQueryData(USER_PROFILE_QUERY_KEY, updated)
      try {
        await refreshProfile()
      } catch {
        // Non-blocking if auth context sync fails
      }
    },
  })

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}
