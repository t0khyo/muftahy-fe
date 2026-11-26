import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import {
  MessageSquare,
  Send,
  Loader2,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  X,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@workspace/ui/components/sheet'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Textarea } from '@workspace/ui/components/textarea'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/ui/components/empty'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@workspace/ui/components/tooltip'
import { formatDate } from '@workspace/domain/formatters/date'
import type { TicketStatus } from '@workspace/domain/schemas/ticket'
import { AdminQueryError } from '../../../components/feedback/admin-query-error'
import { FormErrorAlert } from '../../../components/feedback/form-error-alert'
import { useTicketDetail, useAddTicketComment } from '../hooks/use-tickets'
import { MaskedKeyReveal } from '../../inventory/components/masked-key-reveal'
import { AdminTicketMessageItem } from './admin-ticket-message-item'

export interface AdminTicketChatSheetProps {
  ticketId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenResolve?: (ticketId: string) => void
}

export function AdminTicketChatSheet({
  ticketId,
  open,
  onOpenChange,
  onOpenResolve,
}: AdminTicketChatSheetProps) {
  if (!ticketId) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Physical right-0 and left-auto explicitly required so the chat sheet docks to the right side across both LTR and RTL viewports */}
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full inset-y-0 right-0 left-auto h-full border-s rtl:border-s-0 rtl:border-e data-[side=right]:w-full data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:left-auto data-[side=right]:h-full data-[side=right]:border-s data-[side=right]:rtl:border-s-0 data-[side=right]:rtl:border-e sm:max-w-2xl md:max-w-3xl lg:max-w-4xl data-[side=right]:sm:max-w-2xl data-[side=right]:md:max-w-3xl data-[side=right]:lg:max-w-4xl rtl:data-[side=right]:data-starting-style:translate-x-[2.5rem] rtl:data-[side=right]:data-ending-style:translate-x-[2.5rem] p-0 flex flex-col bg-background shadow-2xl"
      >
        {open && (
          <AdminTicketChatContent
            ticketId={ticketId}
            onOpenResolve={onOpenResolve}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function AdminTicketChatContent({
  ticketId,
  onOpenResolve,
  onClose,
}: {
  ticketId: string
  onOpenResolve?: (ticketId: string) => void
  onClose: () => void
}) {
  const { t } = useTranslation(['admin'])
  const { lang = 'en' } = useParams<{ lang: string }>()
  const {
    data: ticket,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useTicketDetail(ticketId)
  const addCommentMutation = useAddTicketComment({ errorMode: 'inline' })

  const [message, setMessage] = React.useState('')
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }, [])

  React.useEffect(() => {
    if (ticket?.comments) {
      scrollToBottom('auto')
    }
  }, [ticket?.comments, scrollToBottom])

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const content = message.trim()
    if (!content || addCommentMutation.isPending) return

    addCommentMutation.reset()
    try {
      await addCommentMutation.mutateAsync({
        ticketId,
        content,
      })
      setMessage('')
      setTimeout(() => scrollToBottom('smooth'), 50)
    } catch {
      // Keeps input intact; FormErrorAlert displays 400/409/422 and MutationCache handles toast errors
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleApplyCanned = (text: string) => {
    setMessage(text)
    textareaRef.current?.focus()
  }

  const getStatusBadgeVariant = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return 'destructive'
      case 'in_progress':
        return 'secondary'
      case 'resolved':
      case 'closed':
        return 'default'
      default:
        return 'secondary'
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="flex-1 space-y-3 pt-4">
          <Skeleton className="h-14 w-3/4" />
          <Skeleton className="h-14 w-3/4 ms-auto" />
          <Skeleton className="h-14 w-2/3" />
        </div>
      </div>
    )
  }

  if (isError || !ticket) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <AdminQueryError
          error={error}
          onRetry={() => refetch()}
          isRetrying={isFetching}
          variant="section"
        />
      </div>
    )
  }

  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved'

  return (
    <div className="flex flex-col h-full overflow-hidden text-start">
      {/* Top Workstation Header */}
      <SheetHeader className="p-3.5 sm:p-5 pb-3 border-b border-border/60 bg-muted/20 shrink-0 text-start space-y-2.5">
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="sm:hidden -ms-2 h-8 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
              aria-label={t('common.back', 'Back')}
            >
              <ArrowLeft className="size-4 rtl:rotate-180" />
              <span className="font-medium">{t('common.back', 'Back')}</span>
            </Button>

            <SheetTitle className="font-mono text-sm sm:text-base font-bold tracking-tight truncate">
              {`#${ticket.id.slice(0, 8)}`}
            </SheetTitle>
            <Badge
              variant={getStatusBadgeVariant(ticket.status)}
              className="capitalize text-[10px] font-mono tracking-tight shrink-0"
            >
              {ticket.status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenResolve && (
              <Button
                variant={isClosed ? 'outline' : 'default'}
                size="sm"
                onClick={() => onOpenResolve(ticket.id)}
                className="h-8 gap-1.5 text-xs"
              >
                {isClosed ? (
                  <>
                    <ShieldCheck className="size-3.5" />
                    <span>{t('admin.ticketsModule.viewOutcome', 'View Outcome')}</span>
                  </>
                ) : (
                  <>
                    <Clock className="size-3.5" />
                    <span>{t('admin.ticketsModule.resolveTicket', 'Resolve')}</span>
                  </>
                )}
              </Button>
            )}

            {/* Desktop Close Button */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onClose}
                    className="hidden sm:inline-flex text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={t('common.close', 'Close')}
                  >
                    <X className="size-4" />
                  </Button>
                }
              />
              <TooltipContent>{t('common.close', 'Close')}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <SheetDescription className="sr-only">
          {t(
            'admin.ticketsModule.chatDrawerDesc',
            'Real-time communication and defective key audit'
          )}
        </SheetDescription>

        {/* Disciplined Metadata Strip */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-2 border-t border-border/40 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-medium">
              {t('admin.ticketsModule.defectiveKey', 'Reported Key')}:
            </span>
            <MaskedKeyReveal serial={ticket.key_serial} />
          </div>

          <div className="flex items-center gap-2.5 text-muted-foreground text-[11px] font-mono ms-auto">
            <span>
              Item: <span className="text-foreground font-medium">{`#${ticket.order_item_id.slice(0, 8)}`}</span>
            </span>
            <span>•</span>
            <span className="tabular-nums">
              {formatDate(ticket.created_at, {
                locale: lang,
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </span>
          </div>
        </div>

        {/* Resolution Outcome Strip (if present) */}
        {ticket.outcome && (
          <div className="flex items-center justify-between gap-2 p-2 rounded-md border border-border/70 bg-muted/30 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <CheckCircle2 className="size-3.5 text-primary shrink-0" />
              <span>Outcome: <strong className="font-mono uppercase">{ticket.outcome}</strong></span>
            </div>
            {ticket.replacement_key_serial && (
              <span className="font-mono text-[11px] text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border/60">
                Replacement Issued
              </span>
            )}
          </div>
        )}

        {/* Customer Evidence Attachments Bar */}
        {ticket.attachments.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-[11px] text-muted-foreground shrink-0 font-medium">
              {t('admin.ticketsModule.attachmentsTitle', 'Evidence')} ({ticket.attachments.length}):
            </span>
            {ticket.attachments.map((att) => (
              <div
                key={att.id}
                className="inline-flex items-center gap-1.5 rounded border border-border/60 bg-background px-2 py-0.5 text-[11px] text-foreground font-mono shrink-0"
              >
                <FileText className="size-3 text-muted-foreground" />
                <span className="truncate max-w-[150px] sm:max-w-[260px]">{att.file_name}</span>
                <span className="text-[10px] text-muted-foreground">
                  ({Math.round(att.file_size_bytes / 1024)} KB)
                </span>
              </div>
            ))}
          </div>
        )}
      </SheetHeader>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 bg-muted/5">
        {ticket.comments.length === 0 ? (
          <Empty className="h-full border-0 bg-transparent py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="size-12 rounded-xl bg-muted/60 text-muted-foreground mb-1">
                <MessageSquare className="size-6 opacity-60" />
              </EmptyMedia>
              <EmptyTitle className="text-sm font-semibold">
                {t(
                  'admin.ticketsModule.noMessages',
                  'No messages recorded on this ticket yet.'
                )}
              </EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          ticket.comments.map((comment) => (
            <AdminTicketMessageItem key={comment.id} comment={comment} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Operator Reply & Canned Presets Footer */}
      <div className="p-3.5 sm:p-5 border-t border-border/80 bg-background shrink-0 space-y-2.5 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
        {/* Quick Canned Presets without Emojis */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-medium shrink-0 me-1">
            {t('admin.ticketsModule.quickResponses', 'Presets')}:
          </span>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() =>
              handleApplyCanned(
                t(
                  'admin.ticketsModule.cannedRequestScreenshot',
                  'Please provide a clear screenshot of the error code encountered during activation.'
                )
              )
            }
            className="text-xs px-2.5 py-1 rounded-md shrink-0 font-medium cursor-pointer"
          >
            {t('admin.ticketsModule.cannedRequestScreenshotBtn', 'Request Screenshot')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() =>
              handleApplyCanned(
                t(
                  'admin.ticketsModule.cannedInvestigatingKey',
                  'We are currently checking the activation status with our supplier.'
                )
              )
            }
            className="text-xs px-2.5 py-1 rounded-md shrink-0 font-medium cursor-pointer"
          >
            {t('admin.ticketsModule.cannedInvestigatingKeyBtn', 'Investigating Key')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() =>
              handleApplyCanned(
                t(
                  'admin.ticketsModule.cannedReplacementDispatched',
                  'A replacement license key has been added to your order.'
                )
              )
            }
            className="text-xs px-2.5 py-1 rounded-md shrink-0 font-medium cursor-pointer"
          >
            {t('admin.ticketsModule.cannedReplacementDispatchedBtn', 'Replacement Issued')}
          </Button>
        </div>

        <FormErrorAlert error={addCommentMutation.error} />

        {isClosed && (
          <Alert className="py-2 text-xs border-border/60 bg-muted/50">
            <Lock className="size-3.5 text-muted-foreground" />
            <AlertDescription className="text-[11px] text-muted-foreground">
              {t(
                'admin.ticketsModule.ticketResolvedNotice',
                'This support ticket is resolved and closed for messages.'
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="space-y-2">
          <Textarea
            ref={textareaRef}
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t(
              'admin.ticketsModule.replyPlaceholder',
              'Type your message to the customer... (Enter to send, Shift+Enter for new line)'
            )}
            disabled={addCommentMutation.isPending}
            className="text-xs sm:text-sm resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-mono">
              Enter to send, Shift+Enter for newline
            </span>
            <Button
              type="submit"
              size="sm"
              disabled={!message.trim() || addCommentMutation.isPending}
              className="gap-1.5 text-xs h-8"
            >
              {addCommentMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>{t('admin.ticketsModule.sending', 'Sending...')}</span>
                </>
              ) : (
                <>
                  <span>{t('admin.ticketsModule.sendReply', 'Send Reply')}</span>
                  <Send className="size-3.5 rtl:rotate-180" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
