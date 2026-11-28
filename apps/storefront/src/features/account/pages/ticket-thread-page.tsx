import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import {
  ArrowLeft,
  Send,
  Loader2,
  Check,
  Copy,
  Eye,
  EyeOff,
  AlertCircle,
  FileText,
  Lock,
  Sparkles,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Textarea } from '@workspace/ui/components/textarea'
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@workspace/ui/components/alert'
import {
  Field,
  FieldLabel,
} from '@workspace/ui/components/field'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@workspace/ui/components/tooltip'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { ScrambleMaskText } from '@workspace/ui/components/scramble-text'
import { formatDate } from '@workspace/domain/formatters/date'
import { useTicketDetail, useAddTicketComment } from '../hooks/use-tickets'
import { TicketStatusBadge } from '../components/support/ticket-status-badge'
import { TicketMessageItem } from '../components/support/ticket-message-item'

export function TicketThreadPage() {
  const { t } = useTranslation('account')
  const { lang = 'ar', id = '' } = useParams<{ lang: string; id: string }>()
  const { ticket, isLoading, isError, refetch } = useTicketDetail(id)
  const { mutateAsync: addComment, isPending: isAddingComment } = useAddTicketComment(id)

  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Replacement key reveal/copy state
  const [isReplacementRevealed, setIsReplacementRevealed] = useState(false)
  const [isReplacementCopied, setIsReplacementCopied] = useState(false)

  const handleCopyReplacementKey = async (serial: string) => {
    try {
      await navigator.clipboard.writeText(serial)
      setIsReplacementCopied(true)
      setTimeout(() => setIsReplacementCopied(false), 2000)
    } catch {
      // Ignore
    }
  }

  const handleSendComment = async (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isAddingComment) return

    setErrorMsg(null)
    try {
      await addComment(message.trim())
      setMessage('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send message.'
      setErrorMsg(msg)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-44 rounded-lg" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !ticket) {
    return (
      <Alert variant="destructive" className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <AlertTitle className="font-heading text-lg font-semibold text-foreground">
          {t('common.error', 'Ticket not found or access denied')}
        </AlertTitle>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            {t('common.retry', 'Try again')}
          </Button>
          <Button size="sm" render={<Link to={`/${lang}/account/support`} />}>
            {t('support.thread.backToTickets')}
          </Button>
        </div>
      </Alert>
    )
  }

  const formattedDate = formatDate(ticket.created_at, {
    locale: lang,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6">
      {/* Back to Support */}
      <div>
        <Link
          to={`/${lang}/account/support`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180" />
          <span>{t('support.thread.backToTickets')}</span>
        </Link>
      </div>

      {/* Ticket Meta Header Card */}
      <Card className="p-4 sm:p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-base sm:text-lg font-bold text-foreground">
                {t('support.ticketNumber', { id: ticket.id.slice(0, 8) })}
              </h2>
              <TicketStatusBadge status={ticket.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              {t('support.createdOn', { date: formattedDate })}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-muted/40 p-3 text-xs border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-muted-foreground block text-[11px]">
              {t('support.thread.keyUnderReview')}
            </span>
            <span className="font-mono font-semibold text-foreground">
              {ticket.key_serial}
            </span>
          </div>
        </div>
      </Card>

      {/* Outcome Banner: Replacement Key */}
      {ticket.replacement_key_serial && (
        <Card className="border-emerald-500/40 bg-emerald-500/5 p-4 sm:p-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-5 w-5 shrink-0" />
              <h3 className="font-heading text-base font-bold">
                {t('support.thread.replacementBannerTitle')}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('support.thread.replacementBannerDesc')}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-background p-3">
              <span
                dir="ltr"
                className={`font-mono text-sm sm:text-base font-bold tracking-wider select-all ${
                  isReplacementRevealed ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <ScrambleMaskText
                  value={ticket.replacement_key_serial}
                  mask="•••••-•••••-•••••-•••••-•••••"
                  revealed={isReplacementRevealed}
                  hiddenAriaText={t('keys.keyHiddenAria')}
                />
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsReplacementRevealed(!isReplacementRevealed)}
                        className="h-8 gap-1.5 text-xs"
                      />
                    }
                  >
                    {isReplacementRevealed ? (
                      <>
                        <EyeOff className="h-3 w-3" />
                        <span>{t('keys.hide')}</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" />
                        <span>{t('keys.reveal')}</span>
                      </>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    {isReplacementRevealed ? t('keys.hide') : t('keys.reveal')}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant={isReplacementCopied ? 'outline' : 'default'}
                        size="sm"
                        onClick={() =>
                          handleCopyReplacementKey(ticket.replacement_key_serial!)
                        }
                        className="h-8 gap-1.5 text-xs"
                      />
                    }
                  >
                    {isReplacementCopied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-500" />
                        <span>{t('keys.copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>{t('keys.copy')}</span>
                      </>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    {isReplacementCopied ? t('keys.copied') : t('keys.copy')}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Outcome Banner: Refund */}
      {ticket.outcome === 'refund' && (
        <Alert className="border-sky-500/30 bg-sky-500/5 text-foreground">
          <RotateCcw className="size-4 text-sky-600 dark:text-sky-400" />
          <AlertTitle className="text-sm font-semibold">
            {t('support.thread.refundBannerTitle')}
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            {t('support.thread.refundBannerDesc')}
          </AlertDescription>
        </Alert>
      )}

      {/* Outcome Banner: Refused */}
      {ticket.outcome === 'refused' && (
        <Alert variant="destructive">
          <XCircle className="size-4" />
          <AlertTitle className="text-sm font-semibold">
            {t('support.thread.refusedBannerTitle')}
          </AlertTitle>
          <AlertDescription className="text-xs">
            {t('support.thread.refusedBannerDesc')}
          </AlertDescription>
        </Alert>
      )}

      {/* Attachments Section (If Any) */}
      {ticket.attachments.length > 0 && (
        <Card className="p-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-foreground">
              {t('support.dialog.attachments')} ({ticket.attachments.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {ticket.attachments.map((att) => (
                <div
                  key={att.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground"
                >
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate max-w-[200px]">{att.file_name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Conversation Messages Thread */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {t('support.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ticket.comments.map((comment) => (
              <TicketMessageItem key={comment.id} comment={comment} />
            ))}
          </div>

          {/* Reply Form or Locked Notice */}
          <div className="border-t border-border pt-4 mt-6">
            {ticket.is_locked ? (
              <Alert className="bg-muted border-border text-muted-foreground">
                <Lock className="size-4" />
                <AlertDescription className="text-xs">
                  {t('support.thread.ticketLocked')}
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSendComment} className="space-y-3">
                {errorMsg && (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
                  </Alert>
                )}
                <Field>
                  <FieldLabel htmlFor="reply_content" className="text-xs font-medium text-foreground">
                    {t('support.thread.replyBoxLabel')}
                  </FieldLabel>
                  <Textarea
                    id="reply_content"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('support.thread.replyPlaceholder')}
                    disabled={isAddingComment}
                  />
                </Field>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!message.trim() || isAddingComment}
                    className="gap-2 text-xs"
                  >
                    {isAddingComment && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>{isAddingComment ? t('support.thread.sending') : t('support.thread.sendReply')}</span>
                    <Send className="h-3.5 w-3.5 rtl:rotate-180" />
                  </Button>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
