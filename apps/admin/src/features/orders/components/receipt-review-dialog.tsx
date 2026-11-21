import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { useTranslation } from 'react-i18next'
import { useReviewOrder, useRefundOrderItem } from '../hooks/use-admin-orders'
import type { OrderResponse } from '@workspace/domain/schemas/order'
import { formatMoney } from '@workspace/domain/formatters/money'
import { CheckCircle2, XCircle, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react'

interface ReceiptReviewDialogProps {
  order: OrderResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReceiptReviewDialog({ order, open, onOpenChange }: ReceiptReviewDialogProps) {
  const { t, i18n } = useTranslation()
  const reviewMutation = useReviewOrder()
  const refundMutation = useRefundOrderItem()

  const [rejectMode, setRejectMode] = React.useState<'wrong_amount' | 'refund' | null>(null)
  const [rejectReason, setRejectReason] = React.useState('')
  const [refundItemId, setRefundItemId] = React.useState<string | null>(null)
  const [gatewayFee, setGatewayFee] = React.useState('0')
  const [preorderWarning, setPreorderWarning] = React.useState(false)

  if (!order) return null

  const latestAttempt = order.payment_attempts[order.payment_attempts.length - 1]

  const handleApprove = async () => {
    try {
      const res = await reviewMutation.mutateAsync({
        orderId: order.id,
        payload: { action: 'approve' },
      })
      const hasPreorder = res.items.some((it) => it.is_preorder)
      if (hasPreorder) {
        setPreorderWarning(true)
      } else {
        onOpenChange(false)
      }
    } catch {
      // Mutation error handled by TanStack
    }
  }

  const handleReject = async () => {
    if (!rejectMode) return
    const action = rejectMode === 'wrong_amount' ? 'reject_wrong_amount' : 'reject_refund'
    await reviewMutation.mutateAsync({
      orderId: order.id,
      payload: { action, reason: rejectReason || undefined },
    })
    setRejectMode(null)
    setRejectReason('')
    onOpenChange(false)
  }

  const handleExecuteRefund = async () => {
    if (!refundItemId) return
    await refundMutation.mutateAsync({
      orderId: order.id,
      itemId: refundItemId,
      payload: { gateway_fee_egp: parseFloat(gatewayFee) || 0 },
    })
    setRefundItemId(null)
    setGatewayFee('0')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-mono text-base">
              {order.reference_code}
            </DialogTitle>
            <Badge variant={order.status === 'under_review' ? 'default' : 'secondary'}>
              {order.status}
            </Badge>
          </div>
          <DialogDescription>
            {t('admin.ordersModule.receiptImage', 'Transfer Receipt Adjudication')}
          </DialogDescription>
        </DialogHeader>

        {preorderWarning && (
          <div className="rounded-md border border-warning/40 bg-warning/10 p-3 flex items-start gap-2 text-xs text-warning-foreground">
            <AlertTriangle className="size-4 shrink-0 text-warning mt-0.5" />
            <div>
              <p className="font-semibold">
                {t('admin.ordersModule.preorderConverted', 'Order converted to preorder backorder due to zero available stock')}
              </p>
              <Button
                variant="outline"
                size="xs"
                className="mt-2"
                onClick={() => {
                  setPreorderWarning(false)
                  onOpenChange(false)
                }}
              >
                {t('admin.common.confirm', 'Dismiss & Close')}
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Receipt Preview */}
          <div className="rounded-md border border-border bg-muted/20 p-3 flex flex-col items-center justify-center min-h-[220px]">
            {latestAttempt?.receipt_image_path ? (
              <div className="space-y-2 w-full text-center">
                <img
                  src={`http://localhost:8000/${latestAttempt.receipt_image_path.replace(/^\/+/, '')}`}
                  alt="Customer bank receipt"
                  className="max-h-60 mx-auto rounded object-contain border border-border"
                  onError={(e) => {
                    // Fallback visual placeholder when backend image storage isn't mounted locally
                    (e.target as HTMLElement).style.display = 'none'
                  }}
                />
                <a
                  href={`http://localhost:8000/${latestAttempt.receipt_image_path.replace(/^\/+/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
                >
                  <ExternalLink className="size-3" />
                  {latestAttempt.receipt_image_path}
                </a>
              </div>
            ) : (
              <div className="text-center text-xs text-muted-foreground">
                <p>No receipt image file path available</p>
              </div>
            )}
          </div>

          {/* Verification Details */}
          <div className="space-y-3 text-xs">
            <div className="rounded-md border border-border p-3 space-y-2 bg-background">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('admin.ordersModule.orderTotal', 'Order Total')}:</span>
                <span className="font-mono font-semibold">
                  {formatMoney(order.total_egp, { currency: 'EGP', locale: i18n.language })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('admin.ordersModule.claimedAmount', 'Claimed Amount')}:</span>
                <span className="font-mono font-semibold text-primary">
                  {latestAttempt?.amount_claimed_egp
                    ? formatMoney(latestAttempt.amount_claimed_egp, { currency: 'EGP', locale: i18n.language })
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('admin.ordersModule.paymentMethod', 'Payment Channel')}:</span>
                <span className="font-mono uppercase">{order.payment_method ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Attempts:</span>
                <span className="font-mono">{order.payment_attempts.length}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="rounded-md border border-border p-2.5 max-h-40 overflow-y-auto space-y-1.5">
              <span className="font-semibold text-muted-foreground">Order Items</span>
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                  <div>
                    <span className="font-medium">{it.product_name}</span>
                    {it.is_refunded && (
                      <Badge variant="destructive" className="ms-1.5 text-[10px] py-0">Refunded</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">
                      {formatMoney(it.final_price_egp, { currency: 'EGP', locale: i18n.language })}
                    </span>
                    {!it.is_refunded && (order.status === 'completed' || order.status === 'approved') && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="text-[10px] text-destructive h-6 px-1.5"
                        onClick={() => setRefundItemId(it.id)}
                      >
                        <RefreshCw className="size-2.5 me-1" />
                        Refund
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Refund Dialog Drawer */}
        {refundItemId && (
          <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2 text-xs">
            <span className="font-semibold text-destructive">Execute Item Refund</span>
            <div className="space-y-1">
              <Label htmlFor="gateway-fee" className="text-xs">
                {t('admin.ordersModule.gatewayFee', 'Gateway Fee (EGP)')}
              </Label>
              <Input
                id="gateway-fee"
                type="number"
                step="0.1"
                min="0"
                value={gatewayFee}
                onChange={(e) => setGatewayFee(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="xs" onClick={() => setRefundItemId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="xs"
                onClick={handleExecuteRefund}
                disabled={refundMutation.isPending}
              >
                Confirm Refund
              </Button>
            </div>
          </div>
        )}

        {/* Rejection Form */}
        {rejectMode && (
          <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2 text-xs">
            <span className="font-semibold text-destructive">
              {rejectMode === 'wrong_amount'
                ? t('admin.ordersModule.rejectWrongAmount', 'Wrong Amount')
                : t('admin.ordersModule.rejectRefund', 'Fraudulent / Refund')}
            </span>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (sent to customer)"
              className="text-xs h-8"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="xs" onClick={() => setRejectMode(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="xs"
                onClick={handleReject}
                disabled={reviewMutation.isPending}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setRejectMode('wrong_amount')}
              disabled={reviewMutation.isPending || rejectMode !== null}
              className="gap-1 text-xs"
            >
              <XCircle className="size-3.5" />
              {t('admin.ordersModule.rejectWrongAmount', 'Wrong Amount')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRejectMode('refund')}
              disabled={reviewMutation.isPending || rejectMode !== null}
              className="gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <AlertTriangle className="size-3.5" />
              {t('admin.ordersModule.rejectRefund', 'Refuse / Fraud')}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              {t('admin.common.cancel', 'Close')}
            </Button>
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={reviewMutation.isPending}
              className="gap-1 text-xs"
            >
              <CheckCircle2 className="size-3.5" />
              {t('admin.ordersModule.approveAction', 'Approve & Dispatch')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

