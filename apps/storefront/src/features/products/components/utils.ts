export function formatPrice(raw: string | number, locale: string = 'en'): string {
  const num = typeof raw === 'string' ? parseFloat(raw) : raw;
  if (Number.isNaN(num)) return String(raw);
  const normalizedLocale = locale.startsWith('ar') ? 'ar-u-nu-latn' : 'en-US';
  return new Intl.NumberFormat(normalizedLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

