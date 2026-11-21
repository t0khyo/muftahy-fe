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
    <div className="space-y-6 text-start max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {t('admin:promos.title', 'Promotions & Coupons')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('admin:promos.subtitle', 'Configure percentage discount coupons with total usage limits')}
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gap-2 shrink-0 cursor-pointer shadow-xs"
        >
          <Plus className="size-4" />
          <span>{t('admin:promos.createCoupon', 'Create Coupon')}</span>
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute start-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t('admin:promos.searchPlaceholder', 'Search coupon code...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 h-9 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Promos Table */}
      <Card className="border-border">
        <CardHeader className="p-4 pb-2 text-start">
          <CardTitle className="text-base font-semibold">
            {t('admin:promos.listTitle', 'Discount Codes')}
            <span className="ms-2 font-mono text-xs font-normal text-muted-foreground">
              ({filteredPromos.length} {t('admin:common.records', 'records')})
            </span>
          </CardTitle>
          <CardDescription>
            {t('admin:promos.listDesc', 'Discounts apply automatically at checkout when valid.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
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
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">{t('admin:promos.code', 'Coupon Code')}</TableHead>
                  <TableHead className="text-start">{t('admin:promos.discount', 'Discount')}</TableHead>
                  <TableHead className="text-start">{t('admin:promos.usage', 'Usage')}</TableHead>
                  <TableHead className="text-start">{t('admin:promos.validity', 'Expiry')}</TableHead>
                  <TableHead className="text-start">{t('admin:promos.status', 'Active')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromos.map((promo) => {
                  const isExhausted =
                    promo.max_total_uses !== null &&
                    promo.max_total_uses !== undefined &&
                    promo.current_total_uses >= promo.max_total_uses

                  return (
                    <TableRow key={promo.code} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="text-start">
                        <div className="flex items-center gap-2">
                          <Tag className="size-4 text-primary shrink-0" />
                          <span className="font-mono text-sm font-bold tracking-wider text-foreground">
                            {promo.code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-start">
                        <Badge variant="outline" className="font-mono text-xs">
                          <span className="flex items-center gap-0.5">
                            {promo.discount_percentage}% <Percent className="size-3" />
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-start text-xs font-mono">
                        <span className={isExhausted ? 'text-rose-500 font-bold' : 'text-foreground'}>
                          {promo.current_total_uses}
                        </span>{' '}
                        / {promo.max_total_uses ?? '∞'}
                      </TableCell>
                      <TableCell className="text-start text-xs text-muted-foreground">
                        {promo.expires_at ? (
                          <span>Until: {new Date(promo.expires_at).toLocaleDateString()}</span>
                        ) : (
                          'Perpetual'
                        )}
                      </TableCell>
                      <TableCell className="text-start">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={promo.is_active}
                            onCheckedChange={() => handleToggle(promo.code, promo.is_active)}
                            disabled={toggleMutation.isPending}
                          />
                          <span className="text-xs text-muted-foreground">
                            {promo.is_active ? (
                              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
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

      {/* Promo Form Dialog */}
      <PromoFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
}
