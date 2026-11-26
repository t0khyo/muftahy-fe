import { useTranslation } from 'react-i18next'
import { cn } from '@workspace/ui/lib/utils'
import instapayLogo from '../assets/payments/instapay.svg'
import vodafoneCashLogo from '../assets/payments/vodafone-cash.png'

export type PaymentMethodBrand = 'vodafone_cash' | 'instapay'

export interface PaymentMethodLogoProps {
  method: PaymentMethodBrand
  size?: 'sm' | 'md'
  decorative?: boolean
  className?: string
}

const PAYMENT_BRAND_ASSETS: Record<
  PaymentMethodBrand,
  { src: string; i18nKey: 'vodafoneCash' | 'instapay'; fallback: string }
> = {
  vodafone_cash: {
    src: vodafoneCashLogo,
    i18nKey: 'vodafoneCash',
    fallback: 'Vodafone Cash',
  },
  instapay: {
    src: instapayLogo,
    i18nKey: 'instapay',
    fallback: 'InstaPay',
  },
}

/** Displays a localized Vodafone Cash or InstaPay brand mark without a container box. */
export function PaymentMethodLogo({
  method,
  size = 'md',
  decorative = false,
  className,
}: PaymentMethodLogoProps) {
  const { t } = useTranslation('footer')
  const asset = PAYMENT_BRAND_ASSETS[method]
  const label = decorative ? '' : t(asset.i18nKey, { defaultValue: asset.fallback })

  return (
    <img
      src={asset.src}
      alt={label}
      aria-hidden={decorative || undefined}
      className={cn(
        'w-auto shrink-0 object-contain select-none',
        size === 'sm' ? 'h-6' : 'h-8',
        className,
      )}
    />
  )
}

