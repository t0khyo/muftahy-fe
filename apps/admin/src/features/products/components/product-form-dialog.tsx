import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { useTranslation } from 'react-i18next'
import { useCreateProduct, useUpdateProduct } from '../hooks/use-admin-products'
import type { ProductCategory, ProductResponse, ProductVariant } from '@workspace/domain/schemas/product'

interface ProductFormDialogProps {
  product?: ProductResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductFormDialog({
  product,
  open,
  onOpenChange,
}: ProductFormDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {product ? t('admin.common.save', 'Edit Product') : t('admin.emptyState.products.action', 'Add Product')}
          </DialogTitle>
          <DialogDescription>
            {product
              ? 'Update catalog pricing, active status, and license details.'
              : 'Add a new digital activation key product to the catalog.'}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <ProductFormContent
            key={product?.id ?? 'new'}
            product={product}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function ProductFormContent({
  product,
  onSuccess,
  onCancel,
}: {
  product?: ProductResponse | null
  onSuccess: () => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()

  const [name, setName] = React.useState(product ? product.name : '')
  const [category, setCategory] = React.useState<ProductCategory>(product ? product.category : 'windows')
  const [variant, setVariant] = React.useState<ProductVariant>(product ? product.variant : 'retail')
  const [basePrice, setBasePrice] = React.useState(product ? product.base_price : '')
  const [salePrice, setSalePrice] = React.useState(product?.sale_price ?? '')
  const [description, setDescription] = React.useState(product?.description ?? '')
  const [isActive, setIsActive] = React.useState(product ? product.is_active : true)
  const [preorderEnabled, setPreorderEnabled] = React.useState(product ? product.preorder_enabled : true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!basePrice) return

    try {
      if (product) {
        await updateMutation.mutateAsync({
          id: product.id,
          data: {
            base_price: basePrice,
            sale_price: salePrice || null,
            is_active: isActive,
            preorder_enabled: preorderEnabled,
            description: description || null,
          },
        })
      } else {
        if (!name) return
        await createMutation.mutateAsync({
          name,
          category,
          variant: variant ?? undefined,
          base_price: basePrice,
          sale_price: salePrice || undefined,
          preorder_enabled: preorderEnabled,
          description: description || undefined,
        })
      }
      onSuccess()
    } catch {
      // Handled
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 mt-3">
      {!product && (
        <div className="space-y-1">
          <Label htmlFor="prod-name">Product Name</Label>
          <Input
            id="prod-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Windows 11 Pro"
            required
          />
        </div>
      )}

      {!product && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="prod-cat">Category</Label>
            <select
              id="prod-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="windows">Windows</option>
              <option value="office">Office</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="prod-variant">Variant</Label>
            <select
              id="prod-variant"
              value={variant ?? 'retail'}
              onChange={(e) => setVariant(e.target.value as ProductVariant)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="retail">Retail</option>
              <option value="oem">OEM</option>
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="prod-price">Base Price (EGP)</Label>
          <Input
            id="prod-price"
            type="text"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            placeholder="e.g. 585.00"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="prod-sale-price">Sale Price (Optional)</Label>
          <Input
            id="prod-sale-price"
            type="text"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            placeholder="e.g. 499.00"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="prod-desc">Description</Label>
        <textarea
          id="prod-desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Product description and license features..."
          className="w-full rounded-md border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="space-y-2 pt-1">
        {product && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="prod-active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(Boolean(checked))}
            />
            <Label htmlFor="prod-active" className="text-xs font-normal cursor-pointer">
              Product is active in catalog
            </Label>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Checkbox
            id="prod-preorder"
            checked={preorderEnabled}
            onCheckedChange={(checked) => setPreorderEnabled(Boolean(checked))}
          />
          <Label htmlFor="prod-preorder" className="text-xs font-normal cursor-pointer">
            Allow preorder backorders when stock is 0
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('admin.common.cancel', 'Cancel')}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? t('admin.common.loading', 'Saving...')
            : t('admin.common.save', 'Save Changes')}
        </Button>
      </div>
    </form>
  )
}
