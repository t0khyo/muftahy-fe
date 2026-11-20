import { Checkbox } from '@workspace/ui/components/checkbox'
import { cn } from '@workspace/ui/lib/utils'

export interface FilterOptionCount {
  value: string
  count: number
}

export interface FilterGroupProps {
  title: string
  options: FilterOptionCount[]
  selectedValues: string[]
  onToggle: (value: string) => void
  getLabel: (value: string) => string
}

export function FilterGroup({
  title,
  options,
  selectedValues,
  onToggle,
  getLabel,
}: FilterGroupProps) {
  if (options.length === 0) return null

  return (
    <div className="flex flex-col gap-1 py-1">
      <span className="sr-only">{title}</span>
      <div className="flex flex-col">
        {options.map((opt) => {
          const isChecked = selectedValues.includes(opt.value)
          const id = `filter-${title.toLowerCase().replace(/\s+/g, '-')}-${opt.value}`

          return (
            <label
              key={opt.value}
              htmlFor={id}
              className={cn(
                'group flex min-h-[44px] lg:min-h-[36px] cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2 py-1.5',
                'transition-colors hover:bg-secondary/60 select-none',
              )}
            >
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id={id}
                  checked={isChecked}
                  onCheckedChange={() => onToggle(opt.value)}
                />
                <span className="text-sm font-normal text-foreground group-hover:text-foreground">
                  {getLabel(opt.value)}
                </span>
              </div>
              <span className="text-xs font-normal text-muted-foreground tabular-nums">
                {opt.count}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
