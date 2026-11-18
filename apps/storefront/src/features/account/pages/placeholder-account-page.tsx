import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'

export interface PlaceholderAccountPageProps {
  type: 'orders' | 'keys' | 'support'
}

export function PlaceholderAccountPage({ type }: PlaceholderAccountPageProps) {
  const { t } = useTranslation('account')

  return (
    <Card className="border-border shadow-xs text-center py-12">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{t('placeholders.comingSoonTitle')}</CardTitle>
        <CardDescription className="max-w-md mx-auto text-sm mt-2">
          {t(`placeholders.${type}Description` as unknown as 'placeholders.ordersDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="inline-flex items-center justify-center p-6 rounded-full bg-muted/50 text-muted-foreground">
          <span className="text-2xl">⏳</span>
        </div>
      </CardContent>
    </Card>
  )
}
