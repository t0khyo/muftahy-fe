import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useSearchParams } from 'react-router'
import {
  ArrowLeft,
  Copy,
  Check,
  Clock,
  Eye,
  EyeOff,
  AlertCircle,
  Upload,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { ScrambleMaskText } from '@workspace/ui/components/scramble-text'
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from '@workspace/ui/components/alert'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@workspace/ui/components/tooltip'
import { formatMoney } from '@workspace/domain/formatters/money'
import { formatDate } from '@workspace/domain/formatters/date'
import { PaymentMethodLogo } from '../../../components/payment-method-logo'
import { useOrderDetail } from '../hooks/use-orders'
import { OrderStatusBadge } from '../components/orders/order-status-badge'
import { UploadReceiptDialog } from '../components/orders/upload-receipt-dialog'
import { CancelOrderDialog } from '../components/orders/cancel-order-dialog'
import { OpenTicketDialog } from '../components/support/open-ticket-dialog'

export function OrderDetailPage() {
  const { t } = useTranslation('account')
  const { lang = 'ar', id = '' } = useParams<{ lang: string; id: string }>()
  const [searchParams] = useSearchParams()
  const isNewOrder = searchParams.get('new') === 'true'
  const { order, isLoading, isError, refetch } = useOrderDetail(id)

  const [manualUploadOpen, setManualUploadOpen] = useState<boolean | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false)

  const uploadDialogOpen = manualUploadOpen ?? Boolean(isNewOrder && order?.status === 'pending_payment')
  const setUploadDialogOpen = (open: boolean) => setManualUploadOpen(open)
  const [selectedItemForTicket, setSelectedItemForTicket] = useState<{
    itemId: string
    keySerial?: string
    productName: string
  } | null>(null)

  // Revealed keys state map by item ID
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({})
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)
  const [copiedInstruction, setCopiedInstruction] = useState<string | null>(null)

  const toggleRevealKey = (itemId: string) => {
    setRevealedKeys((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  const handleCopyKey = async (itemId: string, serial: string) => {
    try {
      await navigator.clipboard.writeText(serial)
      setCopiedKeyId(itemId)
      setTimeout(() => setCopiedKeyId(null), 2000)
    } catch {
      // Ignore
    }
  }

  const handleCopyInstruction = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedInstruction(key)
      setTimeout(() => setCopiedInstruction(null), 2000)
    } catch {
      // Ignore
    }
  }

  const handleOpenTicketForItem = (itemId: string, productName: string, keySerial?: string | null) => {
    setSelectedItemForTicket({
      itemId,
      productName,
      keySerial: keySerial ?? undefined,
    })
    setTicketDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <Alert variant="destructive" className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <AlertTitle className="font-heading text-lg font-semibold text-foreground">
          {t('common.error', 'Order not found or access denied')}
        </AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground max-w-sm">
          We could not load details for this order. It may not exist or belongs to another account.
        </AlertDescription>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            {t('common.retry', 'Try again')}
          </Button>
          <Button size="sm" render={<Link to={`/${lang}/account/orders`} />}>
            {t('orders.detail.backToOrders')}
          </Button>
        </div>
      </Alert>
    )
  }

  const formattedDate = formatDate(order.created_at, {
    locale: lang,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const formattedTotal = formatMoney(order.total_egp, {
    currency: 'EGP',
    locale: lang,
  })

  const formattedSubtotal = formatMoney(order.subtotal_egp, {
    currency: 'EGP',
    locale: lang,
  })

  const formattedDiscount = formatMoney(order.discount_total_egp, {
    currency: 'EGP',
    locale: lang,
  })

  const isPendingPayment = order.status === 'pending_payment'
  const isUnderReview = ['payment_uploaded', 'under_review'].includes(order.status)

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div>
        <Link
          to={`/${lang}/account/orders`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180" />
          <span>{t('orders.detail.backToOrders')}</span>
        </Link>
      </div>

      {/* New Order Banner */}
      {isNewOrder && isPendingPayment && (
        <Alert className="border-primary/30 bg-primary/10 text-foreground">
          <Check className="size-4 text-primary" />
          <AlertTitle className="font-semibold">
            {lang === 'ar' ? 'تم إنشاء طلبك بنجاح!' : 'Order created successfully!'}
          </AlertTitle>
          <AlertDescription className="text-muted-foreground text-xs sm:text-sm">
            {lang === 'ar'
              ? 'يُرجى إتمام التحويل عبر فودافون كاش أو إنستاباي، ثم رفع صورة إيصال الدفع.'
              : 'Please complete transfer via Vodafone Cash or InstaPay, then upload your receipt below.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Order Header Card */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-mono text-lg sm:text-xl font-bold text-foreground">
                {order.reference_code}
              </h2>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              {t('orders.orderDate', { date: formattedDate })}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isPendingPayment && (
              <>
                <Button
                  size="sm"
                  onClick={() => setUploadDialogOpen(true)}
                  className="gap-1.5 text-xs"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{t('orders.detail.uploadReceipt')}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelDialogOpen(true)}
                  className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>{t('orders.detail.cancelOrder')}</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Verification Status Banner */}
        {isUnderReview && (
          <Alert className="mt-4 border-primary/20 bg-primary/5 text-foreground">
            <Info className="size-4 text-primary" />
            <AlertTitle className="text-sm font-semibold">
              {t('orders.status.under_review')}
            </AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              {t('orders.detail.reviewDeadline')}:{' '}
              {order.review_deadline
                ? formatDate(order.review_deadline, {
                    locale: lang,
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '1-2 hours'}
            </AlertDescription>
          </Alert>
        )}

        {/* Rejection / Warning Notice */}
        {order.rejection_reason && (
          <Alert variant="destructive" className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-4 shrink-0 mt-0.5 text-destructive" />
              <div className="space-y-0.5">
                <AlertTitle className="text-sm font-semibold">{t('orders.detail.rejectionReason')}</AlertTitle>
                <AlertDescription className="text-xs">{order.rejection_reason}</AlertDescription>
              </div>
            </div>
            {isPendingPayment && (
              <AlertAction>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setUploadDialogOpen(true)}
                  className="gap-1.5 text-xs shrink-0"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{t('orders.detail.uploadReceipt')}</span>
                </Button>
              </AlertAction>
            )}
          </Alert>
        )}
      </Card>

      {/* Payment Instructions (If Pending Payment) */}
      {isPendingPayment && order.payment_instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span>{t('orders.detail.paymentInstructions')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              {t('orders.detail.referenceNotice')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vodafone Cash Box */}
              <div className="rounded-lg border border-border p-3.5 bg-muted/30 space-y-2">
                <div className="flex items-center gap-2">
                  <PaymentMethodLogo method="vodafone_cash" size="sm" decorative />
                  <span className="text-xs font-semibold text-foreground">
                    {t('orders.detail.vodafoneCash')}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-foreground">
                    {order.payment_instructions.vodafone_cash_number}
                  </span>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() =>
                            handleCopyInstruction(
                              order.payment_instructions.vodafone_cash_number,
                              'vf',
                            )
                          }
                        />
                      }
                    >
                      {copiedInstruction === 'vf' ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      {copiedInstruction === 'vf' ? t('orders.detail.copied') : t('orders.detail.copy')}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* InstaPay Box */}
              <div className="rounded-lg border border-border p-3.5 bg-muted/30 space-y-2">
                <div className="flex items-center gap-2">
                  <PaymentMethodLogo method="instapay" size="sm" decorative />
                  <span className="text-xs font-semibold text-foreground">
                    {t('orders.detail.instapay')}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-foreground">
                    {order.payment_instructions.instapay_ipa}
                  </span>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() =>
                            handleCopyInstruction(order.payment_instructions.instapay_ipa, 'ipa')
                          }
                        />
                      }
                    >
                      {copiedInstruction === 'ipa' ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      {copiedInstruction === 'ipa' ? t('orders.detail.copied') : t('orders.detail.copy')}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items & Keys Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {t('orders.detail.itemsTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y divide-border">
            {order.items.map((item) => {
              const hasKey = Boolean(item.key_serial)
              const isRevealed = Boolean(revealedKeys[item.id])
              const isCopied = copiedKeyId === item.id

              return (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-sm font-semibold text-foreground">
                        {item.product_name}
                      </span>
                      {item.is_preorder && (
                        <span className="inline-block text-[11px] font-medium text-amber-600 dark:text-amber-400">
                          (Pre-order)
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-foreground text-sm sm:text-base">
                      {formatMoney(item.final_price_egp, {
                        currency: 'EGP',
                        locale: lang,
                      })}
                    </span>
                  </div>

                  {/* Delivered Key Reveal & Copy Row */}
                  {hasKey && item.key_serial && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
                      <div className="flex items-center gap-2 overflow-x-auto">
                        <span
                          dir="ltr"
                          className={`font-mono text-xs sm:text-sm font-semibold tracking-wider select-all ${
                            isRevealed ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        >
                          <ScrambleMaskText
                            value={item.key_serial}
                            mask="•••••-•••••-•••••-•••••-•••••"
                            revealed={isRevealed}
                            hiddenAriaText={t('keys.keyHiddenAria')}
                          />
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => toggleRevealKey(item.id)}
                                className="h-8 gap-1.5 text-xs"
                              />
                            }
                          >
                            {isRevealed ? (
                              <>
                                <EyeOff className="h-3 w-3" />
                                <span>{t('orders.detail.hideKey')}</span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3" />
                                <span>{t('orders.detail.revealKey')}</span>
                              </>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {isRevealed ? t('orders.detail.hideKey') : t('orders.detail.revealKey')}
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                type="button"
                                variant={isCopied ? 'outline' : 'default'}
                                size="sm"
                                onClick={() => handleCopyKey(item.id, item.key_serial!)}
                                className="h-8 gap-1.5 text-xs"
                              />
                            }
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span>{t('orders.detail.copied')}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>{t('orders.detail.copy')}</span>
                              </>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {isCopied ? t('orders.detail.copied') : t('orders.detail.copy')}
                          </TooltipContent>
                        </Tooltip>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleOpenTicketForItem(item.id, item.product_name, item.key_serial)
                          }
                          className="h-8 text-xs text-muted-foreground hover:text-destructive"
                        >
                          {t('orders.detail.reportIssue')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-border pt-4 space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{t('orders.detail.subtotal')}</span>
              <span>{formattedSubtotal}</span>
            </div>
            {order.discount_total_egp > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>{t('orders.detail.discount')}</span>
                <span>-{formattedDiscount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-foreground text-sm sm:text-base border-t border-border/50 pt-2">
              <span>{t('orders.detail.total')}</span>
              <span>{formattedTotal}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <UploadReceiptDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        orderId={order.id}
        suggestedAmount={order.total_egp}
      />

      <CancelOrderDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        orderId={order.id}
        referenceCode={order.reference_code}
      />

      {selectedItemForTicket && (
        <OpenTicketDialog
          open={ticketDialogOpen}
          onOpenChange={setTicketDialogOpen}
          orderItemId={selectedItemForTicket.itemId}
          keySerial={selectedItemForTicket.keySerial}
          productName={selectedItemForTicket.productName}
        />
      )}
    </div>
  )
}
