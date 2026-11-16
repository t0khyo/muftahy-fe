import { Link } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  label?: string
  backHref?: string
  backLabel?: string
  className?: string
}

export function Breadcrumbs({
  items,
  label = 'Breadcrumb',
  backHref,
  backLabel,
  className,
}: BreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <nav
      aria-label={label}
      className={cn('flex items-center h-8 mb-3 lg:mb-4 text-[13px] leading-none', className)}
    >
      {/* ── Mobile Back Link (Shown when filtered on small screens) ── */}
      {backHref && backLabel ? (
        <div className="sm:hidden flex items-center">
          <Link
            to={backHref}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:underline"
          >
            <ChevronLeft className="size-3.5 shrink-0 rtl:rotate-180" aria-hidden="true" />
            <span>{backLabel}</span>
          </Link>
        </div>
      ) : null}

      {/* ── Full Trail (Always visible on sm+, and on mobile when not filtered) ── */}
      <ol
        className={cn(
          'flex items-center gap-1.5 flex-wrap list-none p-0 m-0',
          backHref && backLabel ? 'hidden sm:flex' : 'flex',
        )}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.current

          return (
            <li key={index} className="inline-flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  className="size-3.5 text-muted-foreground/60 shrink-0 rtl:rotate-180"
                  aria-hidden="true"
                />
              )}

              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="font-medium text-foreground truncate max-w-[200px] sm:max-w-none"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:underline"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

