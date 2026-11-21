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

export function AdminProductsRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t } = useTranslation(['admin'])

  const [searchQuery, setSearchQuery] = React.useState('')
  const [formDialogOpen, setFormDialogOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<ProductResponse | null>(null)

  const { data: products, isLoading } = useAdminProducts()
  const statusMutation = useUpdateProductStatus()

  const filteredProducts = React.useMemo(() => {
    const items = products || []
    if (!searchQuery.trim()) return items
    const query = searchQuery.toLowerCase().trim()
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.category && p.category.toLowerCase().includes(query))
    )
  }, [products, searchQuery])

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
    <div className="space-y-6 text-start max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {t('admin:products.title', 'Products & SKUs')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('admin:products.subtitle', 'Configure software licenses, base pricing, release dates, and visibility')}
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0 cursor-pointer shadow-xs">
          <Plus className="size-4" />
          <span>{t('admin:products.addProduct', 'Add Product')}</span>
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute start-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t('admin:products.searchPlaceholder', 'Search by product name or category...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 h-9 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-border">
        <CardHeader className="p-4 pb-2 text-start">
          <CardTitle className="text-base font-semibold">
            {t('admin:products.catalogTitle', 'Product Catalog')}
            <span className="ms-2 font-mono text-xs font-normal text-muted-foreground">
              ({filteredProducts.length} {t('admin:common.records', 'records')})
            </span>
          </CardTitle>
          <CardDescription>
            {t('admin:products.catalogDesc', 'Active products are visible to buyers on the storefront.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
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
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">{t('admin:products.product', 'Product')}</TableHead>
                  <TableHead className="text-start">{t('admin:products.category', 'Category')}</TableHead>
                  <TableHead className="text-start">{t('admin:products.price', 'Base Price')}</TableHead>
                  <TableHead className="text-start">{t('admin:products.stock', 'Available Keys')}</TableHead>
                  <TableHead className="text-start">{t('admin:products.status', 'Active')}</TableHead>
                  <TableHead className="text-end">{t('admin:common.actions', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const priceNum = Number(product.base_price)
                  const hasKeys = product.available_count > 0

                  return (
                    <TableRow key={product.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="text-start">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
                            <PackageCheck className="size-5" />
                          </div>
                          <div className="grid gap-0.5">
                            <span className="font-semibold text-sm text-foreground">
                              {product.name}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {product.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-start">
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {product.category}
                          </Badge>
                          {product.variant && (
                            <Badge variant="secondary" className="text-[9px] uppercase">
                              {product.variant}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-start font-mono text-xs font-semibold">
                        {formatMoney(priceNum, { currency: 'EGP', locale: lang })}
                      </TableCell>
                      <TableCell className="text-start">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <KeyRound className="size-3.5 text-muted-foreground" />
                          <span className={hasKeys ? 'font-semibold text-foreground' : 'text-rose-500 font-bold'}>
                            {product.available_count}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-start">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={product.is_active}
                            onCheckedChange={() => handleToggleStatus(product.id, product.is_active)}
                            disabled={statusMutation.isPending}
                          />
                          <span className="text-xs text-muted-foreground">
                            {product.is_active ? (
                              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
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
                      <TableCell className="text-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(product)}
                          className="h-8 gap-1.5 text-xs cursor-pointer"
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

      {/* Product Form Dialog */}
      <ProductFormDialog
        product={editingProduct}
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
      />
    </div>
  )
}
