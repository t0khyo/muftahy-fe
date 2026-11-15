import * as React from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { IconCheck, IconClose, IconRefresh, IconUserCheck } from './icons';
import type { ProductCardPlan } from './types';
import { formatPrice } from './utils';

export interface PlanPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  plans: ProductCardPlan[];
  locale?: string;
  currency?: string;
  title?: string;
  subtitle?: string;
  addToCartLabel?: string;
  cancelLabel?: string;
  activationPersonalInviteLabel?: string;
  activationReadyAccountLabel?: string;
  onSelectPlan?: (plan: ProductCardPlan) => void;
}

export function PlanPicker({
  open,
  onOpenChange,
  productName,
  plans,
  locale = 'en',
  currency = '$',
  title = 'Choose a plan',
  subtitle = 'Select the duration that best suits your needs',
  addToCartLabel = 'Add to Cart',
  cancelLabel,
  activationPersonalInviteLabel = 'Personal Invite',
  activationReadyAccountLabel = 'Ready Account',
  onSelectPlan
}: PlanPickerProps) {
  const isRtl = locale === 'ar';
  const resolvedCancelLabel = cancelLabel ?? (isRtl ? 'إلغاء' : 'Cancel');

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const activePlanId =
    selectedId && plans.some((p) => p.id === selectedId) ? selectedId : (plans[0]?.id ?? '');

  // Handle escape key
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const handleConfirm = () => {
    const chosen = plans.find((p) => p.id === activePlanId) || plans[0];
    if (chosen && onSelectPlan) {
      onSelectPlan(chosen);
    }
    onOpenChange(false);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity'
        onClick={() => onOpenChange(false)}
        aria-hidden='true'
      />

      {/* Modal Dialog Content */}
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='plan-picker-title'
        className={cn(
          'relative z-50 w-full max-w-lg bg-card text-card-foreground',
          'rounded-t-3xl sm:rounded-3xl border shadow-xl',
          'p-6 sm:p-7 max-h-[85vh] overflow-y-auto flex flex-col gap-5'
        )}
      >
        {/* Header */}
        <div className='flex items-start justify-between gap-4'>
          <div className='text-start'>
            <h3 id='plan-picker-title' className='text-lg font-bold sm:text-xl'>
              {title}
            </h3>
            <p className='mt-1 text-xs sm:text-sm text-muted-foreground'>
              {productName} — {subtitle}
            </p>
          </div>
          <button
            type='button'
            onClick={() => onOpenChange(false)}
            className='rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
            aria-label='Close'
          >
            <IconClose className='h-5 w-5' />
          </button>
        </div>

        {/* Plans List */}
        <div className='flex flex-col gap-2.5 my-1'>
          {plans.map((plan) => {
            const isSelected = plan.id === activePlanId;
            const isPersonal = plan.activationType === 'personal_invite';

            return (
              <button
                key={plan.id}
                type='button'
                onClick={() => setSelectedId(plan.id)}
                aria-label={`${plan.label} – ${formatPrice(plan.price, locale)} ${currency}`}
                className={cn(
                  'flex items-center justify-between p-4 rounded-2xl border text-start transition-all cursor-pointer',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/40'
                )}
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border transition-colors shrink-0',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/40'
                    )}
                  >
                    {isSelected && <IconCheck className='h-3 w-3 stroke-[3]' />}
                  </div>

                  <div>
                    <div className='font-semibold text-sm sm:text-base text-foreground'>
                      {plan.label}
                    </div>
                    <div className='flex items-center gap-2 mt-1 text-xs text-muted-foreground'>
                      <span className='inline-flex items-center gap-1'>
                        {isPersonal ? (
                          <>
                            <IconUserCheck className='h-3 w-3 shrink-0' />
                            <span>{activationPersonalInviteLabel}</span>
                          </>
                        ) : (
                          <>
                            <IconRefresh className='h-3 w-3 shrink-0' />
                            <span>{activationReadyAccountLabel}</span>
                          </>
                        )}
                      </span>
                      <span>·</span>
                      <span>{plan.duration}</span>
                    </div>
                  </div>
                </div>

                <div className='text-end shrink-0 ps-3'>
                  <div className='font-bold text-base sm:text-lg text-primary tabular-nums'>
                    {formatPrice(plan.price, locale)} {currency}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className='flex items-center gap-3 mt-2'>
          <button
            type='button'
            onClick={handleConfirm}
            className={cn(
              'flex-1 flex items-center justify-center h-12 rounded-xl font-semibold text-sm cursor-pointer',
              'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs'
            )}
          >
            {addToCartLabel}
          </button>
          <button
            type='button'
            onClick={() => onOpenChange(false)}
            className='h-12 px-5 rounded-xl border font-medium text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer'
          >
            {resolvedCancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
