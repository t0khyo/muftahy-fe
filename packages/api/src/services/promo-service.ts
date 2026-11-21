import type {
  PromoCreateRequest,
  PromoDetailResponse,
  PromoUpdateRequest,
} from '@workspace/domain/schemas/promos'

export interface ListPromosParams {
  isActive?: boolean
  limit?: number
  offset?: number
}

export interface PromoService {
  createPromo(payload: PromoCreateRequest): Promise<PromoDetailResponse>
  listPromos(params?: ListPromosParams): Promise<PromoDetailResponse[]>
  getPromo(promoId: string): Promise<PromoDetailResponse>
  updatePromo(promoId: string, payload: PromoUpdateRequest): Promise<PromoDetailResponse>
}

