import type { AuditLogListResponse } from '@workspace/domain/schemas/audit'

export interface GetAuditLogsParams {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  adminId?: string
  action?: string
  targetType?: string
  success?: boolean
}

export interface ExportAuditLogsParams {
  format?: 'csv' | 'json'
  startDate?: string
  endDate?: string
  adminId?: string
  action?: string
  targetType?: string
  success?: boolean
}

export interface AuditService {
  getLogs(params?: GetAuditLogsParams): Promise<AuditLogListResponse>
  exportLogs(params?: ExportAuditLogsParams): Promise<Blob>
}

