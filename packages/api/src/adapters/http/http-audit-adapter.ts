import {
  type AuditLogListResponse,
  auditLogListResponseSchema,
} from '@workspace/domain/schemas/audit'
import type {
  AuditService,
  ExportAuditLogsParams,
  GetAuditLogsParams,
} from '../../services/audit-service'
import type { NativeFetchClient } from './fetch-client'

export class HttpAuditAdapter implements AuditService {
  private readonly client: NativeFetchClient

  constructor(client: NativeFetchClient) {
    this.client = client
  }

  async getLogs(params?: GetAuditLogsParams): Promise<AuditLogListResponse> {
    const sp = new URLSearchParams()
    if (params?.page) sp.set('page', String(params.page))
    if (params?.limit) sp.set('limit', String(params.limit))
    if (params?.startDate) sp.set('start_date', params.startDate)
    if (params?.endDate) sp.set('end_date', params.endDate)
    if (params?.adminId) sp.set('admin_id', params.adminId)
    if (params?.action) sp.set('action', params.action)
    if (params?.targetType) sp.set('target_type', params.targetType)
    const qs = sp.toString() ? `?${sp.toString()}` : ''

    const raw = await this.client.request<unknown>(`/audit/logs${qs}`, {
      method: 'GET',
    })
    return auditLogListResponseSchema.parse(raw)
  }

  async exportLogs(params?: ExportAuditLogsParams): Promise<Blob> {
    const sp = new URLSearchParams()
    sp.set('format', params?.format ?? 'csv')
    if (params?.startDate) sp.set('start_date', params.startDate)
    if (params?.endDate) sp.set('end_date', params.endDate)
    if (params?.adminId) sp.set('admin_id', params.adminId)
    if (params?.action) sp.set('action', params.action)
    if (params?.targetType) sp.set('target_type', params.targetType)

    const raw = await this.client.request<Blob>(`/audit/export?${sp.toString()}`, {
      method: 'GET',
      headers: {
        Accept: params?.format === 'json' ? 'application/json' : 'text/csv',
      },
    })
    return raw instanceof Blob ? raw : new Blob([String(raw)], { type: 'text/csv' })
  }
}

