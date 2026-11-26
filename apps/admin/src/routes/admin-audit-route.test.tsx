import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { i18n } from '@workspace/i18n/config'
import * as apiFactory from '@workspace/api/factory'
import type { AdminProfileService } from '@workspace/api/services/admin-profile-service'
import type { AuditService } from '@workspace/api/services/audit-service'
import { createAdminQueryClient } from '../app/query-client'
import { I18nProvider } from '../app/i18n-provider'
import { AdminAuditRoute } from './admin-audit-route'

describe('AdminAuditRoute Filtering & Snapshot Inspector', () => {
  let testQueryClient: QueryClient

  const adminA = {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'alice@souqmuftah.com',
    display_name: 'Alice Admin',
    role: 'admin',
    is_active: true,
    created_at: '2026-11-01T00:00:00Z',
    updated_at: '2026-11-01T00:00:00Z',
  }

  const adminB = {
    id: '22222222-2222-4222-8222-222222222222',
    email: 'bob@souqmuftah.com',
    display_name: 'Bob Admin',
    role: 'admin',
    is_active: true,
    created_at: '2026-11-02T00:00:00Z',
    updated_at: '2026-11-02T00:00:00Z',
  }

  const sampleLog = {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    admin_id: adminA.id,
    admin_name: 'Alice Admin',
    action: 'product_update',
    target_type: 'product',
    target_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    old_value: { sale_price: '399.00' },
    new_value: { sale_price: '349.00', serials: '[REDACTED]' },
    success: true,
    failure_reason: null,
    ip_address: '192.168.1.5',
    created_at: '2026-11-26T10:00:00Z',
  }

  const failedLog = {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    admin_id: adminB.id,
    admin_name: 'Bob Admin',
    action: 'promo_deactivate',
    target_type: 'promo',
    target_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    old_value: null,
    new_value: null,
    success: false,
    failure_reason: 'Promo code not found',
    ip_address: '10.0.0.2',
    created_at: '2026-11-26T11:00:00Z',
  }

  const getLogsMock = vi.fn()
  const exportLogsMock = vi.fn()
  const listAdminsMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    i18n.changeLanguage('en')
    testQueryClient = createAdminQueryClient()

    getLogsMock.mockResolvedValue({
      items: [sampleLog, failedLog],
      total: 2,
      page: 1,
      limit: 100,
    })
    exportLogsMock.mockResolvedValue(new Blob(['id,action\n'], { type: 'text/csv' }))
    listAdminsMock.mockResolvedValue([adminA, adminB])

    vi.spyOn(apiFactory, 'getAuditService').mockReturnValue({
      getLogs: getLogsMock,
      exportLogs: exportLogsMock,
    } as unknown as AuditService)

    vi.spyOn(apiFactory, 'getAdminProfileService').mockReturnValue({
      getMyProfile: vi.fn().mockResolvedValue(adminA),
      updateMyProfile: vi.fn(),
      listAdmins: listAdminsMock,
    } as unknown as AdminProfileService)
  })

  afterEach(() => {
    i18n.changeLanguage('en')
  })

  function renderAuditRoute(initialPath = '/en/audit') {
    return render(
      <I18nProvider>
        <QueryClientProvider client={testQueryClient}>
          <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
              <Route path="/:lang/audit" element={<AdminAuditRoute />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </I18nProvider>,
    )
  }

  it('loads staff list, forwards date/export filters, and renders old_value/new_value diff dialog', async () => {
    renderAuditRoute('/en/audit')

    await waitFor(() => {
      expect(listAdminsMock).toHaveBeenCalledWith({ limit: 100 })
      expect(screen.getByText('product_update')).toBeInTheDocument()
      expect(screen.getByText('promo_deactivate')).toBeInTheDocument()
    })

    // Filter by date bounds
    const startInput = screen.getByLabelText(/from date/i)
    const endInput = screen.getByLabelText(/to date/i)
    fireEvent.change(startInput, { target: { value: '2026-11-01' } })
    fireEvent.change(endInput, { target: { value: '2026-11-26' } })

    await waitFor(() => {
      expect(getLogsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 100,
          startDate: '2026-11-01T00:00:00Z',
          endDate: '2026-11-26T23:59:59Z',
        }),
      )
    })

    // Invalid date range shows inline alert and disables export buttons
    fireEvent.change(startInput, { target: { value: '2026-11-28' } })
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /start date must be before or equal to end date/i,
    )
    expect(screen.getByRole('button', { name: /export csv/i })).toBeDisabled()

    // Fix dates and test CSV export parity
    fireEvent.change(startInput, { target: { value: '2026-11-01' } })
    const exportCsvBtn = screen.getByRole('button', { name: /export csv/i })
    expect(exportCsvBtn).not.toBeDisabled()
    fireEvent.click(exportCsvBtn)

    await waitFor(() => {
      expect(exportLogsMock).toHaveBeenCalledWith({
        format: 'csv',
        startDate: '2026-11-01T00:00:00Z',
        endDate: '2026-11-26T23:59:59Z',
      })
    })

    // Open payload dialog for product_update and confirm both previous value & new value are rendered
    const productRow = screen.getByText('product_update').closest('tr')
    expect(productRow).not.toBeNull()
    fireEvent.click(within(productRow as HTMLElement).getByRole('button', { name: /details/i }))

    expect(await screen.findByText(/previous value/i)).toBeInTheDocument()
    expect(screen.getByText(/399\.00/)).toBeInTheDocument()
    expect(screen.getByText(/349\.00/)).toBeInTheDocument()
    expect(screen.getByText(/\[REDACTED\]/)).toBeInTheDocument()
  })

  it('shows failure reason in detail dialog for failed actions and supports Arabic RTL', async () => {
    await i18n.changeLanguage('ar')
    renderAuditRoute('/ar/audit')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'سجل النشاط' })).toBeInTheDocument()
      expect(screen.getByText('promo_deactivate')).toBeInTheDocument()
    })

    const failedRow = screen.getByText('promo_deactivate').closest('tr')
    expect(failedRow).not.toBeNull()
    fireEvent.click(within(failedRow as HTMLElement).getByRole('button', { name: /التفاصيل/i }))

    expect(await screen.findByText(/Promo code not found/)).toBeInTheDocument()
  })
})

