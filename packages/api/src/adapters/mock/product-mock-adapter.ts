import type {
  FilterOptionCount,
  Product,
  ProductCollection,
  ProductFilterCounts,
  ProductListFilter,
  ProductListResult,
} from '@workspace/domain/schemas/product'
import type { ProductService } from '../../services/product-service'

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    slug: 'windows-11-pro',
    title: {
      en: 'Windows 11 Professional Retail Key',
      ar: 'مفتاح ترخيص ويندوز 11 بروفيشنال الأصلي',
    },
    tagline: {
      en: 'Genuine lifetime license for power users and professionals',
      ar: 'ترخيص أصلي مدى الحياة للمحترفين والمستخدمين المتقدمين',
    },
    description: {
      en: 'Unlock advanced security, remote desktop, BitLocker encryption, and enterprise-grade performance with Windows 11 Pro.',
      ar: 'استمتع بحماية متقدمة، وسطح مكتب عن بعد، وتشفير بيت لوكر، وأداء احترافي مع ويندوز 11 برو الأصلي.',
    },
    price: {
      amountMinor: 65000, // 650.00 EGP
      currency: 'EGP',
    },
    originalPrice: {
      amountMinor: 95000, // 950.00 EGP
      currency: 'EGP',
    },
    category: 'software',
    platform: 'microsoft',
    region: 'global',
    coverImage: '/images/products/windows-11.webp',
    inStock: true,
    featured: true,
    deliveryType: 'instant',
    defaultPlanSlug: '1-pc',
    plans: [
      {
        id: 'plan-w11-1pc',
        slug: '1-pc',
        name: {
          en: '1 PC License',
          ar: 'ترخيص لجهاز واحد',
        },
        price: {
          amountMinor: 65000,
          currency: 'EGP',
        },
        originalPrice: {
          amountMinor: 95000,
          currency: 'EGP',
        },
        stock: 15,
        deliveryType: 'instant',
        deliveryTime: {
          en: 'Instant Delivery',
          ar: 'تسليم فوري',
        },
      },
      {
        id: 'plan-w11-5pc',
        slug: '5-pc',
        name: {
          en: '5 PCs Family / Team Pack',
          ar: 'حزمة 5 أجهزة للعائلة والفرق',
        },
        price: {
          amountMinor: 240000,
          currency: 'EGP',
        },
        originalPrice: {
          amountMinor: 320000,
          currency: 'EGP',
        },
        stock: 3, // Low stock <= 5
        deliveryType: 'instant',
        deliveryTime: {
          en: 'Instant Delivery',
          ar: 'تسليم فوري',
        },
      },
    ],
    includes: [
      {
        en: 'Official Windows 11 Pro 25-digit activation key',
        ar: 'مفتاح تفعيل أصلي مكون من 25 رمزًا لنظام ويندوز 11 برو',
      },
      {
        en: 'Lifetime validity with official Microsoft updates',
        ar: 'صلاحية دائمة مع تحديثات مايكروسوفت الرسمية',
      },
      {
        en: 'Step-by-step activation guide and technical support',
        ar: 'دليل تفعيل خطوة بخطوة ودعم فني مخصص',
      },
    ],
    activationSteps: [
      {
        en: 'Open Windows Settings > System > Activation',
        ar: 'افتح إعدادات ويندوز > النظام > التنشيط',
      },
      {
        en: 'Click "Change product key" and paste your 25-digit code (XXXXX-XXXXX-XXXXX)',
        ar: 'اضغط على "تغيير مفتاح المنتج" وأدخل الرمز (XXXXX-XXXXX-XXXXX)',
      },
      {
        en: 'Click "Next" then "Activate" to verify your license with Microsoft servers',
        ar: 'اضغط "التالي" ثم "تنشيط" لتأكيد الترخيص مع خوادم مايكروسوفت',
      },
    ],
    specs: {
      licenseType: {
        en: 'Retail / Digital',
        ar: 'تجزئة / رقمي',
      },
      edition: {
        en: 'Windows 11 Professional (64-bit)',
        ar: 'ويندوز 11 بروفيشنال (64 بت)',
      },
      language: {
        en: 'Multilingual (All Languages)',
        ar: 'متعدد اللغات (كل اللغات)',
      },
      deliveryTime: {
        en: 'Instant digital delivery via email and dashboard',
        ar: 'تسليم رقمي فوري عبر البريد ولوحة التحكم',
      },
    },
    faq: [
      {
        question: {
          en: 'Can I transfer this license to another computer?',
          ar: 'هل يمكنني نقل هذا الترخيص إلى جهاز كمبيوتر آخر؟',
        },
        answer: {
          en: 'Yes, retail licenses can be transferred to a new PC after deactivating the old one.',
          ar: 'نعم، يمكن نقل ترخيص التجزئة إلى جهاز جديد بعد إلغاء تنشيطه على الجهاز القديم.',
        },
      },
      {
        question: {
          en: 'Does this key work on a fresh Windows installation?',
          ar: 'هل يعمل المفتاح على تثبيت ويندوز نظيف؟',
        },
        answer: {
          en: 'Yes, it activates both existing Windows 11 Home/Pro installations and fresh installs.',
          ar: 'نعم، يعمل على التثبيت النظيف وكذلك ترقية ويندوز 11 هوم إلى برو.',
        },
      },
      {
        question: {
          en: 'What if activation fails?',
          ar: 'ماذا لو فشل التنشيط؟',
        },
        answer: {
          en: 'Our support team is available 24/7 on WhatsApp to verify and assist with your key.',
          ar: 'فريق الدعم متاح على مدار الساعة عبر واتساب لمساعدتك وضمان نجاح التنشيط.',
        },
      },
    ],
    relatedSlugs: ['office-2024-home-business', 'cyberpunk-2077', 'elden-ring-shadow-erdtree'],
  },
  {
    id: 'prod-002',
    slug: 'cyberpunk-2077',
    title: {
      en: 'Cyberpunk 2077: Ultimate Edition (PC)',
      ar: 'سايبر بانك 2077: النسخة الكاملة (حاسوب)',
    },
    tagline: {
      en: 'Experience the definitive Night City adventure with Phantom Liberty',
      ar: 'عش التجربة الكاملة في مدينة نايت سيتي مع توسعة فانتوم ليبرتي',
    },
    description: {
      en: 'Immerse yourself in Night City as V, an outlaw mercenary hunting for a unique implant that is the key to immortality.',
      ar: 'انغمس في مدينة نايت سيتي كمرتزق يبحث عن غرسة فريدة تمنح الخلود.',
    },
    price: {
      amountMinor: 145000, // 1450.00 EGP
      currency: 'EGP',
    },
    originalPrice: {
      amountMinor: 210000,
      currency: 'EGP',
    },
    category: 'games',
    platform: 'steam',
    region: 'global',
    coverImage: '/images/products/cyberpunk-2077.webp',
    inStock: true,
    featured: true,
    deliveryType: 'instant',
    defaultPlanSlug: 'standard',
    plans: [
      {
        id: 'plan-cp2077-std',
        slug: 'standard',
        name: {
          en: 'Ultimate Edition (Base + DLC)',
          ar: 'النسخة الكاملة (اللعبة + الإضافة)',
        },
        price: {
          amountMinor: 145000,
          currency: 'EGP',
        },
        originalPrice: {
          amountMinor: 210000,
          currency: 'EGP',
        },
        stock: 8,
        deliveryType: 'instant',
      },
    ],
    includes: [
      {
        en: 'Cyberpunk 2077 base game on Steam',
        ar: 'لعبة Cyberpunk 2077 الأساسية على ستيم',
      },
      {
        en: 'Phantom Liberty spy-thriller expansion',
        ar: 'توسعة فانتوم ليبرتي',
      },
      {
        en: 'Digital soundtrack and wallpapers',
        ar: 'الموسيقى التصويرية وخلفيات الشاشة الرقمية',
      },
    ],
    activationSteps: [
      {
        en: 'Open your Steam client and log in to your account',
        ar: 'افتح تطبيق ستيم وسجل الدخول إلى حسابك',
      },
      {
        en: 'Click "Games" in the top menu and select "Activate a Product on Steam"',
        ar: 'اضغط على قائمة Games ثم اختر Activate a Product on Steam',
      },
      {
        en: 'Enter your code (XXXXX-XXXXX-XXXXX) and proceed with game installation',
        ar: 'أدخل الرمز (XXXXX-XXXXX-XXXXX) وتابع تحميل وتثبيت اللعبة',
      },
    ],
    specs: {
      licenseType: {
        en: 'Steam Digital CD Key',
        ar: 'مفتاح رقمي أصلي على ستيم',
      },
      edition: {
        en: 'Ultimate Edition',
        ar: 'النسخة الكاملة',
      },
      language: {
        en: 'English, Arabic subtitles, Multilingual',
        ar: 'الإنجليزية، ترجمة عربية، متعدد اللغات',
      },
      deliveryTime: {
        en: 'Instant delivery after payment',
        ar: 'تسليم فوري بعد الدفع',
      },
    },
    faq: [
      {
        question: {
          en: 'Is this game key region-locked?',
          ar: 'هل المفتاح مقيد بمنطقة معينة؟',
        },
        answer: {
          en: 'No, this is a Global Steam key that activates worldwide.',
          ar: 'لا، هذا المفتاح عالمي ويعمل في جميع دول العالم.',
        },
      },
      {
        question: {
          en: 'Does it include the Phantom Liberty DLC?',
          ar: 'هل تتضمن النسخة توسعة فانتوم ليبرتي؟',
        },
        answer: {
          en: 'Yes, the Ultimate Edition includes the base game and Phantom Liberty.',
          ar: 'نعم، النسخة الكاملة تشمل اللعبة والتوسعة معًا.',
        },
      },
    ],
    relatedSlugs: ['elden-ring-shadow-erdtree', 'black-myth-wukong', 'xbox-game-pass-ultimate-3m'],
  },
  {
    id: 'prod-003',
    slug: 'xbox-game-pass-ultimate-3m',
    title: {
      en: 'Xbox Game Pass Ultimate - 3 Months Subscription',
      ar: 'اشتراك إكس بوكس جيم باس ألتيميت - 3 أشهر',
    },
    tagline: {
      en: 'Over 100 high-quality games for console, PC, and cloud',
      ar: 'أكثر من 100 لعبة عالية الجودة للكونسول والحاسوب واللعب السحابي',
    },
    description: {
      en: 'Get all the benefits of Xbox Live Gold, EA Play membership, and unlimited access to over 100 console and PC games.',
      ar: 'احصل على كل مزايا إكس بوكس لايف جولد، وعضوية EA Play، ووصول غير محدود لأكثر من 100 لعبة.',
    },
    price: {
      amountMinor: 89000, // 890.00 EGP
      currency: 'EGP',
    },
    category: 'subscriptions',
    platform: 'xbox',
    region: 'gcc',
    coverImage: '/images/products/xbox-game-pass.webp',
    inStock: true,
    featured: true,
    deliveryType: 'instant',
    defaultPlanSlug: '3-months',
    plans: [
      {
        id: 'plan-xgpu-3m',
        slug: '3-months',
        name: {
          en: '3 Months Subscription',
          ar: 'اشتراك 3 أشهر',
        },
        price: {
          amountMinor: 89000,
          currency: 'EGP',
        },
        stock: 12,
        deliveryType: 'instant',
      },
    ],
    includes: [
      {
        en: '3 months of Xbox Game Pass Ultimate membership',
        ar: 'عضوية 3 أشهر في إكس بوكس جيم باس ألتيميت',
      },
      {
        en: 'Includes EA Play and Xbox Cloud Gaming',
        ar: 'تشمل خدمة EA Play واللعب السحابي',
      },
      {
        en: 'Exclusive member discounts and perks',
        ar: 'خصومات ومكافآت حصرية للأعضاء',
      },
    ],
    activationSteps: [
      {
        en: 'Visit redeem.microsoft.com on any browser',
        ar: 'توجه إلى موقع redeem.microsoft.com',
      },
      {
        en: 'Sign in to your Microsoft / Xbox account',
        ar: 'سجل الدخول بحساب مايكروسوفت أو إكس بوكس الخاص بك',
      },
      {
        en: 'Enter your 25-character prepaid code (XXXXX-XXXXX-XXXXX)',
        ar: 'أدخل الرمز المكون من 25 خانة (XXXXX-XXXXX-XXXXX)',
      },
    ],
    specs: {
      licenseType: {
        en: 'Digital Subscription',
        ar: 'اشتراك رقمي',
      },
      edition: {
        en: 'Game Pass Ultimate',
        ar: 'جيم باس ألتيميت',
      },
      language: {
        en: 'All supported languages',
        ar: 'جميع اللغات المدعومة',
      },
      deliveryTime: {
        en: 'Instant Delivery',
        ar: 'تسليم فوري',
      },
    },
    faq: [
      {
        question: {
          en: 'Can I stack this on an existing subscription?',
          ar: 'هل يمكن إضافة المدة لاشتراك سارٍ؟',
        },
        answer: {
          en: 'Yes, it adds 3 months to your existing active membership.',
          ar: 'نعم، يضيف 3 أشهر إلى مدة اشتراكك الحالي.',
        },
      },
      {
        question: {
          en: 'Does it work in Egypt and GCC?',
          ar: 'هل يعمل في مصر ودول الخليج؟',
        },
        answer: {
          en: 'Yes, it activates on accounts registered in the GCC/MENA region.',
          ar: 'نعم، يعمل على الحسابات المسجلة في الشرق الأوسط والخليج.',
        },
      },
    ],
    relatedSlugs: ['cyberpunk-2077', 'windows-11-pro', 'playstation-network-card-100-sar'],
  },
  {
    id: 'prod-004',
    slug: 'steam-gift-card-50-usd',
    title: {
      en: 'Steam Wallet Card $50 USD (Global)',
      ar: 'بطاقة رصيد ستيم 50 دولار أمريكي (عالمي)',
    },
    tagline: {
      en: 'Add $50 USD to your Steam Wallet to buy any game, DLC, or item',
      ar: 'أضف 50 دولارًا إلى محفظة ستيم لشراء الألعاب والإضافات',
    },
    description: {
      en: 'Instant digital voucher for Steam Wallet. Add funds directly to your Steam account to purchase games, downloadable content, and software.',
      ar: 'بطاقة رقمية فورية لشحن محفظة ستيم لشراء الألعاب والمحتويات الإضافية والبرامج بكل سهولة.',
    },
    price: {
      amountMinor: 5000, // 50.00 USD
      currency: 'USD',
    },
    category: 'gift-cards',
    platform: 'steam',
    region: 'global',
    coverImage: '/images/products/steam-gift-card.webp',
    inStock: true,
    featured: false,
    deliveryType: 'instant',
    defaultPlanSlug: 'card-50',
    plans: [
      {
        id: 'plan-steam-50',
        slug: 'card-50',
        name: {
          en: '$50 USD Wallet Code',
          ar: 'رصيد 50 دولار أمريكي',
        },
        price: {
          amountMinor: 5000,
          currency: 'USD',
        },
        stock: 20,
        deliveryType: 'instant',
      },
    ],
    includes: [
      {
        en: 'Prepaid code providing $50.00 USD Steam Wallet credit',
        ar: 'رمز مسبق الدفع يمنح 50 دولارًا رصيدًا في محفظة ستيم',
      },
      {
        en: 'Instant balance top-up without credit card fees',
        ar: 'شحن فوري للمحفظة دون رسوم إضافية',
      },
    ],
    activationSteps: [
      {
        en: 'Open Steam and go to store.steampowered.com/account/redeemwalletcode',
        ar: 'افتح ستيم واذهب لصفحة redeemwalletcode',
      },
      {
        en: 'Enter your Steam Wallet code (XXXXX-XXXXX-XXXXX)',
        ar: 'أدخل رمز بطاقة ستيم (XXXXX-XXXXX-XXXXX)',
      },
      {
        en: 'Confirm and your balance will update immediately in USD',
        ar: 'أكد العملية وسيتم إضافة 50 دولارًا فورًا إلى رصيدك',
      },
    ],
    specs: {
      licenseType: {
        en: 'Digital Wallet Card',
        ar: 'بطاقة رصيد رقمية',
      },
      edition: {
        en: '$50 USD Denomination',
        ar: 'فئة 50 دولار',
      },
      language: {
        en: 'Global',
        ar: 'عالمي',
      },
      deliveryTime: {
        en: 'Instant Delivery',
        ar: 'تسليم فوري',
      },
    },
    faq: [
      {
        question: {
          en: 'Does this card expire?',
          ar: 'هل للبطاقة تاريخ انتهاء؟',
        },
        answer: {
          en: 'No, Steam Wallet codes have no expiration date.',
          ar: 'لا، رموز محفظة ستيم ليس لها تاريخ انتهاء صلاحية.',
        },
      },
      {
        question: {
          en: 'Can I redeem this on any Steam account?',
          ar: 'هل يمكن تفعيلها على أي حساب ستيم؟',
        },
        answer: {
          en: 'Yes, this is a Global code that converts to your local Steam currency if your store is not USD.',
          ar: 'نعم، كود عالمي ويتم تحويله تلقائيًا لعملة متجرك إذا لم يكن بالدولار.',
        },
      },
    ],
    relatedSlugs: ['cyberpunk-2077', 'black-myth-wukong', 'elden-ring-shadow-erdtree'],
  },
  {
    id: 'prod-005',
    slug: 'playstation-network-card-100-sar',
    title: {
      en: 'PlayStation Store 100 SAR (Saudi Account)',
      ar: 'بطاقة متجر بلايستيشن 100 ريال سعودي (حساب سعودي)',
    },
    tagline: {
      en: 'Top up 100 SAR to your Saudi PlayStation Store wallet',
      ar: 'اشحن 100 ريال سعودي في محفظة متجر بلايستيشن السعودي',
    },
    regionNote: {
      en: 'Notice: This voucher is strictly valid for PlayStation Network accounts registered with Saudi Arabia region.',
      ar: 'تنبيه: هذه البطاقة مخصصة حصريًا لحسابات شبكة بلايستيشن المسجلة بالمتجر السعودي.',
    },
    description: {
      en: 'Recharge your PlayStation Network wallet with 100 SAR to purchase PS4 and PS5 games, add-ons, and subscriptions from the Saudi store.',
      ar: 'اشحن محفظة بلايستيشن بمبلغ 100 ريال سعودي لشراء ألعاب بلايستيشن 4 و5 والإضافات والاشتراكات من المتجر السعودي.',
    },
    price: {
      amountMinor: 10000, // 100.00 SAR
      currency: 'SAR',
    },
    category: 'gift-cards',
    platform: 'playstation',
    region: 'gcc',
    coverImage: '/images/products/psn-card.webp',
    inStock: false,
    featured: false,
    deliveryType: 'instant',
    defaultPlanSlug: 'card-100-sar',
    plans: [
      {
        id: 'plan-psn-100',
        slug: 'card-100-sar',
        name: {
          en: '100 SAR Voucher',
          ar: 'قسيمة 100 ريال',
        },
        price: {
          amountMinor: 10000,
          currency: 'SAR',
        },
        stock: 0, // Out of stock
        deliveryType: 'instant',
      },
    ],
    includes: [
      {
        en: '100 SAR PlayStation Store voucher code',
        ar: 'رمز قسيمة متجر بلايستيشن بقيمة 100 ريال',
      },
    ],
    activationSteps: [
      {
        en: 'Open PlayStation Store on your PS4, PS5, or web browser',
        ar: 'افتح متجر بلايستيشن على جهازك أو المتصفح',
      },
      {
        en: 'Select "Redeem Code" from the profile / options menu',
        ar: 'اختر "استرداد الرمز" (Redeem Code) من القائمة',
      },
      {
        en: 'Enter your 12-character code (XXXXX-XXXXX-XXXXX)',
        ar: 'أدخل الرمز المكون من 12 خانة (XXXXX-XXXXX-XXXXX)',
      },
    ],
    specs: {
      licenseType: {
        en: 'PSN Digital Voucher',
        ar: 'قسيمة رقمية لشبكة بلايستيشن',
      },
      edition: {
        en: '100 SAR',
        ar: '100 ريال سعودي',
      },
      language: {
        en: 'Arabic / English',
        ar: 'عربي / إنجليزي',
      },
      deliveryTime: {
        en: 'Instant Delivery',
        ar: 'تسليم فوري',
      },
    },
    faq: [
      {
        question: {
          en: 'Will this code work on an Egyptian or US account?',
          ar: 'هل يعمل الكود على حساب مصري أو أمريكي؟',
        },
        answer: {
          en: 'No, this voucher requires a PlayStation account set to Saudi Arabia.',
          ar: 'لا، هذه البطاقة مخصصة فقط للحسابات السعودية.',
        },
      },
      {
        question: {
          en: 'When will this item be restocked?',
          ar: 'متى سيتوفر هذا المنتج مجددًا؟',
        },
        answer: {
          en: 'We restock digital vouchers regularly. Contact support for stock updates.',
          ar: 'نقوم بتجديد المخزون بشكل دوري، تواصل معنا لمعرفة موعد التوفر.',
        },
      },
    ],
    relatedSlugs: ['steam-gift-card-50-usd', 'xbox-game-pass-ultimate-3m'],
  },
  {
    id: 'prod-006',
    slug: 'office-2024-home-business',
    title: {
      en: 'Microsoft Office 2024 Home & Business',
      ar: 'مايكروسوفت أوفيس 2024 للمنازل والأعمال',
    },
    tagline: {
      en: 'Classic Office apps for PC and Mac with perpetual license',
      ar: 'تطبيقات أوفيس الكلاسيكية للحاسوب والماك بترخيص دائم',
    },
    description: {
      en: 'Get the 2024 versions of Word, Excel, PowerPoint, Outlook, and OneNote with a one-time purchase for 1 PC or Mac.',
      ar: 'احصل على إصدارات 2024 من وورد، إكسل، باوربوينت، وأوتلوك بترخيص شراء لمرة واحدة دون اشتراك شهري.',
    },
    price: {
      amountMinor: 125000, // 1250.00 EGP
      currency: 'EGP',
    },
    originalPrice: {
      amountMinor: 180000,
      currency: 'EGP',
    },
    category: 'software',
    platform: 'microsoft',
    region: 'global',
    coverImage: '/images/products/office-2024.webp',
    inStock: true,
    featured: true,
    deliveryType: 'instant',
    defaultPlanSlug: 'standard',
    plans: [
      {
        id: 'plan-off-std',
        slug: 'standard',
        name: {
          en: '1 PC / Mac Perpetual License',
          ar: 'ترخيص دائم لجهاز واحد (ويندوز أو ماك)',
        },
        price: {
          amountMinor: 125000,
          currency: 'EGP',
        },
        originalPrice: {
          amountMinor: 180000,
          currency: 'EGP',
        },
        stock: 9,
        deliveryType: 'instant',
      },
    ],
    includes: [
      {
        en: 'Word, Excel, PowerPoint, Outlook, and OneNote 2024',
        ar: 'وورد، إكسل، باوربوينت، أوتلوك، ون ونوت 2024',
      },
      {
        en: 'One-time purchase for 1 PC or Mac',
        ar: 'شراء لمرة واحدة لجهاز كمبيوتر أو ماك',
      },
      {
        en: 'Official Microsoft download and perpetual activation',
        ar: 'تحميل وتفعيل رسمي دائم من مايكروسوفت',
      },
    ],
    activationSteps: [
      {
        en: 'Go to setup.office.com and sign in with your Microsoft account',
        ar: 'توجه إلى setup.office.com وسجل دخولك بحساب مايكروسوفت',
      },
      {
        en: 'Enter your 25-character product key (XXXXX-XXXXX-XXXXX)',
        ar: 'أدخل مفتاح المنتج (XXXXX-XXXXX-XXXXX)',
      },
      {
        en: 'Download and install the Office suite directly to your computer',
        ar: 'حمل وثبت حزمة أوفيس مباشرة على جهازك',
      },
    ],
    specs: {
      licenseType: {
        en: 'Perpetual Retail License',
        ar: 'ترخيص تجزئة دائم',
      },
      edition: {
        en: 'Home & Business 2024',
        ar: 'للمنازل والأعمال 2024',
      },
      language: {
        en: 'Multilingual (All Languages)',
        ar: 'متعدد اللغات (كل اللغات)',
      },
      deliveryTime: {
        en: 'Instant Delivery',
        ar: 'تسليم فوري',
      },
    },
    faq: [
      {
        question: {
          en: 'Does this license require a monthly subscription?',
          ar: 'هل يتطلب هذا الترخيص اشتراكًا شهريًا؟',
        },
        answer: {
          en: 'No, this is a one-time purchase with no recurring fees.',
          ar: 'لا، هذه حزمة دائمة تدفع قيمتها لمرة واحدة دون اشتراكات.',
        },
      },
      {
        question: {
          en: 'Can I use it on Mac?',
          ar: 'هل يمكن استخدامه على أجهزة ماك؟',
        },
        answer: {
          en: 'Yes, this version is fully compatible with macOS and Windows.',
          ar: 'نعم، هذا الإصدار متوافق بالكامل مع نظامي ويندوز وماك.',
        },
      },
    ],
    relatedSlugs: ['windows-11-pro', 'cyberpunk-2077'],
  },
  {
    id: 'prod-007',
    slug: 'elden-ring-shadow-erdtree',
    title: {
      en: 'Elden Ring: Shadow of the Erdtree Edition',
      ar: 'إلدن رينج: نسخة شادو أوف ذا إردتري',
    },
    tagline: {
      en: 'Winner of Game of the Year, bundled with the Shadow of the Erdtree DLC',
      ar: 'لعبة العام الحائزة على الجوائز مع توسعة شادو أوف ذا إردتري',
    },
    description: {
      en: 'Embark on a new story in the Land of Shadow full of mysteries, perilous dungeons, and new enemies, weapons, and equipment.',
      ar: 'انطلق في قصة جديدة بأرض الظلال المليئة بالأسرار والدهاليز الخطيرة والأسلحة والعتاد الجديد.',
    },
    price: {
      amountMinor: 185000, // 1850.00 EGP
      currency: 'EGP',
    },
    originalPrice: {
      amountMinor: 240000,
      currency: 'EGP',
    },
    category: 'games',
    platform: 'steam',
    region: 'global',
    coverImage: '/images/products/elden-ring.webp',
    inStock: true,
    featured: true,
    deliveryType: 'instant',
    defaultPlanSlug: 'standard',
    plans: [
      {
        id: 'plan-er-std',
        slug: 'standard',
        name: {
          en: 'Game + DLC Bundle (Steam)',
          ar: 'حزمة اللعبة مع التوسعة (ستيم)',
        },
        price: {
          amountMinor: 185000,
          currency: 'EGP',
        },
        originalPrice: {
          amountMinor: 240000,
          currency: 'EGP',
        },
        stock: 6,
        deliveryType: 'instant',
      },
    ],
    includes: [
      {
        en: 'Elden Ring base game for Steam',
        ar: 'لعبة Elden Ring الأساسية على ستيم',
      },
      {
        en: 'Shadow of the Erdtree Expansion',
        ar: 'توسعة Shadow of the Erdtree',
      },
    ],
    activationSteps: [
      {
        en: 'Open the Steam client and log in',
        ar: 'افتح برنامج ستيم وسجل الدخول',
      },
      {
        en: 'Go to "Games" > "Activate a Product on Steam"',
        ar: 'اذهب إلى قائمة Games > Activate a Product on Steam',
      },
      {
        en: 'Enter your code (XXXXX-XXXXX-XXXXX) to add the bundle to your library',
        ar: 'أدخل الرمز (XXXXX-XXXXX-XXXXX) لإضافة الحزمة إلى مكتبتك',
      },
    ],
    specs: {
      licenseType: {
        en: 'Steam Digital Key',
        ar: 'مفتاح ستيم رقمي',
      },
      edition: {
        en: 'Shadow of the Erdtree Edition',
        ar: 'نسخة شادو أوف ذا إردتري',
      },
      language: {
        en: 'Arabic, English, and more',
        ar: 'العربية والإنجليزية ولغات أخرى',
      },
      deliveryTime: {
        en: 'Instant Delivery',
        ar: 'تسليم فوري',
      },
    },
    faq: [
      {
        question: {
          en: 'Does it support Arabic text in-game?',
          ar: 'هل تدعم اللعبة اللغة العربية؟',
        },
        answer: {
          en: 'Yes, Elden Ring features full official Arabic text and subtitles.',
          ar: 'نعم، تدعم اللعبة النصوص والقوائم والترجمة العربية رسميًا.',
        },
      },
    ],
    relatedSlugs: ['black-myth-wukong', 'cyberpunk-2077', 'xbox-game-pass-ultimate-3m'],
  },
  {
    id: 'prod-008',
    slug: 'black-myth-wukong',
    title: {
      en: 'Black Myth: Wukong (PC / Steam)',
      ar: 'بلاك ميث: ووكونغ (حاسوب / ستيم)',
    },
    tagline: {
      en: 'An action RPG rooted in Chinese mythology featuring the Destined One',
      ar: 'لعبة أكشن وتقمص أدوار مستوحاة من الأساطير الصينية',
    },
    description: {
      en: 'Set out as the Destined One in this action RPG rooted in Chinese mythology to uncover the obscured truth beneath the veil of a glorious legend from the past.',
      ar: 'انطلق في مغامرة ملحمية مستوحاة من الأساطير الصينية لاكتشاف الحقائق الغامضة وراء أسطورة قديمة مجيدة.',
    },
    price: {
      amountMinor: 160000, // 1600.00 EGP
      currency: 'EGP',
    },
    category: 'games',
    platform: 'steam',
    region: 'global',
    coverImage: '/images/products/wukong.webp',
    inStock: true,
    featured: true,
    deliveryType: 'instant',
    defaultPlanSlug: 'standard',
    plans: [
      {
        id: 'plan-bmw-std',
        slug: 'standard',
        name: {
          en: 'Standard Edition (Steam)',
          ar: 'النسخة القياسية (ستيم)',
        },
        price: {
          amountMinor: 160000,
          currency: 'EGP',
        },
        stock: 11,
        deliveryType: 'instant',
      },
    ],
    includes: [
      {
        en: 'Black Myth: Wukong base game on Steam',
        ar: 'لعبة بلاك ميث: ووكونغ الأساسية على ستيم',
      },
    ],
    activationSteps: [
      {
        en: 'Launch Steam and click "Add a Game" in bottom left corner',
        ar: 'افتح ستيم واضغط على "Add a Game" أسفل يسار الشاشة',
      },
      {
        en: 'Choose "Activate a Product on Steam"',
        ar: 'اختر "Activate a Product on Steam"',
      },
      {
        en: 'Enter your activation code (XXXXX-XXXXX-XXXXX)',
        ar: 'أدخل رمز التفعيل (XXXXX-XXXXX-XXXXX)',
      },
    ],
    specs: {
      licenseType: {
        en: 'Steam Key',
        ar: 'مفتاح ستيم',
      },
      edition: {
        en: 'Standard Edition',
        ar: 'النسخة القياسية',
      },
      language: {
        en: 'Arabic, English, Chinese, Multilingual',
        ar: 'العربية، الإنجليزية، الصينية، متعدد اللغات',
      },
      deliveryTime: {
        en: 'Instant Delivery',
        ar: 'تسليم فوري',
      },
    },
    faq: [
      {
        question: {
          en: 'Is the game region locked?',
          ar: 'هل اللعبة مقيدة بمنطقة؟',
        },
        answer: {
          en: 'No, this is a Global key that activates worldwide.',
          ar: 'لا، هذا مفتاح عالمي يعمل في جميع المناطق.',
        },
      },
      {
        question: {
          en: 'Is there Arabic subtitle support?',
          ar: 'هل تتوفر ترجمة عربية؟',
        },
        answer: {
          en: 'Yes, official Arabic interface and subtitles are included.',
          ar: 'نعم، تتوفر قوائم وترجمة نصوص عربية رسمية بالكامل.',
        },
      },
    ],
    relatedSlugs: ['elden-ring-shadow-erdtree', 'cyberpunk-2077'],
  },
]

export class MockProductAdapter implements ProductService {
  private readonly products: Product[] = [...MOCK_PRODUCTS]

  async list(filter?: ProductListFilter): Promise<ProductListResult> {
    let result = [...this.products]

    if (filter?.category) {
      const categories = Array.isArray(filter.category) ? filter.category : [filter.category]
      if (categories.length > 0) {
        result = result.filter((p) => categories.includes(p.category))
      }
    }
    if (filter?.platform) {
      const platforms = Array.isArray(filter.platform) ? filter.platform : [filter.platform]
      if (platforms.length > 0) {
        result = result.filter((p) => platforms.includes(p.platform))
      }
    }
    if (filter?.region) {
      const regions = Array.isArray(filter.region) ? filter.region : [filter.region]
      if (regions.length > 0) {
        result = result.filter((p) => regions.includes(p.region))
      }
    }
    if (filter?.featured !== undefined) {
      result = result.filter((p) => p.featured === filter.featured)
    }
    if (filter?.inStock) {
      result = result.filter((p) => p.inStock)
    }
    if (filter?.onSale) {
      result = result.filter((p) => Boolean(p.originalPrice && p.originalPrice.amountMinor > p.price.amountMinor))
    }
    if (filter?.priceMin !== undefined) {
      result = result.filter((p) => (p.price.amountMinor / 100) >= filter.priceMin!)
    }
    if (filter?.priceMax !== undefined) {
      result = result.filter((p) => (p.price.amountMinor / 100) <= filter.priceMax!)
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.en.toLowerCase().includes(q) ||
          p.title.ar.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q),
      )
    }

    // Sorting: Featured (default), Best selling, Price low-high, Price high-low, Newest
    const sort = filter?.sort ?? 'featured'
    switch (sort) {
      case 'best-selling':
        result.sort((a, b) => {
          if (a.featured !== b.featured) return a.featured ? -1 : 1
          if (a.inStock !== b.inStock) return a.inStock ? -1 : 1
          return 0
        })
        break
      case 'price-asc':
        result.sort((a, b) => a.price.amountMinor - b.price.amountMinor)
        break
      case 'price-desc':
        result.sort((a, b) => b.price.amountMinor - a.price.amountMinor)
        break
      case 'newest':
        // Reverse original order
        result = [...result].reverse()
        break
      case 'featured':
      default:
        // Default order preserves mock featured order
        break
    }

    const total = result.length
    const page = filter?.page ?? 1
    const pageSize = filter?.pageSize ?? 24
    const limit = page * pageSize
    const items = result.slice(0, limit)
    const hasMore = total > items.length

    return {
      items,
      total,
      page,
      pageSize,
      hasMore,
    }
  }

  async getFilterCounts(_filter?: ProductListFilter): Promise<ProductFilterCounts> {
    // Only count options that exist in products.
    // If filter contains restrictions other than category, we can count available categories, etc.
    // For pure faceted counts, calculate from all products or filtered base:
    const base = [...this.products]

    const categoryMap = new Map<string, number>()
    const platformMap = new Map<string, number>()
    const regionMap = new Map<string, number>()
    let inStockCount = 0
    let onSaleCount = 0

    for (const p of base) {
      categoryMap.set(p.category, (categoryMap.get(p.category) ?? 0) + 1)
      platformMap.set(p.platform, (platformMap.get(p.platform) ?? 0) + 1)
      regionMap.set(p.region, (regionMap.get(p.region) ?? 0) + 1)
      if (p.inStock) inStockCount++
      if (p.originalPrice && p.originalPrice.amountMinor > p.price.amountMinor) onSaleCount++
    }

    const toSortedCounts = (map: Map<string, number>): FilterOptionCount[] =>
      Array.from(map.entries())
        .filter(([, count]) => count > 0)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)

    return {
      categories: toSortedCounts(categoryMap),
      platforms: toSortedCounts(platformMap),
      regions: toSortedCounts(regionMap),
      inStockCount,
      onSaleCount,
      total: base.length,
    }
  }

  async listByCollection(collection: ProductCollection): Promise<Product[]> {
    switch (collection) {
      case 'best-sellers':
        return this.products.filter((p) => p.featured || p.inStock).slice(0, 8)
      case 'deals':
        return this.products
          .filter(
            (p) =>
              p.originalPrice &&
              p.originalPrice.amountMinor > p.price.amountMinor,
          )
          .slice(0, 8)
      case 'new':
        return [...this.products].reverse().slice(0, 8)
    }
  }

  async getBySlug(slug: string): Promise<Product | null> {
    const product = this.products.find((p) => p.slug === slug)
    return product ?? null
  }

  async getById(id: string): Promise<Product | null> {
    const product = this.products.find((p) => p.id === id)
    return product ?? null
  }

  async getSampleLicenseKey(_productId: string): Promise<string> {
    // Obvious mock key pattern: XXXXX-XXXXX-XXXXX as required by security guidelines
    return 'XXXXX-XXXXX-XXXXX'
  }
}

