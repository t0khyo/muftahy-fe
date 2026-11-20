import {
  type UpdateProfileRequest,
  type UserProfile,
  userProfileSchema,
} from '@workspace/domain/schemas/auth'
import type { UserService } from '../../services/user-service'
import type { NativeFetchClient } from './fetch-client'

export class HttpUserAdapter implements UserService {
  private readonly client: NativeFetchClient

  constructor(client: NativeFetchClient) {
    this.client = client
  }

  async getProfile(): Promise<UserProfile> {
    const raw = await this.client.request<unknown>('/users/me', {
      method: 'GET',
    })
    return userProfileSchema.parse(raw)
  }

  async updateProfile(payload: UpdateProfileRequest): Promise<UserProfile> {
    const raw = await this.client.request<unknown>('/users/me', {
      method: 'PATCH',
      body: payload,
    })
    return userProfileSchema.parse(raw)
  }
}
