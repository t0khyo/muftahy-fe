import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import {
  DataTableSearch,
  DataTableActiveFilters,
  DataTableToolbar,
} from './data-table-toolbar'

describe('DataTableToolbar Components', () => {
  it('renders search input and triggers clear on clicking X', () => {
    const handleChange = vi.fn()

    const { rerender } = render(
      <I18nextProvider i18n={i18n}>
        <DataTableSearch value="" onChange={handleChange} placeholder="Search products..." />
      </I18nextProvider>,
    )

    const input = screen.getByPlaceholderText('Search products...')
    expect(input).toBeInTheDocument()
    expect(screen.queryByTitle(/Clear search/i)).not.toBeInTheDocument()

    // Type query
    rerender(
      <I18nextProvider i18n={i18n}>
        <DataTableSearch value="windows" onChange={handleChange} placeholder="Search products..." />
      </I18nextProvider>,
    )

    const clearBtn = screen.getByTitle(/Clear search/i)
    expect(clearBtn).toBeInTheDocument()
    fireEvent.click(clearBtn)
    expect(handleChange).toHaveBeenCalledWith('')
  })

  it('renders active filter chips with remove and clear-all handlers', () => {
    const handleRemoveCategory = vi.fn()
    const handleClearAll = vi.fn()

    render(
      <I18nextProvider i18n={i18n}>
        <DataTableActiveFilters
          chips={[
            { id: 'cat', label: 'Category: OS', onRemove: handleRemoveCategory },
          ]}
          onClearAll={handleClearAll}
        />
      </I18nextProvider>,
    )

    expect(screen.getByText('Category: OS')).toBeInTheDocument()
    const removeBtn = screen.getByLabelText('Remove Category: OS')
    fireEvent.click(removeBtn)
    expect(handleRemoveCategory).toHaveBeenCalled()

    const clearAllBtn = screen.getByText(/Clear all/i)
    fireEvent.click(clearAllBtn)
    expect(handleClearAll).toHaveBeenCalled()
  })

  it('renders DataTableToolbar with search at the start and views at the end', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DataTableToolbar
          search={<span data-testid="search-node">Search Node</span>}
          filters={<span data-testid="filter-node">Filter Node</span>}
          views={<span data-testid="views-node">Views Node</span>}
        />
      </I18nextProvider>,
    )

    expect(screen.getByTestId('search-node')).toBeInTheDocument()
    expect(screen.getByTestId('filter-node')).toBeInTheDocument()
    expect(screen.getByTestId('views-node')).toBeInTheDocument()
  })
})

