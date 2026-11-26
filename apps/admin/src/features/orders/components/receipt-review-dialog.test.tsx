import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import * as apiFactory from '@workspace/api/factory'
import type { AdminOrderService } from '@workspace/api/services/admin-order-service'
import type { OrderResponse } from '@workspace/domain/schemas/order'
import { toast } from '@workspace/ui/components/sonner'
import { createAdminQueryClient } from '../../../app/query-client'
import { ReceiptReviewDialog } from './receipt-review-dialog'

describe('ReceiptReviewDialog Component', () => {
  let testQueryClient: QueryClient
  const mockCreateObjectURL = vi.fn().mockReturnValue('blob:http://localhost:5174/mock-blob-id')
  const mockRevokeObjectURL = vi.fn()

  const sampleOrder: OrderResponse = {
    id: '139e0c3f-3920-4f20-b8db-061834b8db28',
    reference_code: 'SM-KQVJ',
    status: 'payment_uploaded',
    subtotal_egp: 299.0,
    discount_total_egp: 0,
    total_egp: 299.0,
    payment_method: 'instapay',
    payment_instructions: {
      vodafone_cash_number: '01000000000',
      instapay_ipa: 'ipa@instapay',
      reference_code: 'SM-KQVJ',
    },
    payment_deadline: null,
    review_deadline: null,
    wrong_amount_attempts: 0,
    rejection_reason: null,
    items: [
      {
        id: '139e0c3f-3920-4f20-b8db-061834b8db29',
        product_id: '139e0c3f-3920-4f20-b8db-061834b8db30',
        product_name: 'Windows 11 Pro Retail',
        unit_price_egp: 299.0,
        discount_amount_egp: 0,
        final_price_egp: 299.0,
        is_preorder: false,
        is_refunded: false,
        replacement_entitlement_used: false,
      },
    ],
    payment_attempts: [
      {
        id: 'attempt-1',
        order_id: '139e0c3f-3920-4f20-b8db-061834b8db28',
        receipt_image_path: 'storage/receipts/d9c44e35.png',
        payment_method: 'instapay',
        amount_claimed_egp: 299.0,
        status: 'uploaded',
        rejection_reason: null,
        created_at: '2026-11-21T07:54:00Z',
      },
    ],
    created_at: '2026-11-21T07:53:41.570396Z',
  }

  const mockAdminOrderService = {
    getPendingOrders: vi.fn().mockResolvedValue([sampleOrder]),
    getOrder: vi.fn().mockResolvedValue(sampleOrder),
    startReview: vi.fn().mockResolvedValue({ ...sampleOrder, status: 'under_review' }),
    reviewOrder: vi.fn().mockResolvedValue({ ...sampleOrder, status: 'completed' }),
    getReceipts: vi.fn().mockResolvedValue(sampleOrder.payment_attempts),
    getReceiptImageBlob: vi.fn().mockResolvedValue(new Blob(['fake-img'], { type: 'image/png' })),
    refundItem: vi.fn().mockResolvedValue({ status: 'refunded', message: 'Refunded' }),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateObjectURL.mockReturnValue('blob:http://localhost:5174/mock-blob-id')
    mockAdminOrderService.getPendingOrders.mockReset().mockResolvedValue([sampleOrder])
    mockAdminOrderService.getOrder.mockReset().mockResolvedValue(sampleOrder)
    mockAdminOrderService.startReview
      .mockReset()
      .mockResolvedValue({ ...sampleOrder, status: 'under_review' })
    mockAdminOrderService.reviewOrder
      .mockReset()
      .mockResolvedValue({ ...sampleOrder, status: 'completed' })
    mockAdminOrderService.getReceipts.mockReset().mockResolvedValue(sampleOrder.payment_attempts)
    mockAdminOrderService.getReceiptImageBlob
      .mockReset()
      .mockResolvedValue(new Blob(['fake-img'], { type: 'image/png' }))
    mockAdminOrderService.refundItem
      .mockReset()
      .mockResolvedValue({ status: 'refunded', message: 'Refunded' })
    globalThis.URL.createObjectURL = mockCreateObjectURL
    globalThis.URL.revokeObjectURL = mockRevokeObjectURL

    testQueryClient = createAdminQueryClient()

    vi.spyOn(apiFactory, 'getAdminOrderService').mockReturnValue(
      mockAdminOrderService as unknown as AdminOrderService,
    )
  })

  afterEach(() => {
    testQueryClient.clear()
  })

  it('renders receipt dialog with streaming authenticated image, claimed amount, and order items', async () => {
    render(
      <QueryClientProvider client={testQueryClient}>
        <ReceiptReviewDialog order={sampleOrder} open={true} onOpenChange={vi.fn()} />
      </QueryClientProvider>,
    )

    expect(screen.getByText('SM-KQVJ')).toBeInTheDocument()
    expect(screen.getByText('INSTAPAY')).toBeInTheDocument()
    expect(screen.getByText('Windows 11 Pro Retail')).toBeInTheDocument()

    // Verifies blob image request was made with correct IDs
    await waitFor(() => {
      expect(mockAdminOrderService.getReceiptImageBlob).toHaveBeenCalledWith(
        '139e0c3f-3920-4f20-b8db-061834b8db28',
        'attempt-1',
      )
    })

    const receiptImg = await screen.findByRole('img', { name: /customer bank receipt/i })
    expect(receiptImg).toBeInTheDocument()
    expect(receiptImg).toHaveAttribute('src', 'blob:http://localhost:5174/mock-blob-id')
  })

  it('rotates receipt image 90 degrees on rotate button click', async () => {
    render(
      <QueryClientProvider client={testQueryClient}>
        <ReceiptReviewDialog order={sampleOrder} open={true} onOpenChange={vi.fn()} />
      </QueryClientProvider>,
    )

    const receiptImg = await screen.findByRole('img', { name: /customer bank receipt/i })
    expect(receiptImg).toHaveStyle({ transform: 'rotate(0deg)' })

    const rotateBtn = screen.getByRole('button', { name: /rotate image 90 degrees/i })
    fireEvent.click(rotateBtn)

    expect(receiptImg).toHaveStyle({ transform: 'rotate(90deg)' })

    fireEvent.click(rotateBtn)
    expect(receiptImg).toHaveStyle({ transform: 'rotate(180deg)' })
  })

  it('toggles zoom on receipt image click and zoom button click', async () => {
    render(
      <QueryClientProvider client={testQueryClient}>
        <ReceiptReviewDialog order={sampleOrder} open={true} onOpenChange={vi.fn()} />
      </QueryClientProvider>,
    )

    const receiptImg = await screen.findByRole('img', { name: /customer bank receipt/i })
    expect(receiptImg).toHaveClass('cursor-zoom-in')

    const zoomBtn = screen.getByRole('button', { name: /zoom in/i })
    fireEvent.click(zoomBtn)

    expect(receiptImg).toHaveClass('cursor-zoom-out')

    fireEvent.click(receiptImg)
    expect(receiptImg).toHaveClass('cursor-zoom-in')
  })

  it('approves order when clicking Approve & Deliver Keys', async () => {
    const handleOpenChange = vi.fn()
    render(
      <QueryClientProvider client={testQueryClient}>
        <ReceiptReviewDialog order={sampleOrder} open={true} onOpenChange={handleOpenChange} />
      </QueryClientProvider>,
    )

    const approveBtn = screen.getByRole('button', { name: /approve & deliver keys/i })
    fireEvent.click(approveBtn)

    await waitFor(() => {
      expect(mockAdminOrderService.reviewOrder).toHaveBeenCalledWith(
        '139e0c3f-3920-4f20-b8db-061834b8db28',
        { action: 'approve' },
      )
    })
  })

  it('keeps dialog open and shows inline FormErrorAlert on 422 review failure', async () => {
    const handleOpenChange = vi.fn()
    const errorSpy = vi.spyOn(toast, 'error')
    mockAdminOrderService.reviewOrder.mockRejectedValueOnce(
      new ApiClientError(422, 'VALIDATION_ERROR', 'Order cannot be approved without sufficient stock')
    )

    render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={testQueryClient}>
          <ReceiptReviewDialog order={sampleOrder} open={true} onOpenChange={handleOpenChange} />
        </QueryClientProvider>
      </I18nextProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: /approve & deliver keys/i }))

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert')
      expect(
        alerts.some((el) =>
          el.textContent?.includes(i18n.t('admin:errors.VALIDATION_ERROR')),
        ),
      ).toBe(true)
    })

    expect(handleOpenChange).not.toHaveBeenCalledWith(false)
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('renders compact AdminQueryError with Retry when receipt image fails to load', async () => {
    mockAdminOrderService.getReceiptImageBlob.mockRejectedValue(
      new ApiClientError(500, 'INTERNAL_ERROR', 'Storage unavailable'),
    )

    render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={testQueryClient}>
          <ReceiptReviewDialog order={sampleOrder} open={true} onOpenChange={vi.fn()} />
        </QueryClientProvider>
      </I18nextProvider>,
    )

    const retryBtn = await screen.findByRole('button', { name: /retry/i }, { timeout: 3000 })
    expect(retryBtn).toBeInTheDocument()
  })
})
