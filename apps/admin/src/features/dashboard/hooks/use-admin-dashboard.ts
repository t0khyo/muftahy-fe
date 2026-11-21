import { useQuery } from '@tanstack/react-query'
import { getAdminDashboardService } from '@workspace/api/factory'

export const dashboardKeys = {
  all: ['admin', 'dashboard'] as const,
  overview: () => [...dashboardKeys.all, 'overview'] as const,
  sales: (dateFrom?: string, dateTo?: string) =>
    [...dashboardKeys.all, 'sales', { dateFrom, dateTo }] as const,
  preorders: () => [...dashboardKeys.all, 'preorders'] as const,
}

export function useDashboardOverview() {
  const service = getAdminDashboardService()
  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: () => service.getOverview(),
  })
}

export function useSalesSummary(dateFrom?: string, dateTo?: string) {
  const service = getAdminDashboardService()
  return useQuery({
    queryKey: dashboardKeys.sales(dateFrom, dateTo),
    queryFn: () => service.getSales(dateFrom, dateTo),
  })
}

export function usePreorders() {
  const service = getAdminDashboardService()
  return useQuery({
    queryKey: dashboardKeys.preorders(),
    queryFn: () => service.getPreorders(),
  })
}

