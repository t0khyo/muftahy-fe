import type {
  AdminProfileResponse,
  AdminProfileUpdate,
} from '@workspace/domain/schemas/admin-profile'

export interface ListAdminsParams {
  isActive?: boolean
  limit?: number
  offset?: number
}

export interface AdminProfileService {
  getMyProfile(): Promise<AdminProfileResponse>
  updateMyProfile(payload: AdminProfileUpdate): Promise<AdminProfileResponse>
  listAdmins(params?: ListAdminsParams): Promise<AdminProfileResponse[]>
}

