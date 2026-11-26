import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@workspace/i18n/config'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import * as apiFactory from '@workspace/api/factory'
import type { InventoryService } from '@workspace/api/services/inventory-service'
import type { ProductService } from '@workspace/api/services/product-service'
import { toast } from '@workspace/ui/components/sonner'
import { createAdminQueryClient } from '../../../app/query-client'
import { KeyBatchImportSheet } from './key-batch-import-sheet'
import { parseKeyBatchInput } from '../lib/key-batch-parser'

describe('parseKeyBatchInput', () => {
  it('parses newline-separated keys and trims whitespace', () => {
    const raw = `
      KEY-1111-AAAA  
      KEY-2222-BBBB
      KEY-3333-CCCC
    `
    const result = parseKeyBatchInput(raw)
    expect(result.rawKeys).toEqual(['KEY-1111-AAAA', 'KEY-2222-BBBB', 'KEY-3333-CCCC'])
    expect(result.uniqueKeys).toEqual(['KEY-1111-AAAA', 'KEY-2222-BBBB', 'KEY-3333-CCCC'])
    expect(result.duplicatesCount).toBe(0)
    expect(result.isTruncated).toBe(false)
    expect(result.effectiveKeys.length).toBe(3)
  })

  it('parses comma-separated and semicolon-separated keys', () => {
    const raw = 'KEY-A, KEY-B; KEY-C\nKEY-D'
    const result = parseKeyBatchInput(raw)
    expect(result.rawKeys).toEqual(['KEY-A', 'KEY-B', 'KEY-C', 'KEY-D'])
    expect(result.uniqueKeys).toEqual(['KEY-A', 'KEY-B', 'KEY-C', 'KEY-D'])
    expect(result.duplicatesCount).toBe(0)
  })

  it('detects duplicates within batch and computes uniqueKeys correctly', () => {
    const raw = `
      KEY-DUP-1
      KEY-DUP-2
      KEY-DUP-1
      KEY-DUP-3
      KEY-DUP-2
      KEY-DUP-1
    `
    const result = parseKeyBatchInput(raw)
    expect(result.rawKeys.length).toBe(6)
    expect(result.uniqueKeys).toEqual(['KEY-DUP-1', 'KEY-DUP-2', 'KEY-DUP-3'])
    expect(result.duplicatesCount).toBe(3)
  })

  it('enforces 500-key ceiling and flags isTruncated', () => {
    const keysArray: string[] = []
    for (let i = 0; i < 600; i++) {
      keysArray.push(`KEY-TEST-${i}`)
    }
    const raw = keysArray.join('\n')
    const result = parseKeyBatchInput(raw)

    expect(result.rawKeys.length).toBe(600)
    expect(result.uniqueKeys.length).toBe(600)
    expect(result.isTruncated).toBe(true)
    expect(result.effectiveKeys.length).toBe(500)
    expect(result.effectiveKeys[0]).toBe('KEY-TEST-0')
    expect(result.effectiveKeys[499]).toBe('KEY-TEST-499')
  })
})

describe('KeyBatchImportSheet', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    Element.prototype.scrollIntoView = vi.fn()

    vi.spyOn(apiFactory, 'getProductService').mockReturnValue({
      getProducts: vi.fn().mockResolvedValue([
        {
          id: 'prod-1',
          name: 'Windows 11 Pro',
          sku: 'OS-WIN11-PRO',
          category: { name: 'OS' },
        },
      ]),
    } as unknown as ProductService)
  })

  it('renders inline FormErrorAlert on 422 without leaking key serials to alert or toast', async () => {
    const errorSpy = vi.spyOn(toast, 'error')
    const importKeys = vi.fn().mockRejectedValueOnce(
      new ApiClientError(422, 'VALIDATION_ERROR', 'Duplicate key SECRET-KEY-9999 detected')
    )
    vi.spyOn(apiFactory, 'getInventoryService').mockReturnValue({
      importKeys,
    } as unknown as InventoryService)

    const queryClient = createAdminQueryClient()
    render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <KeyBatchImportSheet open={true} onOpenChange={vi.fn()} defaultProductId="prod-1" />
        </QueryClientProvider>
      </I18nextProvider>
    )

    const textarea = await screen.findByLabelText(/activation codes/i)
    fireEvent.change(textarea, { target: { value: 'SECRET-KEY-9999' } })
    fireEvent.click(screen.getByRole('button', { name: /import 1 keys/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert.textContent).not.toContain('SECRET-KEY-9999')
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('keeps sheet open with rejection table and emits warning toast without key serials on partial import', async () => {
    const warningSpy = vi.spyOn(toast, 'warning')
    const handleOpenChange = vi.fn()
    const importKeys = vi.fn().mockResolvedValueOnce({
      total_submitted: 2,
      successful_count: 1,
      failed_count: 1,
      imported_keys: [{ serial: 'SECRET-OK-0001' }],
      failures: [{ serial: 'SECRET-FAIL-0002', error_code: 'DUPLICATE_KEY' }],
    })
    vi.spyOn(apiFactory, 'getInventoryService').mockReturnValue({
      importKeys,
    } as unknown as InventoryService)

    const queryClient = createAdminQueryClient()
    render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <KeyBatchImportSheet open={true} onOpenChange={handleOpenChange} defaultProductId="prod-1" />
        </QueryClientProvider>
      </I18nextProvider>
    )

    const textarea = await screen.findByLabelText(/activation codes/i)
    fireEvent.change(textarea, { target: { value: 'SECRET-OK-0001\nSECRET-FAIL-0002' } })
    fireEvent.click(screen.getByRole('button', { name: /import 2 keys/i }))

    await waitFor(() => {
      expect(screen.getByText('DUPLICATE_KEY')).toBeInTheDocument()
    })

    expect(handleOpenChange).not.toHaveBeenCalledWith(false)
    expect(warningSpy).toHaveBeenCalledTimes(1)
    expect(String(warningSpy.mock.calls[0]?.[0])).not.toContain('SECRET-FAIL-0002')
  })
})
