import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUserService } from '@workspace/api/factory'
import type { UserKey } from '@workspace/domain/schemas/key'

export const USER_KEYS_QUERY_KEY = ['user', 'keys'] as const

export function useUserKeys(searchQuery = '') {
  const userService = getUserService('storefront')

  const query = useQuery({
    queryKey: USER_KEYS_QUERY_KEY,
    queryFn: () => userService.getUserKeys(),
  })

  const allKeys = useMemo(() => query.data ?? [], [query.data])

  const filteredKeys = useMemo<UserKey[]>(() => {
    const trimmed = searchQuery.trim().toLowerCase()
    if (!trimmed) return allKeys
    return allKeys.filter((key) => key.product_name.toLowerCase().includes(trimmed))
  }, [allKeys, searchQuery])

  return {
    keys: filteredKeys,
    allKeys,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
