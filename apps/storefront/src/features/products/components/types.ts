export type ProductBadge = 'warranty' | 'offer' | 'new';
export type ProductType = 'subscription' | 'service';
export type ActivationType = 'personal_invite' | 'ready_account';
export type Platform = 'windows' | 'mac' | 'android' | 'ios' | 'web';
export type DisplayPlatform = 'web' | 'windows' | 'apple' | 'android';

export interface ProductCardPlan {
  id: string;
  label: string;
  duration: string;
  price: string;
  activationType: ActivationType;
}

export interface ProductCardData {
  slug: string;
  name: string;
  nameAr?: string;
  imageUrl?: string | null;
  imageAlt?: string;
  badge?: ProductBadge | null;
  productType?: ProductType;
  activationType?: ActivationType;
  ratingAverage?: number | null;
  ratingCount?: number | null;
  platforms?: Platform[];
  startingPrice: string;
  startingPlanDuration?: string;
  startingPlanDurationEn?: string;
  trustNote?: string | null;
  whatsappNumber?: string | null;
  plans: ProductCardPlan[];
}

export interface ProductCardTranslations {
  badge?: {
    warranty?: string;
    offer?: string;
    new?: string;
  };
  type?: {
    subscription?: string;
    service?: string;
  };
  activation?: {
    personalInvite?: string;
    readyAccount?: string;
  };
  worksOn?: string;
  platforms?: {
    web?: string;
    windows?: string;
    android?: string;
    apple?: string;
  };
  startingFrom?: string;
  currency?: string;
  addToCart?: string;
  buyNow?: string;
  addedToCart?: string;
  choosePlan?: string;
  choosePlanSubtitle?: string;
  termWarranty?: string;
  ratingAriaLabel?: (average: number, count: number) => string;
}
