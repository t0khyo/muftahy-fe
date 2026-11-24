import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { DataTablePagination } from './data-table-pagination'

describe('DataTablePagination Component', () => {
  it('renders summary text and page size selector', () => {
    const handlePageChange = vi.fn()
    const handlePageSizeChange = vi.fn()

    render(
      <I18nextProvider i18n={i18n}>
        <DataTablePagination
          page={1}
          pageSize={10}
          totalItems={45}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </I18nextProvider>
    )

    expect(screen.getByText(/Showing 1–10 of 45 results/i)).toBeInTheDocument()
    expect(screen.getByText(/Rows per page/i)).toBeInTheDocument()
  })

  it('triggers onPageChange when clicking a page number and Next button', () => {
    const handlePageChange = vi.fn()
    const handlePageSizeChange = vi.fn()

    render(
      <I18nextProvider i18n={i18n}>
        <DataTablePagination
          page={1}
          pageSize={10}
          totalItems={45}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </I18nextProvider>
    )

    // Click page 3
    const page3 = screen.getByRole('button', { name: '3' })
    fireEvent.click(page3)
    expect(handlePageChange).toHaveBeenCalledWith(3)

    // Click Next
    const nextBtn = screen.getByRole('button', { name: /Go to next page/i })
    fireEvent.click(nextBtn)
    expect(handlePageChange).toHaveBeenCalledWith(2)
  })

  it('disables Previous button on first page and Next button on last page', () => {
    const handlePageChange = vi.fn()
    const handlePageSizeChange = vi.fn()

    const { rerender } = render(
      <I18nextProvider i18n={i18n}>
        <DataTablePagination
          page={1}
          pageSize={10}
          totalItems={30}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </I18nextProvider>
    )

    const prevBtn = screen.getByRole('button', { name: /Go to previous page/i })
    expect(prevBtn).toHaveAttribute('aria-disabled', 'true')

    // Rerender on last page (page 3)
    rerender(
      <I18nextProvider i18n={i18n}>
        <DataTablePagination
          page={3}
          pageSize={10}
          totalItems={30}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </I18nextProvider>
    )

    const nextBtn = screen.getByRole('button', { name: /Go to next page/i })
    expect(nextBtn).toHaveAttribute('aria-disabled', 'true')
  })

  it('renders ellipsis when total pages exceeds 5', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DataTablePagination
          page={1}
          pageSize={10}
          totalItems={100}
          onPageChange={vi.fn()}
          onPageSizeChange={vi.fn()}
        />
      </I18nextProvider>
    )

    expect(screen.getByText('More pages')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument()
  })
})
