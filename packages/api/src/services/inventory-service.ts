import type {
  KeyBatchImportRequest,
  KeyImportResponse,
  KeyResponse,
  KeyStatsResponse,
  KeyUpdate,
} from '@workspace/domain/schemas/inventory'

export interface ListKeysParams {
  productId?: string
  status?: string
  replacementOnly?: boolean
}

export interface InventoryService {
  importKeys(payload: KeyBatchImportRequest): Promise<KeyImportResponse>
  getStats(productId?: string): Promise<KeyStatsResponse[]>
  listKeys(params?: ListKeysParams): Promise<KeyResponse[]>
  getKey(keyId: string): Promise<KeyResponse>
  updateKey(keyId: string, payload: KeyUpdate): Promise<KeyResponse>
}

