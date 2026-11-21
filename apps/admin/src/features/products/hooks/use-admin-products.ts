import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getProductService } from '@workspace/api/factory'
import type {
  ProductCreateInput,
  ProductResponse,
  ProductUpdateInput,
} from '@workspace/domain/schemas/product'
import type { ProductFilterParams } from '@workspace/api/services/product-service'

export const adminProductKeys = {
  all: ['admin', 'products'] as const,
  list: (params?: ProductFilterParams) => [...adminProductKeys.all, 'list', params] as const,
  categories: () => [...adminProductKeys.all, 'categories'] as const,
  detail: (id: string) => [...adminProductKeys.all, 'detail', id] as const,
}

export function useAdminProducts(params?: ProductFilterParams) {
  const service = getProductService()
  return useQuery({
    queryKey: adminProductKeys.list(params),
    queryFn: () => service.getProducts(params),
  })
}

export function useProductCategories() {
  const service = getProductService()
  return useQuery({
    queryKey: adminProductKeys.categories(),
    queryFn: () => service.getCategories(),
  })
}

export function useAdminProductDetail(id: string) {
  const service = getProductService()
  return useQuery({
    queryKey: adminProductKeys.detail(id),
    queryFn: () => service.getProductById(id),
    enabled: Boolean(id),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const service = getProductService()

  return useMutation({
    mutationFn: (data: ProductCreateInput) => service.createProduct(data),
    onSuccess: (newProduct) => {
      queryClient.setQueryData<ProductResponse[]>(adminProductKeys.list(), (prev) => {
        if (!prev) return [newProduct]
        return [newProduct, ...prev]
      })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  const service = getProductService()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdateInput }) =>
      service.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData(adminProductKeys.detail(updatedProduct.id), updatedProduct)
      queryClient.setQueryData<ProductResponse[]>(adminProductKeys.list(), (prev) => {
        if (!prev) return prev
        return prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      })
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
  const service = getProductService()

  return useMutation({
    mutationFn: (id: string) => service.deleteProduct(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<ProductResponse[]>(adminProductKeys.list(), (prev) => {
        if (!prev) return prev
        return prev.filter((p) => p.id !== deletedId)
      })
    },
  })
}
