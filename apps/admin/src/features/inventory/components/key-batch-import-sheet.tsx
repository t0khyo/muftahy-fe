import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { Label } from '@workspace/ui/components/label'
import { Switch } from '@workspace/ui/components/switch'
import { Card } from '@workspace/ui/components/card'
import { FieldGroup, Field, FieldLabel } from '@workspace/ui/components/field'
import { Alert, AlertDescription, AlertAction } from '@workspace/ui/components/alert'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@workspace/ui/components/input-group'
import { Tooltip, TooltipTrigger, TooltipContent } from '@workspace/ui/components/tooltip'
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
import { useTranslation } from 'react-i18next'
import {
  Upload,
  Copy,
  Check,
  AlertCircle,
  FileText,
  Layers,
  DollarSign,
  Hash,
  Sparkles,
  X,
} from 'lucide-react'
import { useKeyBatchImport } from '../hooks/use-inventory'
import { useAdminProducts } from '../../products/hooks/use-admin-products'
import type { KeyImportErrorItem } from '@workspace/domain/schemas/inventory'
import { parseKeyBatchInput } from '../lib/key-batch-parser'
import { formatMoney } from '@workspace/domain/formatters/money'

interface KeyBatchImportSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultProductId?: string
  preselectedProductId?: string
}

export function KeyBatchImportSheet({
  open,
  onOpenChange,
  defaultProductId,
  preselectedProductId,
}: KeyBatchImportSheetProps) {
  const effectiveDefault = preselectedProductId ?? defaultProductId
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full inset-y-0 right-0 h-full border-s data-[side=right]:w-full data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:border-s sm:max-w-2xl md:max-w-3xl lg:max-w-3xl data-[side=right]:sm:max-w-2xl data-[side=right]:md:max-w-3xl data-[side=right]:lg:max-w-3xl p-0 flex flex-col bg-background shadow-2xl"
      >
        {open && (
          <KeyBatchImportForm
            key={effectiveDefault ?? 'default'}
            defaultProductId={effectiveDefault}
            onSuccess={() => onOpenChange(false)}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function KeyBatchImportForm({
  defaultProductId,
  onSuccess,
  onClose,
}: {
  defaultProductId?: string
  onSuccess: () => void
  onClose: () => void
}) {
  const { t, i18n } = useTranslation(['admin'])
  const lang = i18n.language || 'en'
  const { data: products, isLoading: productsLoading } = useAdminProducts()
  const importMutation = useKeyBatchImport()

  const [selectedProductId, setSelectedProductId] = React.useState<string>(defaultProductId ?? '')
  const [totalCostUsd, setTotalCostUsd] = React.useState<string>('')
  const [serialsText, setSerialsText] = React.useState<string>('')
  const [replacementOnly, setReplacementOnly] = React.useState<boolean>(false)
  const [failures, setFailures] = React.useState<KeyImportErrorItem[]>([])
  const [copiedFailures, setCopiedFailures] = React.useState(false)

  const activeProductId = selectedProductId || (products && products.length > 0 ? products[0].id : '')
  const selectedProduct = products?.find((p) => p.id === activeProductId)

  const batchAnalysis = React.useMemo(() => {
    return parseKeyBatchInput(serialsText)
  }, [serialsText])

  // Calculated unit cost preview
  const unitCostUsd = React.useMemo(() => {
    const cost = parseFloat(totalCostUsd)
    if (isNaN(cost) || cost <= 0 || batchAnalysis.effectiveKeys.length === 0) return null
    return cost / batchAnalysis.effectiveKeys.length
  }, [totalCostUsd, batchAnalysis.effectiveKeys.length])

  const handleDeduplicate = () => {
    setSerialsText(batchAnalysis.uniqueKeys.join('\n'))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (text) {
        setSerialsText(text)
      }
    }
    reader.readAsText(file)
  }

  const handleCopyFailures = () => {
    if (failures.length === 0) return
    const text = failures.map((f) => `${f.serial}\t${f.error_code}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopiedFailures(true)
    setTimeout(() => setCopiedFailures(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeProductId || batchAnalysis.effectiveKeys.length === 0) return

    setFailures([])
    try {
      const result = await importMutation.mutateAsync({
        product_id: activeProductId,
        total_cost_usd: Number(totalCostUsd) || 1,
        serials: batchAnalysis.effectiveKeys,
        replacement_only: replacementOnly,
      })

      if (result.failed_count === 0) {
        onSuccess()
      } else {
        setFailures(result.failures || [])
      }
    } catch {
      // Mutation error handled by TanStack Query
    }
  }

  return (
    <div className="flex flex-col h-full bg-background text-start select-text">
      {/* Authoritative Vault Header */}
      <SheetHeader className="p-5 sm:px-6 sm:py-4.5 border-b border-border/60 bg-muted/20 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <Upload className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                  {t('admin:inventory.importKeysTitle', 'Import Keys')}
                </SheetTitle>
              </div>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5 truncate">
                {t('admin:inventory.importKeysDesc', 'Add digital license keys from vendor batches or files.')}
              </SheetDescription>
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/60 shrink-0 cursor-pointer"
                  aria-label="Close vault sheet"
                >
                  <X className="size-4" />
                </Button>
              }
            />
            <TooltipContent side="bottom">{t('admin:common.close', 'Close')}</TooltipContent>
          </Tooltip>
        </div>
      </SheetHeader>

      {/* Main Scrollable Body */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Target Product & Cost Configuration Card */}
          <Card className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-semibold text-muted-foreground">
              <Layers className="size-3.5 text-primary" />
              <span>{t('admin:inventory.targetProduct', 'Target Product SKU & Wholesale Cost')}</span>
            </div>

            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              {/* Target Product SKU */}
              <Field className="space-y-1.5 text-start">
                <FieldLabel htmlFor="product-select" className="text-xs font-medium text-foreground">
                  {t('admin:inventory.targetProduct', 'Target Product SKU')}
                </FieldLabel>
                <Select
                  value={activeProductId}
                  onValueChange={(val) => setSelectedProductId(val ?? '')}
                  disabled={productsLoading || !products || products.length === 0}
                >
                  <SelectTrigger id="product-select" className="w-full h-9 bg-background/80 text-xs">
                    <SelectValue placeholder={productsLoading ? 'Loading products...' : 'Select target product'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectGroup>
                      {products?.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs font-mono">
                          <span className="font-semibold text-foreground">{p.name}</span>
                          <span className="ms-1.5 text-[10px] text-muted-foreground">({p.category?.name || ''})</span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {selectedProduct && (
                  <p className="text-[11px] font-mono text-muted-foreground mt-1">
                    SKU: <span className="text-foreground font-semibold">{selectedProduct.sku || selectedProduct.id.slice(0, 8)}</span> • Cat:{' '}
                    <span className="capitalize">{selectedProduct.category?.name || ''}</span>
                  </p>
                )}
              </Field>

              {/* Total Cost USD */}
              <Field className="space-y-1.5 text-start">
                <FieldLabel htmlFor="cost-input" className="text-xs font-medium text-foreground">
                  {t('admin:inventory.totalCostUsd', 'Wholesale Cost (USD, Optional)')}
                </FieldLabel>
                <InputGroup className="h-9 bg-background/80">
                  <InputGroupAddon>
                    <DollarSign className="size-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="cost-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={totalCostUsd}
                    onChange={(e) => setTotalCostUsd(e.target.value)}
                    placeholder="0.00"
                    className="font-mono text-xs tabular-nums"
                  />
                </InputGroup>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Synchronously debited to double-entry ledger COGS.
                </p>
              </Field>
            </FieldGroup>

            {/* Replacement Pool Toggle */}
            <div className="pt-2 border-t border-border/50">
              <Field orientation="horizontal" className="justify-between rounded-lg border border-border/60 bg-muted/20 px-3.5 py-3 transition-colors hover:bg-muted/30">
                <div className="space-y-0.5 min-w-0 me-3">
                  <FieldLabel htmlFor="pool-switch" className="text-xs font-medium text-foreground cursor-pointer">
                    {t('admin:inventory.replacementPool', 'Replacement Pool')}
                  </FieldLabel>
                  <p className="text-[11px] text-muted-foreground">
                    {t(
                      'admin:inventory.replacementPoolDesc',
                      'Reserve for dispute replacements only (excluded from storefront checkout).'
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-muted-foreground">
                    {replacementOnly ? t('admin:common.on', 'On') : t('admin:common.off', 'Off')}
                  </span>
                  <Switch
                    id="pool-switch"
                    checked={replacementOnly}
                    onCheckedChange={setReplacementOnly}
                    className="shrink-0 cursor-pointer"
                  />
                </div>
              </Field>
            </div>
          </Card>

          {/* Real-time Telemetry Stats Rail */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Keys Count */}
            <div className="rounded-lg border border-border/80 bg-muted/20 p-3 text-start">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                <Hash className="size-3" /> Detected
              </span>
              <div className="mt-1 font-mono text-lg font-bold text-foreground tabular-nums">
                {batchAnalysis.effectiveKeys.length}
                <span className="text-xs text-muted-foreground font-normal ms-1">/ 500</span>
              </div>
            </div>

            {/* Duplicates */}
            <div className="rounded-lg border border-border/80 bg-muted/20 p-3 text-start">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                <Sparkles className="size-3" /> Duplicates
              </span>
              <div className={`mt-1 font-mono text-lg font-bold tabular-nums ${batchAnalysis.duplicatesCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                {batchAnalysis.duplicatesCount}
              </div>
            </div>

            {/* Total Ingestion Cost */}
            <div className="rounded-lg border border-border/80 bg-muted/20 p-3 text-start">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                <DollarSign className="size-3" /> Total Cost
              </span>
              <div className="mt-1 font-mono text-lg font-bold text-foreground tabular-nums truncate">
                {totalCostUsd && Number(totalCostUsd) > 0
                  ? formatMoney(Number(totalCostUsd), { currency: 'USD', locale: lang })
                  : '$0.00'}
              </div>
            </div>

            {/* Calculated Unit Cost */}
            <div className="rounded-lg border border-border/80 bg-muted/20 p-3 text-start">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                Unit Cost
              </span>
              <div className="mt-1 font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums truncate">
                {unitCostUsd !== null
                  ? formatMoney(unitCostUsd, { currency: 'USD', locale: lang })
                  : '—'}
              </div>
            </div>
          </div>

          {/* Serials Editor & Terminal Ingestion */}
          <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <Label htmlFor="serials-input" className="text-xs font-semibold text-foreground">
                  {t('admin:inventory.activationCodes', 'Activation Codes (Line or Comma Delimited)')}
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Paste raw vendor license keys directly into the monospace editor or upload a batch file.
                </p>
              </div>

              {/* File Upload Trigger */}
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-1.5 h-8 rounded-lg border border-border/80 bg-background px-3 text-xs font-medium text-foreground hover:bg-muted/60 transition-colors cursor-pointer shrink-0"
                >
                  <FileText className="size-3.5 text-primary" />
                  <span>{t('admin:inventory.uploadFile', 'Upload .txt or .csv')}</span>
                </Label>
              </div>
            </div>

            <Textarea
              id="serials-input"
              rows={10}
              value={serialsText}
              onChange={(e) => setSerialsText(e.target.value)}
              placeholder={`XXXXX-XXXXX-XXXXX-XXXXX-XXXXX\nYYYYY-YYYYY-YYYYY-YYYYY-YYYYY\nZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ`}
              className="w-full bg-muted/20 dark:bg-muted/10 p-3.5 font-mono text-xs sm:text-sm tracking-wider leading-relaxed text-foreground placeholder:text-muted-foreground/60 transition-colors"
              required
            />

            {/* Duplicate Notice & 1-Click Clean */}
            {batchAnalysis.duplicatesCount > 0 && (
              <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                  <AlertDescription className="text-xs truncate">
                    {batchAnalysis.duplicatesCount} duplicate {batchAnalysis.duplicatesCount === 1 ? 'key' : 'keys'} detected in batch.
                  </AlertDescription>
                  <AlertAction>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={handleDeduplicate}
                      className="h-7 text-xs border-amber-500/30 hover:bg-amber-500/20 shrink-0 cursor-pointer font-medium"
                    >
                      Deduplicate Batch
                    </Button>
                  </AlertAction>
                </div>
              </Alert>
            )}

            {/* Ceiling Warning Notice */}
            {batchAnalysis.isTruncated && (
              <Alert variant="destructive" className="border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400">
                <AlertCircle className="size-4 shrink-0" />
                <AlertDescription className="text-xs">
                  Batch exceeds 500 keys limit. Only the first 500 unique keys will be ingested in this execution.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Reconciliation Error Table */}
          {failures.length > 0 && (
            <Card className="space-y-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 shadow-none">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>
                    {failures.length} {t('admin:inventory.keysRejected', 'keys rejected due to validation failure')}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyFailures}
                  className="h-7 text-xs gap-1.5 cursor-pointer text-destructive hover:bg-destructive/10"
                >
                  {copiedFailures ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  <span>{copiedFailures ? 'Copied to Clipboard' : 'Copy Rejected Keys'}</span>
                </Button>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-border/60 bg-background/90">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="border-border/60 hover:bg-transparent">
                      <TableHead className="text-xs py-2 ps-3 font-mono">Serial Code</TableHead>
                      <TableHead className="text-xs py-2 pe-3 text-end font-mono">Rejection Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {failures.map((f, i) => (
                      <TableRow key={i} className="border-border/40 hover:bg-muted/20">
                        <TableCell className="font-mono text-xs py-2 ps-3 text-foreground">{f.serial}</TableCell>
                        <TableCell className="text-xs font-mono text-destructive py-2 pe-3 text-end">{f.error_code}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 sm:px-6 sm:py-4 border-t border-border/60 bg-muted/10 shrink-0 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-xs font-medium cursor-pointer"
          >
            {t('admin:common.cancel', 'Cancel')}
          </Button>

          <Button
            type="submit"
            className="gap-2 cursor-pointer font-medium px-5"
            disabled={importMutation.isPending || batchAnalysis.effectiveKeys.length === 0}
          >
            <Upload className="size-4" />
            <span>
              {importMutation.isPending
                ? t('admin:inventory.importing', 'Importing keys...')
                : batchAnalysis.effectiveKeys.length > 0
                  ? `${t('admin:inventory.import', 'Import')} ${batchAnalysis.effectiveKeys.length} ${t('admin:inventory.keys', 'Keys')}`
                  : t('admin:inventory.importKeys', 'Import Keys')}
            </span>
          </Button>
        </div>
      </form>
    </div>
  )
}

