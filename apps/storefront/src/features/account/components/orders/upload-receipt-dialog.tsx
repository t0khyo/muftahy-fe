import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, AlertCircle, FileCheck, Loader2 } from 'lucide-react'
import { compressReceipt } from '@workspace/domain/media/image-compression'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  Alert,
  AlertDescription,
} from '@workspace/ui/components/alert'
import {
  FieldGroup,
  Field,
  FieldLabel,
} from '@workspace/ui/components/field'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@workspace/ui/components/toggle-group'
import { useUploadReceipt } from '../../hooks/use-orders'

interface UploadReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  suggestedAmount?: number
}

export function UploadReceiptDialog({
  open,
  onOpenChange,
  orderId,
  suggestedAmount,
}: UploadReceiptDialogProps) {
  const { t } = useTranslation('account')
  const { mutateAsync: uploadReceipt, isPending } = useUploadReceipt()

  const [paymentMethod, setPaymentMethod] = useState<'vodafone_cash' | 'instapay'>('vodafone_cash')
  const [amountClaimed, setAmountClaimed] = useState<string>(suggestedAmount ? String(suggestedAmount) : '')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [fileStats, setFileStats] = useState<{ originalSize: number; compressedSize: number } | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setErrorMsg(null)
      setIsCompressing(true)
      try {
        const compressed = await compressReceipt(file)
        setSelectedFile(compressed)
        setFileStats({
          originalSize: file.size,
          compressedSize: compressed.size,
        })
      } catch {
        setSelectedFile(file)
      } finally {
        setIsCompressing(false)
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!selectedFile) {
      setErrorMsg(t('orders.detail.receiptFileLabel'))
      return
    }

    try {
      await uploadReceipt({
        orderId,
        payload: {
          receipt: selectedFile,
          payment_method: paymentMethod,
          amount_claimed: amountClaimed ? parseFloat(amountClaimed) : undefined,
        },
      })
      setSuccessMsg(t('orders.detail.uploadSuccess'))
      setTimeout(() => {
        onOpenChange(false)
        setSelectedFile(null)
        setSuccessMsg(null)
      }, 1200)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setErrorMsg(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('orders.detail.uploadModalTitle')}</DialogTitle>
          <DialogDescription>{t('orders.detail.uploadModalDesc')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          {successMsg && (
            <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileCheck className="size-4" />
              <AlertDescription className="text-xs">{successMsg}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            {/* Payment Method Selector */}
            <Field>
              <FieldLabel>{t('orders.detail.selectMethod')}</FieldLabel>
              <ToggleGroup
                value={[paymentMethod]}
                onValueChange={(val) => {
                  if (val.length > 0) {
                    setPaymentMethod(val[val.length - 1] as 'vodafone_cash' | 'instapay')
                  }
                }}
                variant="outline"
                className="grid grid-cols-2 gap-3 w-full"
              >
                <ToggleGroupItem
                  value="vodafone_cash"
                  className="h-auto py-3 flex flex-col items-center justify-center text-xs font-medium"
                >
                  <span>{t('orders.detail.vodafoneCash')}</span>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="instapay"
                  className="h-auto py-3 flex flex-col items-center justify-center text-xs font-medium"
                >
                  <span>{t('orders.detail.instapay')}</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </Field>

            {/* Amount Input */}
            <Field>
              <FieldLabel htmlFor="amount_claimed">{t('orders.detail.claimedAmountLabel')}</FieldLabel>
              <Input
                id="amount_claimed"
                type="number"
                step="0.01"
                value={amountClaimed}
                onChange={(e) => setAmountClaimed(e.target.value)}
                placeholder={t('orders.detail.claimedAmountPlaceholder')}
              />
            </Field>

            {/* File Picker */}
            <Field>
              <FieldLabel htmlFor="receipt_file">{t('orders.detail.receiptFileLabel')}</FieldLabel>
              <div className="relative flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  id="receipt_file"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                {isCompressing ? (
                  <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('orders.detail.compressingReceipt', 'Optimizing receipt (WebP)...')}</span>
                  </div>
                ) : selectedFile ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                      <FileCheck className="h-4 w-4" />
                      <span>{selectedFile.name}</span>
                    </div>
                    {fileStats && fileStats.originalSize > fileStats.compressedSize && (
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {(fileStats.originalSize / (1024 * 1024)).toFixed(1)} MB → {(fileStats.compressedSize / 1024).toFixed(0)} KB (WebP)
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t('orders.detail.dropFilePrompt')}
                  </p>
                )}
              </div>
            </Field>
          </FieldGroup>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending || isCompressing}
              onClick={() => onOpenChange(false)}
            >
              {t('profile.cancel')}
            </Button>
            <Button type="submit" disabled={isPending || isCompressing || !selectedFile}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />}
              {isPending ? t('orders.detail.submitting') : t('orders.detail.submitReceipt')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
