import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getProductService } from '@workspace/api/factory'
import type {
  CategoryCreateInput,
  CategoryUpdateInput,
  CategoryResponse,
} from '@workspace/domain/schemas/product'
import { useAdminMutation } from '../../../hooks/use-admin-mutation'

export const ADMIN_CATEGORIES_QUERY_KEY = ['admin', 'categories'] as const

export function useAdminCategories() {
  const service = getProductService('admin')
  return useQuery<CategoryResponse[]>({
    queryKey: ADMIN_CATEGORIES_QUERY_KEY,
    queryFn: () => service.getAdminCategories(),
  })
}

export function useCreateCategory(options?: { errorMode?: 'toast' | 'inline' }) {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useAdminMutation({
    mutationFn: (data: CategoryCreateInput) => service.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['public', 'categories'] })
    },
    feedback: {
      successKey: 'admin:categories.createdSuccess',
      errorMode: options?.errorMode,
    },
  })
}

export function useUpdateCategory(options?: { errorMode?: 'toast' | 'inline' }) {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useAdminMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdateInput }) =>
      service.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['public', 'categories'] })
    },
    feedback: {
      successKey: 'admin:categories.updatedSuccess',
      errorMode: options?.errorMode,
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useAdminMutation({
    mutationFn: (id: string) => service.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['public', 'categories'] })
    },
    feedback: {
      successKey: 'admin:categories.deletedSuccess',
    },
  })
}
