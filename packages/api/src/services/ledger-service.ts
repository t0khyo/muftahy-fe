import type {
  BalanceResponse,
  FinancialSummaryResponse,
  LedgerEntryResponse,
} from '@workspace/domain/schemas/ledger'

export interface GetLedgerEntriesParams {
  currency?: string
  entryType?: string
  limit?: number
  offset?: number
}

export interface LedgerService {
  getBalance(): Promise<BalanceResponse>
  getSummary(): Promise<FinancialSummaryResponse>
  getEntries(params?: GetLedgerEntriesParams): Promise<LedgerEntryResponse[]>
}

