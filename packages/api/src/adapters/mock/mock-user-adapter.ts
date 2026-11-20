import type {
  UpdateProfileRequest,
  UserProfile,
} from '@workspace/domain/schemas/auth'
import type { UserKey } from '@workspace/domain/schemas/key'
import type { UserService } from '../../services/user-service'

export class MockUserAdapter implements UserService {
  private profile: UserProfile

  constructor(scope: 'customer' | 'admin' = 'customer') {
    if (scope === 'admin') {
      this.profile = {
        id: '55024a5b-9c0d-4d16-a04c-4f5d782e4256',
        email: 'admin1@souqmuftah.com',
        full_name: 'System Admin',
        phone: null,
        is_active: true,
        created_at: '2026-11-16T12:00:00Z',
      }
    } else {
      this.profile = {
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        email: 'customer@example.com',
        full_name: 'Ahmed Mohamed',
        phone: '01012345678',
        is_active: true,
        created_at: '2026-11-16T12:00:00Z',
      }
    }
  }

  async getProfile(): Promise<UserProfile> {
    return { ...this.profile }
  }

  async updateProfile(payload: UpdateProfileRequest): Promise<UserProfile> {
    if (payload.full_name !== undefined) {
      this.profile.full_name = payload.full_name
    }
    if (payload.phone !== undefined) {
      this.profile.phone = payload.phone
    }
    return { ...this.profile }
  }

  async getUserKeys(): Promise<UserKey[]> {
    return [
      {
        key_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        product_name: 'Microsoft Office 2024 Home & Business',
        serial: 'X229N-48FGX-YVC9B-4J6C9-AAAAA',
        sold_at: '2026-11-20T04:00:00Z',
      },
    ]
  }
}
