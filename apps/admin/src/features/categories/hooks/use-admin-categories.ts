import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from '@workspace/ui/components/sonner'
import { getProductService } from '@workspace/api/factory'
import type {
  CategoryCreateInput,
  CategoryUpdateInput,
  CategoryResponse,
} from '@workspace/domain/schemas/product'
import { showApiErrorToast } from '../../../lib/api-error-toast'

export const ADMIN_CATEGORIES_QUERY_KEY = ['admin', 'categories'] as const

export function useAdminCategories() {
  const service = getProductService('admin')
  return useQuery<CategoryResponse[]>({
    queryKey: ADMIN_CATEGORIES_QUERY_KEY,
    queryFn: () => service.getAdminCategories(),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['admin'])
  const service = getProductService('admin')

  return useMutation({
    mutationFn: (data: CategoryCreateInput) => service.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['public', 'categories'] })
      toast.success(t('categories.createdSuccess', { defaultValue: 'Category created successfully' }))
    },
    onError: (err) => {
      showApiErrorToast(err, 'admin:errors.GENERIC_ERROR')
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['admin'])
  const service = getProductService('admin')

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdateInput }) =>
      service.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['public', 'categories'] })
      toast.success(t('categories.updatedSuccess', { defaultValue: 'Category updated successfully' }))
    },
    onError: (err) => {
      showApiErrorToast(err, 'admin:errors.GENERIC_ERROR')
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['admin'])
  const service = getProductService('admin')

  return useMutation({
    mutationFn: (id: string) => service.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['public', 'categories'] })
      toast.success(t('categories.deletedSuccess', { defaultValue: 'Category deleted successfully' }))
    },
    onError: (err) => {
      showApiErrorToast(err, 'admin:errors.CATEGORY_HAS_PRODUCTS')
    },
  })
}

