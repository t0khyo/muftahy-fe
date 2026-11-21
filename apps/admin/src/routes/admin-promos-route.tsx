import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Tag,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Percent,
} from 'lucide-react'
import {
  useAdminPromos,
  useTogglePromoStatus,
} from '../features/promos/hooks/use-promos'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
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

export function AdminPromosRoute() {
  const { t } = useTranslation(['admin'])

  const [searchQuery, setSearchQuery] = React.useState('')
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)

  const { data: promos, isLoading } = useAdminPromos()
  const toggleMutation = useTogglePromoStatus()

  const filteredPromos = React.useMemo(() => {
    const items = promos || []
    if (!searchQuery.trim()) return items
    const query = searchQuery.toLowerCase().trim()
    return items.filter((p) => p.code.toLowerCase().includes(query))
  }, [promos, searchQuery])

  const handleToggle = (code: string, currentStatus: boolean) => {
    toggleMutation.mutate({ code, is_active: !currentStatus })
  }

  return (
    <div className="space-y-6 text-start w-full">
      {/* Header */}
      <AdminPageHeader
        title={t('admin:promos.title', 'Promotions & Coupons')}
        description={t('admin:promos.subtitle', 'Configure percentage discount coupons with total usage limits')}
      >
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gap-2 shrink-0 cursor-pointer shadow-xs active:translate-y-px transition-all font-medium"
        >
          <Plus className="size-4" />
          <span>{t('admin:promos.createCoupon', 'Create Coupon')}</span>
        </Button>
      </AdminPageHeader>

      {/* Streamlined Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t('admin:promos.searchPlaceholder', 'Search coupon code...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 h-9 text-xs sm:text-sm bg-muted/30 border-border/70 focus-visible:bg-background transition-colors"
            />
          </div>
        </div>

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
                {t('admin:common.loading', 'Loading promo codes...')}
              </div>
            ) : filteredPromos.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Tag}
                  title={t('admin:promos.emptyTitle', 'No promotions yet')}
                  description={t(
                    'admin:promos.emptyDesc',
                    'Create your first promotional discount coupon code to incentivize buyers.'
                  )}
                  actionLabel={t('admin:promos.createCoupon', 'Create Coupon')}
                  onAction={() => setCreateDialogOpen(true)}
                />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:promos.code', 'Coupon Code')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:promos.discount', 'Discount')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:promos.usage', 'Usage')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:promos.validity', 'Expiry')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:promos.status', 'Active')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromos.map((promo) => {
                    const isExhausted =
                      promo.max_total_uses !== null &&
                      promo.max_total_uses !== undefined &&
                      promo.current_total_uses >= promo.max_total_uses

                    return (
                      <TableRow key={promo.code} className="border-border/40 hover:bg-muted/20 transition-colors">
                        <TableCell className="text-start py-3.5">
                          <div className="flex items-center gap-2">
                            <Tag className="size-3.5 text-primary shrink-0" />
                            <span className="font-mono text-xs font-bold tracking-wider text-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border/40">
                              {promo.code}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-start py-3.5">
                          <Badge variant="outline" className="font-mono text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <span className="flex items-center gap-0.5 font-bold tabular-nums">
                              {promo.discount_percentage}% <Percent className="size-3 ms-0.5" />
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-start text-xs font-mono py-3.5">
                          <span className={isExhausted ? 'text-rose-500 font-bold tabular-nums' : 'text-foreground font-semibold tabular-nums'}>
                            {promo.current_total_uses}
                          </span>{' '}
                          <span className="text-muted-foreground">/ {promo.max_total_uses ?? '∞'}</span>
                        </TableCell>
                        <TableCell className="text-start text-xs text-muted-foreground font-mono py-3.5">
                          {promo.expires_at ? (
                            <span>{new Date(promo.expires_at).toLocaleDateString()}</span>
                          ) : (
                            <span className="text-muted-foreground/80">Perpetual</span>
                          )}
                        </TableCell>
                        <TableCell className="text-start py-3.5">
                          <div className="flex items-center gap-2">
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
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
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
