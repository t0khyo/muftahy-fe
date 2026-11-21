import { useQuery } from '@tanstack/react-query'
import { getLedgerService } from '@workspace/api/factory'
import type { GetLedgerEntriesParams } from '@workspace/api/services/ledger-service'

export const ledgerKeys = {
  all: ['admin', 'ledger'] as const,
  balance: () => [...ledgerKeys.all, 'balance'] as const,
  summary: () => [...ledgerKeys.all, 'summary'] as const,
  entries: (params?: GetLedgerEntriesParams) => [...ledgerKeys.all, 'entries', params] as const,
}

export function useLedgerBalance() {
  const service = getLedgerService()
  return useQuery({
    queryKey: ledgerKeys.balance(),
    queryFn: () => service.getBalance(),
  })
}

export function useLedgerSummary() {
  const service = getLedgerService()
  return useQuery({
    queryKey: ledgerKeys.summary(),
    queryFn: () => service.getSummary(),
  })
}

export function useLedgerEntries(params?: GetLedgerEntriesParams) {
  const service = getLedgerService()
  return useQuery({
    queryKey: ledgerKeys.entries(params),
    queryFn: () => service.getEntries(params),
  })
}

// Aliases for workstation routes
export const useAdminLedgerSummary = useLedgerSummary
export const useAdminLedgerEntries = useLedgerEntries
