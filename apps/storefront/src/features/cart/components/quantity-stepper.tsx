import { Minus, Plus } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

export interface QuantityStepperProps {
  quantity: number
  onDecrease: () => void
  onIncrease: () => void
  decreaseLabel: string
  increaseLabel: string
  quantityLabel: string
  min?: number
  max?: number
  disabled?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function QuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
  decreaseLabel,
  increaseLabel,
  quantityLabel,
  min = 1,
  max,
  disabled = false,
  size = 'md',
  className,
}: QuantityStepperProps) {
  const canDecrease = !disabled && quantity > min
  const canIncrease = !disabled && (max === undefined || max <= 0 || quantity < max)
  const isSmall = size === 'sm'

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-border/60 bg-secondary/30',
        isSmall ? 'h-8 p-0.5' : 'h-9 p-0.5',
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!canDecrease}
        onClick={onDecrease}
        aria-label={decreaseLabel}
        className={cn(
          'rounded-md text-muted-foreground hover:text-foreground hover:bg-background/80 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors',
          isSmall ? 'size-7' : 'size-8',
        )}
      >
        <Minus className={isSmall ? 'size-3' : 'size-3.5'} aria-hidden="true" />
      </Button>

      <span
        aria-label={quantityLabel}
        className={cn(
          'font-semibold text-foreground tabular-nums select-none text-center',
          isSmall ? 'min-w-6 px-1.5 text-xs' : 'min-w-8 px-2 text-sm',
        )}
      >
        {quantity}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!canIncrease}
        onClick={onIncrease}
        aria-label={increaseLabel}
        className={cn(
          'rounded-md text-muted-foreground hover:text-foreground hover:bg-background/80 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors',
          isSmall ? 'size-7' : 'size-8',
        )}
      >
        <Plus className={isSmall ? 'size-3' : 'size-3.5'} aria-hidden="true" />
      </Button>
    </div>
  )
}

