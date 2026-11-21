import {
  type PromoCreateRequest,
  type PromoDetailResponse,
  type PromoUpdateRequest,
  promoDetailResponseSchema,
  promoListResponseSchema,
} from '@workspace/domain/schemas/promos'
import type { ListPromosParams, PromoService } from '../../services/promo-service'
import type { NativeFetchClient } from './fetch-client'

export class HttpPromoAdapter implements PromoService {
  private readonly client: NativeFetchClient

  constructor(client: NativeFetchClient) {
    this.client = client
  }

  async createPromo(payload: PromoCreateRequest): Promise<PromoDetailResponse> {
    const raw = await this.client.request<unknown>('/promos', {
      method: 'POST',
      body: payload,
    })
    return promoDetailResponseSchema.parse(raw)
  }

  async listPromos(params?: ListPromosParams): Promise<PromoDetailResponse[]> {
    const sp = new URLSearchParams()
    if (params?.isActive !== undefined) sp.set('is_active', String(params.isActive))
    if (params?.limit) sp.set('limit', String(params.limit))
    if (params?.offset !== undefined) sp.set('offset', String(params.offset))
    const qs = sp.toString() ? `?${sp.toString()}` : ''

    const raw = await this.client.request<unknown>(`/promos${qs}`, {
      method: 'GET',
    })
    return promoListResponseSchema.parse(raw)
  }

  async getPromo(promoId: string): Promise<PromoDetailResponse> {
    const raw = await this.client.request<unknown>(`/promos/${promoId}`, {
      method: 'GET',
    })
    return promoDetailResponseSchema.parse(raw)
  }

  async updatePromo(promoId: string, payload: PromoUpdateRequest): Promise<PromoDetailResponse> {
    const raw = await this.client.request<unknown>(`/promos/${promoId}`, {
      method: 'PATCH',
      body: payload,
    })
    return promoDetailResponseSchema.parse(raw)
  }
}

