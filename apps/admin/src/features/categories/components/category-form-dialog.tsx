import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Switch } from '@workspace/ui/components/switch'
import { Textarea } from '@workspace/ui/components/textarea'
import { Field, FieldLabel } from '@workspace/ui/components/field'
import { useTranslation } from 'react-i18next'
import { slugify } from '@workspace/domain/schemas/product'
import type { CategoryResponse } from '@workspace/domain/schemas/product'
import { useCreateCategory, useUpdateCategory } from '../hooks/use-admin-categories'

export interface CategoryFormDialogProps {
  category?: CategoryResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryFormDialog({
  category,
  open,
  onOpenChange,
}: CategoryFormDialogProps) {
  const { t } = useTranslation(['admin'])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh] p-6 text-start">
        <DialogHeader>
          <DialogTitle>
            {category
              ? t('admin:categories.editCategory', 'Edit Category')
              : t('admin:categories.addCategory', 'Add Category')}
          </DialogTitle>
          <DialogDescription>
            {t('admin:categories.subtitle', 'Organize products into catalog categories with distinct codes, slugs, and display orders.')}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <CategoryFormContent
            key={category?.id ?? 'new'}
            category={category}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function CategoryFormContent({
  category,
  onSuccess,
  onCancel,
}: {
  category?: CategoryResponse | null
  onSuccess: () => void
  onCancel: () => void
}) {
  const { t } = useTranslation(['admin'])
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()

  const isEditing = Boolean(category)
  const isCodeImmutable = isEditing && (category?.product_count ?? 0) > 0

  const [name, setName] = React.useState(category?.name ?? '')
  const [code, setCode] = React.useState(category?.code ?? '')
  const [slug, setSlug] = React.useState(category?.slug ?? '')
  const [description, setDescription] = React.useState(category?.description ?? '')
  const [displayOrder, setDisplayOrder] = React.useState<number>(category?.display_order ?? 0)
  const [isActive, setIsActive] = React.useState(category?.is_active ?? true)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const previewSlug = slug.trim() || slugify(name)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!name.trim()) {
      setErrorMsg('Category name is required')
      return
    }

    const trimmedCode = code.trim().toUpperCase()
    if (!trimmedCode) {
      setErrorMsg('Category code is required')
      return
    }

    try {
      if (category) {
        await updateMutation.mutateAsync({
          id: category.id,
          data: {
            name: name.trim(),
            code: isCodeImmutable ? undefined : trimmedCode,
            slug: slug.trim() || undefined,
            description: description.trim() || null,
            display_order: displayOrder,
            is_active: isActive,
          },
        })
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          code: trimmedCode,
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          display_order: displayOrder,
          is_active: isActive,
        })
      }
      onSuccess()
    } catch {
      // Toast handles server errors
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {errorMsg && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Name */}
      <Field>
        <FieldLabel htmlFor="category-name">
          {t('admin:categories.name', 'Name')} *
        </FieldLabel>
        <Input
          id="category-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Operating Systems"
          required
        />
      </Field>

      {/* Code */}
      <Field>
        <FieldLabel htmlFor="category-code">
          {t('admin:categories.code', 'Code')} *
        </FieldLabel>
        <Input
          id="category-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. OS"
          maxLength={10}
          disabled={isCodeImmutable}
          dir="ltr"
          className="font-mono uppercase"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          {isCodeImmutable
            ? t('admin:categories.codeImmutableWithProducts', 'Category code cannot be changed once products are assigned.')
            : t('admin:categories.codeHint', '2-10 uppercase alphanumeric characters (e.g., OS, SEC, OFF).')}
        </p>
      </Field>

      {/* Slug */}
      <Field>
        <FieldLabel htmlFor="category-slug">
          {t('admin:categories.slug', 'Slug')}
        </FieldLabel>
        <Input
          id="category-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          placeholder={previewSlug || 'auto-generated'}
          dir="ltr"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {t('admin:categories.slugHint', 'URL identifier. Leave empty to generate automatically.')}
          {previewSlug && (
            <span className="ms-1 font-mono text-foreground/80">
              Preview: /{previewSlug}
            </span>
          )}
        </p>
      </Field>

      {/* Description */}
      <Field>
        <FieldLabel htmlFor="category-description">
          {t('admin:categories.description', 'Description')}
        </FieldLabel>
        <Textarea
          id="category-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description for search and category pages..."
          rows={3}
        />
      </Field>

      {/* Display Order */}
      <Field>
        <FieldLabel htmlFor="category-order">
          {t('admin:categories.displayOrder', 'Display Order')}
        </FieldLabel>
        <Input
          id="category-order"
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
          className="w-32"
          min={0}
        />
      </Field>

      {/* Active Status */}
      <div className="flex items-center justify-between rounded-xl border border-border/40 p-3 bg-secondary/10">
        <div>
          <label htmlFor="category-active" className="text-sm font-medium text-foreground cursor-pointer">
            {t('admin:categories.status', 'Status')}
          </label>
          <p className="text-xs text-muted-foreground">
            {isActive
              ? t('admin:categories.active', 'Active')
              : t('admin:categories.inactive', 'Inactive')}
          </p>
        </div>
        <Switch
          id="category-active"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
      </div>

      <DialogFooter className="gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('admin:categories.cancel', 'Cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t('admin:categories.saving', 'Saving...')
            : t('admin:categories.save', 'Save Category')}
        </Button>
      </DialogFooter>
    </form>
  )
}

