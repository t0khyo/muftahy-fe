import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import * as apiFactory from '@workspace/api/factory'
import type { TicketService } from '@workspace/api/services/ticket-service'
import type { TicketDetail } from '@workspace/domain/schemas/ticket'
import { toast } from '@workspace/ui/components/sonner'
import { createAdminQueryClient } from '../../../app/query-client'
import { AdminTicketChatSheet } from './admin-ticket-chat-sheet'

describe('AdminTicketChatSheet Component', () => {
  let testQueryClient: QueryClient

  const sampleTicket: TicketDetail = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: 'user-0001-e89b-12d3-a456-426614174001',
    order_item_id: 'item-8888-e89b-12d3-a456-426614174002',
    key_serial: 'W11P-XXXX-YYYY-ZZZZ-9999',
    status: 'open',
    outcome: null,
    is_locked: false,
    admin_override: false,
    replacement_key_serial: null,
    comments: [
      {
        id: '123e4567-e89b-12d3-a456-426614174010',
        author_type: 'customer',
        author_name: 'John Customer',
        content: 'The key returned error 0xC004C008 when activating Windows.',
        created_at: '2026-11-21T10:00:00Z',
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174011',
        author_type: 'system',
        author_name: 'System',
        content: 'Automated telemetry inspection initiated.',
        created_at: '2026-11-21T10:01:00Z',
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174012',
        author_type: 'admin',
        author_name: 'Support Agent Omar',
        content: 'We are verifying the activation log with Microsoft distribution.',
        created_at: '2026-11-21T10:05:00Z',
      },
    ],
    attachments: [
      {
        id: '123e4567-e89b-12d3-a456-426614174020',
        file_name: 'activation_error.png',
        file_size_bytes: 1048576, // 1 MB
        created_at: '2026-11-21T10:00:00Z',
      },
    ],
    created_at: '2026-11-21T10:00:00Z',
    resolved_at: null,
  }

  const mockTicketService = {
    listTickets: vi.fn().mockResolvedValue([sampleTicket]),
    getTicket: vi.fn().mockResolvedValue(sampleTicket),
    openTicket: vi.fn(),
    addComment: vi.fn().mockImplementation((_ticketId: string, content: string) => {
      return Promise.resolve({
        id: '123e4567-e89b-12d3-a456-426614174099',
        author_type: 'admin' as const,
        author_name: 'Support Operator',
        content,
        created_at: new Date().toISOString(),
      })
    }),
    resolveTicket: vi.fn(),
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    mockTicketService.getTicket.mockReset().mockResolvedValue(sampleTicket)
    mockTicketService.addComment.mockReset().mockImplementation((_ticketId: string, content: string) => {
      return Promise.resolve({
        id: '123e4567-e89b-12d3-a456-426614174099',
        author_type: 'admin' as const,
        author_name: 'Support Operator',
        content,
        created_at: new Date().toISOString(),
      })
    })
    Element.prototype.scrollIntoView = vi.fn()

    testQueryClient = createAdminQueryClient()
    vi.spyOn(apiFactory, 'getTicketService').mockReturnValue(mockTicketService as unknown as TicketService)
  })

  function renderWithProviders(ui: React.ReactElement) {
    return render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={testQueryClient}>
          {ui}
        </QueryClientProvider>
      </I18nextProvider>
    )
  }

  it('renders ticket details, messages, defective key, and attachments', async () => {
    renderWithProviders(
      <AdminTicketChatSheet
        ticketId={sampleTicket.id}
        open={true}
        onOpenChange={vi.fn()}
      />
    )

    // Verify ticket header
    await waitFor(() => {
      expect(screen.getByText(`#${sampleTicket.id.slice(0, 8)}`)).toBeInTheDocument()
    })
    expect(screen.getByText(/open/i)).toBeInTheDocument()

    // Verify messages
    expect(screen.getByText('The key returned error 0xC004C008 when activating Windows.')).toBeInTheDocument()
    expect(screen.getByText('John Customer')).toBeInTheDocument()
    expect(screen.getByText('Automated telemetry inspection initiated.')).toBeInTheDocument()
    expect(screen.getByText('We are verifying the activation log with Microsoft distribution.')).toBeInTheDocument()

    // Verify attachment
    expect(screen.getByText('activation_error.png')).toBeInTheDocument()
    expect(screen.getByText('(1024 KB)')).toBeInTheDocument()
  })

  it('applies quick canned responses to message input on click without emojis', async () => {
    renderWithProviders(
      <AdminTicketChatSheet
        ticketId={sampleTicket.id}
        open={true}
        onOpenChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /request screenshot/i })).toBeInTheDocument()
    })

    const cannedBtn = screen.getByRole('button', { name: /request screenshot/i })
    fireEvent.click(cannedBtn)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toContain('screenshot')
  })

  it('submits a new operator message and appends it to thread', async () => {
    renderWithProviders(
      <AdminTicketChatSheet
        ticketId={sampleTicket.id}
        open={true}
        onOpenChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Testing operator message response.' } })

    const sendBtn = screen.getByRole('button', { name: /send reply/i })
    fireEvent.click(sendBtn)

    await waitFor(() => {
      expect(mockTicketService.addComment).toHaveBeenCalledWith(
        sampleTicket.id,
        'Testing operator message response.'
      )
    })
  })

  it('calls onOpenResolve when clicking Resolve button in header', async () => {
    const handleResolve = vi.fn()
    renderWithProviders(
      <AdminTicketChatSheet
        ticketId={sampleTicket.id}
        open={true}
        onOpenChange={vi.fn()}
        onOpenResolve={handleResolve}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resolve/i })).toBeInTheDocument()
    })

    const resolveBtn = screen.getByRole('button', { name: /resolve/i })
    fireEvent.click(resolveBtn)

    expect(handleResolve).toHaveBeenCalledWith(sampleTicket.id)
  })

  it('triggers onOpenChange(false) when clicking the mobile back button or close button', async () => {
    const handleOpenChange = vi.fn()
    renderWithProviders(
      <AdminTicketChatSheet
        ticketId={sampleTicket.id}
        open={true}
        onOpenChange={handleOpenChange}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    })

    const backBtn = screen.getByRole('button', { name: /back/i })
    fireEvent.click(backBtn)

    expect(handleOpenChange).toHaveBeenCalledWith(false)
  })

  it('renders SheetContent docked to the physical right with side="right"', async () => {
    renderWithProviders(
      <AdminTicketChatSheet
        ticketId={sampleTicket.id}
        open={true}
        onOpenChange={vi.fn()}
      />
    )

    await waitFor(() => {
      const sheetContent = document.querySelector('[data-slot="sheet-content"]')
      expect(sheetContent).toBeInTheDocument()
      expect(sheetContent).toHaveAttribute('data-side', 'right')
      expect(sheetContent).toHaveClass('right-0')
    })
  })

  it('renders section AdminQueryError when ticket detail fails to load', async () => {
    mockTicketService.getTicket.mockRejectedValue(
      new ApiClientError(500, 'INTERNAL_ERROR', 'Service down')
    )

    renderWithProviders(
      <AdminTicketChatSheet
        ticketId={sampleTicket.id}
        open={true}
        onOpenChange={vi.fn()}
      />
    )

    const retryBtn = await screen.findByRole('button', { name: /retry/i }, { timeout: 3000 })
    expect(retryBtn).toBeInTheDocument()
  })

  it('renders inline FormErrorAlert and preserves message draft on 422 addComment error', async () => {
    const errorSpy = vi.spyOn(toast, 'error')
    mockTicketService.addComment.mockRejectedValueOnce(
      new ApiClientError(422, 'VALIDATION_ERROR', 'Message cannot be empty or invalid')
    )

    renderWithProviders(
      <AdminTicketChatSheet
        ticketId={sampleTicket.id}
        open={true}
        onOpenChange={vi.fn()}
      />
    )

    const textarea = (await screen.findByRole('textbox')) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Draft operator reply to keep' } })
    fireEvent.click(screen.getByRole('button', { name: /send reply/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(i18n.t('admin:errors.VALIDATION_ERROR'))
    expect(textarea.value).toBe('Draft operator reply to keep')
    expect(errorSpy).not.toHaveBeenCalled()
  })
})
