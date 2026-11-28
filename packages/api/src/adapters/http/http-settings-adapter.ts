import {
  adminSettingsResponseSchema,
  publicSettingsResponseSchema,
  type AdminSettingsResponse,
  type AdminSettingsUpdateRequest,
  type PublicSettingsResponse,
} from '@workspace/domain/schemas/settings'
import type { SettingsService } from '../../services/settings-service'
import type { NativeFetchClient } from './fetch-client'

export class HttpSettingsAdapter implements SettingsService {
  private readonly client: NativeFetchClient

  constructor(client: NativeFetchClient) {
    this.client = client
  }

  async getPublicSettings(): Promise<PublicSettingsResponse> {
    const raw = await this.client.request<unknown>('/settings/public', {
      method: 'GET',
      skipAuth: true,
    })
    return publicSettingsResponseSchema.parse(raw)
  }

  async getAdminSettings(): Promise<AdminSettingsResponse> {
    const raw = await this.client.request<unknown>('/admin/settings', {
      method: 'GET',
    })
    return adminSettingsResponseSchema.parse(raw)
  }

  async updateAdminSettings(payload: AdminSettingsUpdateRequest): Promise<AdminSettingsResponse> {
    const raw = await this.client.request<unknown>('/admin/settings', {
      method: 'PATCH',
      body: payload,
    })
    return adminSettingsResponseSchema.parse(raw)
  }
}

