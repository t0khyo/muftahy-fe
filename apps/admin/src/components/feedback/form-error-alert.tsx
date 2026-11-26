import * as React from 'react'
import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { cn } from '@workspace/ui/lib/utils'
import { resolveApiError } from '../../lib/api-feedback'

export interface FormErrorAlertProps {
  error?: unknown
  clientError?: string | null
  className?: string
}

export function FormErrorAlert({ error, clientError, className }: FormErrorAlertProps) {
  const { t } = useTranslation(['admin', 'auth'])
  const alertRef = React.useRef<HTMLDivElement>(null)

  const resolved = error ? resolveApiError(error) : null
  const serverVisible = Boolean(resolved && resolved.isInlineCandidate)
  const summaryMessage = clientError?.trim() || (serverVisible ? resolved?.message : null) || null
  const fieldEntries = React.useMemo(() => {
    if (!serverVisible || !resolved) return []
    return Object.entries(resolved.fieldErrors).filter(
      ([field, msg]) => Boolean(msg) && !(field === '_root' && msg === summaryMessage),
    )
  }, [serverVisible, resolved, summaryMessage])

  const scrollKey = `${summaryMessage ?? ''}:${fieldEntries.length}`

  React.useEffect(() => {
    if (!summaryMessage) return
    const node = alertRef.current
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [summaryMessage, scrollKey])

  if (!summaryMessage) {
    return null
  }

  return (
    <Alert
      ref={alertRef}
      variant="destructive"
      className={cn('border-destructive/40 bg-destructive/10 text-destructive', className)}
    >
      <AlertCircle className="size-4 shrink-0" />
      <AlertDescription className="text-xs text-destructive space-y-1.5">
        <p className="font-medium" aria-label={t('common:error', 'Error')}>
          {summaryMessage}
        </p>
        {fieldEntries.length > 0 && (
          <ul className="list-disc ps-4 space-y-0.5 text-destructive/90">
            {fieldEntries.map(([field, msg]) => (
              <li key={field}>
                {field !== '_root' && (
                  <span className="font-mono font-semibold me-1" dir="ltr">
                    {field}:
                  </span>
                )}
                <span dir="auto">{msg}</span>
              </li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  )
}

