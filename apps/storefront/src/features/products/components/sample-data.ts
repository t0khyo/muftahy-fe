import type { ProductCardData } from './types';

export const SAMPLE_PRODUCTS: ProductCardData[] = [
  {
    slug: 'canva-pro',
    name: 'Canva Pro - Direct Activation',
    nameAr: 'كانفا برو - تفعيل مباشر',
    imageUrl: null,
    imageAlt: 'Canva Pro',
    badge: 'offer',
    productType: 'subscription',
    activationType: 'personal_invite',
    ratingAverage: 5.0,
    ratingCount: 521,
    platforms: ['web', 'windows', 'mac', 'android', 'ios'],
    startingPrice: '14.99',
    startingPlanDuration: 'شهر',
    startingPlanDurationEn: 'month',
    trustNote: 'Term Warranty Guaranteed',
    whatsappNumber: '1234567890',
    plans: [
      {
        id: 'canva-1-month',
        label: '1 Month - Personal Invite',
        duration: '1 month',
        price: '14.99',
        activationType: 'personal_invite'
      },
      {
        id: 'canva-1-year',
        label: '1 Year - Personal Invite',
        duration: '1 year',
        price: '49.99',
        activationType: 'personal_invite'
      }
    ]
  },
  {
    slug: 'google-ai-pro',
    name: 'Google AI Pro (Gemini Advanced)',
    nameAr: 'جوجل AI برو (جيميني أدفانسد)',
    imageUrl: null,
    imageAlt: 'Google AI Pro',
    badge: 'new',
    productType: 'subscription',
    activationType: 'ready_account',
    ratingAverage: 4.9,
    ratingCount: 284,
    platforms: ['web', 'android', 'ios'],
    startingPrice: '19.99',
    startingPlanDuration: 'شهر',
    startingPlanDurationEn: 'month',
    trustNote: 'Term Warranty Guaranteed',
    whatsappNumber: '1234567890',
    plans: [
      {
        id: 'google-ai-1-month',
        label: 'Monthly Subscription',
        duration: '1 month',
        price: '19.99',
        activationType: 'ready_account'
      }
    ]
  },
  {
    slug: 'office-365',
    name: 'Microsoft 365 Family / Personal',
    nameAr: 'مايكروسوفت 365 عائلي / شخصي',
    imageUrl: null,
    imageAlt: 'Office 365',
    badge: 'warranty',
    productType: 'subscription',
    activationType: 'ready_account',
    ratingAverage: 4.8,
    ratingCount: 390,
    platforms: ['windows', 'mac', 'android', 'ios', 'web'],
    startingPrice: '29.99',
    startingPlanDuration: 'سنة',
    startingPlanDurationEn: 'year',
    trustNote: 'Full Support Included',
    whatsappNumber: '1234567890',
    plans: [
      {
        id: 'office-1-year-personal',
        label: '1 Year - 1 Device',
        duration: '1 year',
        price: '29.99',
        activationType: 'ready_account'
      },
      {
        id: 'office-1-year-family',
        label: '1 Year - 5 Devices',
        duration: '1 year',
        price: '59.99',
        activationType: 'ready_account'
      }
    ]
  }
];

