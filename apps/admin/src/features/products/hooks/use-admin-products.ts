import * as React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import { getProductService } from '@workspace/api/factory'
import type {
  ProductCreateInput,
  ProductResponse,
  ProductUpdateInput,
  ImageReorderItem,
} from '@workspace/domain/schemas/product'
import type { ProductFilterParams } from '@workspace/api/services/product-service'
import type { FeedbackDescriptor } from '../../../lib/api-feedback'
import { useAdminMutation } from '../../../hooks/use-admin-mutation'

export const adminProductKeys = {
  all: ['admin', 'products'] as const,
  lists: () => [...adminProductKeys.all, 'list'] as const,
  list: (params?: ProductFilterParams) => [...adminProductKeys.lists(), params] as const,
  categories: () => [...adminProductKeys.all, 'categories'] as const,
  detail: (id: string) => [...adminProductKeys.all, 'detail', id] as const,
}

export interface ProductMutationHookOptions {
  errorMode?: 'toast' | 'inline'
  suppressSuccessToast?: boolean
}

export interface BulkProductStatusResult {
  total: number
  succeeded: number
  failed: number
  aborted: boolean
}

export function useAdminProducts(params?: ProductFilterParams) {
  const service = getProductService('admin')
  const mergedParams = React.useMemo(
    () => ({
      only_active: false,
      ...params,
    }),
    [params],
  )

  return useQuery({
    queryKey: adminProductKeys.list(mergedParams),
    queryFn: () => service.getProducts(mergedParams),
  })
}

export function useProductCategories() {
  const service = getProductService('admin')
  return useQuery({
    queryKey: adminProductKeys.categories(),
    queryFn: () => service.getAdminCategories(),
  })
}

export function useAdminProductDetail(id: string) {
  const service = getProductService('admin')
  return useQuery({
    queryKey: adminProductKeys.detail(id),
    queryFn: () => service.getProductById(id),
    enabled: Boolean(id) && id !== 'new',
  })
}

export function useCreateProduct(options?: { errorMode?: 'toast' | 'inline' }) {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useAdminMutation({
    mutationFn: (data: ProductCreateInput) => service.createProduct(data),
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
      queryClient.setQueryData(adminProductKeys.detail(newProduct.id), newProduct)
    },
    feedback: {
      successKey: 'admin:productEditor.savedSuccess',
      errorMode: options?.errorMode,
    },
  })
}

export function useUpdateProduct(options?: { errorMode?: 'toast' | 'inline' }) {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useAdminMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdateInput }) =>
      service.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData(adminProductKeys.detail(updatedProduct.id), updatedProduct)
      queryClient.setQueriesData<ProductResponse[]>({ queryKey: adminProductKeys.lists() }, (prev) => {
        if (!prev) return prev
        return prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
      })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.lists() })
    },
    feedback: {
      successKey: 'admin:productEditor.savedSuccess',
      errorMode: options?.errorMode,
    },
  })
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useAdminMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      service.updateProduct(id, { is_active }),
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData(adminProductKeys.detail(updatedProduct.id), updatedProduct)
      queryClient.setQueriesData<ProductResponse[]>({ queryKey: adminProductKeys.lists() }, (prev) => {
        if (!prev) return prev
        return prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
      })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.lists() })
    },
    feedback: {
      getSuccessFeedback: (_data, variables) => ({
        key: variables.is_active
          ? 'admin:feedback.productPublished'
          : 'admin:feedback.productUnpublished',
      }),
    },
  })
}

export function useBulkUpdateProductStatus() {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useAdminMutation<
    BulkProductStatusResult,
    unknown,
    { ids: string[]; is_active: boolean }
  >({
    mutationFn: async ({ ids, is_active }) => {
      let succeeded = 0
      let aborted = false
      let firstError: unknown = null

      for (const id of ids) {
        try {
          await service.updateProduct(id, { is_active })
          succeeded++
        } catch (err) {
          firstError ??= err
          if (
            err instanceof ApiClientError &&
            (err.status === 429 || err.isSessionExpired || err.isNetworkError)
          ) {
            aborted = true
            break
          }
        }
      }

      if (succeeded === 0 && firstError !== null) {
        throw firstError
      }

      return {
        total: ids.length,
        succeeded,
        failed: ids.length - succeeded,
        aborted,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
    },
    feedback: {
      getSuccessFeedback: (res): FeedbackDescriptor | null =>
        res.failed === 0
          ? { key: 'admin:feedback.productBulkStatusSuccess', params: { count: res.succeeded } }
          : {
              key: 'admin:feedback.productBulkStatusPartial',
              params: { succeeded: res.succeeded, total: res.total },
              variant: 'warning',
            },
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useAdminMutation({
    mutationFn: (id: string) => service.deleteProduct(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueriesData<ProductResponse[]>({ queryKey: adminProductKeys.lists() }, (prev) => {
        if (!prev) return prev
        return prev.filter((p) => p.id !== deletedId)
      })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
    },
    feedback: {
      successKey: 'admin:feedback.productDeleted',
    },
  })
}

export function useUploadProductImage(options?: ProductMutationHookOptions) {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useAdminMutation({
    mutationFn: ({
      productId,
      file,
      isPrimary,
    }: {
      productId: string
      file: File
      isPrimary?: boolean
    }) => service.uploadProductImage(productId, { file, is_primary: isPrimary }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.detail(variables.productId) })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.lists() })
    },
    feedback: {
      successKey: 'admin:feedback.imageUploaded',
      suppressSuccessToast: options?.suppressSuccessToast,
      errorMode: options?.errorMode,
      errorFallbackKey: 'admin:errors.INVALID_IMAGE_FORMAT',
    },
  })
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useAdminMutation({
    mutationFn: ({
      productId,
      imageId,
    }: {
      productId: string
      imageId: string
    }) => service.deleteProductImage(productId, imageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.detail(variables.productId) })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.lists() })
    },
    feedback: {
      successKey: 'admin:feedback.imageDeleted',
      errorFallbackKey: 'admin:errors.PRIMARY_IMAGE_CANNOT_BE_DELETED',
    },
  })
}

export function useSetPrimaryProductImage(options?: { suppressSuccessToast?: boolean }) {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useAdminMutation({
    mutationFn: ({
      productId,
      imageId,
    }: {
      productId: string
      imageId: string
    }) => service.setPrimaryProductImage(productId, imageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.detail(variables.productId) })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.lists() })
    },
    feedback: {
      successKey: 'admin:feedback.primaryImageUpdated',
      suppressSuccessToast: options?.suppressSuccessToast,
    },
  })
}

export function useReorderProductImages() {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useAdminMutation({
    mutationFn: ({
      productId,
      images,
    }: {
      productId: string
      images: ImageReorderItem[]
    }) => service.reorderProductImages(productId, { items: images }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.detail(variables.productId) })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.lists() })
    },
    feedback: {
      successKey: 'admin:feedback.imagesReordered',
    },
  })
}

export function useUploadProductThumbnail(options?: { suppressSuccessToast?: boolean }) {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useAdminMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) =>
      service.uploadProductThumbnail(productId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.detail(variables.productId) })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.lists() })
    },
    feedback: {
      successKey: 'admin:feedback.thumbnailUploaded',
      suppressSuccessToast: options?.suppressSuccessToast,
      errorFallbackKey: 'admin:errors.INVALID_IMAGE_FORMAT',
    },
  })
}

export function useDeleteProductThumbnail() {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useAdminMutation({
    mutationFn: ({ productId }: { productId: string }) =>
      service.deleteProductThumbnail(productId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.detail(variables.productId) })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.lists() })
    },
    feedback: {
      successKey: 'admin:feedback.thumbnailDeleted',
    },
  })
}
