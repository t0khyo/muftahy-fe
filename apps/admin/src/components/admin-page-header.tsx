import * as React from 'react'

export interface AdminPageHeaderProps {
  title: string
  description?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function AdminPageHeader({
  title,
  description,
  children,
  className = '',
}: AdminPageHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border/40 ${className}`}
    >
      <div className="space-y-1 text-start">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <div className="text-sm text-muted-foreground">
            {description}
          </div>
        )}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  )
}
