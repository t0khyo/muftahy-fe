import * as React from 'react'
import { Check, ShoppingBag } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

export interface AddToCartButtonProps {
  productName: string
  label?: string
  addedLabel?: string
  className?: string
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export function AddToCartButton({
  productName,
  label = 'Add to Cart',
  addedLabel = 'Added',
  className,
  disabled = false,
  onClick,
}: AddToCartButtonProps) {
  const [justAdded, setJustAdded] = React.useState(false)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (disabled) return

    onClick?.(e)
    setJustAdded(true)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => setJustAdded(false), 1500)
  }

  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={handleButtonClick}
      aria-label={`${label} – ${productName}`}
      className={cn(
        'relative z-10 cursor-pointer flex h-11 lg:h-10 w-full items-center justify-center gap-2 rounded-full px-4',
        'bg-primary text-primary-foreground font-medium text-xs sm:text-sm shadow-none',
        'transition-all duration-150 hover:bg-primary/90 active:scale-[0.98]',
        'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
        justAdded && 'bg-primary/90',
        className,
      )}
    >
      {justAdded ? (
        <>
          <span>{addedLabel}</span>
          <Check className="size-4 shrink-0 transition-transform duration-150 animate-in zoom-in-75" />
        </>
      ) : (
        <>
          <span>{label}</span>
          <ShoppingBag className="size-4 shrink-0 transition-transform duration-150" />
        </>
      )}
    </Button>
  )
}
