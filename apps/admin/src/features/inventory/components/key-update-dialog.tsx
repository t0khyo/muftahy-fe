import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { Textarea } from '@workspace/ui/components/textarea'
import { Switch } from '@workspace/ui/components/switch'
import { Badge } from '@workspace/ui/components/badge'
import { Card } from '@workspace/ui/components/card'
import { FieldGroup, Field, FieldLabel } from '@workspace/ui/components/field'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import {
  KeyRound,
  Layers,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import type { KeyResponse } from '@workspace/domain/schemas/inventory'
import { useKeyUpdate } from '../hooks/use-inventory'
import { MaskedKeyReveal } from './masked-key-reveal'

interface KeyUpdateDialogProps {
  keyRecord: KeyResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  available: ['available', 'cancelled'],
  sold: ['sold', 'reported'],
  reported: ['reported', 'replaced', 'cancelled', 'sold'],
  replaced: ['replaced'],
  cancelled: ['cancelled'],
}

export function KeyUpdateDialog({
  keyRecord,
  open,
  onOpenChange,
  onSuccess,
}: KeyUpdateDialogProps) {
  if (!keyRecord || !open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <KeyUpdateForm
        key={keyRecord.id}
        keyRecord={keyRecord}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    </Dialog>
  )
}

function KeyUpdateForm({
  keyRecord,
  onOpenChange,
  onSuccess,
}: {
  keyRecord: KeyResponse
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}) {
  const { t } = useTranslation(['admin'])
  const keyUpdateMutation = useKeyUpdate()

  const [replacementOnly, setReplacementOnly] = React.useState<boolean>(
    keyRecord.replacement_only
  )
  const [status, setStatus] = React.useState<string>(keyRecord.status)
  const [cancelReason, setCancelReason] = React.useState<string>(
    keyRecord.cancel_reason ?? ''
  )
  const [validationError, setValidationError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<boolean>(false)

  const isTerminal = keyRecord.status === 'cancelled' || keyRecord.status === 'replaced'

  const statusItems = React.useMemo(() => {
    const allowed = ALLOWED_TRANSITIONS[keyRecord.status] ?? [keyRecord.status]
    return allowed.map((opt) => ({
      value: opt,
      label: opt.charAt(0).toUpperCase() + opt.slice(1),
    }))
  }, [keyRecord.status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    // Validation: if status changed to cancelled, cancel_reason is required
    if (status === 'cancelled' && !cancelReason.trim()) {
      setValidationError(
        t(
          'admin:inventoryModule.cancelReasonRequired',
          'Cancellation reason is required when marking a key as cancelled.'
        )
      )
      return
    }

    try {
      await keyUpdateMutation.mutateAsync({
        keyId: keyRecord.id,
        payload: {
          replacement_only: replacementOnly,
          status: status !== keyRecord.status ? (status as 'available' | 'cancelled' | 'reported') : undefined,
          cancel_reason: status === 'cancelled' ? cancelReason.trim() : undefined,
        },
      })
      setSuccessMessage(true)
      setTimeout(() => {
        onSuccess?.()
        onOpenChange(false)
      }, 700)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update key'
      setValidationError(errorMsg)
    }
  }

  return (
    <DialogContent className="sm:max-w-md p-0 overflow-hidden text-start">
      <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
            <KeyRound className="size-4.5" />
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-base font-bold tracking-tight text-foreground truncate">
              {t('admin:inventoryModule.editKey', 'Edit Key')}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
              {t(
                'admin:inventoryModule.editKeyDesc',
                'Update key status and replacement pool assignment.'
              )}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
        {/* Product Summary Card */}
        <Card className="p-3.5 border-border/70 bg-card space-y-1.5 shadow-none">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
              <Layers className="size-3 text-primary" />
              {t('admin:inventoryModule.targetProduct', 'Product')}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              #{keyRecord.id.slice(0, 8)}
            </span>
          </div>
          <div className="font-semibold text-xs text-foreground">
            {keyRecord.product_name || keyRecord.product_id}
          </div>
          <div className="text-[11px] font-mono text-muted-foreground">
            Product ID: <span className="text-foreground">{keyRecord.product_id.slice(0, 12)}...</span>
          </div>
        </Card>

        <FieldGroup className="gap-4">
          {/* Serial Key Reveal */}
          <Field>
            <FieldLabel className="text-xs font-medium text-foreground">
              {t('admin:inventoryModule.serialCode', 'Serial Key Code')}
            </FieldLabel>
            <div className="rounded-lg border border-border/70 bg-muted/20 p-2.5 flex items-center justify-between">
              <MaskedKeyReveal serial={keyRecord.serial} />
            </div>
          </Field>

          {/* Replacement Key Toggle */}
          <Field orientation="horizontal" className="justify-between rounded-lg border border-border/70 bg-muted/20 px-3.5 py-2.5">
            <FieldLabel htmlFor="pool-toggle" className="text-xs font-medium text-foreground cursor-pointer">
              {t('admin:inventory.replacementKey', 'Replacement Key')}
            </FieldLabel>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">
                {replacementOnly ? t('admin:common.on', 'On') : t('admin:common.off', 'Off')}
              </span>
              <Switch
                id="pool-toggle"
                checked={replacementOnly}
                onCheckedChange={setReplacementOnly}
                disabled={isTerminal || keyUpdateMutation.isPending}
                className="shrink-0 cursor-pointer"
              />
            </div>
          </Field>

          {/* Key Lifecycle Status */}
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="status-select" className="text-xs font-medium text-foreground">
                {t('admin:inventoryModule.status', 'Key Status')}
              </FieldLabel>
              <Badge variant="outline" className="text-[10px] font-mono capitalize">
                Current: {keyRecord.status}
              </Badge>
            </div>

            {isTerminal ? (
              <Alert className="border-border/60 bg-muted/30 py-2.5">
                <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
                <AlertDescription className="text-xs text-muted-foreground">
                  {t(
                    'admin:inventoryModule.terminalStatusNotice',
                    'This key is in a terminal state ({{status}}) and cannot be modified.',
                    { status: keyRecord.status }
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Select
                items={statusItems}
                value={status}
                onValueChange={(val) => setStatus(val ?? keyRecord.status)}
                disabled={keyUpdateMutation.isPending}
              >
                <SelectTrigger id="status-select" className="w-full h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {statusItems.map((item) => (
                      <SelectItem key={item.value} value={item.value} className="text-xs font-mono capitalize">
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </Field>

          {/* Cancellation Reason (shown if status is cancelled) */}
          {status === 'cancelled' && (
            <Field>
              <FieldLabel htmlFor="cancel-reason" className="text-xs font-medium text-destructive">
                {t('admin:inventoryModule.cancelReason', 'Cancellation Reason')} *
              </FieldLabel>
              <Textarea
                id="cancel-reason"
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={t(
                  'admin:inventoryModule.cancelReasonPlaceholder',
                  'e.g. Defective code from supplier batch, revoked license'
                )}
                disabled={isTerminal || keyUpdateMutation.isPending}
                className="text-xs resize-none"
                required
              />
            </Field>
          )}
        </FieldGroup>

        {/* Validation Feedback */}
        {validationError && (
          <Alert variant="destructive" className="py-2.5">
            <AlertTriangle className="size-3.5 shrink-0" />
            <AlertDescription className="text-xs">{validationError}</AlertDescription>
          </Alert>
        )}

        {/* Success Notification */}
        {successMessage && (
          <Alert className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 py-2.5">
            <CheckCircle2 className="size-3.5 shrink-0" />
            <AlertDescription className="text-xs">
              {t('admin:inventoryModule.updateSuccess', 'Key updated successfully.')}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="pt-2 border-t border-border/50 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={keyUpdateMutation.isPending}
            className="text-xs font-medium cursor-pointer"
          >
            {t('admin:common.cancel', 'Cancel')}
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={keyUpdateMutation.isPending || isTerminal}
            className="text-xs font-medium gap-1.5 cursor-pointer"
          >
            {keyUpdateMutation.isPending ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>{t('admin:common.saving', 'Saving...')}</span>
              </>
            ) : (
              <span>{t('admin:common.saveChanges', 'Save Changes')}</span>
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
