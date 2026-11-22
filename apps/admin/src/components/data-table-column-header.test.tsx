import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DataTableColumnHeader } from './data-table-column-header'

describe('DataTableColumnHeader Component', () => {
  it('renders title and triggers onSort on click', () => {
    const handleSort = vi.fn()
    render(
      <DataTableColumnHeader
        column="price"
        title="Base Price"
        sortConfig={null}
        onSort={handleSort}
      />
    )

    const header = screen.getByRole('button', { name: /Base Price/i })
    expect(header).toBeInTheDocument()
    expect(header).toHaveAttribute('aria-sort', 'none')

    fireEvent.click(header)
    expect(handleSort).toHaveBeenCalledWith('price')
  })

  it('reflects ascending sort direction with proper aria-sort', () => {
    const handleSort = vi.fn()
    render(
      <DataTableColumnHeader
        column="price"
        title="Base Price"
        sortConfig={{ column: 'price', direction: 'asc' }}
        onSort={handleSort}
      />
    )

    const header = screen.getByRole('button', { name: /Base Price/i })
    expect(header).toHaveAttribute('aria-sort', 'ascending')
  })

  it('reflects descending sort direction with proper aria-sort', () => {
    const handleSort = vi.fn()
    render(
      <DataTableColumnHeader
        column="price"
        title="Base Price"
        sortConfig={{ column: 'price', direction: 'desc' }}
        onSort={handleSort}
      />
    )

    const header = screen.getByRole('button', { name: /Base Price/i })
    expect(header).toHaveAttribute('aria-sort', 'descending')
  })

  it('handles keyboard activation with Enter and Space', () => {
    const handleSort = vi.fn()
    render(
      <DataTableColumnHeader
        column="name"
        title="Product Name"
        sortConfig={null}
        onSort={handleSort}
      />
    )

    const header = screen.getByRole('button', { name: /Product Name/i })
    fireEvent.keyDown(header, { key: 'Enter' })
    expect(handleSort).toHaveBeenCalledWith('name')

    fireEvent.keyDown(header, { key: ' ' })
    expect(handleSort).toHaveBeenCalledTimes(2)
  })
})

