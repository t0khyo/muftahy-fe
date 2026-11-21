import {
  type DashboardOverviewResponse,
  type PreorderSummaryResponse,
  type SalesSummaryResponse,
  dashboardOverviewResponseSchema,
  preorderSummaryResponseSchema,
  salesSummaryResponseSchema,
} from '@workspace/domain/schemas/admin-dashboard'
import type { AdminDashboardService } from '../../services/admin-dashboard-service'
import type { NativeFetchClient } from './fetch-client'

export class HttpAdminDashboardAdapter implements AdminDashboardService {
  private readonly client: NativeFetchClient

  constructor(client: NativeFetchClient) {
    this.client = client
  }

  async getOverview(): Promise<DashboardOverviewResponse> {
    const raw = await this.client.request<unknown>('/admin/dashboard/overview', {
      method: 'GET',
    })
    return dashboardOverviewResponseSchema.parse(raw)
  }

  async getSales(dateFrom?: string, dateTo?: string): Promise<SalesSummaryResponse> {
    const params = new URLSearchParams()
    if (dateFrom) params.set('date_from', dateFrom)
    if (dateTo) params.set('date_to', dateTo)
    const qs = params.toString() ? `?${params.toString()}` : ''

    const raw = await this.client.request<unknown>(`/admin/dashboard/sales${qs}`, {
      method: 'GET',
    })
    return salesSummaryResponseSchema.parse(raw)
  }

  async getPreorders(): Promise<PreorderSummaryResponse> {
    const raw = await this.client.request<unknown>('/admin/dashboard/preorders', {
      method: 'GET',
    })
    return preorderSummaryResponseSchema.parse(raw)
  }
}

