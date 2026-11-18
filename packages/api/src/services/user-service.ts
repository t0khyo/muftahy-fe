import type {
  UpdateProfileRequest,
  UserProfile,
} from '@workspace/domain/schemas/auth'

export interface UserService {
  getProfile(): Promise<UserProfile>
  updateProfile(payload: UpdateProfileRequest): Promise<UserProfile>
}
