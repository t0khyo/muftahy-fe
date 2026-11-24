import * as React from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  ArrowRight,
  Save,
  ExternalLink,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { Switch } from '@workspace/ui/components/switch'
import { Badge } from '@workspace/ui/components/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Field, FieldLabel } from '@workspace/ui/components/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { toast } from '@workspace/ui/components/sonner'
import { formatMoney } from '@workspace/domain/formatters/money'
import { slugify, validateSkuForCategory } from '@workspace/domain/schemas/product'
import type { CategoryResponse, ProductResponse, ProductVariant } from '@workspace/domain/schemas/product'
import { getProductService } from '@workspace/api/factory'
import { getStorefrontUrl } from '../../../lib/storefront-url'
import {
  useAdminProductDetail,
  useCreateProduct,
  useUpdateProduct,
} from '../hooks/use-admin-products'
import { useAdminCategories } from '../../categories/hooks/use-admin-categories'
import { ProductMediaSection, type StagedImage, type StagedThumbnail } from './product-media-section'

const EMPTY_PRODUCT_IMAGES: ProductResponse['images'] = []

export interface ProductEditorPageProps {
  productId?: string
}

export function ProductEditorPage({ productId }: ProductEditorPageProps) {
  const isEditing = Boolean(productId && productId !== 'new')
  const { data: product, isLoading: isLoadingProduct } = useAdminProductDetail(productId || '')
  const { data: categories = [], isLoading: isLoadingCategories } = useAdminCategories()

  if (isEditing && isLoadingProduct) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <ProductEditorForm
      key={product?.id ?? 'new'}
      productId={productId}
      product={product}
      categories={categories}
      isLoadingCategories={isLoadingCategories}
    />
  )
}

interface ProductEditorFormProps {
  productId?: string
  product?: ProductResponse | null
  categories: CategoryResponse[]
  isLoadingCategories: boolean
}

function ProductEditorForm({
  productId,
  product,
  categories,
  isLoadingCategories,
}: ProductEditorFormProps) {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation(['admin'])
  const isRtl = i18n.language === 'ar'

  const isEditing = Boolean(productId && productId !== 'new')

  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()

  // Form State initialized directly from loaded product and categories
  const [name, setName] = React.useState(product?.name || '')
  const [slug, setSlug] = React.useState(product?.slug || '')
  const [description, setDescription] = React.useState(product?.description || '')
  const [basePrice, setBasePrice] = React.useState(product?.base_price ? String(product.base_price) : '')
  const [salePrice, setSalePrice] = React.useState(product?.sale_price ? String(product.sale_price) : '')
  const [categoryId, setCategoryId] = React.useState(product?.category?.id || '')
  const [variant, setVariant] = React.useState<ProductVariant | 'none'>(product?.variant || 'none')
  const [sku, setSku] = React.useState(product?.sku || '')
  const [isActive, setIsActive] = React.useState(product ? (product.is_active ?? true) : true)
  const [isFeatured, setIsFeatured] = React.useState(product ? (product.is_featured ?? false) : false)
  const [preorderEnabled, setPreorderEnabled] = React.useState(product ? product.preorder_enabled : true)

  // Staged Media for creation
  const [stagedImages, setStagedImages] = React.useState<StagedImage[]>([])
  const [stagedThumbnail, setStagedThumbnail] = React.useState<StagedThumbnail | null>(null)
  const [isUploadingStaged, setIsUploadingStaged] = React.useState(false)

  // Effective category resolution: use explicitly selected category or fall back to first category
  const effectiveCategoryId = categoryId || (categories.length > 0 ? categories[0].id : '')

  const selectedCategory = React.useMemo(() => {
    return categories.find((c) => c.id === effectiveCategoryId) || null
  }, [categories, effectiveCategoryId])

  const previewSlug = slug.trim() || slugify(name)

  const categoryItems = React.useMemo(() => {
    return categories.map((cat) => ({
      value: cat.id,
      label: `${cat.name} (${cat.code})`,
    }))
  }, [categories])

  const variantItems = React.useMemo(
    () => [
      { value: 'none', label: t('admin:productEditor.variantNone', 'None (Standard)') },
      { value: 'retail', label: t('admin:productEditor.variantRetail', 'Retail') },
      { value: 'oem', label: t('admin:productEditor.variantOem', 'OEM') },
    ],
    [t],
  )

  // Validate SKU against selected category code (derived synchronously)
  const skuError = React.useMemo(() => {
    if (!sku.trim()) return null
    if (!selectedCategory) return null
    const isValid = validateSkuForCategory(sku.trim(), selectedCategory.code)
    if (!isValid) {
      return t('admin:productEditor.skuMismatch', {
        code: selectedCategory.code,
        defaultValue: `SKU must begin with ${selectedCategory.code}- and match format ${selectedCategory.code}-XXXX-XXXX-XXXX`,
      })
    }
    return null
  }, [sku, selectedCategory, t])

  // Validate Sale Price < Base Price (derived synchronously)
  const priceError = React.useMemo(() => {
    if (salePrice && basePrice) {
      const numBaseVal = parseFloat(basePrice)
      const numSaleVal = parseFloat(salePrice)
      if (!isNaN(numBaseVal) && !isNaN(numSaleVal) && numSaleVal >= numBaseVal) {
        return 'Sale price must be less than base price'
      }
    }
    return null
  }, [basePrice, salePrice])

  // Price calculations
  const numBase = parseFloat(basePrice) || 0
  const numSale = parseFloat(salePrice) || 0
  const effectivePrice = numSale > 0 && numSale < numBase ? numSale : numBase
  const discountPercent =
    numSale > 0 && numSale < numBase
      ? Math.round(((numBase - numSale) / numBase) * 100)
      : 0

  const isSubmitting = createMutation.isPending || updateMutation.isPending || isUploadingStaged

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Product title is required')
      return
    }
    if (!basePrice || numBase <= 0) {
      toast.error('Valid base price is required')
      return
    }
    if (priceError) {
      toast.error(priceError)
      return
    }
    if (!effectiveCategoryId) {
      toast.error('Category is required')
      return
    }
    if (!sku.trim()) {
      toast.error('SKU is required')
      return
    }
    if (selectedCategory && !validateSkuForCategory(sku.trim(), selectedCategory.code)) {
      toast.error(skuError || 'Invalid SKU format for selected category')
      return
    }

    try {
      if (isEditing && product) {
        await updateMutation.mutateAsync({
          id: product.id,
          data: {
            name: name.trim(),
            slug: slug.trim() || undefined,
            description: description.trim() || undefined,
            base_price: basePrice.trim(),
            sale_price: salePrice.trim() || null,
            category_id: effectiveCategoryId || undefined,
            variant: variant !== 'none' ? variant : undefined,
            sku: sku.trim() || undefined,
            is_active: isActive,
            is_featured: isFeatured,
            preorder_enabled: preorderEnabled,
          },
        })
      } else {
        const newProduct = await createMutation.mutateAsync({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          base_price: basePrice.trim(),
          sale_price: salePrice.trim() || null,
          category_id: effectiveCategoryId,
          variant: variant !== 'none' ? variant : undefined,
          sku: sku.trim(),
          is_active: isActive,
          is_featured: isFeatured,
          preorder_enabled: preorderEnabled,
        })

        // Upload staged images and thumbnail to the new product if any
        if (stagedImages.length > 0 || stagedThumbnail) {
          setIsUploadingStaged(true)
          const service = getProductService('admin')
          let hasPartialFailure = false

          if (stagedThumbnail) {
            try {
              await service.uploadProductThumbnail(newProduct.id, stagedThumbnail.file)
            } catch {
              hasPartialFailure = true
            }
          }

          for (const staged of stagedImages) {
            try {
              await service.uploadProductImage(newProduct.id, {
                file: staged.file,
                is_primary: staged.is_primary,
              })
            } catch {
              hasPartialFailure = true
            }
          }
          setIsUploadingStaged(false)

          if (hasPartialFailure) {
            toast.error(
              t(
                'admin:productEditor.partialUploadError',
                'Product created, but some images failed to upload. Click retry on failed images.',
              ),
            )
          }
        }

        navigate(`/${lang}/products/${newProduct.id}`)
      }
    } catch {
      // Toast handled by mutation hooks
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-start max-w-7xl mx-auto pb-12">
      {/* Header with back navigation and action buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="space-y-1">
          <Link
            to={`/${lang}/products`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-1"
          >
            {isRtl ? <ArrowRight className="size-3.5" /> : <ArrowLeft className="size-3.5" />}
            <span>{t('admin:nav.products', 'Products')}</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {isEditing
              ? t('admin:productEditor.editTitle', 'Edit Product')
              : t('admin:productEditor.createTitle', 'Add Product')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isEditing
              ? t('admin:productEditor.editSubtitle', 'Update product details, pricing, organization, and media assets.')
              : t('admin:productEditor.createSubtitle', 'Create a new digital product listing with SKU, pricing, and media.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {isEditing && product && (
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(getStorefrontUrl(`/${lang}/products/${product.slug || product.id}`), '_blank')}
              className="gap-1.5 cursor-pointer"
              title={t('admin:products.viewStorefront', 'View in Store')}
            >
              <ExternalLink className="size-3.5" />
              <span>{t('admin:products.viewStorefront', 'View in Store')}</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/${lang}/products`)}
            disabled={isSubmitting}
          >
            {t('admin:productEditor.cancel', { defaultValue: 'Cancel' })}
          </Button>

          <Button type="submit" disabled={isSubmitting} className="gap-2 cursor-pointer shadow-sm">
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span>
              {isSubmitting
                ? t('admin:productEditor.saving', 'Saving...')
                : t('admin:productEditor.save', 'Save Product')}
            </span>
          </Button>
        </div>
      </div>

      {/* 2-Column Responsive Layout (Shopify style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: General Details, Media, Pricing (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. General Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                {t('admin:productEditor.generalDetails', 'General Details')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Title */}
              <Field>
                <FieldLabel htmlFor="product-name">
                  {t('admin:productEditor.name', 'Product Title')} *
                </FieldLabel>
                <Input
                  id="product-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('admin:productEditor.namePlaceholder', 'e.g. Windows 11 Professional')}
                  required
                />
              </Field>

              {/* URL Slug */}
              <Field>
                <FieldLabel htmlFor="product-slug">
                  {t('admin:productEditor.slug', 'URL Slug')}
                </FieldLabel>
                <Input
                  id="product-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder={previewSlug || t('admin:productEditor.slugPlaceholder', 'Auto-generated from title')}
                  dir="ltr"
                  className="font-mono text-sm"
                />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <span>
                    Preview: <span className="font-mono text-foreground/80">/products/{previewSlug}</span>
                  </span>
                  {isEditing && product && (
                    <a
                      href={getStorefrontUrl(`/${lang}/products/${previewSlug || product.id}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:underline gap-0.5 ms-1"
                      title={t('admin:products.viewStorefront', 'View in Store')}
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </Field>

              {/* Description */}
              <Field>
                <FieldLabel htmlFor="product-description">
                  {t('admin:productEditor.description', 'Description')}
                </FieldLabel>
                <Textarea
                  id="product-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t(
                    'admin:productEditor.descriptionPlaceholder',
                    'Detailed product license and usage terms...',
                  )}
                  rows={4}
                />
              </Field>
            </CardContent>
          </Card>

          {/* 2. Media Section */}
          <Card>
            <CardContent className="pt-6">
              <ProductMediaSection
                productId={isEditing ? product?.id : undefined}
                thumbnailUrl={isEditing ? (product?.thumbnail_url ?? null) : null}
                liveImages={product?.images ?? EMPTY_PRODUCT_IMAGES}
                stagedImages={stagedImages}
                onStagedImagesChange={setStagedImages}
                stagedThumbnail={stagedThumbnail}
                onStagedThumbnailChange={setStagedThumbnail}
              />
            </CardContent>
          </Card>

          {/* 3. Pricing Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                {t('admin:productEditor.pricing', 'Pricing')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="base-price">
                    {t('admin:productEditor.basePrice', 'Base Price (EGP)')} *
                  </FieldLabel>
                  <Input
                    id="base-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="sale-price">
                    {t('admin:productEditor.salePrice', 'Sale Price (EGP)')}
                  </FieldLabel>
                  <Input
                    id="sale-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="Optional sale price"
                  />
                  {priceError && (
                    <p className="text-xs text-destructive mt-1">{priceError}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(
                      'admin:productEditor.salePriceHint',
                      'Optional promotional price. Must be less than base price.',
                    )}
                  </p>
                </Field>
              </div>

              {/* Price Preview Card */}
              {numBase > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-border/40 bg-secondary/20 p-4">
                  <div className="space-y-0.5">
                    <span className="text-xs text-muted-foreground block">
                      {t('admin:productEditor.effectivePrice', {
                        price: '',
                        defaultValue: 'Effective Customer Price',
                      })}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-foreground">
                        {formatMoney(effectivePrice, { currency: 'EGP', locale: lang })}
                      </span>
                      {numSale > 0 && numSale < numBase && (
                        <span className="text-sm line-through text-muted-foreground">
                          {formatMoney(numBase, { currency: 'EGP', locale: lang })}
                        </span>
                      )}
                    </div>
                  </div>

                  {discountPercent > 0 && (
                    <Badge variant="destructive" className="font-semibold text-xs">
                      {t('admin:productEditor.discount', {
                        percent: discountPercent,
                        defaultValue: `${discountPercent}% OFF`,
                      })}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Status & Organization (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* 4. Status & Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                {t('admin:productEditor.status', 'Status & Availability')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Active Toggle */}
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <label htmlFor="is-active" className="text-sm font-medium text-foreground cursor-pointer">
                    {t('admin:productEditor.isActive', 'Active in Store')}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t('admin:productEditor.isActiveHint', 'Visible to customers in the catalog when active.')}
                  </p>
                </div>
                <Switch
                  id="is-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              <div className="border-t border-border/30 pt-4">
                {/* Featured Toggle */}
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <label htmlFor="is-featured" className="text-sm font-medium text-foreground cursor-pointer">
                      {t('admin:productEditor.isFeatured', 'Featured on Homepage')}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {t('admin:productEditor.isFeaturedHint', 'Highlight in homepage featured and best-seller showcases.')}
                    </p>
                  </div>
                  <Switch
                    id="is-featured"
                    checked={isFeatured}
                    onCheckedChange={setIsFeatured}
                  />
                </div>
              </div>

              <div className="border-t border-border/30 pt-4">
                {/* Pre-order Toggle */}
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <label htmlFor="preorder-enabled" className="text-sm font-medium text-foreground cursor-pointer">
                      {t('admin:productEditor.preorderEnabled', 'Enable Pre-order')}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {t('admin:productEditor.preorderHint', 'Allow customers to order even when stock is zero.')}
                    </p>
                  </div>
                  <Switch
                    id="preorder-enabled"
                    checked={preorderEnabled}
                    onCheckedChange={setPreorderEnabled}
                  />
                </div>
              </div>

              {/* Stock Info & Link to Inventory */}
              {isEditing && product && (
                <div className="border-t border-border/30 pt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {t('admin:productEditor.stockQuantity', {
                        count: product.available_count,
                        defaultValue: `Stock Available: ${product.available_count}`,
                      })}
                    </span>
                    <Badge variant={product.available_count > 0 ? 'default' : 'destructive'} className="font-mono text-xs">
                      {product.available_count}
                    </Badge>
                  </div>

                  <Link
                    to={`/${lang}/inventory`}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                  >
                    <span>{t('admin:productEditor.linkToInventory', 'Manage Keys in Inventory')}</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 5. Organization & SKU */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                {t('admin:productEditor.organization', 'Organization & SKU')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Dropdown */}
              <Field>
                <FieldLabel htmlFor="category-select">
                  {t('admin:productEditor.category', 'Category')} *
                </FieldLabel>
                {isLoadingCategories ? (
                  <div className="h-10 bg-secondary/50 rounded-lg animate-pulse" />
                ) : (
                  <Select
                    items={categoryItems}
                    value={effectiveCategoryId}
                    onValueChange={(val) => setCategoryId(val ?? '')}
                  >
                    <SelectTrigger id="category-select" className="w-full">
                      <SelectValue placeholder={t('admin:productEditor.selectCategory', 'Select a category')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categoryItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </Field>

              {/* Variant Dropdown */}
              <Field>
                <FieldLabel htmlFor="variant-select">
                  {t('admin:productEditor.variant', 'Edition Variant')}
                </FieldLabel>
                <Select
                  items={variantItems}
                  value={variant}
                  onValueChange={(val) => setVariant(val as ProductVariant | 'none')}
                >
                  <SelectTrigger id="variant-select" className="w-full">
                    <SelectValue placeholder={t('admin:productEditor.selectVariant', 'Select variant')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {variantItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              {/* SKU Field */}
              <Field>
                <FieldLabel htmlFor="product-sku">
                  {t('admin:productEditor.sku', 'SKU')}
                </FieldLabel>
                <Input
                  id="product-sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder={
                    selectedCategory
                      ? `${selectedCategory.code}-XXXX-XXXX-XXXX`
                      : t('admin:productEditor.skuPlaceholder', 'e.g. OS-WIN11-PRO-RET')
                  }
                  dir="ltr"
                  className="font-mono uppercase text-sm"
                />
                {skuError ? (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="size-3 shrink-0" />
                    <span>{skuError}</span>
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(
                      'admin:productEditor.skuHint',
                      '4-segment uppercase format. Must start with the category code.',
                    )}
                  </p>
                )}
              </Field>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
