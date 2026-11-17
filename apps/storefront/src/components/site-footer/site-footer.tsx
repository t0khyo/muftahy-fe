import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, Zap } from 'lucide-react'
import { FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa6'
import { BrandLogoMark } from '../brand-logo'
import { LanguageSwitcher } from './language-switcher'
import { ThemeToggle } from '../theme-toggle'
import { cn } from '@workspace/ui/lib/utils'

export interface SiteFooterProps {
  className?: string
}

export function SiteFooter({ className = '' }: SiteFooterProps) {
  const { lang } = useParams<{ lang: string }>()
  const currentLang = lang || 'en'
  const isAr = currentLang === 'ar'
  const { t } = useTranslation(['footer', 'common', 'nav'])
  const currentYear = new Date().getFullYear()

  const phoneRaw = '201158172869'
  const socialHandle = '@muftahy'

  const categoryLinks = [
    { labelKey: 'nav.software', href: `/${currentLang}/products?category=software`, fallback: isAr ? 'برامج' : 'Software' },
    { labelKey: 'nav.subscriptions', href: `/${currentLang}/products?category=subscriptions`, fallback: isAr ? 'اشتراكات' : 'Subscriptions' },
    { labelKey: 'nav.giftCards', href: `/${currentLang}/products?category=gift-cards`, fallback: isAr ? 'بطاقات هدايا' : 'Gift Cards' },
    { labelKey: 'nav.games', href: `/${currentLang}/products?category=games`, fallback: isAr ? 'ألعاب' : 'Games' },
    { labelKey: 'nav.deals', href: `/${currentLang}/products?deals=true`, fallback: isAr ? 'عروض خاصة' : 'Deals' },
  ]

  const supportLinks = [
    { labelKey: 'footer.howItWorks', href: `/${currentLang}#how-it-works`, fallback: isAr ? 'خطوات الشراء' : 'How it works' },
    { labelKey: 'footer.activationHelp', href: `/${currentLang}#support`, fallback: isAr ? 'المساعدة في التفعيل' : 'Activation help' },
    { labelKey: 'footer.faq', href: `/${currentLang}#faq`, fallback: isAr ? 'الأسئلة الشائعة' : 'FAQ' },
    { labelKey: 'footer.contact', href: `https://wa.me/${phoneRaw}`, fallback: isAr ? 'تواصل معنا' : 'Contact Us', isExternal: true },
  ]

  return (
    <footer
      aria-label="Site Footer"
      className={cn(
        'w-full border-t border-border/50 bg-secondary/30 dark:bg-card/20 text-muted-foreground',
        className
      )}
    >
      <div className="mx-auto max-w-[var(--header-max-width,1024px)] px-[var(--header-inline-padding-mobile,16px)] lg:px-[var(--header-inline-padding,22px)]">
        {/* Main Content: Compact flex on mobile, 12-col grid on desktop */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-10 py-8 lg:py-16">
          {/* Brand & Socials Hub (Col 1-5 on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-4 text-start">
            {/* Logo & Name */}
            <Link
              to={`/${currentLang}`}
              className="inline-flex items-center gap-2 text-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md w-fit"
              aria-label={t('appName', { ns: 'common', defaultValue: 'Muftahy' })}
            >
              <BrandLogoMark className="h-6 w-auto shrink-0" idPrefix="footer-logo" />
              <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                {t('appName', { ns: 'common', defaultValue: 'Muftahy' })}
              </span>
            </Link>

            {/* Tagline */}
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {t('footer.tagline', {
                ns: 'footer',
                defaultValue: isAr
                  ? 'منصتك الموثوقة للمفاتيح الرقمية الأصلية، وتراخيص البرامج، واشتراكات الألعاب.'
                  : 'Your trusted marketplace for genuine digital keys, software licenses, and gaming subscriptions.',
              })}
            </p>

            {/* Direct WhatsApp Contact Button */}
            <div className="pt-0.5">
              <a
                href={`https://wa.me/${phoneRaw}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-background border border-border/60 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-fit"
                aria-label={t('footer.chatOnWhatsApp', {
                  ns: 'footer',
                  defaultValue: isAr ? 'راسلنا عبر واتساب' : 'Chat on WhatsApp',
                })}
              >
                <FaWhatsapp className="size-3.5 text-success shrink-0" aria-hidden="true" />
                <span>
                  {t('footer.chatOnWhatsApp', {
                    ns: 'footer',
                    defaultValue: isAr ? 'راسلنا عبر واتساب' : 'Chat on WhatsApp',
                  })}
                </span>
              </a>
            </div>

            {/* Social Media Row */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xs font-medium text-muted-foreground me-1">
                {t('footer.socialMedia', { ns: 'footer', defaultValue: isAr ? 'تابعنا' : 'Follow Us' })}:
              </span>

              {/* Instagram */}
              <a
                href="https://instagram.com/muftahy"
                target="_blank"
                rel="noopener noreferrer"
                className="size-8 rounded-lg bg-background border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Instagram ${socialHandle}`}
              >
                <FaInstagram className="size-3.5" aria-hidden="true" />
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com/muftahy"
                target="_blank"
                rel="noopener noreferrer"
                className="size-8 rounded-lg bg-background border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Facebook ${socialHandle}`}
              >
                <FaFacebook className="size-3.5" aria-hidden="true" />
              </a>

              {/* WhatsApp icon */}
              <a
                href={`https://wa.me/${phoneRaw}`}
                target="_blank"
                rel="noopener noreferrer"
                className="size-8 rounded-lg bg-background border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="size-3.5" aria-hidden="true" />
              </a>

              {/* Handle Tag */}
              <span dir="ltr" className="text-xs font-medium text-muted-foreground ms-1 select-all">
                {socialHandle}
              </span>
            </div>
          </div>

          {/* 2-Column Grid on Mobile for Categories & Support */}
          <div className="grid grid-cols-2 gap-6 lg:contents" data-testid="footer-nav-columns">
            {/* Categories Column (Col 6-8 on desktop) */}
            <div className="lg:col-span-3 flex flex-col gap-3 text-start">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {t('footer.categories', { ns: 'footer', defaultValue: isAr ? 'الأقسام' : 'Categories' })}
              </h3>
              <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                {categoryLinks.map((item) => (
                  <li key={item.labelKey}>
                    <Link
                      to={item.href}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      {t(item.labelKey as never, { ns: 'nav', defaultValue: item.fallback })}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column (Col 9-10 on desktop) */}
            <div className="lg:col-span-2 flex flex-col gap-3 text-start">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {t('footer.support', { ns: 'footer', defaultValue: isAr ? 'الدعم والمساعدة' : 'Support & Help' })}
              </h3>
              <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                {supportLinks.map((item) => (
                  <li key={item.labelKey}>
                    {item.isExternal ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      >
                        {t(item.labelKey as never, { ns: 'footer', defaultValue: item.fallback })}
                      </a>
                    ) : (
                      <Link
                        to={item.href}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      >
                        {t(item.labelKey as never, { ns: 'footer', defaultValue: item.fallback })}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Trust Highlights Column (2-cols on mobile, Col 11-12 on desktop) */}
          <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:flex lg:flex-col text-start">
            <div className="rounded-xl border border-border/50 bg-background/60 p-3 flex items-start gap-2.5">
              <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">
                  {t('footer.genuineKeys', { ns: 'footer', defaultValue: isAr ? 'مفاتيح أصلية 100%' : '100% Genuine Keys' })}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-background/60 p-3 flex items-start gap-2.5">
              <Zap className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">
                  {t('footer.instantDelivery', { ns: 'footer', defaultValue: isAr ? 'تسليم فوري ومباشر' : 'Instant Digital Delivery' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div className="border-t border-border/50 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          {/* Copyright notice */}
          <div className="flex items-center gap-2 text-center sm:text-start">
            <BrandLogoMark className="h-4 w-auto shrink-0 opacity-70" idPrefix="footer-sublogo" />
            <p>
              © {currentYear} {t('appName', { ns: 'common', defaultValue: 'Muftahy' })}. {t('allRightsReserved', { ns: 'footer', defaultValue: 'All rights reserved.' })}
            </p>
          </div>

          {/* Controls: Theme & Language */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="h-4 w-[1px] bg-border/60" aria-hidden="true" />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  )
}
