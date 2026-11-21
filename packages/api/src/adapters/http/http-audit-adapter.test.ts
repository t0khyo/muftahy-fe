import { describe, expect, it, vi } from 'vitest'
import type { NativeFetchClient } from './fetch-client'
import { HttpAuditAdapter } from './http-audit-adapter'

describe('HttpAuditAdapter', () => {
  const createMockClient = (responseData: unknown): NativeFetchClient => {
    return {
      request: vi.fn().mockResolvedValue(responseData),
    } as unknown as NativeFetchClient
  }

  it('fetches paginated audit logs with search params', async () => {
    const mockList = {
      items: [
        {
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          admin_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
          admin_name: 'Admin User',
          action: 'keys.import',
          target_type: 'key',
          target_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
          success: true,
          created_at: '2026-11-20T10:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
    }
    const client = createMockClient(mockList)
    const adapter = new HttpAuditAdapter(client)

    const result = await adapter.getLogs({ page: 1, limit: 50, action: 'keys.import' })
    expect(client.request).toHaveBeenCalledWith(
      '/audit/logs?page=1&limit=50&action=keys.import',
      { method: 'GET' },
    )
    expect(result.items.length).toBe(1)
  })

  it('requests export blob', async () => {
    const blob = new Blob(['col1,col2\nval1,val2'], { type: 'text/csv' })
    const client = createMockClient(blob)
    const adapter = new HttpAuditAdapter(client)

    const result = await adapter.exportLogs({ format: 'csv' })
    expect(client.request).toHaveBeenCalledWith('/audit/export?format=csv', {
      method: 'GET',
      headers: { Accept: 'text/csv' },
    })
    expect(result).toBeInstanceOf(Blob)
  })
})

