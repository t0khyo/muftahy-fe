import { useTranslation } from 'react-i18next'
import { FaWhatsapp } from 'react-icons/fa'
import { cn } from '@workspace/ui/lib/utils'
import type { SupportSectionConfig } from '../home.config'

export interface SupportSectionProps {
  config: SupportSectionConfig
  className?: string
}

interface TopicChip {
  id: 'activation' | 'order' | 'product'
  labelKey: string
  prefillKey: string
}

const TOPIC_CHIPS: TopicChip[] = [
  {
    id: 'activation',
    labelKey: 'support.chips.activation.label',
    prefillKey: 'support.chips.activation.prefill',
  },
  {
    id: 'order',
    labelKey: 'support.chips.order.label',
    prefillKey: 'support.chips.order.prefill',
  },
  {
    id: 'product',
    labelKey: 'support.chips.product.label',
    prefillKey: 'support.chips.product.prefill',
  },
]

export function SupportSection({ config, className = '' }: SupportSectionProps) {
  const { t, i18n } = useTranslation(['home', 'common'])
  const headingId = `${config.id}-heading`
  const isRtl = i18n.dir() === 'rtl'

  const rawNumber = config.whatsappNumber?.trim()
  const cleanNumber = rawNumber ? rawNumber.replace(/[^0-9]/g, '') : null

  // If WhatsApp is not configured, do not render an empty shell
  if (!cleanNumber) {
    return null
  }

  const baseWhatsAppUrl = `https://wa.me/${cleanNumber}`

  return (
    <section
      id={config.id}
      aria-labelledby={headingId}
      className={cn('py-12 lg:py-24', className)}
    >
      <div className="site-container">
        {/* Centered Heading & Subline */}
        <div className="text-center space-y-2 mb-10 lg:mb-14">
          <h2
            id={headingId}
            className={cn(
              'text-2xl sm:text-3xl font-semibold text-foreground',
              isRtl ? 'tracking-normal' : 'tracking-tight'
            )}
          >
            {t((config.titleKey || 'support.title') as never, {
              ns: 'home',
              defaultValue: isRtl ? 'تحتاج مساعدة؟ تواصل معنا' : 'Need help? Contact us',
            })}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t((config.subtitleKey || 'support.subtitle') as never, {
              ns: 'home',
              defaultValue: isRtl
                ? 'فريق الدعم جاهز لمساعدتك في التفعيل والطلبات وأي استفسار.'
                : 'Our support team is ready to help with activation, orders, and any question.',
            })}
          </p>
        </div>

        {/* Primary WhatsApp Card (Apple-store Visual Language) */}
        <div className="max-w-2xl mx-auto rounded-3xl p-6 sm:p-8 lg:p-10 bg-card border-0 shadow-none text-center sm:text-start flex flex-col gap-6 lg:gap-8">
          {/* Main Action Row */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 justify-between">
            <div className="text-center sm:text-start">
              <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
                {t('support.whatsapp.title' as never, {
                  ns: 'home',
                  defaultValue: isRtl ? 'تحدث مع الدعم' : 'Chat with support',
                })}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mt-1 leading-relaxed max-w-md">
                {t('support.whatsapp.description' as never, {
                  ns: 'home',
                  defaultValue: isRtl
                    ? 'احصل على مساعدة في التفعيل أو طلبك أو أي سؤال.'
                    : 'Get help with activation, your order, or any question.',
                })}
              </p>
            </div>

            {/* Primary Action Button */}
            <a
              href={baseWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full h-11 px-6 font-medium bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full sm:w-auto"
            >
              <span>
                {t('support.whatsapp.action' as never, {
                  ns: 'home',
                  defaultValue: isRtl ? 'محادثة عبر واتساب' : 'Chat on WhatsApp',
                })}
              </span>
              <FaWhatsapp size={18} className="shrink-0" />
            </a>
          </div>

          {/* Quick Topic Chips Sub-block */}
          <div className="pt-4 border-t border-border/40 text-start">
            <span className="text-xs font-medium text-muted-foreground block mb-3 text-center sm:text-start">
              {t('support.chips.quickTopics' as never, {
                ns: 'home',
                defaultValue: isRtl ? 'مواضيع سريعة:' : 'Quick topics:',
              })}
            </span>
            <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
              {TOPIC_CHIPS.map((chip) => {
                const prefillText = t(chip.prefillKey as never, { ns: 'home' })
                const chipUrl = `${baseWhatsAppUrl}?text=${encodeURIComponent(prefillText)}`

                return (
                  <a
                    key={chip.id}
                    href={chipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center min-h-10 px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span>{t(chip.labelKey as never, { ns: 'home' })}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
