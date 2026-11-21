import type {
  DashboardOverviewResponse,
  PreorderSummaryResponse,
  SalesSummaryResponse,
} from '@workspace/domain/schemas/admin-dashboard'

export interface AdminDashboardService {
  getOverview(): Promise<DashboardOverviewResponse>
  getSales(dateFrom?: string, dateTo?: string): Promise<SalesSummaryResponse>
  getPreorders(): Promise<PreorderSummaryResponse>
}

