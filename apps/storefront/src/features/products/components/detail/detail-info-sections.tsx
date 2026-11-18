import { useTranslation } from 'react-i18next'
import { Check, MessageCircle } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@workspace/ui/components/table'
import type { Product } from '@workspace/domain/schemas/product'
import { resolveLocalizedName } from '../../../cart/lib/cart-selectors'

export interface DetailInfoSectionsProps {
  product: Product
  lang: string
}

export function DetailInfoSections({ product, lang }: DetailInfoSectionsProps) {
  const { t } = useTranslation(['detail', 'products', 'common'])
  const isRtl = lang === 'ar'

  const productTitle = resolveLocalizedName(product.title, lang)
  const productDescription = resolveLocalizedName(product.description, lang)

  const encodedMessage = encodeURIComponent(
    isRtl
      ? `مرحباً، لدي استفسار بخصوص ${productTitle}`
      : `Hi, I have a question about ${productTitle}`,
  )
  const whatsappUrl = `https://wa.me/201158172869?text=${encodedMessage}`

  return (
    <div className="max-w-2xl w-full text-start space-y-12 sm:space-y-16 pt-8">
      {/* 1. What You Get */}
      <section aria-labelledby="heading-what-you-get" className="space-y-4">
        <h2
          id="heading-what-you-get"
          className="font-heading text-xl sm:text-2xl font-semibold text-foreground"
        >
          {t('whatYouGet')}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          {productDescription}
        </p>

        {product.includes && product.includes.length > 0 && (
          <ul className="space-y-2.5 pt-2">
            {product.includes.map((inc, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm sm:text-[15px] text-foreground"
              >
                <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="size-3.5" aria-hidden="true" />
                </div>
                <span>{resolveLocalizedName(inc, lang)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 2. How to Activate */}
      {product.activationSteps && product.activationSteps.length > 0 && (
        <section aria-labelledby="heading-activation" className="space-y-4">
          <h2
            id="heading-activation"
            className="font-heading text-xl sm:text-2xl font-semibold text-foreground"
          >
            {t('howToActivate')}
          </h2>
          <ol className="space-y-3.5">
            {product.activationSteps.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-3.5 text-sm sm:text-[15px] text-foreground"
              >
                <span className="size-6 rounded-full bg-secondary text-secondary-foreground font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                  {i + 1}
                </span>
                <span className="leading-relaxed">
                  {resolveLocalizedName(step, lang)}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 3. Details (Specification Table) */}
      {product.specs && (
        <section aria-labelledby="heading-specs" className="space-y-4">
          <h2
            id="heading-specs"
            className="font-heading text-xl sm:text-2xl font-semibold text-foreground"
          >
            {t('details')}
          </h2>
          <div className="rounded-2xl border border-border/50 overflow-hidden bg-card">
            <Table>
              <TableBody>
                <TableRow className="border-b border-border/40">
                  <TableCell className="font-medium text-muted-foreground w-1/3 text-xs sm:text-sm">
                    {t('licenseType')}
                  </TableCell>
                  <TableCell className="text-foreground text-xs sm:text-sm font-medium">
                    {resolveLocalizedName(product.specs.licenseType, lang)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-border/40">
                  <TableCell className="font-medium text-muted-foreground w-1/3 text-xs sm:text-sm">
                    {t('edition')}
                  </TableCell>
                  <TableCell className="text-foreground text-xs sm:text-sm font-medium">
                    {resolveLocalizedName(product.specs.edition, lang)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-b border-border/40">
                  <TableCell className="font-medium text-muted-foreground w-1/3 text-xs sm:text-sm">
                    {t('language')}
                  </TableCell>
                  <TableCell className="text-foreground text-xs sm:text-sm font-medium">
                    {resolveLocalizedName(product.specs.language, lang)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground w-1/3 text-xs sm:text-sm">
                    {t('delivery')}
                  </TableCell>
                  <TableCell className="text-foreground text-xs sm:text-sm font-medium">
                    {resolveLocalizedName(product.specs.deliveryTime, lang)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      {/* 4. Questions About This Product (Accordion) */}
      {product.faq && product.faq.length > 0 && (
        <section aria-labelledby="heading-faq" className="space-y-4">
          <h2
            id="heading-faq"
            className="font-heading text-xl sm:text-2xl font-semibold text-foreground"
          >
            {t('faq')}
          </h2>
          <Accordion className="w-full divide-y divide-border/40 border-y border-border/40">
            {product.faq.map((item, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger className="text-sm sm:text-base font-medium py-4 text-start">
                  {resolveLocalizedName(item.question, lang)}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                  {resolveLocalizedName(item.answer, lang)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {/* 5. Contact Support Line */}
      <section className="pt-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 text-sm sm:text-base text-primary hover:text-primary/80 transition-colors font-medium group"
        >
          <MessageCircle className="size-5 text-emerald-500 group-hover:scale-110 transition-transform" />
          <span>{t('askUs')}</span>
        </a>
      </section>
    </div>
  )
}
