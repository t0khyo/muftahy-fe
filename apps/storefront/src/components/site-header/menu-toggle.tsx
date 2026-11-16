import { useTranslation } from 'react-i18next'

export interface MenuToggleProps {
  isOpen: boolean
  onToggle: () => void
  controlsId?: string
  className?: string
  ariaLabel?: string
}

export function MenuToggle({
  isOpen,
  onToggle,
  controlsId = 'mobile-menu',
  className = '',
  ariaLabel: customAriaLabel,
}: MenuToggleProps) {
  const { t } = useTranslation(['header'])
  const label =
    customAriaLabel ??
    (isOpen
      ? t('closeMenu', { ns: 'header' })
      : t('openMenu', { ns: 'header' }))

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={controlsId}
      aria-label={label}
      className={`cursor-pointer relative inline-flex h-11 w-11 items-center justify-center text-foreground/80 transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden ${className}`}
    >
      <span className="relative flex h-[17px] w-[17px] flex-col justify-center items-center">
        {/* Top bar */}
        <span
          aria-hidden="true"
          style={{
            transform: isOpen ? 'translateY(3px) rotate(45deg)' : 'translateY(-3px)',
            transitionDuration: 'var(--header-duration-menu, 240ms)',
            transitionTimingFunction: 'var(--header-ease)',
          }}
          className="absolute block h-[1.5px] w-[17px] rounded-full bg-current transition-transform"
        />
        {/* Bottom bar */}
        <span
          aria-hidden="true"
          style={{
            transform: isOpen ? 'translateY(3px) rotate(-45deg)' : 'translateY(3px)',
            transitionDuration: 'var(--header-duration-menu, 240ms)',
            transitionTimingFunction: 'var(--header-ease)',
          }}
          className="absolute block h-[1.5px] w-[17px] rounded-full bg-current transition-transform"
        />
      </span>
    </button>
  )
}
