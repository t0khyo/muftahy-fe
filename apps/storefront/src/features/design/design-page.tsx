import { useTranslation } from 'react-i18next'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import type { ProductResponse } from '@workspace/domain/schemas/product'
import { ProductCard } from '../products/components/product-card'
import { ProductCardSkeleton } from '../products/components/product-card-skeleton'

const SAMPLE_PRODUCTS: ProductResponse[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Windows 11 Professional',
    slug: 'windows-11-professional',
    sku: 'OS-WIN11-PRO-RET',
    description: 'Lifetime activation for 1 PC.',
    category: {
      id: 'cat-001',
      name: 'Windows',
      code: 'OS',
      slug: 'windows',
      display_order: 0,
      is_active: true,
      product_count: 2,
    },
    variant: 'retail',
    base_price: '349.00',
    sale_price: '299.99',
    effective_price: '299.99',
    discount_percentage: 14,
    stock_status: 'in_stock',
    available_count: 15,
    preorder_enabled: false,
    is_active: true,
    images: [],
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    name: 'Office 2021 Professional Plus',
    slug: 'office-2021-professional-plus',
    sku: 'OFF-OFF21-PRO-RET',
    description: 'Word, Excel, PowerPoint, Outlook, Access, Publisher.',
    category: {
      id: 'cat-002',
      name: 'Office',
      code: 'OFF',
      slug: 'office',
      display_order: 1,
      is_active: true,
      product_count: 1,
    },
    variant: 'retail',
    base_price: '599.00',
    sale_price: '499.99',
    effective_price: '499.99',
    discount_percentage: 17,
    stock_status: 'in_stock',
    available_count: 8,
    preorder_enabled: false,
    is_active: true,
    images: [],
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    name: 'Windows 11 Home',
    slug: 'windows-11-home',
    sku: 'OS-WIN11-HOM-OEM',
    description: 'OEM License for new PC installation.',
    category: {
      id: 'cat-001',
      name: 'Windows',
      code: 'OS',
      slug: 'windows',
      display_order: 0,
      is_active: true,
      product_count: 2,
    },
    variant: 'oem',
    base_price: '249.00',
    sale_price: null,
    effective_price: '249.00',
    discount_percentage: null,
    stock_status: 'in_stock',
    available_count: 5,
    preorder_enabled: false,
    is_active: true,
    images: [],
  },
]

export function DesignPage() {
  const { t, i18n } = useTranslation(['design', 'common', 'products'])
  const isAr = i18n.language === 'ar'

  return (
    <div className="container mx-auto space-y-12 px-4 py-10 sm:px-6">
      {/* Page Title */}
      <div className="space-y-2 border-b border-border pb-6 text-start">
        <h1 className="font-heading text-display font-bold text-foreground">
          {t('title', { ns: 'design' })}
        </h1>
        <p className="text-body text-muted-foreground">
          {t('subtitle', { ns: 'design' })}
        </p>
      </div>

      {/* Typography Scale */}
      <section className="space-y-4">
        <h2 className="font-heading text-h4 font-semibold text-foreground text-start">
          {t('typography', { ns: 'design' })}
        </h2>
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-card-foreground">
          <div>
            <span className="text-small text-muted-foreground block">
              h1 — 64px (4rem)
            </span>
            <h1 className="font-heading text-h1 font-bold tracking-tight">
              {isAr
                ? t('typographySampleAr', { ns: 'design' })
                : t('typographySampleEn', { ns: 'design' })}
            </h1>
          </div>
          <div>
            <span className="text-small text-muted-foreground block">
              h2 — 48px (3rem)
            </span>
            <h2 className="font-heading text-h2 font-bold">
              {isAr
                ? t('typographySampleAr', { ns: 'design' })
                : t('typographySampleEn', { ns: 'design' })}
            </h2>
          </div>
          <div>
            <span className="text-small text-muted-foreground block">
              h3 — 40px (2.5rem)
            </span>
            <h3 className="font-heading text-h3 font-semibold">
              {isAr
                ? t('typographySampleAr', { ns: 'design' })
                : t('typographySampleEn', { ns: 'design' })}
            </h3>
          </div>
          <div>
            <span className="text-small text-muted-foreground block">
              h4 — 32px (2rem)
            </span>
            <h4 className="font-heading text-h4 font-semibold">
              {isAr
                ? t('typographySampleAr', { ns: 'design' })
                : t('typographySampleEn', { ns: 'design' })}
            </h4>
          </div>
          <div>
            <span className="text-small text-muted-foreground block">
              h5 — 24px (1.5rem)
            </span>
            <h5 className="font-heading text-h5 font-medium">
              {isAr
                ? t('typographySampleAr', { ns: 'design' })
                : t('typographySampleEn', { ns: 'design' })}
            </h5>
          </div>
          <div>
            <span className="text-small text-muted-foreground block">
              h6 — 20px (1.25rem)
            </span>
            <h6 className="font-heading text-h6 font-medium">
              {isAr
                ? t('typographySampleAr', { ns: 'design' })
                : t('typographySampleEn', { ns: 'design' })}
            </h6>
          </div>
          <div>
            <span className="text-small text-muted-foreground block">
              p — 16px (1rem)
            </span>
            <p className="text-p text-foreground">
              {isAr
                ? t('typographySampleAr', { ns: 'design' })
                : t('typographySampleEn', { ns: 'design' })}
            </p>
          </div>
          <div>
            <span className="text-small text-muted-foreground block">
              small — 12px (0.75rem)
            </span>
            <small className="text-small text-muted-foreground block">
              {isAr
                ? t('typographySampleAr', { ns: 'design' })
                : t('typographySampleEn', { ns: 'design' })}
            </small>
          </div>
          <div>
            <span className="text-small text-muted-foreground block">
              xs — 10px (0.625rem)
            </span>
            <span className="xs text-xs text-muted-foreground block">
              {isAr
                ? t('typographySampleAr', { ns: 'design' })
                : t('typographySampleEn', { ns: 'design' })}
            </span>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="font-heading text-heading font-semibold text-foreground text-start">
          {t('buttons', { ns: 'design' })}
        </h2>
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-6">
          <Button variant="default">{t('btnDefault', { ns: 'design' })}</Button>
          <Button variant="secondary">
            {t('btnSecondary', { ns: 'design' })}
          </Button>
          <Button variant="outline">{t('btnOutline', { ns: 'design' })}</Button>
          <Button variant="ghost">{t('btnGhost', { ns: 'design' })}</Button>
          <Button variant="destructive">
            {t('btnDestructive', { ns: 'design' })}
          </Button>
          <Button variant="link">{t('btnLink', { ns: 'design' })}</Button>
          <Button variant="default" disabled>
            {t('btnDefault', { ns: 'design' })} (Disabled)
          </Button>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="font-heading text-heading font-semibold text-foreground text-start">
          {t('badges', { ns: 'design' })}
        </h2>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-6">
          <Badge variant="default">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>

          {/* Status Badges with semantic tokens */}
          <Badge className="bg-success text-success-foreground border-transparent">
            {t('statusSuccess', { ns: 'design' })}
          </Badge>
          <Badge className="bg-warning text-warning-foreground border-transparent">
            {t('statusWarning', { ns: 'design' })}
          </Badge>
          <Badge className="bg-info text-info-foreground border-transparent">
            {t('statusInfo', { ns: 'design' })}
          </Badge>
          <Badge className="bg-discount text-discount-foreground border-transparent">
            {t('statusDiscount', { ns: 'design' })}
          </Badge>

          {/* Subtle/Outline Status Badges */}
          <Badge className="border-success/30 bg-success/10 text-success">
            {t('statusSuccess', { ns: 'design' })} (Subtle)
          </Badge>
          <Badge className="border-warning/30 bg-warning/10 text-warning">
            {t('statusWarning', { ns: 'design' })} (Subtle)
          </Badge>
          <Badge className="border-info/30 bg-info/10 text-info">
            {t('statusInfo', { ns: 'design' })} (Subtle)
          </Badge>
          <Badge className="border-discount/30 bg-discount/10 text-discount">
            {t('statusDiscount', { ns: 'design' })} (Subtle)
          </Badge>
        </div>
      </section>

      {/* Form Controls */}
      <section className="space-y-4">
        <h2 className="font-heading text-heading font-semibold text-foreground text-start">
          {t('inputs', { ns: 'design' })}
        </h2>
        <div className="grid grid-cols-1 gap-6 rounded-xl border border-border bg-card p-6 md:grid-cols-2">
          <div className="space-y-2 text-start">
            <label
              htmlFor="license-input"
              className="text-small font-medium text-foreground block"
            >
              {t('inputLabel', { ns: 'design' })}
            </label>
            <Input
              id="license-input"
              className="tabular-nums"
              placeholder={t('inputPlaceholder', { ns: 'design' })}
            />
          </div>

          <div className="space-y-2 text-start">
            <label
              htmlFor="region-select"
              className="text-small font-medium text-foreground block"
            >
              {t('selectLabel', { ns: 'design' })}
            </label>
            <Select defaultValue="global">
              <SelectTrigger id="region-select" className="w-full">
                <SelectValue
                  placeholder={t('selectPlaceholder', { ns: 'design' })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="windows">
                    {t('categories.windows', { ns: 'products', defaultValue: 'Windows' })}
                  </SelectItem>
                  <SelectItem value="office">
                    {t('categories.office', { ns: 'products', defaultValue: 'Office' })}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section className="space-y-4">
        <h2 className="font-heading text-heading font-semibold text-foreground text-start">
          {t('alerts', { ns: 'design' })}
        </h2>
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <Alert>
            <AlertTitle>{t('alertTitle', { ns: 'design' })}</AlertTitle>
            <AlertDescription>
              {t('alertDesc', { ns: 'design' })}
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>
              {t('alertDestructiveTitle', { ns: 'design' })}
            </AlertTitle>
            <AlertDescription>
              {t('alertDestructiveDesc', { ns: 'design' })}
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Card */}
      <section className="space-y-4">
        <h2 className="font-heading text-heading font-semibold text-foreground text-start">
          {t('cards', { ns: 'design' })}
        </h2>
        <div className="max-w-md">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between pb-2">
                <Badge variant="outline">XBOX</Badge>
                <Badge className="bg-success text-success-foreground border-transparent">
                  {t('statusSuccess', { ns: 'design' })}
                </Badge>
              </div>
              <CardTitle>{t('cardTitle', { ns: 'design' })}</CardTitle>
              <CardDescription>
                {t('cardDesc', { ns: 'design' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-xl font-bold text-foreground tabular-nums">
                  120.00 EGP
                </span>
                <span className="text-caption text-muted-foreground line-through tabular-nums">
                  180.00 EGP
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                {t('cardAction', { ns: 'design' })}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Table */}
      <section className="space-y-4">
        <h2 className="font-heading text-heading font-semibold text-foreground text-start">
          {t('tables', { ns: 'design' })}
        </h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('colProduct', { ns: 'design' })}</TableHead>
                <TableHead>{t('colCategory', { ns: 'design' })}</TableHead>
                <TableHead className="text-end">
                  {t('colPrice', { ns: 'design' })}
                </TableHead>
                <TableHead className="text-center">
                  {t('colStatus', { ns: 'design' })}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-foreground">
                  Windows 11 Pro Retail
                </TableCell>
                <TableCell className="text-muted-foreground">Software</TableCell>
                <TableCell className="text-end tabular-nums font-semibold">
                  650.00 EGP
                </TableCell>
                <TableCell className="text-center">
                  <Badge className="bg-success text-success-foreground border-transparent">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">
                  Cyberpunk 2077
                </TableCell>
                <TableCell className="text-muted-foreground">Games</TableCell>
                <TableCell className="text-end tabular-nums font-semibold">
                  1450.00 EGP
                </TableCell>
                <TableCell className="text-center">
                  <Badge className="bg-discount text-discount-foreground border-transparent">
                    -30%
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">
                  Xbox Game Pass 3M
                </TableCell>
                <TableCell className="text-muted-foreground">
                  Subscriptions
                </TableCell>
                <TableCell className="text-end tabular-nums font-semibold">
                  890.00 EGP
                </TableCell>
                <TableCell className="text-center">
                  <Badge className="bg-warning text-warning-foreground border-transparent">
                    Low Stock
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Product Cards (Template Showcase) */}
      <section className="space-y-4">
        <div className="space-y-1 text-start">
          <h2 className="font-heading text-heading font-semibold text-foreground">
            {t('productCards', { ns: 'design' })}
          </h2>
          <p className="text-body text-muted-foreground">
            {t('productCardsDesc', { ns: 'design' })}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SAMPLE_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={() => {}} />
          ))}
          <div className="flex flex-col gap-2">
            <span className="text-caption text-muted-foreground text-start">
              {t('productCardSkeleton', { ns: 'design' })}
            </span>
            <ProductCardSkeleton />
          </div>
        </div>
      </section>
    </div>
  )
}

