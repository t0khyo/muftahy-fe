import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { i18n } from '@workspace/i18n/config'
import { getOrderService } from '@workspace/api/factory'
import { OrdersPage } from './orders-page'
import { OrderDetailPage } from './order-detail-page'

const mockOrdersList = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    reference_code: 'SM-20261120-001',
    status: 'pending_payment' as const,
    total_egp: 299.99,
    created_at: '2026-11-20T04:00:00Z',
    item_count: 1,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    reference_code: 'SM-20261120-002',
    status: 'completed' as const,
    total_egp: 750,
    created_at: '2026-11-19T10:00:00Z',
    item_count: 2,
  },
]

const mockOrderDetail = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  reference_code: 'SM-20261120-001',
  status: 'pending_payment' as const,
  subtotal_egp: 299.99,
  discount_total_egp: 0,
  total_egp: 299.99,
  payment_method: 'vodafone_cash',
  payment_instructions: {
    vodafone_cash_number: '01012345678',
    instapay_ipa: 'souqmuftah@instapay',
    reference_code: 'SM-20261120-001',
  },
  payment_deadline: '2026-11-20T06:00:00Z',
  review_deadline: null,
  wrong_amount_attempts: 0,
  rejection_reason: null,
  items: [
    {
      id: '660e8400-e29b-41d4-a716-446655440010',
      product_id: '770e8400-e29b-41d4-a716-446655440020',
      product_name: 'Windows 11 Professional Retail',
      is_preorder: false,
      unit_price_egp: 299.99,
      discount_amount_egp: 0,
      final_price_egp: 299.99,
      key_serial: null,
      is_refunded: false,
      replacement_entitlement_used: false,
    },
  ],
  payment_attempts: [],
  created_at: '2026-11-20T04:00:00Z',
}

function renderOrdersView(initialRoute = '/en/account/orders') {
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
            <Route path="/:lang/account/orders" element={<OrdersPage />} />
            <Route path="/:lang/account/orders/:id" element={<OrderDetailPage />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  )
}

describe('OrdersPage & OrderDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const orderService = getOrderService('storefront')
    vi.spyOn(orderService, 'listUserOrders').mockResolvedValue(mockOrdersList)
    vi.spyOn(orderService, 'getOrder').mockResolvedValue(mockOrderDetail)
  })

  it('renders order list with summary metrics and badges in English', async () => {
    renderOrdersView('/en/account/orders')

    await waitFor(() => {
      expect(screen.getByText('SM-20261120-001')).toBeInTheDocument()
      expect(screen.getByText('SM-20261120-002')).toBeInTheDocument()
    })

    expect(screen.getByText('Awaiting Payment')).toBeInTheDocument()
    expect(screen.getByText('Delivered')).toBeInTheDocument()
    expect(screen.getByText('Order History')).toBeInTheDocument()
  })

  it('filters orders by tabs (pending vs completed)', async () => {
    renderOrdersView('/en/account/orders')

    await waitFor(() => {
      expect(screen.getByText('SM-20261120-001')).toBeInTheDocument()
    })

    // Click Pending tab
    const pendingTab = screen.getByRole('button', { name: /pending/i })
    fireEvent.click(pendingTab)

    expect(screen.getByText('SM-20261120-001')).toBeInTheDocument()
    expect(screen.queryByText('SM-20261120-002')).not.toBeInTheDocument()

    // Click Completed tab
    const completedTab = screen.getByRole('button', { name: /completed/i })
    fireEvent.click(completedTab)

    expect(screen.queryByText('SM-20261120-001')).not.toBeInTheDocument()
    expect(screen.getByText('SM-20261120-002')).toBeInTheDocument()
  })

  it('renders in Arabic RTL properly', async () => {
    renderOrdersView('/ar/account/orders')

    await waitFor(() => {
      expect(screen.getByText('سجل الطلبات')).toBeInTheDocument()
      expect(screen.getByText('بانتظار التحويل')).toBeInTheDocument()
      expect(screen.getByText('تم التسليم')).toBeInTheDocument()
    })
  })

  it('renders order detail page with payment instructions and upload button', async () => {
    renderOrdersView('/en/account/orders/550e8400-e29b-41d4-a716-446655440001')

    await waitFor(() => {
      expect(screen.getByText('Windows 11 Professional Retail')).toBeInTheDocument()
      expect(screen.getByText('01012345678')).toBeInTheDocument()
      expect(screen.getByText('souqmuftah@instapay')).toBeInTheDocument()
    })

    const uploadBtn = screen.getByRole('button', { name: /upload payment receipt/i })
    expect(uploadBtn).toBeInTheDocument()
    expect(document.querySelector('img[src*="vodafone-cash"]')).toBeInTheDocument()
    expect(document.querySelector('img[src*="instapay"]')).toBeInTheDocument()

    fireEvent.click(uploadBtn)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    expect(document.querySelectorAll('img[src*="vodafone-cash"]').length).toBeGreaterThanOrEqual(2)
    expect(document.querySelectorAll('img[src*="instapay"]').length).toBeGreaterThanOrEqual(2)
  })
})

