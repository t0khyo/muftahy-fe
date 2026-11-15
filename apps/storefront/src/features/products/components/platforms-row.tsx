import * as React from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { IconGlobe, IconPlatformAndroid, IconPlatformMac, IconPlatformWindows } from './icons';
import type { DisplayPlatform, Platform } from './types';

const PLATFORM_ICONS: Record<DisplayPlatform, React.ComponentType<{ className?: string }>> = {
  web: IconGlobe,
  windows: IconPlatformWindows,
  apple: IconPlatformMac,
  android: IconPlatformAndroid
};

const DEFAULT_PLATFORM_LABELS: Record<DisplayPlatform, string> = {
  web: 'Web Browser',
  windows: 'Windows',
  apple: 'Apple (macOS / iOS)',
  android: 'Android'
};

export interface PlatformsRowProps {
  platforms: Platform[];
  label?: string;
  platformLabels?: Partial<Record<DisplayPlatform, string>>;
  className?: string;
}

export function PlatformsRow({
  platforms,
  label = 'Works on:',
  platformLabels = DEFAULT_PLATFORM_LABELS,
  className
}: PlatformsRowProps) {
  // Normalize and order: web, windows, apple, android
  const displayPlatforms = React.useMemo(() => {
    const set = new Set(platforms);
    const result: DisplayPlatform[] = [];

    if (set.has('web')) result.push('web');
    if (set.has('windows')) result.push('windows');
    if (set.has('mac') || set.has('ios')) result.push('apple');
    if (set.has('android')) result.push('android');

    return result;
  }, [platforms]);

  if (displayPlatforms.length === 0) {
    return null;
  }

  return (
    <div className={cn('relative z-10 flex items-center gap-2', className)}>
      <span className='text-[11px] text-muted-foreground'>{label}</span>
      <span className='flex items-center gap-1.5'>
        {displayPlatforms.map((key) => {
          const IconComp = PLATFORM_ICONS[key];
          const name = platformLabels[key] || DEFAULT_PLATFORM_LABELS[key];

          return (
            <span
              key={key}
              title={name}
              aria-label={name}
              className={cn(
                'group/platform relative inline-flex h-7 w-7 items-center justify-center rounded-full',
                'bg-muted text-muted-foreground ring-1 ring-border',
                'transition-all duration-150 hover:scale-110 hover:text-foreground hover:bg-muted/80',
                'cursor-default'
              )}
            >
              <IconComp className='h-3.5 w-3.5' />
              {/* Lightweight CSS tooltip fallback */}
              <span
                role='tooltip'
                className={cn(
                  'pointer-events-none absolute bottom-full mb-1.5 hidden',
                  'group-hover/platform:block z-50 whitespace-nowrap rounded-md',
                  'bg-popover text-popover-foreground px-2 py-0.5 text-[10px] font-medium shadow-md border'
                )}
              >
                {name}
              </span>
            </span>
          );
        })}
      </span>
    </div>
  );
}

