import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { useCancelOrder } from '../../hooks/use-orders'

interface CancelOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  referenceCode: string
}

export function CancelOrderDialog({
  open,
  onOpenChange,
  orderId,
  referenceCode,
}: CancelOrderDialogProps) {
  const { t } = useTranslation('account')
  const { mutateAsync: cancelOrder, isPending } = useCancelOrder()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleConfirmCancel = async () => {
    setErrorMsg(null)
    try {
      await cancelOrder(orderId)
      onOpenChange(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel order.'
      setErrorMsg(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <DialogTitle>{t('orders.detail.cancelConfirmTitle')}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {t('orders.detail.cancelConfirmDesc')} ({referenceCode})
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-md">
            {errorMsg}
          </p>
        )}

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {t('profile.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={handleConfirmCancel}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />}
            {isPending ? t('orders.detail.cancelling') : t('orders.detail.cancelAction')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

