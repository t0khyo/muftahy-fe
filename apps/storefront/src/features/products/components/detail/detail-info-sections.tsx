import { Check, MessageCircle, ShieldCheck, Zap } from 'lucide-react'
import type { ProductResponse } from '@workspace/domain/schemas/product'

export interface DetailInfoSectionsProps {
  product: ProductResponse
  lang: string
}

export function DetailInfoSections({ product, lang }: DetailInfoSectionsProps) {
  const isRtl = lang === 'ar'

  const encodedMessage = encodeURIComponent(
    isRtl
      ? `مرحباً، لدي استفسار بخصوص ${product.name}`
      : `Hi, I have a question about ${product.name}`,
  )
  const whatsappUrl = `https://wa.me/201158172869?text=${encodedMessage}`

  return (
    <div className="max-w-3xl w-full text-start space-y-10">
      {/* 1. License Overview & Description */}
      <section aria-labelledby="heading-about" className="space-y-4">
        <h2
          id="heading-about"
          className="text-xl sm:text-2xl font-bold text-foreground"
        >
          {lang === 'ar' ? 'حول الترخيص' : 'About this license'}
        </h2>
        {product.description && (
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            {product.description}
          </p>
        )}

        <ul className="space-y-2.5 pt-2">
          <li className="flex items-start gap-3 text-sm sm:text-[15px] text-foreground">
            <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Check className="size-3.5" aria-hidden="true" />
            </div>
            <span>
              {lang === 'ar'
                ? 'مفتاح ترخيص رقمي رسمي أصلي 100%'
                : '100% Genuine official digital license key'}
            </span>
          </li>
          <li className="flex items-start gap-3 text-sm sm:text-[15px] text-foreground">
            <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Check className="size-3.5" aria-hidden="true" />
            </div>
            <span>
              {lang === 'ar'
                ? 'تفعيل دائم لمدى الحياة لجهاز حاسوب واحد'
                : 'Permanent lifetime activation for 1 PC'}
            </span>
          </li>
          <li className="flex items-start gap-3 text-sm sm:text-[15px] text-foreground">
            <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Check className="size-3.5" aria-hidden="true" />
            </div>
            <span>
              {lang === 'ar'
                ? 'تحديثات نظام التشغيل والتطبيقات الرسمية من مايكروسوفت'
                : 'Official updates directly from Microsoft'}
            </span>
          </li>
        </ul>
      </section>

      {/* 2. Digital Key Delivery & Activation */}
      <section aria-labelledby="heading-delivery" className="space-y-4">
        <h2
          id="heading-delivery"
          className="text-xl sm:text-2xl font-bold text-foreground"
        >
          {lang === 'ar' ? 'التسليم والتفعيل' : 'Delivery & Activation'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-border/40 bg-card space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Zap className="size-4 shrink-0" />
              <span>{lang === 'ar' ? 'التسليم الرقمي' : 'Digital Fulfillment'}</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {product.stock_status === 'preorder'
                ? lang === 'ar'
                  ? 'هذا المنتج تحت الطلب المسبق. سيتم تسليم المفتاح فور توفر المخزون الجديد.'
                  : 'This item is on preorder. The key will be dispatched as soon as the restock arrives.'
                : lang === 'ar'
                  ? 'يظهر المفتاح فوراً في حسابك وعلى الشاشة بعد تأكيد عملية الدفع.'
                  : 'Keys are revealed on-screen immediately upon payment approval.'}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-border/40 bg-card space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <ShieldCheck className="size-4 shrink-0" />
              <span>{lang === 'ar' ? 'الضمان والاستبدال' : 'Warranty & Guarantee'}</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {lang === 'ar'
                ? 'نضمن صلاحية جميع المفاتيح بنسبة 100%. في حال واجهت أي صعوبة، يتم استبدال المفتاح فوراً.'
                : 'All keys are guaranteed 100% valid. In case of any activation issue, an instant replacement is provided.'}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Need Help / WhatsApp */}
      <section aria-labelledby="heading-support" className="p-5 rounded-2xl border border-border/40 bg-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 id="heading-support" className="font-semibold text-foreground text-base">
            {lang === 'ar' ? 'هل لديك أي استفسار؟' : 'Have a question?'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {lang === 'ar'
              ? 'فريق الدعم الفني متواجد عبر واتساب للمساعدة في خطوات التفعيل والطلب.'
              : 'Our support team is available on WhatsApp to assist with order and activation steps.'}
          </p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
        >
          <MessageCircle className="size-4" />
          <span>{lang === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}</span>
        </a>
      </section>
    </div>
  )
}
