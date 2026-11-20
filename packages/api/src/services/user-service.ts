import type {
  UpdateProfileRequest,
  UserProfile,
} from '@workspace/domain/schemas/auth'
import type { UserKey } from '@workspace/domain/schemas/key'

export interface UserService {
  getProfile(): Promise<UserProfile>
  updateProfile(payload: UpdateProfileRequest): Promise<UserProfile>
  getUserKeys(): Promise<UserKey[]>
}
