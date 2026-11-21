import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  PackageCheck,
  Plus,
  Search,
  Edit,
  KeyRound,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import {
  useAdminProducts,
  useUpdateProductStatus,
} from '../features/products/hooks/use-admin-products'
import type { ProductResponse } from '@workspace/domain/schemas/product'
import { formatMoney } from '@workspace/domain/formatters/money'
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
import { ProductFormDialog } from '../features/products/components/product-form-dialog'
import { EmptyState } from '../features/dashboard/components/empty-state'
import { AdminPageHeader } from '../components/admin-page-header'

export function AdminProductsRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t } = useTranslation(['admin'])

  const [searchQuery, setSearchQuery] = React.useState('')
  const [formDialogOpen, setFormDialogOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<ProductResponse | null>(null)

  const { data: products, isLoading } = useAdminProducts()
  const statusMutation = useUpdateProductStatus()

  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')

  const filteredProducts = React.useMemo(() => {
    let items = products || []
    if (selectedCategory !== 'all') {
      items = items.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase())
    }
    if (!searchQuery.trim()) return items
    const query = searchQuery.toLowerCase().trim()
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.category && p.category.toLowerCase().includes(query))
    )
  }, [products, searchQuery, selectedCategory])

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setFormDialogOpen(true)
  }

  const handleOpenEdit = (product: ProductResponse) => {
    setEditingProduct(product)
    setFormDialogOpen(true)
  }

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    statusMutation.mutate({ id, is_active: !currentStatus })
  }

  return (
    <div className="space-y-6 text-start w-full">
      {/* Header */}
      <AdminPageHeader
        title={t('admin:products.title', 'Products & SKUs')}
        description={t('admin:products.subtitle', 'Configure software licenses, base pricing, release dates, and visibility')}
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
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t('admin:products.searchPlaceholder', 'Search by product name or category...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 h-9 text-xs sm:text-sm bg-muted/30 border-border/70 focus-visible:bg-background transition-colors"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'windows', 'office'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {cat === 'all' ? t('admin:common.all', 'All') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <Card className="border-border/80 shadow-none overflow-hidden">
          <CardHeader className="p-4 pb-3 text-start border-b border-border/40 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold tracking-tight">
                  {t('admin:products.catalogTitle', 'Product Catalog')}
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
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:products.product', 'Product')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:products.category', 'Category')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:products.price', 'Base Price')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:products.stock', 'Available Keys')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:products.status', 'Active')}</TableHead>
                    <TableHead className="text-end font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:common.actions', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const priceNum = Number(product.base_price)
                    const hasKeys = product.available_count > 0

                    return (
                      <TableRow key={product.id} className="border-border/40 hover:bg-muted/20 transition-colors">
                        <TableCell className="text-start py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/5 text-primary border border-primary/10 shrink-0">
                              <PackageCheck className="size-5" />
                            </div>
                            <div className="grid gap-0.5 min-w-0">
                              <span className="font-semibold text-sm text-foreground truncate">
                                {product.name}
                              </span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {product.id.slice(0, 8)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-start py-3.5">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <Badge variant="outline" className="text-[10px] font-mono capitalize border-border/60 bg-muted/40">
                              {product.category}
                            </Badge>
                            {product.variant && (
                              <Badge variant="secondary" className="text-[9px] font-mono uppercase font-bold tracking-wider">
                                {product.variant}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-start font-mono text-xs font-semibold tabular-nums py-3.5">
                          {formatMoney(priceNum, { currency: 'EGP', locale: lang })}
                        </TableCell>
                        <TableCell className="text-start py-3.5">
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <KeyRound className="size-3.5 text-muted-foreground" />
                            <span className={hasKeys ? 'font-semibold text-foreground tabular-nums' : 'text-rose-500 font-bold tabular-nums'}>
                              {product.available_count}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-start py-3.5">
                          <div className="flex items-center gap-2">
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
                        <TableCell className="text-end py-3.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(product)}
                            className="h-8 gap-1.5 text-xs font-medium cursor-pointer hover:text-foreground"
                          >
                            <Edit className="size-3.5" />
                            <span>{t('admin:common.edit', 'Edit')}</span>
                          </Button>
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

      {/* Product Form Dialog */}
      <ProductFormDialog
        product={editingProduct}
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
      />
    </div>
  )
}
