import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { ShieldAlert, User, Info } from 'lucide-react'
import { formatDate } from '@workspace/domain/formatters/date'
import type { CommentResponse } from '@workspace/domain/schemas/ticket'

interface TicketMessageItemProps {
  comment: CommentResponse
}

export function TicketMessageItem({ comment }: TicketMessageItemProps) {
  const { t } = useTranslation('account')
  const { lang = 'ar' } = useParams<{ lang: string }>()

  const formattedTime = formatDate(comment.created_at, {
    locale: lang,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  if (comment.author_type === 'system') {
    return (
      <div className="flex justify-center my-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3.5 py-1 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>{comment.content}</span>
          <span className="text-[10px] opacity-70">({formattedTime})</span>
        </div>
      </div>
    )
  }

  const isCustomer = comment.author_type === 'customer'

  return (
    <div className={`flex flex-col gap-1 my-3 max-w-[85%] ${isCustomer ? 'ms-auto items-end' : 'me-auto items-start'}`}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-1">
        {isCustomer ? (
          <>
            <span className="font-medium text-foreground">{t('support.thread.customerAuthor')}</span>
            <User className="h-3.5 w-3.5" />
          </>
        ) : (
          <>
            <ShieldAlert className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-primary">{t('support.thread.operatorAuthor')}</span>
          </>
        )}
        <span>•</span>
        <span className="text-[11px]">{formattedTime}</span>
      </div>

      <div
        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isCustomer
            ? 'bg-primary text-primary-foreground rounded-te-xs'
            : 'bg-muted border border-border text-foreground rounded-ts-xs'
        }`}
      >
        {comment.content}
      </div>
    </div>
  )
}

