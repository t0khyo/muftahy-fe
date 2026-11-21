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
import { Label } from '@workspace/ui/components/label'
import { Switch } from '@workspace/ui/components/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { useTranslation } from 'react-i18next'
import { Upload, Copy, Check, AlertCircle, FileText } from 'lucide-react'
import { useKeyBatchImport } from '../hooks/use-inventory'
import { useAdminProducts } from '../../products/hooks/use-admin-products'
import type { KeyImportErrorItem } from '@workspace/domain/schemas/inventory'
import { parseKeyBatchInput } from '../lib/key-batch-parser'

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
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        {open && (
          <KeyBatchImportForm
            key={effectiveDefault ?? 'default'}
            defaultProductId={effectiveDefault}
            onSuccess={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function KeyBatchImportForm({
  defaultProductId,
  onSuccess,
}: {
  defaultProductId?: string
  onSuccess: () => void
}) {
  const { t } = useTranslation(['admin'])
  const { data: products } = useAdminProducts()
  const importMutation = useKeyBatchImport()

  const [selectedProductId, setSelectedProductId] = React.useState<string>(defaultProductId ?? '')
  const [totalCostUsd, setTotalCostUsd] = React.useState<string>('')
  const [serialsText, setSerialsText] = React.useState<string>('')
  const [replacementOnly, setReplacementOnly] = React.useState<boolean>(false)
  const [failures, setFailures] = React.useState<KeyImportErrorItem[]>([])
  const [copiedFailures, setCopiedFailures] = React.useState(false)

  const activeProductId = selectedProductId || (products && products.length > 0 ? products[0].id : '')

  const batchAnalysis = React.useMemo(() => {
    return parseKeyBatchInput(serialsText)
  }, [serialsText])

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
    <div className="space-y-6 text-start">
      <SheetHeader className="text-start">
        <SheetTitle className="flex items-center gap-2">
          <Upload className="size-5 text-primary" />
          <span>{t('admin:inventory.batchIngestModalTitle', 'Batch Key Ingestion Vault')}</span>
        </SheetTitle>
        <SheetDescription>
          {t('admin:inventory.batchIngestModalDesc', 'Ingest digital license keys directly into the zero-knowledge encrypted vault.')}
        </SheetDescription>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Selector */}
        <div className="space-y-1.5">
          <Label htmlFor="product-select">{t('admin:inventory.targetProduct', 'Target Product SKU')}</Label>
          <select
            id="product-select"
            value={activeProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            required
          >
            <option value="" disabled>Select target product</option>
            {products?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.category})
              </option>
            ))}
          </select>
        </div>

        {/* Total Cost USD */}
        <div className="space-y-1.5">
          <Label htmlFor="cost-input">{t('admin:inventory.totalCostUsd', 'Wholesale Ingestion Cost (USD, Optional)')}</Label>
          <Input
            id="cost-input"
            type="number"
            step="0.01"
            min="0"
            value={totalCostUsd}
            onChange={(e) => setTotalCostUsd(e.target.value)}
            placeholder="e.g. 450.00 (Recorded in double-entry ledger)"
          />
        </div>

        {/* Replacement Pool Toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="pool-switch" className="text-sm font-medium">
              {t('admin:inventory.replacementPool', 'Replacement Pool (Defective Claims Only)')}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t('admin:inventory.replacementPoolDesc', 'Keys in this pool are isolated and never sold through standard checkout.')}
            </p>
          </div>
          <Switch
            id="pool-switch"
            checked={replacementOnly}
            onCheckedChange={setReplacementOnly}
          />
        </div>

        {/* Serials Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="serials-input">{t('admin:inventory.activationCodes', 'Activation Codes')}</Label>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {batchAnalysis.effectiveKeys.length} / 500 {t('admin:inventory.keysDetected', 'keys')}
            </span>
          </div>
          <textarea
            id="serials-input"
            rows={8}
            value={serialsText}
            onChange={(e) => setSerialsText(e.target.value)}
            placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX&#10;YYYYY-YYYYY-YYYYY-YYYYY-YYYYY"
            className="w-full rounded-md border border-border bg-background p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            required
          />

          {batchAnalysis.duplicatesCount > 0 && (
            <div className="flex items-center justify-between rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="size-4 shrink-0" />
                <span>
                  {batchAnalysis.duplicatesCount} duplicate {batchAnalysis.duplicatesCount === 1 ? 'key' : 'keys'} detected in batch.
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleDeduplicate}
                className="h-7 text-xs border-amber-500/30 hover:bg-amber-500/20"
              >
                Deduplicate
              </Button>
            </div>
          )}

          {batchAnalysis.isTruncated && (
            <div className="flex items-center gap-1.5 rounded-md border border-warning/30 bg-warning/10 p-2.5 text-xs text-warning-foreground">
              <AlertCircle className="size-4 shrink-0 text-warning" />
              <span>
                Batch exceeds 500 keys limit. Only the first 500 unique keys will be ingested.
              </span>
            </div>
          )}
        </div>

        {/* File Upload Helper */}
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
            className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 cursor-pointer"
          >
            <FileText className="size-3.5" />
            <span>{t('admin:inventory.uploadFile', 'Upload .txt or .csv list')}</span>
          </Label>
        </div>

        {/* Reconciliation Error Table */}
        {failures.length > 0 && (
          <div className="space-y-2 rounded-lg border border-destructive/50 bg-destructive/5 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                <AlertCircle className="size-4" />
                <span>
                  {failures.length} {t('admin:inventory.keysRejected', 'keys rejected due to validation failure')}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyFailures}
                className="h-7 text-xs gap-1"
              >
                {copiedFailures ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                <span>{copiedFailures ? 'Copied' : 'Copy Rejected'}</span>
              </Button>
            </div>
            <div className="max-h-40 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs py-1">Code</TableHead>
                    <TableHead className="text-xs py-1 text-end">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failures.map((f, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-[10px] py-1">{f.serial}</TableCell>
                      <TableCell className="text-[10px] text-destructive py-1 text-end">{f.error_code}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full gap-2 cursor-pointer"
            disabled={importMutation.isPending || batchAnalysis.effectiveKeys.length === 0}
          >
            <Upload className="size-4" />
            <span>
              {importMutation.isPending
                ? t('admin:common.loading', 'Ingesting into vault...')
                : `${t('admin:inventory.confirmIngestion', 'Confirm Ingestion of')} ${batchAnalysis.effectiveKeys.length} ${t('admin:inventory.keys', 'Keys')}`}
            </span>
          </Button>
        </div>
      </form>
    </div>
  )
}
