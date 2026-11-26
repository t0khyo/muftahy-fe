export interface BrandLogoMarkProps {
  id?: string
  className?: string
  idPrefix?: string
}

export function BrandLogoMark({
  id,
  className = 'h-6 w-auto',
  idPrefix = 'brand-logo',
}: BrandLogoMarkProps) {
  return (
    <svg
      id={id ?? idPrefix}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 358.349 390.59"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <g>
        <polygon
          points="178.802,0 264.991,53.367 264.991,141.202 235.172,159.352 235.044,152.735 225.457,146.762 225.391,146.56 248.648,132.016 248.648,62.806 248.791,62.224 178.805,18.977 109.077,61.663 109.077,87.941 93.298,87.941 93.337,52.884"
          fill="#009245"
        />
        <polygon
          points="53.361,93.341 141.113,93.342 162.31,128.013 148.814,136.465 131.975,109.726 62.182,109.641 18.977,179.51 61.601,249.23 132.142,249.354 144.336,229.831 157.841,238.152 141.231,264.981 52.906,265.029 0,179.508"
          fill="#ed1c24"
        />
        <polygon
          points="200.852,237.954 214.213,229.616 226.24,248.813 296.171,248.959 339.364,179.039 296.691,109.369 270.383,109.369 270.383,93.585 279.716,93.59 280.345,93.478 305.4,93.48 358.349,179.006 304.929,265.202 217.177,265.262 200.575,238.13"
          fill="#f7931e"
        />
        <polygon
          points="243.258,93.566 243.258,109.243 226.143,109.243 209.139,136.528 195.675,128.116 217.075,93.621"
          fill="#f7931e"
        />
        <polygon
          points="109.06,115.05 108.951,132.17 132.336,146.74 123.113,152.402 123.113,159.677 93.314,141.312 93.314,115.05"
          fill="#009245"
        />
        <path
          d="M168.855 238.66 L128.532 213.611 L128.532 155.458 L178.998 124.123 L229.833 155.777 L229.833 213.253 L189.519 238.652 L189.519 291.83 L225.767 291.974 L225.767 312.851 L189.509 312.851 L189.509 368.844 L225.921 368.844 L225.921 390.523 L168.994 390.59 L168.994 339.907 L132.524 339.907 L132.443 318.631 L169.096 318.631 M178.861 148.807 C167.03 156.482 149.885 166.956 149.885 166.956 L149.487 201.196 L179.044 219.366 L208.377 201.455 L208.574 166.794 Z"
          fill="#0071bc"
        />
      </g>
    </svg>
  )
}

export interface BrandHorizontalLogoProps {
  lang?: string
  alt?: string
  className?: string
}

export function BrandHorizontalLogo({
  lang = 'en',
  alt = '',
  className = 'h-8 w-auto shrink-0',
}: BrandHorizontalLogoProps) {
  const isAr = lang === 'ar'
  return (
    <img
      src={isAr ? '/logo-horizontal-rtl.svg' : '/logo-horizontal-ltr.svg'}
      alt={alt}
      className={className}
    />
  )
}
