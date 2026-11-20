import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, AlertCircle, FileCheck, Loader2 } from 'lucide-react'
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
import { Label } from '@workspace/ui/components/label'
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('File size exceeds 5MB limit')
        setSelectedFile(null)
        return
      }
      setSelectedFile(file)
      setErrorMsg(null)
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
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
              <FileCheck className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <Label>{t('orders.detail.selectMethod')}</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('vodafone_cash')}
                className={`flex flex-col items-center justify-center rounded-lg border p-3 text-xs font-medium transition-colors ${
                  paymentMethod === 'vodafone_cash'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <span>{t('orders.detail.vodafoneCash')}</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('instapay')}
                className={`flex flex-col items-center justify-center rounded-lg border p-3 text-xs font-medium transition-colors ${
                  paymentMethod === 'instapay'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <span>{t('orders.detail.instapay')}</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <Label htmlFor="amount_claimed">{t('orders.detail.claimedAmountLabel')}</Label>
            <Input
              id="amount_claimed"
              type="number"
              step="0.01"
              value={amountClaimed}
              onChange={(e) => setAmountClaimed(e.target.value)}
              placeholder={t('orders.detail.claimedAmountPlaceholder')}
            />
          </div>

          {/* File Picker */}
          <div className="space-y-1.5">
            <Label htmlFor="receipt_file">{t('orders.detail.receiptFileLabel')}</Label>
            <div className="relative flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center hover:border-primary/50 transition-colors">
              <input
                id="receipt_file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              {selectedFile ? (
                <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                  <FileCheck className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t('orders.detail.dropFilePrompt')}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              {t('profile.cancel')}
            </Button>
            <Button type="submit" disabled={isPending || !selectedFile}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />}
              {isPending ? t('orders.detail.submitting') : t('orders.detail.submitReceipt')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

