import { act, render, screen, waitFor, fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { i18n } from '@workspace/i18n/config'
import { getTicketService } from '@workspace/api/factory'
import { TicketsPage } from './tickets-page'
import { TicketThreadPage } from './ticket-thread-page'

const mockTicketsList = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    user_id: '223e4567-e89b-12d3-a456-426614174002',
    order_item_id: '323e4567-e89b-12d3-a456-426614174003',
    key_serial: 'DEFECTIVE-KEY-001',
    status: 'open' as const,
    outcome: null,
    is_locked: false,
    admin_override: false,
    replacement_key_serial: null,
    comments: [
      {
        id: '423e4567-e89b-12d3-a456-426614174004',
        author_type: 'customer' as const,
        author_name: 'Ahmed',
        content: 'Product key reports error 0xC004C003',
        created_at: '2026-11-20T04:00:00Z',
      },
    ],
    attachments: [],
    created_at: '2026-11-20T04:00:00Z',
    resolved_at: null,
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    user_id: '223e4567-e89b-12d3-a456-426614174002',
    order_item_id: '323e4567-e89b-12d3-a456-426614174005',
    key_serial: 'DEFECTIVE-KEY-002',
    status: 'resolved' as const,
    outcome: 'replacement' as const,
    is_locked: true,
    admin_override: false,
    replacement_key_serial: 'NEW-REPLACEMENT-KEY-999',
    comments: [
      {
        id: '423e4567-e89b-12d3-a456-426614174006',
        author_type: 'customer' as const,
        author_name: 'Ahmed',
        content: 'Activation key failed',
        created_at: '2026-11-19T10:00:00Z',
      },
      {
        id: '423e4567-e89b-12d3-a456-426614174007',
        author_type: 'admin' as const,
        author_name: 'Support Agent',
        content: 'We verified the defect and issued a replacement key above.',
        created_at: '2026-11-19T11:00:00Z',
      },
    ],
    attachments: [],
    created_at: '2026-11-19T10:00:00Z',
    resolved_at: '2026-11-19T11:00:00Z',
  },
]

function renderTicketsView(initialRoute = '/en/account/support') {
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
            <Route path="/:lang/account/support" element={<TicketsPage />} />
            <Route path="/:lang/account/support/:id" element={<TicketThreadPage />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  )
}

describe('TicketsPage & TicketThreadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const ticketService = getTicketService('storefront')
    vi.spyOn(ticketService, 'listTickets').mockResolvedValue(mockTicketsList)
    vi.spyOn(ticketService, 'getTicket').mockImplementation(async (id: string) => {
      const found = mockTicketsList.find((t) => t.id === id)
      if (!found) throw new Error('Not found')
      return found
    })
    vi.spyOn(ticketService, 'addComment').mockResolvedValue({
      id: '523e4567-e89b-12d3-a456-426614174010',
      author_type: 'customer',
      author_name: 'Ahmed',
      content: 'New user follow-up message',
      created_at: '2026-11-20T04:30:00Z',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders support tickets list with badges in English', async () => {
    renderTicketsView('/en/account/support')

    await waitFor(() => {
      expect(screen.getByText(/DEFECTIVE-KEY-001/)).toBeInTheDocument()
      expect(screen.getByText(/DEFECTIVE-KEY-002/)).toBeInTheDocument()
    })

    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getAllByText('Resolved').length).toBeGreaterThan(0)
  })

  it('filters tickets by tabs', async () => {
    renderTicketsView('/en/account/support')

    await waitFor(() => {
      expect(screen.getByText(/DEFECTIVE-KEY-001/)).toBeInTheDocument()
    })

    // Click Resolved tab
    const resolvedTab = screen.getByRole('button', { name: /resolved/i })
    fireEvent.click(resolvedTab)

    expect(screen.queryByText(/DEFECTIVE-KEY-001/)).not.toBeInTheDocument()
    expect(screen.getByText(/DEFECTIVE-KEY-002/)).toBeInTheDocument()
  })

  it('renders ticket thread with replacement key and locked message', async () => {
    renderTicketsView('/en/account/support/123e4567-e89b-12d3-a456-426614174002')

    await waitFor(() => {
      expect(screen.getByText('Replacement Key Issued!')).toBeInTheDocument()
      expect(screen.getByText('We verified the defect and issued a replacement key above.')).toBeInTheDocument()
    })

    // Locked indicator should be visible
    expect(
      screen.getByText(/this ticket is resolved and locked for further replies/i),
    ).toBeInTheDocument()

    // Key reveal in thread scrambles first then settles to plaintext
    vi.useFakeTimers()
    const revealBtn = screen.getByRole('button', { name: /reveal/i })
    fireEvent.click(revealBtn)
    const srOnlySpan = screen.getByText('NEW-REPLACEMENT-KEY-999')
    expect(srOnlySpan).toHaveClass('sr-only')

    const visualSpan = srOnlySpan.previousElementSibling
    expect(visualSpan).not.toBeNull()
    expect(visualSpan).toHaveAttribute('aria-hidden', 'true')
    expect(visualSpan?.textContent).not.toBe('NEW-REPLACEMENT-KEY-999')

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(visualSpan?.textContent).toBe('NEW-REPLACEMENT-KEY-999')

    // Hide clears replacement plaintext immediately and scrambles back to mask
    fireEvent.click(screen.getByRole('button', { name: /hide/i }))
    expect(screen.queryByText('NEW-REPLACEMENT-KEY-999')).not.toBeInTheDocument()
    const hideSr = screen.getByText('Digital key hidden')
    const hideVisual = hideSr.previousElementSibling
    expect(hideVisual?.textContent).not.toBe('•••••-•••••-•••••-•••••-•••••')

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(hideVisual?.textContent).toBe('•••••-•••••-•••••-•••••-•••••')
  })

  it('allows posting a comment on an open ticket', async () => {
    const ticketService = getTicketService('storefront')

    renderTicketsView('/en/account/support/123e4567-e89b-12d3-a456-426614174001')

    await waitFor(() => {
      expect(screen.getByText('Product key reports error 0xC004C003')).toBeInTheDocument()
    })

    const textarea = screen.getByPlaceholderText(/type your message/i)
    fireEvent.change(textarea, { target: { value: 'New user follow-up message' } })

    const sendBtn = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(sendBtn)

    await waitFor(() => {
      expect(ticketService.addComment).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174001',
        'New user follow-up message',
      )
    })
  })

  it('renders correctly in Arabic RTL', async () => {
    renderTicketsView('/ar/account/support')

    await waitFor(() => {
      expect(screen.getByText('مركز المساعدة وبلاغات المفاتيح')).toBeInTheDocument()
      expect(screen.getByText('مفتوحة')).toBeInTheDocument()
      expect(screen.getAllByText('تم الحل').length).toBeGreaterThan(0)
    })
  })
})
