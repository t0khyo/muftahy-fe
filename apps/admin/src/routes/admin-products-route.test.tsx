import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import * as apiFactory from '@workspace/api/factory'
import type { ProductService } from '@workspace/api/services/product-service'
import type { ProductResponse } from '@workspace/domain/schemas/product'
import { toast } from '@workspace/ui/components/sonner'
import { createAdminQueryClient } from '../app/query-client'
import * as useAdminAuthModule from '../features/auth/hooks/use-admin-auth'
import { AdminProductsRoute } from './admin-products-route'

function makeProduct(id: string, name: string, isActive: boolean): ProductResponse {
  return {
    id,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    sku: `OS-${id.toUpperCase()}`,
    description: 'Sample license',
    category: {
      id: 'cat-1',
      name: 'Operating Systems',
      code: 'OS',
      slug: 'operating-systems',
      display_order: 0,
      is_active: true,
      product_count: 2,
    },
    variant: 'retail',
    base_price: '250.00',
    sale_price: null,
    effective_price: '250.00',
    discount_percentage: null,
    stock_status: 'in_stock',
    available_count: 10,
    preorder_enabled: false,
    is_active: isActive,
    images: [],
  }
}

describe('AdminProductsRoute feedback behavior', () => {
  let testQueryClient: QueryClient
  const prodA = makeProduct('prod-a', 'Windows 11 Home', true)
  const prodB = makeProduct('prod-b', 'Windows 11 Pro', false)

  beforeEach(() => {
    vi.restoreAllMocks()
    testQueryClient = createAdminQueryClient()

    vi.spyOn(useAdminAuthModule, 'useAdminAuth').mockReturnValue({
      user: {
        id: 'usr-1',
        email: 'admin1@souqmuftah.com',
        full_name: 'Lead Admin',
        is_active: true,
        created_at: '2026-01-01',
      },
      role: 'admin',
      isAuthenticated: true,
      isLoading: false,
      isInitializing: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
    })
  })

  function renderProductsRoute() {
    return render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={testQueryClient}>
          <MemoryRouter initialEntries={['/en/products']}>
            <Routes>
              <Route path="/:lang/products" element={<AdminProductsRoute />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </I18nextProvider>
    )
  }

  it('emits exactly one success toast when toggling a single row status', async () => {
    const successSpy = vi.spyOn(toast, 'success')
    const updateProduct = vi.fn().mockResolvedValue({ ...prodA, is_active: false })

    vi.spyOn(apiFactory, 'getProductService').mockReturnValue({
      getProducts: vi.fn().mockResolvedValue([prodA]),
      getAdminCategories: vi.fn().mockResolvedValue([]),
      updateProduct,
    } as unknown as ProductService)

    renderProductsRoute()

    await screen.findByText('Windows 11 Home')

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    const toggleItem = await screen.findByRole('menuitem', { name: /set as draft/i })
    fireEvent.click(toggleItem)

    await waitFor(() => {
      expect(updateProduct).toHaveBeenCalledWith('prod-a', { is_active: false })
      expect(successSpy).toHaveBeenCalledTimes(1)
    })
  })

  it('shows error toast fallback when row status toggle fails with 409 conflict', async () => {
    const errorSpy = vi.spyOn(toast, 'error')
    const updateProduct = vi
      .fn()
      .mockRejectedValueOnce(new ApiClientError(409, 'CONFLICT', 'Cannot unpublish while featured'))

    vi.spyOn(apiFactory, 'getProductService').mockReturnValue({
      getProducts: vi.fn().mockResolvedValue([prodA]),
      getAdminCategories: vi.fn().mockResolvedValue([]),
      updateProduct,
    } as unknown as ProductService)

    renderProductsRoute()

    await screen.findByText('Windows 11 Home')

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    const toggleItem = await screen.findByRole('menuitem', { name: /set as draft/i })
    fireEvent.click(toggleItem)

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })
  })

  it('executes bulk status sequentially and emits partial warning toast when one item fails', async () => {
    const warningSpy = vi.spyOn(toast, 'warning')
    const updateProduct = vi
      .fn()
      .mockResolvedValueOnce({ ...prodA, is_active: true })
      .mockRejectedValueOnce(new ApiClientError(500, 'INTERNAL_ERROR', 'Server failure'))

    vi.spyOn(apiFactory, 'getProductService').mockReturnValue({
      getProducts: vi.fn().mockResolvedValue([prodA, prodB]),
      getAdminCategories: vi.fn().mockResolvedValue([]),
      updateProduct,
    } as unknown as ProductService)

    renderProductsRoute()

    await screen.findByText('Windows 11 Home')

    const selectAll = screen.getByRole('checkbox', { name: /select all products/i })
    fireEvent.click(selectAll)

    const bulkPublishBtn = await screen.findByRole('button', { name: /set as active/i })
    fireEvent.click(bulkPublishBtn)

    await waitFor(() => {
      expect(updateProduct).toHaveBeenCalledTimes(2)
      expect(warningSpy).toHaveBeenCalledTimes(1)
    })
  })
})

