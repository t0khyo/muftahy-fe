import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { KeyUpdateDialog } from './key-update-dialog'
import type { KeyResponse } from '@workspace/domain/schemas/inventory'
import * as inventoryServiceModule from '@workspace/api/factory'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, defaultValue?: string) => defaultValue ?? _key,
  }),
}))

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
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()

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

  it('renders target product name and masked serial key', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <KeyUpdateDialog
          keyRecord={mockKeyRecord}
          open={true}
          onOpenChange={vi.fn()}
        />
      </QueryClientProvider>
    )

    expect(screen.getByText('Windows 11 Pro')).toBeInTheDocument()
    expect(screen.getByText('Edit Key')).toBeInTheDocument()
    expect(screen.getByText('Replacement Key')).toBeInTheDocument()
    expect(screen.getByText('Off')).toBeInTheDocument()
  })

  it('submits pool toggle mutation when saved', async () => {
    const handleSuccess = vi.fn()
    render(
      <QueryClientProvider client={queryClient}>
        <KeyUpdateDialog
          keyRecord={mockKeyRecord}
          open={true}
          onOpenChange={vi.fn()}
          onSuccess={handleSuccess}
        />
      </QueryClientProvider>
    )

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
  })

  it('displays terminal status notification when key is cancelled', () => {
    const cancelledKey: KeyResponse = {
      ...mockKeyRecord,
      status: 'cancelled',
      cancel_reason: 'Supplier defect',
    }

    render(
      <QueryClientProvider client={queryClient}>
        <KeyUpdateDialog
          keyRecord={cancelledKey}
          open={true}
          onOpenChange={vi.fn()}
        />
      </QueryClientProvider>
    )

    expect(
      screen.getByText(/This key is in a terminal state/i)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeDisabled()
  })
})
