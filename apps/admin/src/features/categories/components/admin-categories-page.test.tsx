import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import * as apiFactory from '@workspace/api/factory'
import type { CategoryResponse } from '@workspace/domain/schemas/product'
import type { ProductService } from '@workspace/api/services/product-service'
import { toast } from '@workspace/ui/components/sonner'
import { createAdminQueryClient } from '../../../app/query-client'
import { AdminCategoriesPage } from './admin-categories-page'

const mockCategories: CategoryResponse[] = [
  {
    id: 'cat-1',
    name: 'Operating Systems',
    code: 'OS',
    slug: 'operating-systems',
    description: 'Windows and other desktop OS licenses',
    display_order: 0,
    is_active: true,
    product_count: 5,
  },
  {
    id: 'cat-2',
    name: 'Security Software',
    code: 'SEC',
    slug: 'security-software',
    description: 'Antivirus and VPN keys',
    display_order: 1,
    is_active: false,
    product_count: 0,
  },
]

describe('AdminCategoriesPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.restoreAllMocks()
    queryClient = createAdminQueryClient()
  })

  function renderPage() {
    return render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/en/categories']}>
            <AdminCategoriesPage />
          </MemoryRouter>
        </QueryClientProvider>
      </I18nextProvider>,
    )
  }

  it('renders table with categories, codes, slugs, and product counts', async () => {
    vi.spyOn(apiFactory, 'getProductService').mockReturnValue({
      getAdminCategories: vi.fn().mockResolvedValue(mockCategories),
    } as unknown as ProductService)

    renderPage()

    expect(screen.getByRole('heading', { name: 'Categories' })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Operating Systems')).toBeInTheDocument()
      expect(screen.getByText('Security Software')).toBeInTheDocument()
    })

    // Codes & Slugs
    expect(screen.getByText('OS')).toBeInTheDocument()
    expect(screen.getByText('SEC')).toBeInTheDocument()
    expect(screen.getByText('/operating-systems')).toBeInTheDocument()
    expect(screen.getByText('/security-software')).toBeInTheDocument()

    // Product counts
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('opens category creation dialog on clicking Add Category', async () => {
    vi.spyOn(apiFactory, 'getProductService').mockReturnValue({
      getAdminCategories: vi.fn().mockResolvedValue(mockCategories),
    } as unknown as ProductService)

    renderPage()

    const addBtn = screen.getByRole('button', { name: /add category/i })
    fireEvent.click(addBtn)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Add Category' })).toBeInTheDocument()
    })
  })

  it('guards deletion when category has products assigned', async () => {
    vi.spyOn(apiFactory, 'getProductService').mockReturnValue({
      getAdminCategories: vi.fn().mockResolvedValue(mockCategories),
    } as unknown as ProductService)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Operating Systems')).toBeInTheDocument()
    })

    // Click delete on the first category (which has 5 products)
    const deleteButtons = screen.getAllByRole('button', { name: /delete category/i })
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      // Guard message
      expect(screen.getByText(/cannot delete category with assigned products/i)).toBeInTheDocument()
    })
  })

  it('shows toast error when deleting an empty category fails on the backend', async () => {
    const errorSpy = vi.spyOn(toast, 'error')
    vi.spyOn(apiFactory, 'getProductService').mockReturnValue({
      getAdminCategories: vi.fn().mockResolvedValue(mockCategories),
      deleteCategory: vi.fn().mockRejectedValue(
        new ApiClientError(409, 'CONFLICT', 'Category still has archived items')
      ),
    } as unknown as ProductService)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Security Software')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: /delete category/i })
    fireEvent.click(deleteButtons[1])

    const dialog = await screen.findByRole('dialog')
    const confirmBtn = within(dialog).getByRole('button', { name: /delete category/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })
  })
})

