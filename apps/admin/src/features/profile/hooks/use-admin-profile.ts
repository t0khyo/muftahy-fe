import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserService } from '@workspace/api/factory'
import type { UpdateProfileRequest, UserProfile } from '@workspace/domain/schemas/auth'
import { useAdminAuth } from '../../auth/hooks/use-admin-auth'

export const ADMIN_PROFILE_QUERY_KEY = ['admin-profile'] as const

export function useAdminProfile() {
  const queryClient = useQueryClient()
  const { user: authUser, refreshProfile } = useAdminAuth()
  const userService = getUserService('admin')

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<UserProfile>({
    queryKey: ADMIN_PROFILE_QUERY_KEY,
    queryFn: async () => {
      try {
        return await userService.getProfile()
      } catch (err) {
        // Fallback to authUser if endpoint mock fails
        if (authUser) return authUser
        throw err
      }
    },
    initialData: authUser ?? undefined,
    staleTime: 1000 * 60 * 5,
  })

  const updateMutation = useMutation({
    mutationFn: async (payload: UpdateProfileRequest) => {
      return await userService.updateProfile(payload)
    },
    onSuccess: async (updated) => {
      queryClient.setQueryData(ADMIN_PROFILE_QUERY_KEY, updated)
      await refreshProfile()
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
  }
}

