import * as React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getProductService } from '@workspace/api/factory'
import { toast } from '@workspace/ui/components/sonner'
import type {
  ProductCreateInput,
  ProductResponse,
  ProductUpdateInput,
  ImageReorderItem,
} from '@workspace/domain/schemas/product'
import type { ProductFilterParams } from '@workspace/api/services/product-service'
import { showApiErrorToast } from '../../../lib/api-error-toast'

export const adminProductKeys = {
  all: ['admin', 'products'] as const,
  lists: () => [...adminProductKeys.all, 'list'] as const,
  list: (params?: ProductFilterParams) => [...adminProductKeys.lists(), params] as const,
  categories: () => [...adminProductKeys.all, 'categories'] as const,
  detail: (id: string) => [...adminProductKeys.all, 'detail', id] as const,
}

export function useAdminProducts(params?: ProductFilterParams) {
  const service = getProductService('admin')
  const mergedParams = React.useMemo(() => ({
    only_active: false,
    ...params,
  }), [params])

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

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['admin'])
  const service = getProductService('admin')

  return useMutation({
    mutationFn: (data: ProductCreateInput) => service.createProduct(data),
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
      queryClient.setQueryData(adminProductKeys.detail(newProduct.id), newProduct)
      toast.success(t('productEditor.savedSuccess', { defaultValue: 'Product saved successfully' }))
    },
    onError: (err) => {
      showApiErrorToast(err, 'admin:errors.GENERIC_ERROR')
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['admin'])
  const service = getProductService('admin')

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdateInput }) =>
      service.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData(adminProductKeys.detail(updatedProduct.id), updatedProduct)
      // Optimistically update existing list queries so UI responds immediately
      queryClient.setQueriesData<ProductResponse[]>({ queryKey: adminProductKeys.lists() }, (prev) => {
        if (!prev) return prev
        return prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
      })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.lists() })
      toast.success(t('productEditor.savedSuccess', { defaultValue: 'Product saved successfully' }))
    },
    onError: (err) => {
      showApiErrorToast(err, 'admin:errors.GENERIC_ERROR')
    },
  })
}

export function useUpdateProductStatus() {
  const updateMutation = useUpdateProduct()
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateMutation.mutateAsync({ id, data: { is_active } }),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useMutation({
    mutationFn: (id: string) => service.deleteProduct(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<ProductResponse[]>(adminProductKeys.list(), (prev) => {
        if (!prev) return prev
        return prev.filter((p) => p.id !== deletedId)
      })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all })
    },
    onError: (err) => {
      showApiErrorToast(err, 'admin:errors.GENERIC_ERROR')
    },
  })
}

export function useUploadProductImage() {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useMutation({
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
    onError: (err) => {
      showApiErrorToast(err, 'admin:errors.INVALID_IMAGE_FORMAT')
    },
  })
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useMutation({
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
    onError: (err) => {
      showApiErrorToast(err, 'admin:errors.PRIMARY_IMAGE_CANNOT_BE_DELETED')
    },
  })
}

export function useSetPrimaryProductImage() {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useMutation({
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
    onError: (err) => {
      showApiErrorToast(err, 'admin:errors.GENERIC_ERROR')
    },
  })
}

export function useReorderProductImages() {
  const queryClient = useQueryClient()
  const service = getProductService('admin')

  return useMutation({
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
    onError: (err) => {
      showApiErrorToast(err, 'admin:errors.GENERIC_ERROR')
    },
  })
}

export function useUploadProductThumbnail() {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['admin'])
  const service = getProductService('admin')

  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) =>
      service.uploadProductThumbnail(productId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.detail(variables.productId) })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.lists() })
      toast.success(
        t('admin:productEditor.thumbnailUploaded', { defaultValue: 'Thumbnail updated' }),
      )
    },
    onError: (err) => {
      showApiErrorToast(err, 'admin:errors.INVALID_IMAGE_FORMAT')
    },
  })
}

export function useDeleteProductThumbnail() {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['admin'])
  const service = getProductService('admin')

  return useMutation({
    mutationFn: ({ productId }: { productId: string }) =>
      service.deleteProductThumbnail(productId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.detail(variables.productId) })
      queryClient.invalidateQueries({ queryKey: adminProductKeys.lists() })
      toast.success(
        t('admin:productEditor.thumbnailDeleted', {
          defaultValue: 'Thumbnail removed (reverted to primary image)',
        }),
      )
    },
    onError: (err) => {
      showApiErrorToast(err, 'admin:errors.GENERIC_ERROR')
    },
  })
}
