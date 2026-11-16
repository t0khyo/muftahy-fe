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
        'flex flex-col overflow-hidden rounded-3xl border bg-card p-0 shadow-xs',
        className
      )}
    >
      {/* Image area */}
      <div className='flex h-40 items-center justify-center bg-muted rounded-t-3xl'>
        <Bone className='h-[88px] w-[88px] rounded-2xl bg-muted-foreground/10' />
      </div>

      {/* Card body */}
      <div className='flex flex-1 flex-col gap-3 p-4'>
        {/* Chips */}
        <div className='flex gap-1.5'>
          <Bone className='h-5 w-20 rounded-full' />
          <Bone className='h-5 w-24 rounded-full' />
        </div>

        {/* Name */}
        <div className='space-y-1.5 min-h-[2.75rem]'>
          <Bone className='h-4 w-full' />
          <Bone className='h-4 w-3/4' />
        </div>

        {/* Price & Button spacer */}
        <div className='mt-auto flex flex-col gap-3 pt-1'>
          <div className='flex items-baseline gap-1'>
            <Bone className='h-3 w-12' />
            <Bone className='h-6 w-16' />
            <Bone className='h-3 w-10' />
          </div>

          <Bone className='h-12 w-full rounded-xl' />

          <div className='flex justify-center'>
            <Bone className='h-3 w-28' />
          </div>
        </div>
      </div>
    </div>
  );
}

