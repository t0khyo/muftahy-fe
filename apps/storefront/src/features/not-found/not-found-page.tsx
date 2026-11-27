import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { isSupportedLanguage, type SupportedLanguage } from '@workspace/i18n/config'
import { Button } from '@workspace/ui/components/button'

export function NotFoundPage() {
  const { lang } = useParams<{ lang: string }>()
  const { t, i18n } = useTranslation('notFound')
  const currentLang: SupportedLanguage =
    lang && isSupportedLanguage(lang)
      ? lang
      : isSupportedLanguage(i18n.language)
        ? i18n.language
        : 'ar'

  return (
    <section
      aria-labelledby="not-found-heading"
      className="site-container flex min-h-[calc(100svh-12rem)] flex-col items-center justify-center py-16 sm:py-24"
    >
      <div className="auth-enter motion-reduce:animate-none w-full max-w-2xl text-center space-y-10">
        <div className="space-y-4">
          <p
            dir="ltr"
            className="text-6xl sm:text-7xl font-bold tracking-tight tabular-nums text-muted-foreground/35 select-none"
            aria-hidden="true"
          >
            {t('code')}
          </p>
          <h1
            id="not-found-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
          >
            {t('title')}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link to={`/${currentLang}/products`} />}
            className="w-full sm:w-auto rounded-full px-6"
          >
            {t('primaryCta')}
          </Button>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link to={`/${currentLang}`} />}
            className="w-full sm:w-auto rounded-full px-6"
          >
            {t('secondaryCta')}
          </Button>
        </div>
      </div>
    </section>
  )
}

