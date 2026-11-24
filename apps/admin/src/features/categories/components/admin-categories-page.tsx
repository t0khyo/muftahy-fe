import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import type { CategoryResponse } from '@workspace/domain/schemas/product'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Switch } from '@workspace/ui/components/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { AdminPageHeader } from '../../../components/admin-page-header'
import { EmptyState } from '../../dashboard/components/empty-state'
import { DataTableColumnHeader } from '../../../components/data-table-column-header'
import {
  DataTableToolbar,
  DataTableSearch,
  DataTableActiveFilters,
  type ActiveFilterChipItem,
} from '../../../components/data-table/data-table-toolbar'
import { DataTablePagination } from '../../../components/data-table/data-table-pagination'
import { useDataTableSort } from '../../../hooks/use-data-table-sort'
import { useDataTablePagination } from '../../../hooks/use-data-table-pagination'
import {
  useAdminCategories,
  useUpdateCategory,
  useDeleteCategory,
} from '../hooks/use-admin-categories'
import { CategoryFormDialog } from './category-form-dialog'

export function AdminCategoriesPage() {
  const { t } = useTranslation(['admin'])
  const { data: categories = [], isLoading } = useAdminCategories()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all')
  const [formDialogOpen, setFormDialogOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<CategoryResponse | null>(null)

  // Delete modal state
  const [categoryToDelete, setCategoryToDelete] = React.useState<CategoryResponse | null>(null)

  const statusCounts = React.useMemo(() => {
    const all = categories.length
    const active = categories.filter((c) => c.is_active).length
    const inactive = all - active
    return { all, active, inactive }
  }, [categories])

  const filteredCategories = React.useMemo(() => {
    let items = categories
    if (statusFilter === 'active') {
      items = items.filter((c) => c.is_active)
    } else if (statusFilter === 'inactive') {
      items = items.filter((c) => !c.is_active)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q),
      )
    }
    return items
  }, [categories, statusFilter, searchQuery])

  const { sortedItems, sortConfig, toggleSort } = useDataTableSort<CategoryResponse>(
    filteredCategories,
    { column: 'display_order', direction: 'asc' },
    {
      product_count: (c) => Number(c.product_count),
      display_order: (c) => Number(c.display_order),
    }
  )

  const pagination = useDataTablePagination(sortedItems, { defaultPageSize: 10 })
  const { resetPage } = pagination

  React.useEffect(() => {
    resetPage()
  }, [searchQuery, statusFilter, resetPage])

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

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setFormDialogOpen(true)
  }

  const handleOpenEdit = (category: CategoryResponse) => {
    setEditingCategory(category)
    setFormDialogOpen(true)
  }

  const handleToggleStatus = (category: CategoryResponse) => {
    updateMutation.mutate({
      id: category.id,
      data: { is_active: !category.is_active },
    })
  }

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return
    try {
      await deleteMutation.mutateAsync(categoryToDelete.id)
      setCategoryToDelete(null)
    } catch {
      // Toast handles error
    }
  }

  return (
    <div className="space-y-6 text-start w-full">
      <AdminPageHeader
        title={t('admin:categories.title', 'Categories')}
        description={t(
          'admin:categories.subtitle',
          'Organize products into catalog categories with distinct codes, slugs, and display orders.',
        )}
      >
        <Button onClick={handleOpenCreate} className="gap-2 cursor-pointer">
          <Plus className="size-4" />
          <span>{t('admin:categories.addCategory', 'Add Category')}</span>
        </Button>
      </AdminPageHeader>

      {/* Streamlined Toolbar */}
      <DataTableToolbar
        search={
          <DataTableSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t(
              'admin:categories.searchPlaceholder',
              'Search categories by name, code, or slug...',
            )}
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

      {/* Table / Empty State */}
      {isLoading ? (
        <div className="p-12 text-center text-sm text-muted-foreground">
          {t('admin:common.loading', { defaultValue: 'Loading categories...' })}
        </div>
      ) : filteredCategories.length === 0 ? (
        categories.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title={t('admin:categories.emptyTitle', 'No categories found')}
            description={t(
              'admin:categories.emptyDescription',
              'Create your first category to start organizing products in your catalog.',
            )}
            actionLabel={t('admin:categories.addCategory', 'Add Category')}
            onAction={handleOpenCreate}
          />
        ) : (
          <div className="p-12 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
            {t('admin:common.noFilteredResults', 'No records match your active filters')}
          </div>
        )
      ) : (
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="ps-4 pe-3 py-3.5 text-start">
                  <DataTableColumnHeader
                    column="name"
                    title={t('admin:categories.name', 'Name')}
                    sortConfig={sortConfig}
                    onSort={toggleSort}
                  />
                </TableHead>
                <TableHead className="px-3 py-3.5 text-start">
                  <DataTableColumnHeader
                    column="code"
                    title={t('admin:categories.code', 'Code')}
                    sortConfig={sortConfig}
                    onSort={toggleSort}
                  />
                </TableHead>
                <TableHead className="px-3 py-3.5 text-start">
                  <DataTableColumnHeader
                    column="slug"
                    title={t('admin:categories.slug', 'Slug')}
                    sortConfig={sortConfig}
                    onSort={toggleSort}
                  />
                </TableHead>
                <TableHead className="px-3 py-3.5 text-center">
                  <DataTableColumnHeader
                    column="product_count"
                    title={t('admin:categories.productCount', 'Products')}
                    sortConfig={sortConfig}
                    onSort={toggleSort}
                    align="center"
                  />
                </TableHead>
                <TableHead className="px-3 py-3.5 text-center">
                  <DataTableColumnHeader
                    column="display_order"
                    title={t('admin:categories.displayOrder', 'Order')}
                    sortConfig={sortConfig}
                    onSort={toggleSort}
                    align="center"
                  />
                </TableHead>
                <TableHead className="px-3 py-3.5 text-center">
                  {t('admin:categories.status', 'Status')}
                </TableHead>
                <TableHead className="ps-3 pe-4 py-3.5 text-end">
                  {t('admin:categories.actions', 'Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paginatedItems.map((category) => {
                const hasProducts = category.product_count > 0

                return (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium text-foreground">
                      <div className="flex flex-col">
                        <span>{category.name}</span>
                        {category.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {category.description}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="secondary"
                        dir="ltr"
                        className="font-mono text-xs font-semibold uppercase"
                      >
                        {category.code}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span dir="ltr" className="font-mono text-xs text-muted-foreground">
                        /{category.slug}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant={hasProducts ? 'default' : 'outline'}
                        className="text-xs font-mono"
                      >
                        {category.product_count}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center font-mono text-xs">
                      {category.display_order}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Switch
                          checked={category.is_active}
                          onCheckedChange={() => handleToggleStatus(category)}
                          aria-label={`${category.name} status`}
                        />
                      </div>
                    </TableCell>

                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenEdit(category)}
                          aria-label={t('admin:categories.editCategory', 'Edit Category')}
                          className="cursor-pointer text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="size-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setCategoryToDelete(category)}
                          aria-label={t('admin:categories.deleteCategory', 'Delete Category')}
                          className="cursor-pointer text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {filteredCategories.length > 0 && (
            <DataTablePagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
            />
          )}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <CategoryFormDialog
        category={editingCategory}
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
      />

      {/* Delete Confirmation Dialog with Has-Products Guard */}
      <Dialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <DialogContent className="sm:max-w-md text-start">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5 shrink-0" />
              <span>{t('admin:categories.deleteConfirmTitle', 'Delete Category')}</span>
            </DialogTitle>
            <DialogDescription render={<div className="space-y-2 pt-2" />}>
              {categoryToDelete && categoryToDelete.product_count > 0 ? (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm leading-relaxed">
                  {t(
                    'admin:categories.deleteGuardHasProducts',
                    'Cannot delete category with assigned products. Reassign or remove all products first.',
                  )}
                </div>
              ) : (
                <p>
                  {t(
                    'admin:categories.deleteConfirmDescription',
                    'Are you sure you want to delete this category? This action cannot be undone.',
                  )}
                </p>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCategoryToDelete(null)}
            >
              {t('admin:categories.cancel', 'Cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={
                !categoryToDelete ||
                categoryToDelete.product_count > 0 ||
                deleteMutation.isPending
              }
            >
              {deleteMutation.isPending
                ? t('admin:categories.saving', 'Saving...')
                : t('admin:categories.deleteCategory', 'Delete Category')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
