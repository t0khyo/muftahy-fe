import {
  type KeyBatchImportRequest,
  type KeyImportResponse,
  type KeyResponse,
  type KeyStatsResponse,
  type KeyUpdate,
  keyImportResponseSchema,
  keyListResponseSchema,
  keyResponseSchema,
  keyStatsListSchema,
} from '@workspace/domain/schemas/inventory'
import type { InventoryService, ListKeysParams } from '../../services/inventory-service'
import type { NativeFetchClient } from './fetch-client'

export class HttpInventoryAdapter implements InventoryService {
  private readonly client: NativeFetchClient

  constructor(client: NativeFetchClient) {
    this.client = client
  }

  async importKeys(payload: KeyBatchImportRequest): Promise<KeyImportResponse> {
    const raw = await this.client.request<unknown>('/keys/import', {
      method: 'POST',
      body: payload,
    })
    return keyImportResponseSchema.parse(raw)
  }

  async getStats(productId?: string): Promise<KeyStatsResponse[]> {
    const qs = productId ? `?product_id=${encodeURIComponent(productId)}` : ''
    const raw = await this.client.request<unknown>(`/keys/stats${qs}`, {
      method: 'GET',
    })
    return keyStatsListSchema.parse(raw)
  }

  async listKeys(params?: ListKeysParams): Promise<KeyResponse[]> {
    const sp = new URLSearchParams()
    if (params?.productId) sp.set('product_id', params.productId)
    if (params?.status) sp.set('status', params.status)
    if (params?.replacementOnly !== undefined) {
      sp.set('replacement_only', String(params.replacementOnly))
    }
    const qs = sp.toString() ? `?${sp.toString()}` : ''

    const raw = await this.client.request<unknown>(`/keys${qs}`, {
      method: 'GET',
    })
    return keyListResponseSchema.parse(raw)
  }

  async getKey(keyId: string): Promise<KeyResponse> {
    const raw = await this.client.request<unknown>(`/keys/${keyId}`, {
      method: 'GET',
    })
    return keyResponseSchema.parse(raw)
  }

  async updateKey(keyId: string, payload: KeyUpdate): Promise<KeyResponse> {
    const raw = await this.client.request<unknown>(`/keys/${keyId}`, {
      method: 'PATCH',
      body: payload,
    })
    return keyResponseSchema.parse(raw)
  }
}

