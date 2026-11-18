import type {
  UpdateProfileRequest,
  UserProfile,
} from '@workspace/domain/schemas/auth'
import type { UserService } from '../../services/user-service'
import type { NativeFetchClient } from './fetch-client'

export class HttpUserAdapter implements UserService {
  private readonly client: NativeFetchClient

  constructor(client: NativeFetchClient) {
    this.client = client
  }

  async getProfile(): Promise<UserProfile> {
    return this.client.request<UserProfile>('/users/me', {
      method: 'GET',
    })
  }

  async updateProfile(payload: UpdateProfileRequest): Promise<UserProfile> {
    return this.client.request<UserProfile>('/users/me', {
      method: 'PATCH',
      body: payload,
    })
  }
}
