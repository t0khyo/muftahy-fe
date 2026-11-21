import { useMutation, useQuery } from '@tanstack/react-query'
import { getAuditService } from '@workspace/api/factory'
import type {
  ExportAuditLogsParams,
  GetAuditLogsParams,
} from '@workspace/api/services/audit-service'

export const auditKeys = {
  all: ['admin', 'audit'] as const,
  logs: (params?: GetAuditLogsParams) => [...auditKeys.all, 'logs', params] as const,
}

export function useAuditLogs(params?: GetAuditLogsParams) {
  const service = getAuditService()
  return useQuery({
    queryKey: auditKeys.logs(params),
    queryFn: () => service.getLogs(params),
  })
}

export function useExportAuditLogs() {
  const service = getAuditService()
  return useMutation({
    mutationFn: (params?: ExportAuditLogsParams) => service.exportLogs(params),
  })
}

