import {
  type BalanceResponse,
  type FinancialSummaryResponse,
  type LedgerEntryResponse,
  balanceResponseSchema,
  financialSummaryResponseSchema,
  ledgerEntryListResponseSchema,
} from '@workspace/domain/schemas/ledger'
import type { GetLedgerEntriesParams, LedgerService } from '../../services/ledger-service'
import type { NativeFetchClient } from './fetch-client'

export class HttpLedgerAdapter implements LedgerService {
  private readonly client: NativeFetchClient

  constructor(client: NativeFetchClient) {
    this.client = client
  }

  async getBalance(): Promise<BalanceResponse> {
    const raw = await this.client.request<unknown>('/ledger/balance', {
      method: 'GET',
    })
    return balanceResponseSchema.parse(raw)
  }

  async getSummary(): Promise<FinancialSummaryResponse> {
    const raw = await this.client.request<unknown>('/ledger/summary', {
      method: 'GET',
    })
    return financialSummaryResponseSchema.parse(raw)
  }

  async getEntries(params?: GetLedgerEntriesParams): Promise<LedgerEntryResponse[]> {
    const sp = new URLSearchParams()
    if (params?.currency) sp.set('currency', params.currency)
    if (params?.entryType) sp.set('entry_type', params.entryType)
    if (params?.limit) sp.set('limit', String(params.limit))
    if (params?.offset !== undefined) sp.set('offset', String(params.offset))
    const qs = sp.toString() ? `?${sp.toString()}` : ''

    const raw = await this.client.request<unknown>(`/ledger/entries${qs}`, {
      method: 'GET',
    })
    return ledgerEntryListResponseSchema.parse(raw)
  }
}

