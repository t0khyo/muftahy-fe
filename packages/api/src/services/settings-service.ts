import type {
  AdminSettingsResponse,
  AdminSettingsUpdateRequest,
  PublicSettingsResponse,
} from '@workspace/domain/schemas/settings'

export interface SettingsService {
  getPublicSettings(): Promise<PublicSettingsResponse>
  getAdminSettings(): Promise<AdminSettingsResponse>
  updateAdminSettings(payload: AdminSettingsUpdateRequest): Promise<AdminSettingsResponse>
}

