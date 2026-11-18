import { type LucideIcon } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

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
    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 sm:p-12 min-h-[380px]">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-foreground/80 shadow-xs ring-1 ring-border mb-4">
          <Icon className="size-7 text-primary" />
        </div>
        <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {(actionLabel || secondaryActionLabel) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {actionLabel && (
              <Button onClick={onAction}>
                {actionLabel}
              </Button>
            )}
            {secondaryActionLabel && (
              <Button variant="outline" onClick={onSecondaryAction}>
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

