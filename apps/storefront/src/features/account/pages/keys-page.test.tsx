import { act, render, screen, waitFor, fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { i18n } from '@workspace/i18n/config'
import { getUserService } from '@workspace/api/factory'
import { KeysPage } from './keys-page'

const mockKeys = [
  {
    key_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    order_item_id: 'e4f5a6b7-c8d9-0123-4567-89abcdef0123',
    product_name: 'Microsoft Office 2024 Home & Business',
    serial: 'X229N-48FGX-YVC9B-4J6C9-AAAAA',
    sold_at: '2026-11-20T04:00:00Z',
  },
  {
    key_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    order_item_id: 'f5a6b7c8-d9e0-1234-5678-9abcdef01234',
    product_name: 'Windows 11 Professional',
    serial: 'VK7JG-NPHTM-C97JM-9MPGT-3V66T',
    sold_at: '2026-11-18T12:00:00Z',
  },
]

function renderKeysView(initialRoute = '/en/account/keys') {
  const lang = initialRoute.startsWith('/ar') ? 'ar' : 'en'
  i18n.changeLanguage(lang)
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/:lang/account/keys" element={<KeysPage />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  )
}

describe('KeysPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const userService = getUserService('storefront')
    vi.spyOn(userService, 'getUserKeys').mockResolvedValue(mockKeys)

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders key vault with active license count and masked serials', async () => {
    renderKeysView('/en/account/keys')

    await waitFor(() => {
      expect(screen.getByText('Microsoft Office 2024 Home & Business')).toBeInTheDocument()
      expect(screen.getByText('Windows 11 Professional')).toBeInTheDocument()
    })

    expect(screen.getAllByText('•••••-•••••-•••••-•••••-•••••').length).toBe(2)
    expect(screen.queryByText('X229N-48FGX-YVC9B-4J6C9-AAAAA')).not.toBeInTheDocument()
  })

  it('reveals key with scramble animation when reveal button is clicked and hides again on toggle', async () => {
    renderKeysView('/en/account/keys')

    await waitFor(() => {
      expect(screen.getByText('Microsoft Office 2024 Home & Business')).toBeInTheDocument()
    })

    vi.useFakeTimers()
    const revealButtons = screen.getAllByRole('button', { name: /reveal/i })
    fireEvent.click(revealButtons[0])

    // Screen-reader live region announces serial immediately; visual span scrambles first
    const srOnlySpan = screen.getByText('X229N-48FGX-YVC9B-4J6C9-AAAAA')
    expect(srOnlySpan).toHaveClass('sr-only')
    const visualSpan = srOnlySpan.previousElementSibling
    expect(visualSpan).not.toBeNull()
    expect(visualSpan).toHaveAttribute('aria-hidden', 'true')
    expect(visualSpan?.textContent).not.toBe('X229N-48FGX-YVC9B-4J6C9-AAAAA')
    expect(visualSpan?.textContent?.length).toBe('X229N-48FGX-YVC9B-4J6C9-AAAAA'.length)

    act(() => {
      vi.advanceTimersByTime(1200)
    })

    expect(visualSpan?.textContent).toBe('X229N-48FGX-YVC9B-4J6C9-AAAAA')

    // Hide clears plaintext immediately and reverse-scrambles back to bullet mask
    fireEvent.click(screen.getByRole('button', { name: /hide/i }))
    expect(screen.queryByText('X229N-48FGX-YVC9B-4J6C9-AAAAA')).not.toBeInTheDocument()

    const hideSr = screen.getByText('Digital key hidden')
    expect(hideSr).toHaveClass('sr-only')
    const hideVisual = hideSr.previousElementSibling
    expect(hideVisual).toHaveAttribute('aria-hidden', 'true')
    expect(hideVisual?.textContent).not.toBe('•••••-•••••-•••••-•••••-•••••')

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(hideVisual?.textContent).toBe('•••••-•••••-•••••-•••••-•••••')
  })

  it('copies key serial to clipboard with feedback', async () => {
    renderKeysView('/en/account/keys')

    await waitFor(() => {
      expect(screen.getByText('Microsoft Office 2024 Home & Business')).toBeInTheDocument()
    })

    const copyButtons = screen.getAllByRole('button', { name: /copy key/i })
    fireEvent.click(copyButtons[0])

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('X229N-48FGX-YVC9B-4J6C9-AAAAA')
    await waitFor(() => {
      expect(screen.getByText('Copied to clipboard!')).toBeInTheDocument()
    })
  })

  it('filters keys by search input', async () => {
    renderKeysView('/en/account/keys')

    await waitFor(() => {
      expect(screen.getByText('Microsoft Office 2024 Home & Business')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search licenses/i)
    fireEvent.change(searchInput, { target: { value: 'Office' } })

    expect(screen.getByText('Microsoft Office 2024 Home & Business')).toBeInTheDocument()
    expect(screen.queryByText('Windows 11 Professional')).not.toBeInTheDocument()
  })

  it('renders correctly in Arabic RTL', async () => {
    renderKeysView('/ar/account/keys')

    await waitFor(() => {
      expect(screen.getByText('خزينة المفاتيح الرقمية')).toBeInTheDocument()
      expect(screen.getByText('Microsoft Office 2024 Home & Business')).toBeInTheDocument()
    })
  })

  it('passes order_item_id directly to OpenTicketDialog when reporting an issue', async () => {
    renderKeysView('/en/account/keys')

    await waitFor(() => {
      expect(screen.getByText('Microsoft Office 2024 Home & Business')).toBeInTheDocument()
    })

    const reportButtons = screen.getAllByRole('button', { name: /report/i })
    fireEvent.click(reportButtons[0])

    // Manual Order Item ID input should not be shown since order_item_id is linked
    expect(screen.queryByLabelText(/Order Item ID \(UUID\)/i)).not.toBeInTheDocument()
  })
})

