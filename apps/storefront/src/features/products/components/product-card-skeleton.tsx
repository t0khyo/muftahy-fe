import { cn } from '@workspace/ui/lib/utils';

function Bone({ className }: { className?: string }) {
  return <div aria-hidden='true' className={cn('animate-pulse rounded-md bg-muted', className)} />;
}

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-busy='true'
      aria-label='Loading...'
      className={cn(
        'relative flex flex-col rounded-3xl bg-card border-0 shadow-none p-3 sm:p-3.5 lg:p-4 h-full',
        className
      )}
    >
      {/* 1 ── Cover Area (4:3, centered with ~12% padding) */}
      <div className='aspect-4/3 w-full rounded-2xl bg-secondary/50 p-[12%] flex items-center justify-center overflow-hidden'>
        <Bone className='h-12 w-12 rounded-xl bg-muted-foreground/15' />
      </div>

      {/* 2 ── Meta Line Skeleton */}
      <Bone className='h-3 w-20 rounded mt-2.5' />

      {/* 3 ── Title Skeleton (2 lines) */}
      <div className='space-y-1.5 pt-1'>
        <Bone className='h-4 w-full rounded' />
        <Bone className='h-4 w-3/4 rounded' />
      </div>

      {/* 4 ── Bottom Stack: Price, Delivery, Pill Button */}
      <div className='mt-auto flex flex-col gap-2.5 pt-3'>
        {/* Price Row */}
        <div className='flex items-baseline gap-1.5'>
          <Bone className='h-3 w-8 rounded' />
          <Bone className='h-4 w-16 rounded' />
        </div>

        {/* Pill button skeleton: height 44/44/40 px (h-11 lg:h-10) */}
        <Bone className='h-11 lg:h-10 w-full rounded-full' />
      </div>
    </div>
  );
}

