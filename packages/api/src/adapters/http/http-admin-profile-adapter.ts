import {
  type AdminProfileResponse,
  type AdminProfileUpdate,
  adminProfileListResponseSchema,
  adminProfileResponseSchema,
} from '@workspace/domain/schemas/admin-profile'
import type {
  AdminProfileService,
  ListAdminsParams,
} from '../../services/admin-profile-service'
import type { NativeFetchClient } from './fetch-client'

export class HttpAdminProfileAdapter implements AdminProfileService {
  private readonly client: NativeFetchClient

  constructor(client: NativeFetchClient) {
    this.client = client
  }

  async getMyProfile(): Promise<AdminProfileResponse> {
    const raw = await this.client.request<unknown>('/admin/me', {
      method: 'GET',
    })
    return adminProfileResponseSchema.parse(raw)
  }

  async updateMyProfile(payload: AdminProfileUpdate): Promise<AdminProfileResponse> {
    const raw = await this.client.request<unknown>('/admin/me', {
      method: 'PATCH',
      body: { display_name: payload.display_name },
    })
    return adminProfileResponseSchema.parse(raw)
  }

  async listAdmins(params?: ListAdminsParams): Promise<AdminProfileResponse[]> {
    const sp = new URLSearchParams()
    if (params?.isActive !== undefined) sp.set('is_active', String(params.isActive))
    if (params?.limit !== undefined) sp.set('limit', String(params.limit))
    if (params?.offset !== undefined) sp.set('offset', String(params.offset))
    const qs = sp.toString() ? `?${sp.toString()}` : ''

    const raw = await this.client.request<unknown>(`/admin/admins${qs}`, {
      method: 'GET',
    })
    return adminProfileListResponseSchema.parse(raw)
  }
}

