import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { CatchAllRedirect } from './catch-all-redirect'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location-display">{location.pathname}</div>
}

describe('CatchAllRedirect', () => {
  it('redirects /ar/admin to /ar/products cleanly without appending /products infinitely', () => {
    render(
      <MemoryRouter initialEntries={['/ar/admin']}>
        <Routes>
          <Route path="/:lang/*" element={<CatchAllRedirect />} />
          <Route path="/:lang/products" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('location-display')).toHaveTextContent('/ar/products')
  })

  it('redirects /en/admin to /en/products cleanly', () => {
    render(
      <MemoryRouter initialEntries={['/en/admin']}>
        <Routes>
          <Route path="/:lang/*" element={<CatchAllRedirect />} />
          <Route path="/:lang/products" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('location-display')).toHaveTextContent('/en/products')
  })

  it('redirects deep unknown nested paths under /ar to /ar/products', () => {
    render(
      <MemoryRouter initialEntries={['/ar/admin/products/products/something']}>
        <Routes>
          <Route path="/:lang/*" element={<CatchAllRedirect />} />
          <Route path="/:lang/products" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('location-display')).toHaveTextContent('/ar/products')
  })

  it('falls back to /en/products when lang parameter is unsupported', () => {
    render(
      <MemoryRouter initialEntries={['/fr/admin']}>
        <Routes>
          <Route path="/:lang/*" element={<CatchAllRedirect />} />
          <Route path="/:lang/products" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('location-display')).toHaveTextContent('/en/products')
  })
})
