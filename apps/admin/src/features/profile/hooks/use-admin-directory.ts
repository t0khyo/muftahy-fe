import { useQuery } from '@tanstack/react-query'
import { getAdminProfileService } from '@workspace/api/factory'
import type { ListAdminsParams } from '@workspace/api/services/admin-profile-service'

export const adminDirectoryKeys = {
  all: ['admin', 'directory'] as const,
  list: (params?: ListAdminsParams) => [...adminDirectoryKeys.all, 'list', params] as const,
}

export function useAdminDirectory(params?: ListAdminsParams) {
  const service = getAdminProfileService()
  return useQuery({
    queryKey: adminDirectoryKeys.list(params),
    queryFn: () => service.listAdmins(params),
    staleTime: 1000 * 60 * 5,
  })
}

