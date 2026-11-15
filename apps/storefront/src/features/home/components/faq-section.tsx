import { useTranslation } from 'react-i18next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion'
import type { FaqSectionConfig } from '../home.config'

export interface FaqSectionProps {
  config: FaqSectionConfig
  className?: string
}

export function FaqSection({ config, className = '' }: FaqSectionProps) {
  const { t } = useTranslation(['home', 'common'])
  const headingId = `${config.id}-heading`

  return (
    <section
      id={config.id}
      aria-labelledby={headingId}
      className={`py-12 lg:py-20 ${className}`}
    >
      <div className="mx-auto max-w-[var(--header-max-width,1024px)] px-4 lg:px-6 space-y-8">
        <div className="text-start space-y-2">
          <h2
            id={headingId}
            className="text-h4 font-bold tracking-tight text-foreground"
          >
            {t('faq.title', { ns: 'home', defaultValue: 'Frequently Asked Questions' })}
          </h2>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-6 text-start">
          <Accordion defaultValue={[]} className="w-full">
            {config.items.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="border-border/40">
                <AccordionTrigger className="text-sm md:text-base font-medium py-4 text-foreground hover:no-underline hover:text-primary">
                  {t(`faq.${item.questionKey}`, {
                    ns: 'home',
                    defaultValue: 'Placeholder question?',
                  })}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {t(`faq.${item.answerKey}`, {
                    ns: 'home',
                    defaultValue: 'Placeholder answer explanation.',
                  })}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

