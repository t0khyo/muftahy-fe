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
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Textarea } from '@workspace/ui/components/textarea'
import { Field, FieldLabel, FieldGroup } from '@workspace/ui/components/field'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@workspace/ui/components/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
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
      <DialogContent className="sm:max-w-xl overflow-y-auto max-h-[90vh] p-6">
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
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
      <FieldGroup>
        {!product && (
          <Field>
            <FieldLabel htmlFor="prod-name">Product Name</FieldLabel>
            <Input
              id="prod-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Windows 11 Pro"
              className="h-9"
              required
            />
          </Field>
        )}

        {!product && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="prod-cat">Category</FieldLabel>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as ProductCategory)}
              >
                <SelectTrigger id="prod-cat" className="w-full h-9">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="windows">Windows</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="prod-variant">Variant</FieldLabel>
              <Select
                value={variant ?? 'retail'}
                onValueChange={(val) => setVariant(val as ProductVariant)}
              >
                <SelectTrigger id="prod-variant" className="w-full h-9">
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="oem">OEM</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="prod-price">Base Price</FieldLabel>
            <InputGroup className="h-9">
              <InputGroupInput
                id="prod-price"
                type="text"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="585.00"
                className="font-mono"
                required
              />
              <InputGroupAddon align="inline-end" className="text-xs text-muted-foreground font-mono">
                EGP
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="prod-sale-price">Sale Price (Optional)</FieldLabel>
            <InputGroup className="h-9">
              <InputGroupInput
                id="prod-sale-price"
                type="text"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="499.00"
                className="font-mono"
              />
              <InputGroupAddon align="inline-end" className="text-xs text-muted-foreground font-mono">
                EGP
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="prod-desc">Description</FieldLabel>
          <Textarea
            id="prod-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product description and license features..."
            className="min-h-20"
          />
        </Field>
      </FieldGroup>

      <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-3">
        {product && (
          <Field orientation="horizontal" className="justify-between">
            <FieldLabel htmlFor="prod-active" className="text-xs font-normal cursor-pointer leading-tight">
              Product is active in catalog
            </FieldLabel>
            <Checkbox
              id="prod-active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(Boolean(checked))}
            />
          </Field>
        )}
        <Field orientation="horizontal" className="justify-between">
          <FieldLabel htmlFor="prod-preorder" className="text-xs font-normal cursor-pointer leading-tight">
            Allow preorder backorders when stock is 0
          </FieldLabel>
          <Checkbox
            id="prod-preorder"
            checked={preorderEnabled}
            onCheckedChange={(checked) => setPreorderEnabled(Boolean(checked))}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-4">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          {t('admin.common.cancel', 'Cancel')}
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending
            ? t('admin.common.loading', 'Saving...')
            : t('admin.common.save', 'Save Changes')}
        </Button>
      </div>
    </form>
  )
}
