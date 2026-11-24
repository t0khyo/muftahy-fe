import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Tag,
  Plus,
  CheckCircle,
  XCircle,
  Percent,
  Copy,
} from 'lucide-react'
import {
  useAdminPromos,
  useTogglePromoStatus,
} from '../features/promos/hooks/use-promos'
import type { PromoDetailResponse } from '@workspace/domain/schemas/promos'
import { formatDate } from '@workspace/domain/formatters/date'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Switch } from '@workspace/ui/components/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { PromoFormDialog } from '../features/promos/components/promo-form-dialog'
import { EmptyState } from '../features/dashboard/components/empty-state'
import { AdminPageHeader } from '../components/admin-page-header'
import { DataTableColumnHeader } from '../components/data-table-column-header'
import { DataTableRowActions } from '../components/data-table-row-actions'
import {
  DataTableToolbar,
  DataTableSearch,
  DataTableActiveFilters,
  type ActiveFilterChipItem,
} from '../components/data-table/data-table-toolbar'
import { DataTablePagination } from '../components/data-table/data-table-pagination'
import { useDataTableSort } from '../hooks/use-data-table-sort'
import { useDataTablePagination } from '../hooks/use-data-table-pagination'

export function AdminPromosRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t } = useTranslation(['admin'])

  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all')
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)

  const { data: promos, isLoading } = useAdminPromos()
  const toggleMutation = useTogglePromoStatus()

  const statusCounts = React.useMemo(() => {
    const all = promos?.length || 0
    const active = promos?.filter((p) => p.is_active).length || 0
    const inactive = all - active
    return { all, active, inactive }
  }, [promos])

  const filteredPromos = React.useMemo(() => {
    let items = promos || []
    if (statusFilter === 'active') {
      items = items.filter((p) => p.is_active)
    } else if (statusFilter === 'inactive') {
      items = items.filter((p) => !p.is_active)
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      items = items.filter((p) => p.code.toLowerCase().includes(query))
    }
    return items
  }, [promos, statusFilter, searchQuery])

  const activeFilterChips = React.useMemo(() => {
    const chips: ActiveFilterChipItem[] = []
    if (searchQuery.trim()) {
      chips.push({
        id: 'search',
        label: `"${searchQuery.trim()}"`,
        onRemove: () => setSearchQuery(''),
      })
    }
    if (statusFilter !== 'all') {
      chips.push({
        id: 'status',
        label: statusFilter === 'active' ? t('admin:categories.active', 'Active') : t('admin:categories.inactive', 'Inactive'),
        onRemove: () => setStatusFilter('all'),
      })
    }
    return chips
  }, [searchQuery, statusFilter, t])

  const handleResetAllFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
  }

  const { sortedItems, sortConfig, toggleSort } = useDataTableSort<PromoDetailResponse>(
    filteredPromos,
    { column: 'code', direction: 'asc' },
    {
      discount_percentage: (p) => Number(p.discount_percentage),
      current_total_uses: (p) => Number(p.current_total_uses),
    }
  )

  const pagination = useDataTablePagination(sortedItems, { defaultPageSize: 10 })
  const { resetPage } = pagination

  React.useEffect(() => {
    resetPage()
  }, [searchQuery, statusFilter, resetPage])

  const handleToggle = (code: string, currentStatus: boolean) => {
    toggleMutation.mutate({ code, is_active: !currentStatus })
  }

  return (
    <div className="space-y-6 text-start w-full">
      {/* Header */}
      <AdminPageHeader
        title={t('admin:promos.title', 'Discounts')}
        description={t('admin:promos.subtitle', 'Create and manage discount codes and promotion limits')}
      >
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gap-2 shrink-0 cursor-pointer shadow-xs active:translate-y-px transition-all font-medium"
        >
          <Plus className="size-4" />
          <span>{t('admin:promos.createCoupon', 'Create Discount')}</span>
        </Button>
      </AdminPageHeader>

      {/* Streamlined Toolbar & Promos Table */}
      <div className="space-y-4">
        <DataTableToolbar
          search={
            <DataTableSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('admin:promos.searchPlaceholder', 'Search discount code...')}
            />
          }
          views={
            <Tabs
              value={statusFilter}
              onValueChange={(val) => {
                if (val) setStatusFilter(val as 'all' | 'active' | 'inactive')
              }}
            >
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs whitespace-nowrap">
                  {t('admin:products.tabs.all', 'All')} ({statusCounts.all})
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs whitespace-nowrap">
                  {t('admin:categories.active', 'Active')} ({statusCounts.active})
                </TabsTrigger>
                <TabsTrigger value="inactive" className="text-xs whitespace-nowrap">
                  {t('admin:categories.inactive', 'Inactive')} ({statusCounts.inactive})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          }
          activeFilters={
            <DataTableActiveFilters
              chips={activeFilterChips}
              onClearAll={handleResetAllFilters}
            />
          }
        />

        {/* Promos Table */}
        <Card className="border-border/80 shadow-none overflow-hidden">
          <CardHeader className="p-4 pb-3 text-start border-b border-border/40 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold tracking-tight">
                  {t('admin:promos.listTitle', 'Discount Codes')}
                  <span className="ms-2 font-mono text-xs font-normal text-muted-foreground tabular-nums">
                    ({filteredPromos.length} {t('admin:common.records', 'records')})
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {t('admin:promos.listDesc', 'Discounts apply automatically at checkout when valid.')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-20 text-center text-sm font-mono text-muted-foreground">
                {t('admin:common.loading', 'Loading discounts...')}
              </div>
            ) : filteredPromos.length === 0 ? (
              (promos?.length || 0) === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={Tag}
                    title={t('admin:promos.emptyTitle', 'No discounts yet')}
                    description={t(
                      'admin:promos.emptyDesc',
                      'Create your first promotional discount code to incentivize buyers.'
                    )}
                    actionLabel={t('admin:promos.createCoupon', 'Create Discount')}
                    onAction={() => setCreateDialogOpen(true)}
                  />
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {t('admin:common.noFilteredResults', 'No records match your active filters')}
                </div>
              )
            ) : (
              <>
                <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="ps-4 pe-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="code"
                        title={t('admin:promos.code', 'Discount Code')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="discount_percentage"
                        title={t('admin:promos.discount', 'Discount')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="current_total_uses"
                        title={t('admin:promos.usage', 'Usage')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="expires_at"
                        title={t('admin:promos.validity', 'Expiry')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-center">
                      <DataTableColumnHeader
                        column="is_active"
                        title={t('admin:promos.status', 'Active')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="center"
                      />
                    </TableHead>
                    <TableHead className="ps-3 pe-4 py-3.5 text-center w-20 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t('admin:common.actions', 'Actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagination.paginatedItems.map((promo) => {
                    const isExhausted =
                      promo.max_total_uses !== null &&
                      promo.max_total_uses !== undefined &&
                      promo.current_total_uses >= promo.max_total_uses

                    return (
                      <TableRow key={promo.code} className="border-border/40 hover:bg-muted/20 transition-colors">
                        <TableCell className="ps-4 pe-3 py-3.5 text-start">
                          <div className="flex items-center gap-2">
                            <Tag className="size-3.5 text-primary shrink-0" />
                            <span className="font-mono text-xs font-bold tracking-wider text-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border/40">
                              {promo.code}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3.5 text-start">
                          <Badge variant="outline" className="font-mono text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <span className="flex items-center gap-0.5 font-bold tabular-nums">
                              {promo.discount_percentage}% <Percent className="size-3 ms-0.5" />
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 py-3.5 text-start text-xs font-mono">
                          <span className={isExhausted ? 'text-rose-500 font-bold tabular-nums' : 'text-foreground font-semibold tabular-nums'}>
                            {promo.current_total_uses}
                          </span>{' '}
                          <span className="text-muted-foreground">/ {promo.max_total_uses ?? '∞'}</span>
                        </TableCell>
                        <TableCell className="px-3 py-3.5 text-start text-xs text-muted-foreground font-mono tabular-nums">
                          {promo.expires_at ? (
                            <span>
                              {formatDate(promo.expires_at, {
                                locale: lang,
                                dateStyle: 'short',
                              })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/80">Perpetual</span>
                          )}
                        </TableCell>
                        <TableCell className="px-3 py-3.5 text-center">
                          <div className="inline-flex items-center justify-center gap-2">
                            <Switch
                              checked={promo.is_active}
                              onCheckedChange={() => handleToggle(promo.code, promo.is_active)}
                              disabled={toggleMutation.isPending}
                            />
                            <span className="text-xs">
                              {promo.is_active ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                  <CheckCircle className="size-3" /> Live
                                </span>
                              ) : (
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <XCircle className="size-3" /> Disabled
                                </span>
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="ps-3 pe-4 py-3.5 text-center">
                          <div className="inline-flex items-center justify-center">
                            <DataTableRowActions
                              items={[
                                {
                                  label: t('admin:promos.copyCode', 'Copy Discount Code'),
                                  icon: Copy,
                                  onClick: () => navigator.clipboard.writeText(promo.code),
                                },
                                {
                                  label: promo.is_active
                                    ? t('admin:promos.deactivate', 'Deactivate Code')
                                    : t('admin:promos.activate', 'Activate Code'),
                                  icon: promo.is_active ? XCircle : CheckCircle,
                                  onClick: () => handleToggle(promo.code, promo.is_active),
                                  separatorBefore: true,
                                },
                              ]}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {filteredPromos.length > 0 && (
                <DataTablePagination
                  page={pagination.page}
                  pageSize={pagination.pageSize}
                  totalItems={pagination.totalItems}
                  onPageChange={pagination.setPage}
                  onPageSizeChange={pagination.setPageSize}
                />
              )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Promo Form Dialog */}
      <PromoFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
}
