import * as React from 'react'
import { useParams, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  PackageCheck,
  Plus,
  Search,
  Edit,
  KeyRound,
  CheckCircle,
  XCircle,
  Copy,
} from 'lucide-react'
import {
  useAdminProducts,
  useUpdateProductStatus,
} from '../features/products/hooks/use-admin-products'
import type { ProductResponse } from '@workspace/domain/schemas/product'
import { formatMoney } from '@workspace/domain/formatters/money'
import { getProductMainImageUrl } from '@workspace/api/factory'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@workspace/ui/components/input-group'
import { Switch } from '@workspace/ui/components/switch'
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
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
import { EmptyState } from '../features/dashboard/components/empty-state'
import { AdminPageHeader } from '../components/admin-page-header'
import { DataTableColumnHeader } from '../components/data-table-column-header'
import { DataTableRowActions } from '../components/data-table-row-actions'
import { useDataTableSort } from '../hooks/use-data-table-sort'
import { useAdminCategories } from '../features/categories/hooks/use-admin-categories'

export function AdminProductsRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['admin'])

  const [searchQuery, setSearchQuery] = React.useState('')

  const { data: products, isLoading } = useAdminProducts()
  const { data: categories = [] } = useAdminCategories()
  const statusMutation = useUpdateProductStatus()

  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')

  const filteredProducts = React.useMemo(() => {
    let items = products || []
    if (selectedCategory !== 'all') {
      items = items.filter((p) => p.category?.slug === selectedCategory || p.category?.id === selectedCategory)
    }
    if (!searchQuery.trim()) return items
    const query = searchQuery.toLowerCase().trim()
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.category?.name && p.category.name.toLowerCase().includes(query))
    )
  }, [products, searchQuery, selectedCategory])

  const { sortedItems, sortConfig, toggleSort } = useDataTableSort<ProductResponse>(
    filteredProducts,
    { column: 'name', direction: 'asc' },
    {
      base_price: (p) => Number(p.base_price),
      available_count: (p) => Number(p.available_count),
    }
  )

  const handleOpenCreate = () => {
    navigate(`/${lang}/products/new`)
  }

  const handleOpenEdit = (product: ProductResponse) => {
    navigate(`/${lang}/products/${product.id}`)
  }

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    statusMutation.mutate({ id, is_active: !currentStatus })
  }

  return (
    <div className="space-y-6 text-start w-full">
      {/* Header */}
      <AdminPageHeader
        title={t('admin:products.title', 'Products')}
        description={t('admin:products.subtitle', 'Manage digital products, pricing, categories, and visibility')}
      >
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0 cursor-pointer shadow-xs active:translate-y-px transition-all font-medium">
          <Plus className="size-4" />
          <span>{t('admin:products.addProduct', 'Add Product')}</span>
        </Button>
      </AdminPageHeader>

      {/* Integrated Control Strip & Catalog Table */}
      <div className="space-y-4">
        {/* Streamlined Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <InputGroup className="flex-1 max-w-sm h-9 bg-muted/30 border-border/70 focus-within:bg-background transition-colors">
            <InputGroupAddon>
              <Search className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder={t('admin:products.searchPlaceholder', 'Search by product name or category...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs sm:text-sm"
            />
          </InputGroup>

          {/* Category Filter Tabs */}
          <Tabs
            value={selectedCategory}
            onValueChange={(val) => {
              if (val) setSelectedCategory(val)
            }}
          >
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs">
                {t('admin:common.all', 'All')}
              </TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.slug} className="text-xs">
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Products Table */}
        <Card className="border-border/80 shadow-none overflow-hidden">
          <CardHeader className="p-4 pb-3 text-start border-b border-border/40 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold tracking-tight">
                  {t('admin:products.catalogTitle', 'Products')}
                  <span className="ms-2 font-mono text-xs font-normal text-muted-foreground tabular-nums">
                    ({filteredProducts.length} {t('admin:common.records', 'records')})
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {t('admin:products.catalogDesc', 'Active products are visible to buyers on the storefront.')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-20 text-center text-sm font-mono text-muted-foreground">
                {t('admin:common.loading', 'Loading catalog...')}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={PackageCheck}
                  title={t('admin:products.emptyTitle', 'No products found')}
                  description={t(
                    'admin:products.emptyDesc',
                    'Create digital products or game licenses to start accepting orders.'
                  )}
                  actionLabel={t('admin:products.addProduct', 'Add Product')}
                  onAction={handleOpenCreate}
                />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="ps-4 pe-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="name"
                        title={t('admin:products.product', 'Product')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="category"
                        title={t('admin:products.category', 'Category')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-end">
                      <DataTableColumnHeader
                        column="base_price"
                        title={t('admin:products.price', 'Base Price')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="end"
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-end">
                      <DataTableColumnHeader
                        column="available_count"
                        title={t('admin:products.stock', 'Available Keys')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="end"
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-center">
                      <DataTableColumnHeader
                        column="is_active"
                        title={t('admin:products.status', 'Active')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="center"
                      />
                    </TableHead>
                    <TableHead className="ps-3 pe-4 py-3.5 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground w-28">
                      {t('admin:common.actions', 'Actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map((product) => {
                    const priceNum = Number(product.base_price)
                    const hasKeys = product.available_count > 0

                    return (
                      <TableRow key={product.id} className="border-border/40 hover:bg-muted/20 transition-colors">
                        <TableCell className="ps-4 pe-3 py-3.5 text-start">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const coverUrl = getProductMainImageUrl(product)
                              return coverUrl ? (
                                <img
                                  src={coverUrl}
                                  alt=""
                                  className="size-9 rounded-lg object-cover border border-border/40 shrink-0 select-none"
                                />
                              ) : (
                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/5 text-primary border border-primary/10 shrink-0">
                                  <PackageCheck className="size-4.5" />
                                </div>
                              )
                            })()}
                            <div className="grid gap-0.5 min-w-0">
                              <span className="font-semibold text-sm text-foreground truncate">
                                {product.name}
                              </span>
                              <div className="flex items-center gap-2">
                                {product.sku ? (
                                  <span dir="ltr" className="font-mono text-[10px] text-muted-foreground">
                                    {product.sku}
                                  </span>
                                ) : (
                                  <span className="font-mono text-[10px] text-muted-foreground">
                                    {product.id.slice(0, 8)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3.5 text-start">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <Badge variant="outline" className="text-[10px] font-mono border-border/60 bg-muted/40">
                              {product.category?.name || ''}
                            </Badge>
                            {product.variant && (
                              <Badge variant="secondary" className="text-[9px] font-mono uppercase font-bold tracking-wider">
                                {product.variant}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3.5 text-end font-mono text-xs font-semibold tabular-nums">
                          {formatMoney(priceNum, { currency: 'EGP', locale: lang })}
                        </TableCell>
                        <TableCell className="px-3 py-3.5 text-end">
                          <div className="inline-flex items-center gap-1.5 font-mono text-xs">
                            <KeyRound className="size-3.5 text-muted-foreground" />
                            <span className={hasKeys ? 'font-semibold text-foreground tabular-nums' : 'text-rose-500 font-bold tabular-nums'}>
                              {product.available_count}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3.5 text-center">
                          <div className="inline-flex items-center justify-center gap-2">
                            <Switch
                              checked={product.is_active}
                              onCheckedChange={() => handleToggleStatus(product.id, product.is_active)}
                              disabled={statusMutation.isPending}
                            />
                            <span className="text-xs">
                              {product.is_active ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                  <CheckCircle className="size-3" /> Live
                                </span>
                              ) : (
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <XCircle className="size-3" /> Hidden
                                </span>
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="ps-3 pe-4 py-3.5 text-center">
                          <div className="inline-flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(product)}
                              className="h-8 px-2.5 gap-1.5 text-xs font-medium cursor-pointer hover:text-foreground"
                            >
                              <Edit className="size-3.5" />
                              <span>{t('admin:common.edit', 'Edit')}</span>
                            </Button>
                            <DataTableRowActions
                              items={[
                                {
                                  label: t('admin:products.copyId', 'Copy Product ID'),
                                  icon: Copy,
                                  onClick: () => navigator.clipboard.writeText(product.id),
                                },
                                {
                                  label: t('admin:products.viewInventory', 'Manage Key Pool'),
                                  icon: KeyRound,
                                  onClick: () => navigate(`/${lang}/admin/inventory?product=${product.id}`),
                                },
                                {
                                  label: product.is_active
                                    ? t('admin:products.hideProduct', 'Hide from Storefront')
                                    : t('admin:products.publishProduct', 'Publish to Storefront'),
                                  icon: product.is_active ? XCircle : CheckCircle,
                                  onClick: () => handleToggleStatus(product.id, product.is_active),
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
