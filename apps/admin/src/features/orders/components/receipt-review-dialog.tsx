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
import { Card } from '@workspace/ui/components/card'
import { Alert, AlertTitle, AlertAction } from '@workspace/ui/components/alert'
import { Tooltip, TooltipTrigger, TooltipContent } from '@workspace/ui/components/tooltip'
import { Field, FieldLabel, FieldGroup } from '@workspace/ui/components/field'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@workspace/ui/components/input-group'
import { useTranslation } from 'react-i18next'
import {
  useReviewOrder,
  useRefundOrderItem,
  useAdminReceiptImage,
} from '../hooks/use-admin-orders'
import type { OrderResponse } from '@workspace/domain/schemas/order'
import { formatMoney } from '@workspace/domain/formatters/money'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Loader2,
} from 'lucide-react'
import { AdminQueryError } from '../../../components/feedback/admin-query-error'
import { FormErrorAlert } from '../../../components/feedback/form-error-alert'

interface ReceiptReviewDialogProps {
  order: OrderResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReceiptReviewDialog({ order, open, onOpenChange }: ReceiptReviewDialogProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <ReceiptReviewDialogContent
          key={`${order.id}-${order.payment_attempts[order.payment_attempts.length - 1]?.id ?? 'latest'}`}
          order={order}
          onOpenChange={onOpenChange}
        />
      )}
    </Dialog>
  )
}

function ReceiptReviewDialogContent({
  order,
  onOpenChange,
}: {
  order: OrderResponse
  onOpenChange: (open: boolean) => void
}) {
  const { t, i18n } = useTranslation(['admin'])
  const reviewMutation = useReviewOrder({ errorMode: 'inline' })
  const refundMutation = useRefundOrderItem({ errorMode: 'inline' })

  const [rejectMode, setRejectMode] = React.useState<'wrong_amount' | 'refund' | null>(null)
  const [rejectReason, setRejectReason] = React.useState('')
  const [refundItemId, setRefundItemId] = React.useState<string | null>(null)
  const [gatewayFee, setGatewayFee] = React.useState('0')
  const [preorderWarning, setPreorderWarning] = React.useState(false)

  const [rotation, setRotation] = React.useState(0)
  const [isZoomed, setIsZoomed] = React.useState(false)

  const latestAttempt = order.payment_attempts[order.payment_attempts.length - 1]

  const {
    data: imageBlob,
    isLoading: imageLoading,
    isError: imageError,
    error: imageLoadError,
    isFetching: imageFetching,
    refetch: refetchImage,
  } = useAdminReceiptImage(order.id, latestAttempt?.id, {
    enabled: Boolean(order.id && latestAttempt?.id),
  })

  const imageUrl = React.useMemo(() => {
    if (!imageBlob) return null
    return URL.createObjectURL(imageBlob)
  }, [imageBlob])

  React.useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [imageUrl])

  const handleApprove = async () => {
    reviewMutation.reset()
    refundMutation.reset()
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
      // Keeps dialog open; MutationCache handles toast errors and FormErrorAlert renders 400/409/422
    }
  }

  const handleReject = async () => {
    if (!rejectMode) return
    reviewMutation.reset()
    refundMutation.reset()
    const action = rejectMode === 'wrong_amount' ? 'reject_wrong_amount' : 'reject_refund'
    try {
      await reviewMutation.mutateAsync({
        orderId: order.id,
        payload: { action, reason: rejectReason || undefined },
      })
      setRejectMode(null)
      setRejectReason('')
      onOpenChange(false)
    } catch {
      // Keeps dialog open on failure
    }
  }

  const handleExecuteRefund = async () => {
    if (!refundItemId) return
    reviewMutation.reset()
    refundMutation.reset()
    try {
      await refundMutation.mutateAsync({
        orderId: order.id,
        itemId: refundItemId,
        payload: { gateway_fee_egp: parseFloat(gatewayFee) || 0 },
      })
      setRefundItemId(null)
      setGatewayFee('0')
    } catch {
      // Keeps dialog open on failure
    }
  }

  return (
    <DialogContent className="sm:max-w-4xl overflow-y-auto max-h-[90vh] p-6">
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
            {t('admin:ordersModule.receiptImage', 'Payment Receipt Verification')}
          </DialogDescription>
        </DialogHeader>

        <FormErrorAlert error={refundMutation.error ?? reviewMutation.error} className="mt-3" />

        {preorderWarning && (
          <Alert className="border-warning/30 bg-warning/10 text-foreground mt-3">
            <AlertTriangle className="size-4 shrink-0 text-warning" />
            <AlertTitle className="text-xs font-semibold">
              {t('admin:ordersModule.preorderConverted', 'Order converted to preorder backorder due to zero available stock')}
            </AlertTitle>
            <AlertAction>
              <Button
                variant="outline"
                size="xs"
                className="cursor-pointer"
                onClick={() => {
                  setPreorderWarning(false)
                  onOpenChange(false)
                }}
              >
                {t('admin:common.confirm', 'Dismiss & Close')}
              </Button>
            </AlertAction>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          {/* Receipt Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col rounded-lg border border-border bg-muted/10 p-4 min-h-[380px]">
            {/* Image Toolbar */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/60">
              <span className="text-xs font-semibold text-muted-foreground font-mono">
                {latestAttempt?.payment_method?.toUpperCase() || 'RECEIPT'}
              </span>
              <div className="flex items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        disabled={!imageUrl}
                        aria-label="Rotate image 90 degrees"
                        className="h-7 px-2 text-xs cursor-pointer"
                      >
                        <RotateCw className="size-3.5 me-1" />
                        <span>90°</span>
                      </Button>
                    }
                  />
                  <TooltipContent>Rotate image 90 degrees</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => setIsZoomed((z) => !z)}
                        disabled={!imageUrl}
                        aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
                        className="h-7 px-2 text-xs cursor-pointer"
                      >
                        {isZoomed ? <ZoomOut className="size-3.5" /> : <ZoomIn className="size-3.5" />}
                      </Button>
                    }
                  />
                  <TooltipContent>{isZoomed ? 'Zoom out' : 'Zoom in'}</TooltipContent>
                </Tooltip>
                {imageUrl && (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <a
                          href={imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/80 transition-colors"
                          aria-label="Open full image in new tab"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      }
                    />
                    <TooltipContent>Open full image in new tab</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Image Canvas / State */}
            <div className="flex-1 flex items-center justify-center overflow-hidden rounded-md bg-background/50 border border-border/40 min-h-[300px] p-2">
              {imageLoading ? (
                <div className="flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-5 animate-spin text-primary" />
                  <span>Loading receipt image...</span>
                </div>
              ) : imageError ? (
                <div className="w-full p-2">
                  <AdminQueryError
                    error={imageLoadError}
                    onRetry={() => refetchImage()}
                    isRetrying={imageFetching}
                    variant="compact"
                  />
                </div>
              ) : imageUrl ? (
                <div className="w-full flex items-center justify-center overflow-auto max-h-[380px]">
                  <img
                    src={imageUrl}
                    alt="Customer bank receipt"
                    className={`transition-transform duration-200 object-contain rounded select-none ${
                      isZoomed ? 'max-h-none w-full cursor-zoom-out' : 'max-h-72 w-auto cursor-zoom-in'
                    }`}
                    style={{ transform: `rotate(${rotation}deg)` }}
                    onClick={() => setIsZoomed((z) => !z)}
                  />
                </div>
              ) : (
                <div className="text-center text-xs text-muted-foreground">
                  <p>No receipt image file available</p>
                </div>
              )}
            </div>
          </div>

          {/* Verification Details (5 cols) */}
          <div className="lg:col-span-5 space-y-4 text-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4 space-y-2.5 bg-background shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('admin.ordersModule.orderTotal', 'Order Total')}:</span>
                  <span className="font-mono font-semibold text-sm">
                    {formatMoney(order.total_egp, { currency: 'EGP', locale: i18n.language })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('admin.ordersModule.claimedAmount', 'Claimed Amount')}:</span>
                  <span className="font-mono font-semibold text-sm text-primary">
                    {latestAttempt?.amount_claimed_egp
                      ? formatMoney(latestAttempt.amount_claimed_egp, { currency: 'EGP', locale: i18n.language })
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-border/40">
                  <span className="text-muted-foreground">{t('admin.ordersModule.paymentMethod', 'Payment Channel')}:</span>
                  <span className="font-mono uppercase font-medium">{order.payment_method ?? 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Attempts:</span>
                  <span className="font-mono">{order.payment_attempts.length}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="rounded-lg border border-border p-3 max-h-48 overflow-y-auto space-y-2">
                <span className="font-semibold text-muted-foreground block text-[11px] uppercase tracking-wider">Order Items</span>
                {order.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
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
        </div>

        {/* Refund Dialog Drawer */}
        {refundItemId && (
          <Card className="mt-4 border-destructive/30 bg-destructive/5 p-3.5 space-y-3 text-xs shadow-none">
            <span className="font-semibold text-destructive">Execute Item Refund</span>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="gateway-fee" className="text-xs">
                  {t('admin.ordersModule.gatewayFee', 'Gateway Fee')}
                </FieldLabel>
                <InputGroup className="h-8">
                  <InputGroupInput
                    id="gateway-fee"
                    type="number"
                    step="0.1"
                    min="0"
                    value={gatewayFee}
                    onChange={(e) => setGatewayFee(e.target.value)}
                    className="text-xs font-mono"
                  />
                  <InputGroupAddon align="inline-end" className="text-xs text-muted-foreground font-mono">
                    EGP
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </FieldGroup>
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
          </Card>
        )}

        {/* Rejection Form */}
        {rejectMode && (
          <Card className="mt-4 border-destructive/30 bg-destructive/5 p-3.5 space-y-3 text-xs shadow-none">
            <span className="font-semibold text-destructive">
              {rejectMode === 'wrong_amount'
                ? t('admin.ordersModule.rejectWrongAmount', 'Wrong Amount')
                : t('admin.ordersModule.rejectRefund', 'Fraudulent / Refund')}
            </span>
            <FieldGroup>
              <Field>
                <Input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection (sent to customer)"
                  className="text-xs h-8"
                />
              </Field>
            </FieldGroup>
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
          </Card>
        )}

        {/* Action Controls */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-border mt-6">
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
              {t('admin.ordersModule.approveAction', 'Approve & Deliver Keys')}
            </Button>
          </div>
        </div>
      </DialogContent>
  )
}

