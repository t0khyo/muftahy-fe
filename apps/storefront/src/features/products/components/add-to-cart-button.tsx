import * as React from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { IconCheck, IconShoppingCartPlus } from './icons';
import { PlanPicker } from './plan-picker';
import type { ProductCardPlan } from './types';

export interface AddToCartButtonProps {
  productName: string;
  plans: ProductCardPlan[];
  locale?: string;
  currency?: string;
  label?: string;
  addedLabel?: string;
  choosePlanTitle?: string;
  choosePlanSubtitle?: string;
  cancelLabel?: string;
  activationPersonalInviteLabel?: string;
  activationReadyAccountLabel?: string;
  className?: string;
  disabled?: boolean;
  onAddToCart?: (plan: ProductCardPlan) => void;
}

export function AddToCartButton({
  productName,
  plans,
  locale = 'en',
  currency = '$',
  label = 'Add to Cart',
  addedLabel = 'Added!',
  choosePlanTitle = 'Choose a plan',
  choosePlanSubtitle = 'Select the duration that best suits your needs',
  cancelLabel,
  activationPersonalInviteLabel = 'Personal Invite',
  activationReadyAccountLabel = 'Ready Account',
  className,
  disabled = false,
  onAddToCart
}: AddToCartButtonProps) {
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const [justAdded, setJustAdded] = React.useState(false);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    if (plans.length === 1 && plans[0]) {
      if (onAddToCart) {
        onAddToCart(plans[0]);
      }
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    } else if (plans.length > 1) {
      setIsPickerOpen(true);
    }
  };

  const handleSelectPlan = (plan: ProductCardPlan) => {
    if (onAddToCart) {
      onAddToCart(plan);
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <>
      <button
        type='button'
        disabled={disabled}
        onClick={handleButtonClick}
        aria-label={`${label} – ${productName}`}
        className={cn(
          'relative z-10 cursor-pointer flex h-12 w-full items-center justify-center gap-2 rounded-xl',
          'bg-primary text-primary-foreground font-semibold text-sm shadow-xs',
          'transition-all duration-150 hover:bg-primary/90 active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
          justAdded && 'bg-primary/90',
          className
        )}
      >
        {justAdded ? (
          <>
            <IconCheck className='size-4 shrink-0' />
            <span>{addedLabel}</span>
          </>
        ) : (
          <>
            <IconShoppingCartPlus className='size-4 shrink-0' />
            <span>{label}</span>
          </>
        )}
      </button>

      {plans.length > 1 && (
        <PlanPicker
          open={isPickerOpen}
          onOpenChange={setIsPickerOpen}
          productName={productName}
          plans={plans}
          locale={locale}
          currency={currency}
          title={choosePlanTitle}
          subtitle={choosePlanSubtitle}
          cancelLabel={cancelLabel}
          addToCartLabel={label}
          activationPersonalInviteLabel={activationPersonalInviteLabel}
          activationReadyAccountLabel={activationReadyAccountLabel}
          onSelectPlan={handleSelectPlan}
        />
      )}
    </>
  );
}

