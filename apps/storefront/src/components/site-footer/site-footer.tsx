import { Link, useParams } from "react-router"
import { useTranslation } from "react-i18next"
import { ShieldCheck, Zap } from "lucide-react"
import { FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa6"
import { BrandHorizontalLogo, BrandLogoMark } from "../brand-logo"
import { PaymentMethodLogo } from "../payment-method-logo"
import { LanguageSwitcher } from "./language-switcher"
import { ThemeToggle } from "../theme-toggle"
import { cn } from "@workspace/ui/lib/utils"
import {
  buildSupportEmailUrl,
  buildWhatsAppUrl,
  getSocialLinks,
  getSupportEmail,
} from "../../lib/env"

export interface SiteFooterProps {
  className?: string
}

export function SiteFooter({ className = "" }: SiteFooterProps) {
  const { lang } = useParams<{ lang: string }>()
  const currentLang = lang || "en"
  const isAr = currentLang === "ar"
  const { t } = useTranslation(["footer", "common", "nav"])
  const currentYear = new Date().getFullYear()

  const whatsappUrl = buildWhatsAppUrl()
  const supportEmail = getSupportEmail()
  const supportEmailUrl = buildSupportEmailUrl()
  const { instagramUrl, facebookUrl, handle: socialHandle } = getSocialLinks()
  const hasSocialRow = Boolean(instagramUrl || facebookUrl || whatsappUrl || socialHandle)

  const categoryLinks = [
    {
      labelKey: "nav.software",
      href: `/${currentLang}/products?category=software`,
      fallback: isAr ? "برامج" : "Software",
    },
    {
      labelKey: "nav.subscriptions",
      href: `/${currentLang}/products?category=subscriptions`,
      fallback: isAr ? "اشتراكات" : "Subscriptions",
    },
    {
      labelKey: "nav.giftCards",
      href: `/${currentLang}/products?category=gift-cards`,
      fallback: isAr ? "بطاقات هدايا" : "Gift Cards",
    },
    {
      labelKey: "nav.games",
      href: `/${currentLang}/products?category=games`,
      fallback: isAr ? "ألعاب" : "Games",
    },
    {
      labelKey: "nav.deals",
      href: `/${currentLang}/products?deals=true`,
      fallback: isAr ? "عروض خاصة" : "Deals",
    },
  ]

  const supportLinks = [
    {
      labelKey: "footer.howItWorks",
      href: `/${currentLang}#how-it-works`,
      fallback: isAr ? "خطوات الشراء" : "How it works",
    },
    {
      labelKey: "footer.activationHelp",
      href: `/${currentLang}#support`,
      fallback: isAr ? "المساعدة في التفعيل" : "Activation help",
    },
    {
      labelKey: "footer.faq",
      href: `/${currentLang}#faq`,
      fallback: isAr ? "الأسئلة الشائعة" : "FAQ",
    },
    ...(whatsappUrl
      ? [
          {
            labelKey: "footer.contact",
            href: whatsappUrl,
            fallback: isAr ? "تواصل معنا" : "Contact Us",
            isExternal: true,
          },
        ]
      : []),
    ...(supportEmail && supportEmailUrl
      ? [
          {
            labelKey: "footer.email",
            href: supportEmailUrl,
            fallback: supportEmail,
            isExternal: true,
          },
        ]
      : []),
  ]

  return (
    <footer
      aria-label="Site Footer"
      className={cn(
        "w-full border-t border-border/50 bg-secondary/30 text-muted-foreground dark:bg-card/20",
        className
      )}
    >
      <div className="site-container">
        {/* Main Content: Compact flex on mobile, 12-col grid on desktop */}
        <div className="flex flex-col gap-8 py-8 lg:grid lg:grid-cols-12 lg:gap-10 lg:py-16">
          {/* Brand & Socials Hub (Col 1-5 on desktop) */}
          <div className="flex flex-col gap-4 text-start lg:col-span-5">
            {/* Logo & Name */}
            <Link
              to={`/${currentLang}`}
              className="inline-flex w-fit items-center rounded-md text-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label={t("appName", {
                ns: "common",
                defaultValue: "Muftahy",
              })}
            >
              <BrandHorizontalLogo
                lang={currentLang}
                alt=""
                className="h-9 w-auto shrink-0"
              />
            </Link>

            {/* Tagline */}
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline", {
                ns: "footer",
                defaultValue: isAr
                  ? "منصتك الموثوقة للمفاتيح الرقمية الأصلية، وتراخيص البرامج، واشتراكات الألعاب."
                  : "Your trusted marketplace for genuine digital keys, software licenses, and gaming subscriptions.",
              })}
            </p>

            {/* Direct WhatsApp Contact Button */}
            {whatsappUrl && (
              <div className="pt-0.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label={t("footer.chatOnWhatsApp", {
                    ns: "footer",
                    defaultValue: isAr ? "راسلنا عبر واتساب" : "Chat on WhatsApp",
                  })}
                >
                  <FaWhatsapp
                    className="size-3.5 shrink-0 text-success"
                    aria-hidden="true"
                  />
                  <span>
                    {t("footer.chatOnWhatsApp", {
                      ns: "footer",
                      defaultValue: isAr
                        ? "راسلنا عبر واتساب"
                        : "Chat on WhatsApp",
                    })}
                  </span>
                </a>
              </div>
            )}

            {/* Social Media Row */}
            {hasSocialRow && (
              <div className="flex items-center gap-2 pt-0.5">
                <span className="me-1 text-xs font-medium text-muted-foreground">
                  {t("footer.socialMedia", {
                    ns: "footer",
                    defaultValue: isAr ? "تابعنا" : "Follow Us",
                  })}
                  :
                </span>

                {/* Instagram */}
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    aria-label={socialHandle ? `Instagram ${socialHandle}` : "Instagram"}
                  >
                    <FaInstagram className="size-3.5" aria-hidden="true" />
                  </a>
                )}

                {/* Facebook */}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    aria-label={socialHandle ? `Facebook ${socialHandle}` : "Facebook"}
                  >
                    <FaFacebook className="size-3.5" aria-hidden="true" />
                  </a>
                )}

                {/* WhatsApp icon */}
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    aria-label="WhatsApp"
                  >
                    <FaWhatsapp className="size-3.5" aria-hidden="true" />
                  </a>
                )}

                {/* Handle Tag */}
                {socialHandle && (
                  <span
                    dir="ltr"
                    className="ms-1 text-xs font-medium text-muted-foreground select-all"
                  >
                    {socialHandle}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 2-Column Grid on Mobile for Categories & Support */}
          <div
            className="grid grid-cols-2 gap-6 lg:contents"
            data-testid="footer-nav-columns"
          >
            {/* Categories Column (Col 6-8 on desktop) */}
            <div className="flex flex-col gap-3 text-start lg:col-span-3">
              <h3 className="text-xs font-semibold tracking-wider text-foreground uppercase">
                {t("footer.categories", {
                  ns: "footer",
                  defaultValue: isAr ? "الأقسام" : "Categories",
                })}
              </h3>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {categoryLinks.map((item) => (
                  <li key={item.labelKey}>
                    <Link
                      to={item.href}
                      className="rounded-sm text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {t(item.labelKey as never, {
                        ns: "nav",
                        defaultValue: item.fallback,
                      })}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column (Col 9-10 on desktop) */}
            <div className="flex flex-col gap-3 text-start lg:col-span-2">
              <h3 className="text-xs font-semibold tracking-wider text-foreground uppercase">
                {t("footer.support", {
                  ns: "footer",
                  defaultValue: isAr ? "الدعم والمساعدة" : "Support & Help",
                })}
              </h3>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {supportLinks.map((item) => (
                  <li key={item.labelKey}>
                    {item.isExternal ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                        rel={item.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                        className="rounded-sm text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        {t(item.labelKey as never, {
                          ns: "footer",
                          defaultValue: item.fallback,
                        })}
                      </a>
                    ) : (
                      <Link
                        to={item.href}
                        className="rounded-sm text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        {t(item.labelKey as never, {
                          ns: "footer",
                          defaultValue: item.fallback,
                        })}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Trust Highlights Column (2-cols on mobile, Col 11-12 on desktop) */}
          <div className="grid grid-cols-2 gap-3 text-start lg:col-span-2 lg:flex lg:flex-col">
            <div className="flex items-start gap-2.5 rounded-xl border border-border/50 bg-background/60 p-3">
              <ShieldCheck
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">
                  {t("footer.genuineKeys", {
                    ns: "footer",
                    defaultValue: isAr
                      ? "مفاتيح أصلية 100%"
                      : "100% Genuine Keys",
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-border/50 bg-background/60 p-3">
              <Zap
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">
                  {t("footer.instantDelivery", {
                    ns: "footer",
                    defaultValue: isAr
                      ? "تسليم فوري ومباشر"
                      : "Instant Delivery",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/50 py-6 text-xs text-muted-foreground sm:flex-row">
          {/* Copyright notice */}
          <div className="flex items-center gap-2 text-center sm:text-start">
            <BrandLogoMark
              className="h-4 w-auto shrink-0 opacity-70"
              idPrefix="footer-sublogo"
            />
            <p>
              © {currentYear}{" "}
              {t("appName", { ns: "common", defaultValue: "Muftahy" })}.{" "}
              {t("allRightsReserved", {
                ns: "footer",
                defaultValue: "All rights reserved.",
              })}
            </p>
          </div>

          {/* Controls: Accepted Payments, Theme & Language */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div
              className="flex items-center gap-3"
              role="group"
              aria-label={t("acceptedPayments", {
                ns: "footer",
                defaultValue: isAr ? "وسائل الدفع المتاحة" : "Accepted payment methods",
              })}
            >
              <PaymentMethodLogo method="vodafone_cash" size="sm" />
              <PaymentMethodLogo method="instapay" size="sm" />
            </div>
            <div className="h-4 w-[1px] bg-border/60 hidden sm:block" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="h-4 w-[1px] bg-border/60" aria-hidden="true" />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
