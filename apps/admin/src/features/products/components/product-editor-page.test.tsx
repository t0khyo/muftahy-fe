import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import * as apiFactory from '@workspace/api/factory'
import type { CategoryResponse, ProductResponse } from '@workspace/domain/schemas/product'
import type { ProductService } from '@workspace/api/services/product-service'
import { ProductEditorPage } from './product-editor-page'

const mockCategories: CategoryResponse[] = [
  {
    id: 'cat-1',
    name: 'Operating Systems',
    code: 'OS',
    slug: 'operating-systems',
    display_order: 0,
    is_active: true,
    product_count: 1,
  },
]

const mockProduct: ProductResponse = {
  id: 'prod-123',
  name: 'Windows 11 Professional',
  slug: 'windows-11-professional',
  sku: 'OS-WIN11-PRO-RET',
  description: 'Pro edition key',
  category: mockCategories[0],
  variant: 'retail',
  base_price: '499.00',
  sale_price: '349.00',
  effective_price: '349.00',
  discount_percentage: 30,
  stock_status: 'in_stock',
  available_count: 15,
  preorder_enabled: true,
  is_active: true,
  images: [
    {
      id: 'img-1',
      file_path: 'products/prod-123/img1.webp',
      file_size: 1024,
      mime_type: 'image/webp',
      url: 'https://cdn.example.com/products/prod-123/img1.webp',
      display_order: 0,
      is_primary: true,
      created_at: '2026-01-01',
    },
  ],
}

describe('ProductEditorPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.restoreAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    })
  })

  function renderEditor(productId?: string) {
    const initialEntry = productId ? `/en/products/${productId}` : '/en/products/new'
    return render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
              <Route path="/:lang/products/:id" element={<ProductEditorPage productId={productId} />} />
              <Route path="/:lang/products/new" element={<ProductEditorPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </I18nextProvider>,
    )
  }

  it('renders creation mode with 2-column layout and validated SKU', async () => {
    vi.spyOn(apiFactory, 'getProductService').mockReturnValue({
      getAdminCategories: vi.fn().mockResolvedValue(mockCategories),
    } as unknown as ProductService)

    renderEditor()

    expect(screen.getByRole('heading', { name: 'Add Product' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Product Title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Base Price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/SKU/i)).toBeInTheDocument()

    // Test SKU mismatch validation
    const skuInput = screen.getByLabelText(/SKU/i)
    fireEvent.change(skuInput, { target: { value: 'OFF-INVALID' } })

    await waitFor(() => {
      expect(screen.getByText(/SKU must begin with OS-/i)).toBeInTheDocument()
    })
  })

  it('renders edit mode with loaded product data and media section', async () => {
    vi.spyOn(apiFactory, 'getProductService').mockReturnValue({
      getAdminCategories: vi.fn().mockResolvedValue(mockCategories),
      getProductById: vi.fn().mockResolvedValue(mockProduct),
    } as unknown as ProductService)

    renderEditor('prod-123')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Edit Product' })).toBeInTheDocument()
      expect(screen.getByDisplayValue('Windows 11 Professional')).toBeInTheDocument()
      expect(screen.getByDisplayValue('OS-WIN11-PRO-RET')).toBeInTheDocument()
    })

    // Shows stock info and link to inventory
    expect(screen.getByText(/Stock Available: 15/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Manage Keys in Inventory/i })).toBeInTheDocument()
  })
})

