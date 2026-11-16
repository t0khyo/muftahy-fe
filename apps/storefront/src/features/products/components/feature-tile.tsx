import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { cn } from '@workspace/ui/lib/utils';
import {
  IconPlatformSteam,
  IconPlatformPlaystation,
  IconPlatformXbox,
  IconPlatformNintendo,
  IconPlatformPc,
} from './icons';

export interface FeatureTileProps {
  headline: string;
  tagline: string;
  buyHref: string;
  learnMoreHref: string;
  desktopImage?: string;
  mobileImage?: string;
  imageAlt?: string;
  eyebrow?: string;
  platform?: 'steam' | 'xbox' | 'playstation' | 'nintendo' | 'pc';
  priority?: boolean;
  className?: string;
}

function FallbackFeatureArt({ platform }: { platform?: string }) {
  const Icon =
    platform === 'steam'
      ? IconPlatformSteam
      : platform === 'xbox'
        ? IconPlatformXbox
        : platform === 'playstation'
          ? IconPlatformPlaystation
          : platform === 'nintendo'
            ? IconPlatformNintendo
            : IconPlatformPc;

  return (
    <div
      aria-hidden='true'
      className='absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-br from-secondary/80 via-secondary/40 to-muted/30 overflow-hidden'
    >
      <div className='relative flex items-center justify-center'>
        <div className='size-56 sm:size-72 lg:size-88 rounded-full bg-primary/5 blur-3xl' />
        <Icon className='size-28 sm:size-36 lg:size-44 text-muted-foreground/20' />
      </div>
    </div>
  );
}

export function FeatureTile({
  headline,
  tagline,
  buyHref,
  learnMoreHref,
  desktopImage,
  mobileImage,
  imageAlt,
  eyebrow,
  platform,
  priority = false,
  className,
}: FeatureTileProps) {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || 'en';
  const isRtl = currentLang === 'ar';
  const { t } = useTranslation(['products', 'common']);

  const buyText = t('buyNow', { ns: 'products', defaultValue: isRtl ? 'شراء الآن' : 'Buy' });
  const learnMoreText = t('learnMore', { ns: 'products', defaultValue: isRtl ? 'اعرف المزيد' : 'Learn more' });

  const resolvedBuyHref = buyHref.startsWith('/') ? buyHref : `/${currentLang}/${buyHref}`;
  const resolvedLearnHref = learnMoreHref.startsWith('/') ? learnMoreHref : `/${currentLang}/${learnMoreHref}`;

  const hasImage = Boolean(desktopImage || mobileImage);

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-3xl lg:rounded-4xl bg-card border-0 shadow-none',
        'min-h-[420px] lg:min-h-[480px]',
        'aspect-4/5 md:aspect-auto',
        className
      )}
    >
      {/* Background artwork */}
      {hasImage ? (
        <picture className='absolute inset-0 z-0 h-full w-full'>
          {mobileImage && <source media='(max-width: 768px)' srcSet={mobileImage} />}
          <img
            src={desktopImage || mobileImage}
            alt={imageAlt || headline}
            width={1440}
            height={900}
            loading={priority ? 'eager' : 'lazy'}
            decoding='async'
            className='h-full w-full object-cover transition-transform duration-500 ease-out lg:group-hover:scale-[1.02] motion-reduce:transform-none'
          />
        </picture>
      ) : (
        <FallbackFeatureArt platform={platform} />
      )}

      {/* Subtle overlay for legibility */}
      {hasImage && (
        <div
          aria-hidden='true'
          className='absolute inset-0 z-1 bg-gradient-to-t from-background/90 via-background/40 to-transparent'
        />
      )}

      {/* Content */}
      <div className='relative z-10 flex h-full flex-col justify-end p-6 sm:p-8 lg:p-12 text-start'>
        <div className='max-w-xl space-y-2.5'>
          {eyebrow && (
            <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              {eyebrow}
            </p>
          )}
          <h3
            className={cn(
              'text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight',
              isRtl ? 'tracking-normal' : 'tracking-tight'
            )}
          >
            {headline}
          </h3>
          <p className='text-sm sm:text-base text-muted-foreground font-normal line-clamp-2'>
            {tagline}
          </p>
        </div>

        {/* CTA Actions */}
        <div className='mt-6 flex items-center gap-4 flex-wrap'>
          <Link
            to={resolvedBuyHref}
            className='inline-flex h-11 lg:h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            {buyText}
          </Link>
          <Link
            to={resolvedLearnHref}
            className='group/link inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md'
          >
            <span>{learnMoreText}</span>
            <svg
              aria-hidden='true'
              className='size-4 transition-transform group-hover/link:translate-x-0.5 rtl:rotate-180 rtl:group-hover/link:-translate-x-0.5'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='m9 18 6-6-6-6' />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
