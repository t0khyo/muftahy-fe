import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingBag, CreditCard, KeyRound, ChevronRight } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { HowItWorksSectionConfig } from '../home.config'

export interface HowItWorksSectionProps {
  config: HowItWorksSectionConfig
  className?: string
}

interface StepItem {
  id: string
  number: string
  numberKey: string
  titleKey: string
  descKey: string
  icon: React.ComponentType<{ className?: string }>
}

const STEPS: StepItem[] = [
  {
    id: 'step-1',
    number: '01',
    numberKey: 'howItWorks.steps.step1.number',
    titleKey: 'howItWorks.steps.step1.title',
    descKey: 'howItWorks.steps.step1.description',
    icon: ShoppingBag,
  },
  {
    id: 'step-2',
    number: '02',
    numberKey: 'howItWorks.steps.step2.number',
    titleKey: 'howItWorks.steps.step2.title',
    descKey: 'howItWorks.steps.step2.description',
    icon: CreditCard,
  },
  {
    id: 'step-3',
    number: '03',
    numberKey: 'howItWorks.steps.step3.number',
    titleKey: 'howItWorks.steps.step3.title',
    descKey: 'howItWorks.steps.step3.description',
    icon: KeyRound,
  },
]

export function HowItWorksSection({ config, className = '' }: HowItWorksSectionProps) {
  const { t, i18n } = useTranslation(['home', 'common'])
  const headingId = `${config.id}-heading`
  const isRtl = i18n.dir() === 'rtl'

  return (
    <section
      id={config.id}
      aria-labelledby={headingId}
      className={cn('py-12 lg:py-24 bg-background', className)}
    >
      <div className="mx-auto max-w-[var(--header-max-width,1024px)] px-4 lg:px-6">
        {/* Centered Heading & Subline */}
        <div className="text-center space-y-2 mb-10 lg:mb-16">
          <h2
            id={headingId}
            className={cn(
              'text-2xl sm:text-3xl font-semibold text-foreground',
              isRtl ? 'tracking-normal' : 'tracking-tight'
            )}
          >
            {t((config.titleKey || 'howItWorks.title') as never, {
              ns: 'home',
              defaultValue: isRtl ? 'خطوات الشراء' : 'How it works',
            })}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t((config.subtitleKey || 'howItWorks.subtitle') as never, {
              ns: 'home',
              defaultValue: isRtl
                ? 'من الاختيار إلى الاستخدام في ثلاث خطوات بسيطة.'
                : 'From choosing to using, in three simple steps.',
            })}
          </p>
        </div>

        {/* Desktop Layout: 3 Equal Columns with 1px Horizontal Connectors */}
        <ol className="hidden lg:grid grid-cols-3 gap-8 relative list-none p-0 m-0">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isLast = index === STEPS.length - 1

            return (
              <li
                key={step.id}
                className="relative flex flex-col items-center text-center group"
              >
                {/* 1px Horizontal Connector Line between steps (mirrors in RTL) */}
                {!isLast && (
                  <div
                    className="absolute top-7 start-[calc(50%+36px)] w-[calc(100%-72px+2rem)] h-[1px] bg-border/60 pointer-events-none"
                    aria-hidden="true"
                  />
                )}

                {/* 56px Rounded Icon Container */}
                <div className="size-14 rounded-2xl bg-secondary/80 flex items-center justify-center text-foreground relative z-10 transition-colors duration-200">
                  <Icon className="size-6 text-foreground" />
                </div>

                {/* 14px Step Number (Western digits) */}
                <span className="mt-3 text-sm font-semibold tabular-nums text-muted-foreground">
                  {t(step.numberKey as never, { ns: 'home', defaultValue: step.number })}
                </span>

                {/* 20px Semibold Title */}
                <h3 className="mt-1 text-xl font-semibold text-foreground">
                  {t(step.titleKey as never, { ns: 'home' })}
                </h3>

                {/* 15px Muted Description (max-w ~280px) */}
                <p className="mt-1.5 text-[15px] text-muted-foreground max-w-[280px] leading-relaxed">
                  {t(step.descKey as never, { ns: 'home' })}
                </p>
              </li>
            )
          })}
        </ol>

        {/* Mobile Layout: Vertical Stepper with Leading Icon & Vertical Line */}
        <ol className="flex flex-col gap-6 lg:hidden list-none p-0 m-0">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isLast = index === STEPS.length - 1

            return (
              <li key={step.id} className="relative flex gap-4 text-start">
                {/* Leading side: 48px Icon + Vertical 1px connector line */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="size-12 rounded-2xl bg-secondary/80 flex items-center justify-center text-foreground relative z-10">
                    <Icon className="size-5 text-foreground" />
                  </div>
                  {!isLast && (
                    <div
                      className="w-[1px] flex-1 bg-border/60 my-2"
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Trailing side: Number, Title, Description */}
                <div className={cn('flex flex-col', !isLast ? 'pb-6' : 'pb-1')}>
                  <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                    {t(step.numberKey as never, { ns: 'home', defaultValue: step.number })}
                  </span>
                  <h3 className="text-[17px] font-semibold text-foreground mt-0.5">
                    {t(step.titleKey as never, { ns: 'home' })}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed mt-1">
                    {t(step.descKey as never, { ns: 'home' })}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>

        {/* Centered Activation Help Link */}
        <div className="mt-10 lg:mt-16 text-center">
          <a
            href="#support"
            className="inline-flex items-center gap-1.5 min-h-11 px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span>{t('howItWorks.helpLink', { ns: 'home', defaultValue: isRtl ? 'تحتاج مساعدة في التفعيل؟ تواصل معنا' : 'Need help activating? Contact us' })}</span>
            <ChevronRight className="size-4 rtl:rotate-180 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  )
}
