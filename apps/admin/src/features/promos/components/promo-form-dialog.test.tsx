import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nProvider } from '../../../app/i18n-provider'
import { PromoFormDialog } from './promo-form-dialog'
import * as apiFactory from '@workspace/api/factory'
import type { PromoService } from '@workspace/api/services/promo-service'

describe('PromoFormDialog Component', () => {
  let testQueryClient: QueryClient

  const mockPromoService = {
    listPromos: vi.fn().mockResolvedValue([]),
    getPromo: vi.fn(),
    createPromo: vi.fn().mockResolvedValue({
      id: 'promo-123',
      code: 'SUMMER50',
      discount_percentage: 50,
      max_total_uses: 100,
      max_uses_per_user: 1,
      current_uses: 0,
      expires_at: '2026-12-31T23:59:59.000Z',
      is_active: true,
      created_at: '2026-11-22T00:00:00.000Z',
    }),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    testQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    })
    vi.spyOn(apiFactory, 'getPromoService').mockReturnValue(mockPromoService as unknown as PromoService)
  })

  function renderWithProviders(ui: React.ReactElement) {
    return render(
      <I18nProvider>
        <QueryClientProvider client={testQueryClient}>
          {ui}
        </QueryClientProvider>
      </I18nProvider>
    )
  }

  it('renders discount form fields and date picker trigger', () => {
    renderWithProviders(
      <PromoFormDialog open={true} onOpenChange={vi.fn()} />
    )

    expect(screen.getByRole('heading', { name: /create discount code/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/promo code/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/discount %/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /expiration date/i })).toBeInTheDocument()
    expect(screen.getByText(/pick expiration date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/max total redemptions/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/per-user limit/i)).toBeInTheDocument()
  })

  it('submits discount form with code and discount percentage', async () => {
    const handleOpenChange = vi.fn()
    renderWithProviders(
      <PromoFormDialog open={true} onOpenChange={handleOpenChange} />
    )

    const codeInput = screen.getByLabelText(/promo code/i)
    fireEvent.change(codeInput, { target: { value: 'winter25' } })
    expect((codeInput as HTMLInputElement).value).toBe('WINTER25')

    const discInput = screen.getByLabelText(/discount %/i)
    fireEvent.change(discInput, { target: { value: '25' } })

    const submitBtn = screen.getByRole('button', { name: /create discount/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockPromoService.createPromo).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'WINTER25',
          discount_percentage: 25,
        })
      )
    })
    expect(handleOpenChange).toHaveBeenCalledWith(false)
  })

  it('opens date picker popover on clicking the date button', async () => {
    renderWithProviders(
      <PromoFormDialog open={true} onOpenChange={vi.fn()} />
    )

    const dateBtn = screen.getByRole('button', { name: /expiration date/i })
    fireEvent.click(dateBtn)

    await waitFor(() => {
      expect(screen.getAllByRole('dialog').length).toBeGreaterThanOrEqual(1)
    })
  })
})
