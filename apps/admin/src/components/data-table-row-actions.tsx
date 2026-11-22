import * as React from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@workspace/ui/components/dropdown-menu'

export interface RowActionItem {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: () => void
  variant?: 'default' | 'destructive'
  separatorBefore?: boolean
  disabled?: boolean
}

export interface DataTableRowActionsProps {
  items: RowActionItem[]
  align?: 'start' | 'end'
  ariaLabel?: string
}

export function DataTableRowActions({
  items,
  align = 'end',
  ariaLabel = 'Actions',
}: DataTableRowActionsProps) {
  if (!items.length) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
            aria-label={ariaLabel}
          />
        }
      >
        <MoreHorizontal className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-40 text-xs">
        {items.map((action, index) => {
          const Icon = action.icon
          return (
            <React.Fragment key={index}>
              {action.separatorBefore && <DropdownMenuSeparator />}
              <DropdownMenuItem
                variant={action.variant}
                disabled={action.disabled}
                onClick={(e) => {
                  e.stopPropagation()
                  action.onClick()
                }}
                className="gap-2 cursor-pointer font-medium"
              >
                {Icon && <Icon className="size-3.5" />}
                <span>{action.label}</span>
              </DropdownMenuItem>
            </React.Fragment>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

