import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { ShieldCheck, User } from 'lucide-react'
import { formatDate } from '@workspace/domain/formatters/date'
import type { CommentResponse } from '@workspace/domain/schemas/ticket'
import { Bubble, BubbleContent } from '@workspace/ui/components/bubble'

interface AdminTicketMessageItemProps {
  comment: CommentResponse
}

export function AdminTicketMessageItem({ comment }: AdminTicketMessageItemProps) {
  const { t } = useTranslation()
  const { lang = 'en' } = useParams<{ lang: string }>()

  const formattedTime = formatDate(comment.created_at, {
    locale: lang,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  if (comment.author_type === 'system') {
    return (
      <div className="flex items-center gap-3 my-3 px-1">
        <div className="h-px flex-1 bg-border/60" />
        <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap">
          {comment.content}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground/75 tabular-nums">
          {formattedTime}
        </span>
        <div className="h-px flex-1 bg-border/60" />
      </div>
    )
  }

  const isOperator = comment.author_type === 'admin'

  return (
    <div
      className={`flex flex-col gap-1 my-2.5 max-w-[90%] sm:max-w-[80%] md:max-w-[640px] ${
        isOperator ? 'ms-auto items-end' : 'me-auto items-start'
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-1">
        {isOperator ? (
          <>
            <span className="font-semibold text-primary">
              {comment.author_name || t('admin.ticketsModule.operatorAuthor', 'Support Operator')}
            </span>
            <ShieldCheck className="size-3 text-primary shrink-0" />
          </>
        ) : (
          <>
            <User className="size-3 text-muted-foreground shrink-0" />
            <span className="font-medium text-foreground">
              {comment.author_name || t('admin.ticketsModule.customerAuthor', 'Customer')}
            </span>
          </>
        )}
        <span className="text-[10px] font-mono text-muted-foreground/75 tabular-nums ms-1">
          {formattedTime}
        </span>
      </div>

      <Bubble
        variant={isOperator ? 'default' : 'secondary'}
        align={isOperator ? 'end' : 'start'}
      >
        <BubbleContent className="whitespace-pre-wrap break-words text-xs sm:text-sm">
          {comment.content}
        </BubbleContent>
      </Bubble>
    </div>
  )
}
