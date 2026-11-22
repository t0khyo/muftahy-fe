import * as React from 'react'
import {
  Link,
  useNavigate,
  useParams,
  useRouteError,
  isRouteErrorResponse,
} from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  RefreshCw,
  LayoutDashboard,
  Copy,
  Check,
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'

export function AdminRouteError() {
  const error = useRouteError()
  const { lang = 'en' } = useParams<{ lang: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['admin', 'common'])
  const [copied, setCopied] = React.useState(false)

  let title: string = t('admin:error.title', 'An Error Occurred')
  let description: string = t(
    'admin:error.description',
    'An unexpected error occurred while loading this page. Your session remains active.',
  )
  let statusText: string | undefined
  let errorStack: string | undefined

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = t('admin:error.notFoundTitle', 'Page Not Found')
      description = t(
        'admin:error.notFoundDescription',
        'The requested page does not exist or may have been moved.',
      )
    } else {
      title = `${error.status} ${error.statusText || t('admin:error.httpError', 'HTTP Error')}`
      description = error.data?.message || description
    }
    statusText = `${error.status} ${error.statusText}`
  } else if (error instanceof Error) {
    description = error.message
    errorStack = error.stack
  } else if (typeof error === 'string') {
    description = error
  }

  const handleCopy = () => {
    const textToCopy = errorStack || (typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error))
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    } else {
      navigate(0)
    }
  }

  return (
    <div className="flex min-h-[500px] w-full items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-xl border-border/80 bg-card/60 shadow-lg backdrop-blur-sm">
        <CardHeader className="space-y-2 text-start">
          <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive shadow-xs">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {title}
            </CardTitle>
            {statusText && (
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {statusText}
              </span>
            )}
            <CardDescription className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorStack && (
            <Accordion className="w-full">
              <AccordionItem
                value="diagnostics"
                className="rounded-lg border border-border/60 bg-muted/40 px-3 py-1 text-start"
              >
                <AccordionTrigger className="py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:no-underline cursor-pointer">
                  <span>{t('admin:error.showDetails', 'View Technical Diagnostics')}</span>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-2">
                  <div className="space-y-2">
                    <pre className="max-h-48 overflow-auto rounded bg-background/80 p-2.5 font-mono text-[11px] text-muted-foreground border border-border/40 select-all leading-normal whitespace-pre-wrap break-all">
                      {errorStack}
                    </pre>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={handleCopy}
                        className="gap-1.5 text-[11px] h-7 px-2"
                      >
                        {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                        <span>{copied ? t('common:copied', 'Copied') : t('admin:error.copyTrace', 'Copy Stack Trace')}</span>
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </CardContent>

        <CardFooter className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 border-t border-border/40 pt-4">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to={`/${lang}`} />}
            className="w-full sm:w-auto gap-2"
          >
            <LayoutDashboard className="size-4" />
            <span>{t('admin:error.returnDashboard', 'Dashboard')}</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleReload}
            className="w-full sm:w-auto gap-2"
          >
            <RefreshCw className="size-4" />
            <span>{t('admin:error.reload', 'Reload Page')}</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
