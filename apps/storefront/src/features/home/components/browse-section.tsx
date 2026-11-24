import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight,
  FileSpreadsheet,
  Grid2x2,
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { BrowseSectionConfig } from '../home.config'

export interface BrowseSectionProps {
  config: BrowseSectionConfig
  className?: string
}

interface CategoryCardItem {
  id: string
  nameKey: string
  defaultName: string
  defaultDesc: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const CATEGORIES: CategoryCardItem[] = [
  {
    id: 'windows',
    nameKey: 'categories.windows',
    defaultName: 'Windows',
    defaultDesc: 'Genuine Windows 11 & Windows 10 Pro retail and OEM keys',
    href: '/:lang/categories/windows',
    icon: Grid2x2,
  },
  {
    id: 'office',
    nameKey: 'categories.office',
    defaultName: 'Office',
    defaultDesc: 'Office 2021 & 2019 Professional Plus lifetime licenses',
    href: '/:lang/categories/office',
    icon: FileSpreadsheet,
  },
]

export function BrowseSection({ config, className = '' }: BrowseSectionProps) {
  const { lang } = useParams<{ lang: string }>()
  const currentLang = lang || 'en'
  const isRtl = currentLang === 'ar'
  const { t } = useTranslation(['home', 'products', 'common'])

  const headingId = `${config.id}-heading`

  return (
    <section
      id={config.id}
      aria-labelledby={headingId}
      className={`py-12 lg:py-20 ${className}`}
    >
      <div className="site-container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 lg:mb-12 gap-4">
          <div className="text-start">
            <h2
              id={headingId}
              className="text-h3 font-bold tracking-tight text-foreground"
            >
              {t(config.titleKey ?? 'browse.title', {
                defaultValue: isRtl ? 'تصفح حسب الفئة' : 'Browse by Category',
              })}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl">
              {t(config.subtitleKey ?? 'browse.subtitle', {
                defaultValue: isRtl
                  ? 'اختر من تراخيص وأنظمة مايكروسوفت الأصلية مع تفعيل دائم'
                  : 'Choose genuine Microsoft operating systems and productivity suites',
              })}
            </p>
          </div>

          <Link
            to={`/${currentLang}/products`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group inline-flex items-center gap-1 self-start md:self-auto"
          >
            <span>{t('browse.viewAll', { defaultValue: 'View all products' })}</span>
            <ChevronRight
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
            />
          </Link>
        </div>

        {/* 2-Column Responsive Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const title = t(cat.nameKey, { ns: 'products', defaultValue: cat.defaultName })

            return (
              <Link
                key={cat.id}
                to={cat.href.replace(':lang', currentLang)}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border border-border/40 bg-card p-6 lg:p-8 text-start',
                  'transition-all duration-300 hover:-translate-y-1 hover:border-border/80 hover:shadow-md',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                      <Icon className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {isRtl
                        ? cat.id === 'windows'
                          ? 'مفاتيح أصلية لويندوز 11 وويندوز 10 برو وهوم'
                          : 'تراخيص أوفيس 2021 وأوفيس 2019 بروفيشنال بلس الدائمة'
                        : cat.defaultDesc}
                    </p>
                  </div>
                  <div className="size-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0 mt-1">
                    <ChevronRight className="size-4 rtl:rotate-180" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
