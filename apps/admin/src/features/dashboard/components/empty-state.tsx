import { type LucideIcon } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@workspace/ui/components/empty'

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <Empty className="min-h-[360px] border border-dashed border-border bg-card/40 p-8 sm:p-12">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-14 rounded-2xl bg-muted text-primary shadow-xs ring-1 ring-border/80 mb-2">
          <Icon className="size-7 text-primary" />
        </EmptyMedia>
        <EmptyTitle className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {title}
        </EmptyTitle>
        <EmptyDescription className="text-sm leading-relaxed text-muted-foreground max-w-md">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      {(actionLabel || secondaryActionLabel) && (
        <EmptyContent>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {actionLabel && (
              <Button size="sm" onClick={onAction} className="cursor-pointer">
                {actionLabel}
              </Button>
            )}
            {secondaryActionLabel && (
              <Button variant="outline" size="sm" onClick={onSecondaryAction} className="cursor-pointer">
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        </EmptyContent>
      )}
    </Empty>
  )
}


