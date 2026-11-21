import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AdminRouteError } from './admin-route-error'

describe('AdminRouteError Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders runtime error details with reload and dashboard links', () => {
    const CrashingComponent = () => {
      throw new Error('Database connection failed in inventory workstation')
    }

    const router = createMemoryRouter(
      [
        {
          path: '/:lang',
          errorElement: <AdminRouteError />,
          children: [
            {
              path: 'inventory',
              element: <CrashingComponent />,
            },
          ],
        },
      ],
      { initialEntries: ['/en/inventory'] },
    )

    render(<RouterProvider router={router} />)

    expect(screen.getByText('Workstation Encountered an Error')).toBeInTheDocument()
    expect(
      screen.getByText('Database connection failed in inventory workstation'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reload workstation/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('expands technical diagnostics and allows copying stack trace', () => {
    const errorWithStack = new Error('Explicit test trace crash')
    errorWithStack.stack = 'Error: Explicit test trace crash\n    at Workstation.tsx:42:15'

    const CrashingComponent = () => {
      throw errorWithStack
    }

    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    const router = createMemoryRouter(
      [
        {
          path: '/:lang',
          errorElement: <AdminRouteError />,
          children: [
            {
              path: 'test',
              element: <CrashingComponent />,
            },
          ],
        },
      ],
      { initialEntries: ['/en/test'] },
    )

    render(<RouterProvider router={router} />)

    const toggleBtn = screen.getByRole('button', { name: /view technical diagnostics/i })
    expect(toggleBtn).toBeInTheDocument()
    fireEvent.click(toggleBtn)

    expect(screen.getByText(/at Workstation\.tsx:42:15/)).toBeInTheDocument()

    const copyBtn = screen.getByRole('button', { name: /copy stack trace/i })
    fireEvent.click(copyBtn)
    expect(writeTextMock).toHaveBeenCalledWith(errorWithStack.stack)
  })
})
