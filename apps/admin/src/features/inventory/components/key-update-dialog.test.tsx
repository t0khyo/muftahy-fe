import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import * as inventoryServiceModule from '@workspace/api/factory'
import type { KeyResponse } from '@workspace/domain/schemas/inventory'
import { toast } from '@workspace/ui/components/sonner'
import { createAdminQueryClient } from '../../../app/query-client'
import { KeyUpdateDialog } from './key-update-dialog'

const mockKeyRecord: KeyResponse = {
  id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  product_id: 'e3b8a8b1-4f11-4a81-9b19-e58f0d8fa001',
  product_name: 'Windows 11 Pro',
  serial: 'W269N-WFGWX-YVC9B-4J6C9-T83GX',
  status: 'available',
  replacement_only: false,
  cancel_reason: null,
  cost_usd: '7.50',
  created_at: '2026-11-20T10:00:00Z',
}

describe('KeyUpdateDialog', () => {
  let queryClient: QueryClient
  const mockUpdateKey = vi.fn()

  beforeEach(() => {
    queryClient = createAdminQueryClient()
    vi.restoreAllMocks()

    vi.spyOn(inventoryServiceModule, 'getInventoryService').mockReturnValue({
      updateKey: mockUpdateKey.mockResolvedValue({
        ...mockKeyRecord,
        replacement_only: true,
      }),
      listKeys: vi.fn(),
      getKey: vi.fn(),
      importKeys: vi.fn(),
      getStats: vi.fn(),
    } as unknown as ReturnType<typeof inventoryServiceModule.getInventoryService>)
  })

  function renderDialog(props: Partial<React.ComponentProps<typeof KeyUpdateDialog>> = {}) {
    return render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <KeyUpdateDialog
            keyRecord={mockKeyRecord}
            open={true}
            onOpenChange={vi.fn()}
            {...props}
          />
        </QueryClientProvider>
      </I18nextProvider>
    )
  }

  it('renders target product name and masked serial key', () => {
    renderDialog()

    expect(screen.getByText('Windows 11 Pro')).toBeInTheDocument()
    expect(screen.getByText('Edit Key')).toBeInTheDocument()
    expect(screen.getByText('Replacement Key')).toBeInTheDocument()
    expect(screen.getByText('Off')).toBeInTheDocument()
  })

  it('submits pool toggle mutation when saved and closes immediately with one toast', async () => {
    const handleSuccess = vi.fn()
    const handleOpenChange = vi.fn()
    const successSpy = vi.spyOn(toast, 'success')
    renderDialog({ onOpenChange: handleOpenChange, onSuccess: handleSuccess })

    const poolSwitch = screen.getByRole('switch')
    fireEvent.click(poolSwitch)

    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockUpdateKey).toHaveBeenCalledWith(
        mockKeyRecord.id,
        expect.objectContaining({
          replacement_only: true,
        })
      )
    })

    expect(handleSuccess).toHaveBeenCalledTimes(1)
    expect(handleOpenChange).toHaveBeenCalledWith(false)
    expect(successSpy).toHaveBeenCalledTimes(1)
  })

  it('renders inline FormErrorAlert on 422 validation failure and keeps dialog open without exposing key serial', async () => {
    const handleOpenChange = vi.fn()
    const errorSpy = vi.spyOn(toast, 'error')
    mockUpdateKey.mockRejectedValueOnce(
      new ApiClientError(422, 'VALIDATION_ERROR', 'Raw W269N-WFGWX-YVC9B-4J6C9-T83GX error', undefined, undefined, {
        fieldErrors: [{ field: 'status', message: 'Status transition not allowed' }],
      })
    )

    renderDialog({ onOpenChange: handleOpenChange })

    fireEvent.click(screen.getByRole('switch'))
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    expect(handleOpenChange).not.toHaveBeenCalledWith(false)
    expect(errorSpy).not.toHaveBeenCalled()
    expect(screen.getByRole('alert').textContent).toContain('Status transition not allowed')
    expect(screen.getByRole('alert').textContent).not.toContain('W269N-WFGWX-YVC9B-4J6C9-T83GX')
  })

  it('displays terminal status notification when key is cancelled', () => {
    const cancelledKey: KeyResponse = {
      ...mockKeyRecord,
      status: 'cancelled',
      cancel_reason: 'Supplier defect',
    }

    renderDialog({ keyRecord: cancelledKey })

    expect(
      screen.getByText(/This key is in a terminal state/i)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeDisabled()
  })
})
