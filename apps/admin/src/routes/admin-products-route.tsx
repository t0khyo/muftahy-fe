import * as React from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  PackageCheck,
  Plus,
  Search,
  Edit,
  KeyRound,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react'
import {
  useAdminProducts,
  useUpdateProductStatus,
} from '../features/products/hooks/use-admin-products'
import type { ProductResponse } from '@workspace/domain/schemas/product'
import { formatMoney } from '@workspace/domain/formatters/money'
import { getProductMainImageUrl } from '@workspace/api/factory'
import { getStorefrontUrl } from '../lib/storefront-url'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@workspace/ui/components/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
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
import { toast } from '@workspace/ui/components/sonner'
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
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'draft'>('all')
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all')
  const [stockFilter, setStockFilter] = React.useState<string>('all')
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [copiedSku, setCopiedSku] = React.useState<string | null>(null)

  const { data: products, isLoading } = useAdminProducts()
  const { data: categories = [] } = useAdminCategories()
  const statusMutation = useUpdateProductStatus()

  // Status metrics for tabs
  const statusCounts = React.useMemo(() => {
    const all = products?.length || 0
    const active = products?.filter((p) => p.is_active ?? true).length || 0
    const draft = all - active
    return { all, active, draft }
  }, [products])

  const filteredProducts = React.useMemo(() => {
    let items = products || []

    // 1. Status Filter
    if (statusFilter === 'active') {
      items = items.filter((p) => (p.is_active ?? true))
    } else if (statusFilter === 'draft') {
      items = items.filter((p) => !(p.is_active ?? true))
    }

    // 2. Category Filter
    if (categoryFilter !== 'all') {
      items = items.filter(
        (p) => p.category?.slug === categoryFilter || p.category?.id === categoryFilter,
      )
    }

    // 3. Stock Health Filter
    if (stockFilter === 'in_stock') {
      items = items.filter((p) => p.available_count > 0)
    } else if (stockFilter === 'low_stock') {
      items = items.filter((p) => p.available_count > 0 && p.available_count <= 5)
    } else if (stockFilter === 'out_of_stock') {
      items = items.filter((p) => p.available_count === 0 && !p.preorder_enabled)
    } else if (stockFilter === 'preorder') {
      items = items.filter((p) => p.available_count === 0 && p.preorder_enabled)
    }

    // 4. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.sku && p.sku.toLowerCase().includes(query)) ||
          (p.category?.name && p.category.name.toLowerCase().includes(query)),
      )
    }

    return items
  }, [products, statusFilter, categoryFilter, stockFilter, searchQuery])

  const { sortedItems, sortConfig, toggleSort } = useDataTableSort<ProductResponse>(
    filteredProducts,
    { column: 'name', direction: 'asc' },
    {
      base_price: (p) => Number(p.base_price),
      available_count: (p) => Number(p.available_count),
    },
  )

  const categoryFilterItems = React.useMemo(() => {
    return [
      {
        value: 'all',
        label: t('admin:products.filters.allCategories', 'All Categories'),
      },
      ...categories.map((cat) => ({
        value: cat.slug,
        label: cat.name,
      })),
    ]
  }, [categories, t])

  const stockFilterItems = React.useMemo(() => {
    return [
      {
        value: 'all',
        label: t('admin:products.filters.allStock', 'All Inventory'),
      },
      {
        value: 'in_stock',
        label: t('admin:products.filters.inStockOnly', 'In Stock'),
      },
      {
        value: 'low_stock',
        label: t('admin:products.filters.lowStockOnly', 'Low Stock (≤5)'),
      },
      {
        value: 'out_of_stock',
        label: t('admin:products.filters.outOfStockOnly', 'Out of Stock'),
      },
      {
        value: 'preorder',
        label: t('admin:products.filters.preorderOnly', 'Pre-orders Enabled'),
      },
    ]
  }, [t])

  const handleOpenCreate = () => {
    navigate(`/${lang}/products/new`)
  }

  const handleOpenEdit = (product: ProductResponse) => {
    navigate(`/${lang}/products/${product.id}`)
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await statusMutation.mutateAsync({ id, is_active: !currentStatus })
    toast.success(
      !currentStatus
        ? t('admin:products.publishSuccess', 'Product published to storefront')
        : t('admin:products.unpublishSuccess', 'Product moved to draft'),
    )
  }

  const handleCopySku = (sku: string) => {
    navigator.clipboard.writeText(sku)
    setCopiedSku(sku)
    toast.success(t('admin:products.copiedSku', 'SKU copied to clipboard'))
    setTimeout(() => setCopiedSku(null), 2000)
  }

  // Selection handlers
  const allFilteredSelected =
    filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.has(p.id))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleBulkStatus = async (is_active: boolean) => {
    const ids = Array.from(selectedIds)
    if (!ids.length) return
    for (const id of ids) {
      await statusMutation.mutateAsync({ id, is_active })
    }
    toast.success(
      is_active
        ? t('admin:products.publishSuccess', 'Products published to storefront')
        : t('admin:products.unpublishSuccess', 'Products moved to draft'),
    )
    setSelectedIds(new Set())
  }

  return (
    <div className="space-y-6 text-start w-full">
      {/* Header */}
      <AdminPageHeader
        title={t('admin:products.title', 'Products')}
        description={t(
          'admin:products.subtitle',
          'Manage digital products, pricing, categories, and visibility',
        )}
      >
        <Button
          onClick={handleOpenCreate}
          className="gap-2 shrink-0 cursor-pointer shadow-xs active:translate-y-px transition-all font-medium"
        >
          <Plus className="size-4" />
          <span>{t('admin:products.addProduct', 'Add Product')}</span>
        </Button>
      </AdminPageHeader>

      {/* Integrated Control Strip & Catalog Table */}
      <div className="space-y-3">
        {/* Shopify-Style Filter Bar: Status Segmented Tabs + Search + Dropdown Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
          <Tabs
            value={statusFilter}
            onValueChange={(val) => {
              if (val) setStatusFilter(val as 'all' | 'active' | 'draft')
            }}
          >
            <TabsList className="h-8 bg-muted/40 p-0.5 border border-border/50">
              <TabsTrigger value="all" className="text-xs px-3 gap-1.5 cursor-pointer">
                <span>{t('admin:products.tabs.all', 'All')}</span>
                <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                  {statusCounts.all}
                </span>
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs px-3 gap-1.5 cursor-pointer">
                <span>{t('admin:products.tabs.active', 'Active')}</span>
                <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                  {statusCounts.active}
                </span>
              </TabsTrigger>
              <TabsTrigger value="draft" className="text-xs px-3 gap-1.5 cursor-pointer">
                <span>{t('admin:products.tabs.draft', 'Draft')}</span>
                <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                  {statusCounts.draft}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search & Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <InputGroup className="w-full sm:w-60 h-8 bg-background border-border/70 focus-within:ring-1 focus-within:ring-ring">
              <InputGroupAddon>
                <Search className="size-3.5 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder={t(
                  'admin:products.searchPlaceholder',
                  'Search by product name, SKU, or category...',
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs h-7"
              />
            </InputGroup>

            {/* Category Dropdown */}
            <Select
              items={categoryFilterItems}
              value={categoryFilter}
              onValueChange={(val) => setCategoryFilter(val ?? 'all')}
            >
              <SelectTrigger className="h-8 text-xs min-w-[130px] cursor-pointer bg-background border-border/70">
                <SelectValue
                  placeholder={t('admin:products.filters.allCategories', 'All Categories')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categoryFilterItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Stock Health Dropdown */}
            <Select
              items={stockFilterItems}
              value={stockFilter}
              onValueChange={(val) => setStockFilter(val ?? 'all')}
            >
              <SelectTrigger className="h-8 text-xs min-w-[130px] cursor-pointer bg-background border-border/70">
                <SelectValue
                  placeholder={t('admin:products.filters.allStock', 'All Inventory')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {stockFilterItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Multi-Select Contextual Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between gap-3 px-4 py-2 bg-secondary/80 border border-border/70 rounded-lg text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-medium">
              <span className="size-2 rounded-full bg-primary" />
              <span>
                {t('admin:products.bulk.selected', {
                  count: selectedIds.size,
                  defaultValue: `${selectedIds.size} selected`,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleBulkStatus(true)}
                className="gap-1 cursor-pointer h-7 text-xs"
                disabled={statusMutation.isPending}
              >
                <Eye className="size-3" />
                <span>{t('admin:products.bulk.publish', 'Set as Active')}</span>
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleBulkStatus(false)}
                className="gap-1 cursor-pointer h-7 text-xs"
                disabled={statusMutation.isPending}
              >
                <EyeOff className="size-3" />
                <span>{t('admin:products.bulk.unpublish', 'Set as Draft')}</span>
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setSelectedIds(new Set())}
                className="text-muted-foreground hover:text-foreground cursor-pointer h-7 text-xs"
              >
                {t('admin:common.cancel', 'Clear')}
              </Button>
            </div>
          </div>
        )}

        {/* Products Table Card */}
        <Card className="border-border/80 shadow-none overflow-hidden">
          <CardHeader className="p-4 pb-3 text-start border-b border-border/40 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold tracking-tight">
                  {t('admin:products.catalogTitle', 'Products')}
                  <span className="ms-2 font-mono text-xs font-normal text-muted-foreground tabular-nums">
                    ({filteredProducts.length}{' '}
                    {t('admin:common.records', { defaultValue: 'records' })})
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {t(
                    'admin:products.catalogDesc',
                    'Active products are visible to buyers on the storefront.',
                  )}
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
                    'Create digital products or game licenses to start accepting orders.',
                  )}
                  actionLabel={t('admin:products.addProduct', 'Add Product')}
                  onAction={handleOpenCreate}
                />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="w-10 ps-4 pe-0 py-3 text-start">
                      <Checkbox
                        checked={allFilteredSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all products"
                      />
                    </TableHead>
                    <TableHead className="ps-3 pe-3 py-3 text-start">
                      <DataTableColumnHeader
                        column="name"
                        title={t('admin:products.product', 'Product')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3 text-start">
                      <DataTableColumnHeader
                        column="category"
                        title={t('admin:products.category', 'Category')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3 text-start">
                      <DataTableColumnHeader
                        column="base_price"
                        title={t('admin:products.price', 'Price')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="start"
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3 text-start">
                      <DataTableColumnHeader
                        column="available_count"
                        title={t('admin:products.stock', 'Inventory')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="start"
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3 text-center">
                      <DataTableColumnHeader
                        column="is_active"
                        title={t('admin:products.status', 'Status')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="center"
                      />
                    </TableHead>
                    <TableHead className="ps-3 pe-4 py-3 text-end font-mono text-[11px] uppercase tracking-wider text-muted-foreground w-28">
                      {t('admin:products.actions', 'Actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map((product) => {
                    const priceNum = Number(product.base_price)
                    const saleNum = product.sale_price ? Number(product.sale_price) : null
                    const hasDiscount = saleNum !== null && saleNum > 0 && saleNum < priceNum
                    const discountPct = hasDiscount
                      ? Math.round(((priceNum - saleNum!) / priceNum) * 100)
                      : 0
                    const isSelected = selectedIds.has(product.id)

                    return (
                      <TableRow
                        key={product.id}
                        data-state={isSelected ? 'selected' : undefined}
                        className="border-border/40 hover:bg-muted/20 transition-colors"
                      >
                        {/* Checkbox */}
                        <TableCell className="w-10 ps-4 pe-0 py-3 text-start">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleSelectRow(product.id)}
                            aria-label={`Select ${product.name}`}
                          />
                        </TableCell>

                        {/* Product Title, Thumbnail & SKU */}
                        <TableCell className="ps-3 pe-3 py-3 text-start">
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/${lang}/products/${product.id}`}
                              className="shrink-0 group block"
                            >
                              {(() => {
                                const coverUrl = getProductMainImageUrl(product)
                                return coverUrl ? (
                                  <img
                                    src={coverUrl}
                                    alt=""
                                    className="size-10 rounded-lg object-cover border border-border/40 group-hover:border-primary/50 transition-colors select-none"
                                  />
                                ) : (
                                  <div className="flex size-10 items-center justify-center rounded-lg bg-secondary/60 text-muted-foreground border border-border/40 group-hover:border-primary/50 transition-colors">
                                    <PackageCheck className="size-5" />
                                  </div>
                                )
                              })()}
                            </Link>

                            <div className="grid gap-0.5 min-w-0">
                              <Link
                                to={`/${lang}/products/${product.id}`}
                                className="font-medium text-sm text-foreground hover:underline truncate"
                              >
                                {product.name}
                              </Link>
                              <div className="flex items-center gap-1.5">
                                {product.sku ? (
                                  <button
                                    type="button"
                                    onClick={() => handleCopySku(product.sku)}
                                    className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    title={t('admin:products.copySku', 'Copy SKU')}
                                  >
                                    <span dir="ltr">{product.sku}</span>
                                    {copiedSku === product.sku ? (
                                      <Check className="size-2.5 text-emerald-500" />
                                    ) : (
                                      <Copy className="size-2.5 opacity-60 hover:opacity-100" />
                                    )}
                                  </button>
                                ) : (
                                  <span className="font-mono text-[10px] text-muted-foreground">
                                    {product.id.slice(0, 8)}
                                  </span>
                                )}
                                <a
                                  href={getStorefrontUrl(`/${lang}/products/${product.slug || product.id}`)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center size-5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
                                  title={t('admin:products.viewStorefront', 'View in Store')}
                                  aria-label={t('admin:products.viewStorefront', 'View in Store')}
                                >
                                  <ExternalLink className="size-3" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Category & Variant */}
                        <TableCell className="px-3 py-3 text-start">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="text-xs text-foreground font-medium">
                              {product.category?.name || '—'}
                            </span>
                            {product.variant && (
                              <Badge
                                variant="outline"
                                className="text-[9px] font-mono uppercase px-1.5 py-0 border-border/60 bg-muted/40 font-semibold"
                              >
                                {product.variant}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Dual Pricing (Shopify Style) */}
                        <TableCell className="px-3 py-3 text-start font-mono text-xs tabular-nums">
                          {hasDiscount ? (
                            <div className="space-y-0.5">
                              <div className="font-bold text-foreground">
                                {formatMoney(saleNum!, { currency: 'EGP', locale: lang })}
                              </div>
                              <div className="flex items-center justify-start gap-1.5 text-[10px]">
                                <span className="line-through text-muted-foreground">
                                  {formatMoney(priceNum, { currency: 'EGP', locale: lang })}
                                </span>
                                <span className="text-destructive font-bold">
                                  -{discountPct}%
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="font-semibold text-foreground">
                              {formatMoney(priceNum, { currency: 'EGP', locale: lang })}
                            </span>
                          )}
                        </TableCell>

                        {/* Digital Key Pool Inventory Health */}
                        <TableCell className="px-3 py-3 text-start">
                          <Link
                            to={`/${lang}/inventory?product=${product.id}`}
                            className="inline-flex items-center gap-1.5 font-mono text-xs hover:underline group"
                            title={t('admin:products.viewInventory', 'Manage Keys')}
                          >
                            <KeyRound className="size-3 text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0" />
                            {product.available_count > 5 ? (
                              <span className="tabular-nums font-medium text-foreground">
                                {t('admin:products.inventory.inStock', {
                                  count: product.available_count,
                                  defaultValue: `${product.available_count} in stock`,
                                })}
                              </span>
                            ) : product.available_count > 0 ? (
                              <span className="tabular-nums font-semibold text-amber-600 dark:text-amber-400">
                                {t('admin:products.inventory.lowStock', {
                                  count: product.available_count,
                                  defaultValue: `${product.available_count} left`,
                                })}
                              </span>
                            ) : product.preorder_enabled ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5"
                              >
                                {t('admin:products.inventory.preorder', 'Pre-order')}
                              </Badge>
                            ) : (
                              <Badge
                                variant="destructive"
                                className="text-[10px] font-mono bg-destructive/10 text-destructive border-destructive/20"
                              >
                                {t('admin:products.inventory.outOfStock', 'Out of stock')}
                              </Badge>
                            )}
                          </Link>
                        </TableCell>

                        {/* Shopify-Style Status Indicator Badge (Zero Slop) */}
                        <TableCell className="px-3 py-3 text-center">
                          {(product.is_active ?? true) ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="size-1.5 rounded-full bg-emerald-500" />
                              {t('admin:products.statusActive', 'Active')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/70">
                              <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                              {t('admin:products.statusDraft', 'Draft')}
                            </span>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="ps-3 pe-4 py-3 text-end">
                          <div className="inline-flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(product)}
                              className="h-7 px-2.5 text-xs font-medium cursor-pointer hover:bg-muted"
                            >
                              <Edit className="size-3.5 me-1" />
                              <span>{t('admin:common.edit', 'Edit')}</span>
                            </Button>
                            <DataTableRowActions
                              items={[
                                {
                                  label: t(
                                    'admin:products.viewStorefront',
                                    'View on Storefront',
                                  ),
                                  icon: ExternalLink,
                                  onClick: () =>
                                    window.open(
                                      getStorefrontUrl(
                                        `/${lang}/products/${product.slug || product.id}`,
                                      ),
                                      '_blank',
                                    ),
                                },
                                {
                                  label: t('admin:products.viewInventory', 'Manage Keys'),
                                  icon: KeyRound,
                                  onClick: () =>
                                    navigate(`/${lang}/inventory?product=${product.id}`),
                                },
                                {
                                  label: t('admin:products.copySku', 'Copy SKU'),
                                  icon: Copy,
                                  onClick: () => handleCopySku(product.sku || product.id),
                                },
                                {
                                  label: product.is_active
                                    ? t('admin:products.bulk.unpublish', 'Set as Draft')
                                    : t('admin:products.bulk.publish', 'Set as Active'),
                                  icon: product.is_active ? EyeOff : Eye,
                                  onClick: () =>
                                    handleToggleStatus(product.id, product.is_active),
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
