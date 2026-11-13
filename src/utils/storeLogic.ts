import type {
  CartItem,
  CartTotals,
  Category,
  CheckoutFormState,
  DeliveryZone,
  FaqItem,
  FaqTopic,
  Language,
  OrderRecord,
  Product,
  ProductCategory,
  ProductReview,
  ProductTag,
  ReviewsByProduct,
  SortOption,
  StoreLocation,
  StoreLocationType,
  ThemeMode,
  TrackingCheckpoint,
  TrackingLookupResult,
  TrackingStatus,
  ValidationErrors,
} from '../types/store';

export const FREE_SHIPPING_THRESHOLD = 6000;
export const DHAKA_SHIPPING_FEE = 70;
export const OUTSIDE_DHAKA_SHIPPING_FEE = 130;
export const GIFT_WRAPPING_FEE = 100;
export const DISCOUNT_RATE = 0.1;
export const VALID_DISCOUNT_CODES = [
  'LUXURIA10',
  'WELCOME10',
  'DHAKA10',
] as const;

export function filterAndSortProducts(
  products: Product[],
  options: {
    category: Category;
    query: string;
    sortBy: SortOption;
  },
): Product[] {
  const normalizedQuery = options.query.trim().toLowerCase();

  const filtered = products.filter((product) => {
    const matchesCategory =
      options.category === 'all' || product.category === options.category;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      product.nameBn,
      product.nameEn,
      product.subtitleBn,
      product.subtitleEn,
      product.materialBn,
      product.materialEn,
      product.sku,
      product.category,
      ...(product.tags ?? []),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const sorted = [...filtered];
  if (options.sortBy === 'price-asc') {
    sorted.sort((a, b) => a.price - b.price);
  } else if (options.sortBy === 'price-desc') {
    sorted.sort((a, b) => b.price - a.price);
  } else if (options.sortBy === 'newest') {
    sorted.sort((a, b) => {
      const aIsNew = a.tags?.includes('New Arrival') ? 1 : 0;
      const bIsNew = b.tags?.includes('New Arrival') ? 1 : 0;
      if (bIsNew !== aIsNew) {
        return bIsNew - aIsNew;
      }
      const aTime = a.releasedAt ? Date.parse(a.releasedAt) : 0;
      const bTime = b.releasedAt ? Date.parse(b.releasedAt) : 0;
      if (bTime !== aTime) {
        return bTime - aTime;
      }
      return b.featuredRank - a.featuredRank;
    });
  } else {
    sorted.sort((a, b) => a.featuredRank - b.featuredRank);
  }

  return sorted;
}

export function buildCartItemKey(productId: string, variant: string): string {
  return `${productId}::${variant}`;
}

export function addItemToCart(
  cart: CartItem[],
  product: Product,
  variant: string,
  quantity = 1,
): CartItem[] {
  const safeQuantity = Math.max(1, Math.floor(quantity));
  const selectedVariant = variant || product.variants[0] || 'Standard';
  const key = buildCartItemKey(product.id, selectedVariant);

  const existingIndex = cart.findIndex((item) => item.key === key);
  if (existingIndex === -1) {
    return [
      ...cart,
      {
        key,
        productId: product.id,
        sku: product.sku,
        nameBn: product.nameBn,
        nameEn: product.nameEn,
        category: product.category,
        variant: selectedVariant,
        price: product.price,
        image: product.image,
        quantity: safeQuantity,
      },
    ];
  }

  return cart.map((item, idx) =>
    idx === existingIndex
      ? { ...item, quantity: Math.min(20, item.quantity + safeQuantity) }
      : item,
  );
}

export function createDirectBuyCartItem(
  product: Product,
  variant?: string,
  quantity = 1,
): CartItem {
  const safeQuantity = Math.min(20, Math.max(1, Math.floor(quantity)));
  const selectedVariant = variant || product.variants[0] || 'Standard';
  return addItemToCart([], product, selectedVariant, safeQuantity)[0];
}

export function updateCartItemQuantity(
  cart: CartItem[],
  itemKey: string,
  delta: number,
): CartItem[] {
  return cart
    .map((item) => {
      if (item.key !== itemKey) {
        return item;
      }
      const nextQty = item.quantity + delta;
      if (nextQty <= 0) {
        return null;
      }
      return { ...item, quantity: Math.min(20, nextQty) };
    })
    .filter((item): item is CartItem => item !== null);
}

export function removeCartItem(cart: CartItem[], itemKey: string): CartItem[] {
  return cart.filter((item) => item.key !== itemKey);
}

export function validateDiscountCode(
  rawCode: string,
  lang: Language = 'bn',
): { valid: boolean; normalizedCode?: string; error?: string } {
  const normalized = rawCode.trim().toUpperCase();
  if (!normalized) {
    return {
      valid: false,
      error:
        lang === 'bn'
          ? 'অনুগ্রহ করে একটি ডিসকাউন্ট কোড লিখুন।'
          : 'Please enter a discount code.',
    };
  }
  if (!(VALID_DISCOUNT_CODES as readonly string[]).includes(normalized)) {
    return {
      valid: false,
      error:
        lang === 'bn'
          ? 'সঠিক ডিসকাউন্ট কোড নয়। উদাহরণ: LUXURIA10'
          : 'Invalid discount code. Try LUXURIA10.',
    };
  }
  return { valid: true, normalizedCode: normalized };
}

export function calculateCartTotals(
  cart: CartItem[],
  deliveryZone: DeliveryZone,
  giftWrapping = false,
  discountCode?: string | null,
): CartTotals {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (itemCount === 0) {
    return {
      itemCount: 0,
      subtotal: 0,
      discountAmount: 0,
      shippingFee: 0,
      giftWrappingFee: 0,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      amountToFreeShipping: FREE_SHIPPING_THRESHOLD,
      grandTotal: 0,
    };
  }

  const baseShipping =
    deliveryZone === 'dhaka' ? DHAKA_SHIPPING_FEE : OUTSIDE_DHAKA_SHIPPING_FEE;
  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = qualifiesForFreeShipping ? 0 : baseShipping;
  const giftWrappingFee = giftWrapping ? GIFT_WRAPPING_FEE : 0;
  const isDiscountValid = Boolean(
    discountCode && validateDiscountCode(discountCode).valid,
  );
  const discountAmount = isDiscountValid
    ? Math.round(subtotal * DISCOUNT_RATE)
    : 0;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return {
    itemCount,
    subtotal,
    discountAmount,
    shippingFee,
    giftWrappingFee,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    amountToFreeShipping,
    grandTotal:
      Math.max(0, subtotal - discountAmount) + shippingFee + giftWrappingFee,
  };
}

export function normalizeBangladeshPhone(rawPhone: string): string {
  const stripped = rawPhone.replace(/[\s\-()]/g, '');
  if (stripped.startsWith('+880')) {
    return `0${stripped.slice(4)}`;
  }
  if (stripped.startsWith('880') && stripped.length === 13) {
    return `0${stripped.slice(3)}`;
  }
  return stripped;
}

export function validateCheckoutForm(
  form: CheckoutFormState,
  lang: Language = 'bn',
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (form.customerName.trim().length < 2) {
    errors.customerName =
      lang === 'bn'
        ? 'অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।'
        : 'Please enter your full name.';
  }

  const normalizedPhone = normalizeBangladeshPhone(form.phone);
  if (!/^01[3-9]\d{8}$/.test(normalizedPhone)) {
    errors.phone =
      lang === 'bn'
        ? 'সঠিক ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।'
        : 'Enter a valid 11-digit Bangladesh mobile number (e.g. 017XXXXXXXX).';
  }

  if (form.address.trim().length < 8) {
    errors.address =
      lang === 'bn'
        ? 'ডেলিভারির জন্য বিস্তারিত ঠিকানা লিখুন (বাসা, রোড, এলাকা)।'
        : 'Please provide your complete delivery address (house, road, area).';
  }

  if (
    (form.paymentMethod === 'bkash' || form.paymentMethod === 'nagad') &&
    form.transactionId.trim().length < 5
  ) {
    errors.transactionId =
      lang === 'bn'
        ? 'বিকাশ বা নগদ পেমেন্টের TrxID অথবা প্রেরকের শেষ ৪ সংখ্যা লিখুন।'
        : 'Please enter your bKash/Nagad TrxID or sender last 4 digits.';
  }

  return errors;
}

export function formatBDT(amount: number): string {
  const rounded = Math.round(amount);
  return `৳ ${rounded.toLocaleString('en-IN')}`;
}

export function generateOrderId(seedTimestamp = Date.now()): string {
  const suffix = String(seedTimestamp % 100000).padStart(5, '0');
  return `LX-${suffix}`;
}

export function createOrderRecord(
  form: CheckoutFormState,
  items: CartItem[],
  totals: CartTotals,
  now = new Date(),
): OrderRecord {
  const trimmedGiftMessage = form.giftWrapping
    ? form.giftMessage.trim() || undefined
    : undefined;
  const validDiscount =
    form.discountCode && validateDiscountCode(form.discountCode).valid
      ? validateDiscountCode(form.discountCode).normalizedCode
      : undefined;
  return {
    orderId: generateOrderId(now.getTime()),
    createdAt: now.toISOString(),
    status: 'confirmed',
    customerName: form.customerName.trim(),
    phone: normalizeBangladeshPhone(form.phone),
    deliveryZone: form.deliveryZone,
    address: form.address.trim(),
    paymentMethod: form.paymentMethod,
    transactionId:
      form.paymentMethod === 'cod' ? undefined : form.transactionId.trim(),
    note: form.note.trim() || undefined,
    giftWrapping: form.giftWrapping || undefined,
    giftMessage: trimmedGiftMessage,
    discountCode: validDiscount,
    items: items.map((item) => ({ ...item })),
    totals: { ...totals },
  };
}

export function toggleWishlistItem(
  wishlistIds: string[],
  productId: string,
): string[] {
  if (!productId) {
    return wishlistIds;
  }
  if (wishlistIds.includes(productId)) {
    return wishlistIds.filter((id) => id !== productId);
  }
  return [productId, ...wishlistIds];
}

export function getWishlistProducts(
  products: Product[],
  wishlistIds: string[],
): Product[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  return wishlistIds
    .map((id) => byId.get(id))
    .filter((product): product is Product => product !== undefined);
}

export function validateProductReview(
  rating: number,
  comment: string,
  lang: Language = 'bn',
): string | null {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return lang === 'bn'
      ? 'অনুগ্রহ করে ১ থেকে ৫ স্টার রেটিং নির্বাচন করুন।'
      : 'Please select a star rating between 1 and 5.';
  }
  if (comment.trim().length < 3) {
    return lang === 'bn'
      ? 'অনুগ্রহ করে অন্তত ৩ অক্ষরের একটি মতামত লিখুন।'
      : 'Please enter a review comment of at least 3 characters.';
  }
  return null;
}

export const MAX_REVIEW_IMAGE_BYTES = 10 * 1024 * 1024;

export function validateReviewImageFile(
  file: { type: string; size: number },
  lang: Language = 'bn',
): string | null {
  if (!file.type || !file.type.startsWith('image/')) {
    return lang === 'bn'
      ? 'অনুগ্রহ করে শুধুমাত্র ছবির ফাইল (JPG, PNG, WEBP) নির্বাচন করুন।'
      : 'Please select a valid image file (JPG, PNG, or WEBP).';
  }
  if (file.size <= 0 || file.size > MAX_REVIEW_IMAGE_BYTES) {
    return lang === 'bn'
      ? 'ছবির ফাইল ১০ মেগাবাইটের কম হতে হবে।'
      : 'Image file size must be 10 MB or smaller.';
  }
  return null;
}

export function addProductReview(
  reviewsByProduct: ReviewsByProduct,
  productId: string,
  input: {
    rating: number;
    comment: string;
    authorName?: string;
    imageDataUrl?: string;
  },
  now = new Date(),
): ReviewsByProduct {
  const existing = reviewsByProduct[productId] ?? [];
  const trimmedAuthor = input.authorName?.trim();
  const trimmedImage = input.imageDataUrl?.trim();
  const nextReview: ProductReview = {
    id: `REV-${now.getTime()}-${Math.floor(Math.random() * 1000)}`,
    productId,
    rating: input.rating,
    comment: input.comment.trim(),
    authorName: trimmedAuthor || undefined,
    imageDataUrl: trimmedImage || undefined,
    createdAt: now.toISOString(),
  };
  return {
    ...reviewsByProduct,
    [productId]: [nextReview, ...existing],
  };
}

export function getReviewSummary(reviews: ProductReview[]): {
  count: number;
  averageRating: number;
} {
  if (reviews.length === 0) {
    return { count: 0, averageRating: 0 };
  }
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const averageRating = Math.round((sum / reviews.length) * 10) / 10;
  return { count: reviews.length, averageRating };
}

export function getRecommendedSizeGuideTab(
  category: ProductCategory,
): 'shoes' | 'belts' {
  return category === 'belts' ? 'belts' : 'shoes';
}

export function buildProductShareUrl(
  origin: string,
  pathname: string,
  productId: string,
): string {
  const safeOrigin = origin.replace(/\/+$/, '');
  const safePath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const url = new URL(`${safeOrigin}${safePath}`);
  url.searchParams.set('product', productId);
  return url.toString();
}

export function buildFacebookShareUrl(
  productUrl: string,
  quote?: string,
): string {
  const shareUrl = new URL('https://www.facebook.com/sharer/sharer.php');
  shareUrl.searchParams.set('u', productUrl);
  if (quote && quote.trim()) {
    shareUrl.searchParams.set('quote', quote.trim());
  }
  return shareUrl.toString();
}

export function buildNativeSharePayload(
  product: Pick<
    Product,
    'nameBn' | 'nameEn' | 'subtitleBn' | 'subtitleEn' | 'price'
  >,
  productUrl: string,
  lang: Language,
): { title: string; text: string; url: string } {
  const name = lang === 'bn' ? product.nameBn : product.nameEn;
  const subtitle = lang === 'bn' ? product.subtitleBn : product.subtitleEn;
  const brand = lang === 'bn' ? 'লাক্সুরিয়া বিডি' : 'Luxuria BD';
  return {
    title: `${name} — ${brand}`,
    text: `${name} (${formatBDT(product.price)}) — ${subtitle}`,
    url: productUrl,
  };
}

export function getProductIdFromSearch(
  search: string,
  products: Product[],
): Product | null {
  if (!search) {
    return null;
  }
  const params = new URLSearchParams(search);
  const productId = params.get('product');
  if (!productId) {
    return null;
  }
  return products.find((product) => product.id === productId) ?? null;
}

export function validateCommunityEmail(
  rawEmail: string,
  lang: Language = 'bn',
): string | null {
  const email = rawEmail.trim();
  if (!email) {
    return lang === 'bn'
      ? 'অনুগ্রহ করে আপনার ইমেইল ঠিকানা লিখুন।'
      : 'Please enter your email address.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return lang === 'bn'
      ? 'সঠিক ইমেইল ঠিকানা দিন (যেমন: name@example.com)।'
      : 'Please enter a valid email address (e.g. name@example.com).';
  }
  return null;
}

export function buildBagToastContent(
  product: Product,
  variant: string,
  quantity: number,
  lang: Language,
): { title: string; subtitle: string } {
  const safeQty = Math.max(1, Math.floor(quantity));
  const title = lang === 'bn' ? product.nameBn : product.nameEn;
  const resolvedVariant = variant || product.variants[0] || 'Standard';
  const subtitle =
    lang === 'bn'
      ? `${resolvedVariant} · ${safeQty}টি ব্যাগে যোগ হয়েছে`
      : `${resolvedVariant} · ${safeQty} added to bag`;
  return { title, subtitle };
}

export const MAX_COMPARE_ITEMS = 2;

export function toggleCompareItem(
  compareIds: string[],
  productId: string,
): string[] {
  if (!productId) {
    return compareIds;
  }
  if (compareIds.includes(productId)) {
    return compareIds.filter((id) => id !== productId);
  }
  if (compareIds.length < MAX_COMPARE_ITEMS) {
    return [...compareIds, productId];
  }
  return [compareIds[compareIds.length - 1], productId];
}

export function getCompareProducts(
  products: Product[],
  compareIds: string[],
): Product[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  return compareIds
    .map((id) => byId.get(id))
    .filter((product): product is Product => product !== undefined)
    .slice(0, MAX_COMPARE_ITEMS);
}

export function buildComparisonSpecRows(
  first: Product,
  second: Product,
  lang: Language,
): Array<{ label: string; firstValue: string; secondValue: string }> {
  const keys: string[] = [];
  const firstMap = new Map<string, { label: string; value: string }>();
  const secondMap = new Map<string, { label: string; value: string }>();

  for (const spec of first.specs) {
    if (!firstMap.has(spec.labelEn)) {
      keys.push(spec.labelEn);
      firstMap.set(spec.labelEn, {
        label: lang === 'bn' ? spec.labelBn : spec.labelEn,
        value: lang === 'bn' ? spec.valueBn : spec.valueEn,
      });
    }
  }

  for (const spec of second.specs) {
    if (!firstMap.has(spec.labelEn) && !secondMap.has(spec.labelEn)) {
      keys.push(spec.labelEn);
    }
    secondMap.set(spec.labelEn, {
      label: lang === 'bn' ? spec.labelBn : spec.labelEn,
      value: lang === 'bn' ? spec.valueBn : spec.valueEn,
    });
  }

  return keys.map((key) => {
    const a = firstMap.get(key);
    const b = secondMap.get(key);
    return {
      label: a?.label ?? b?.label ?? key,
      firstValue: a?.value ?? '—',
      secondValue: b?.value ?? '—',
    };
  });
}

export function buildWhatsAppInquiryUrl(
  phoneNumber: string,
  message?: string,
): string {
  const digits = phoneNumber.replace(/\D/g, '');
  const baseUrl = `https://wa.me/${digits}`;
  const trimmedMessage = message?.trim();
  if (!trimmedMessage) {
    return baseUrl;
  }
  return `${baseUrl}?text=${encodeURIComponent(trimmedMessage)}`;
}

export function filterFaqItems(
  items: FaqItem[],
  topic: FaqTopic,
): FaqItem[] {
  if (topic === 'all') {
    return items;
  }
  return items.filter((item) => item.topic === topic);
}

export function resolveInitialTheme(
  storedValue: string | null | undefined,
  prefersDark = false,
): ThemeMode {
  if (storedValue === 'dark') {
    return 'dark';
  }
  if (storedValue === 'light') {
    return 'light';
  }
  return prefersDark ? 'dark' : 'light';
}

export function toggleThemeMode(current: ThemeMode): ThemeMode {
  return current === 'dark' ? 'light' : 'dark';
}

export const SUPPORTED_PRODUCT_TAGS: readonly ProductTag[] = [
  'New Arrival',
  'Best Seller',
  'Sale',
];

export function getProductTags(product: Pick<Product, 'tags'>): ProductTag[] {
  if (!Array.isArray(product.tags) || product.tags.length === 0) {
    return [];
  }
  const seen = new Set<ProductTag>();
  const resolved: ProductTag[] = [];
  for (const tag of product.tags) {
    if (SUPPORTED_PRODUCT_TAGS.includes(tag) && !seen.has(tag)) {
      seen.add(tag);
      resolved.push(tag);
    }
  }
  return resolved;
}

export const NEWSLETTER_IDLE_TIMEOUT_MS = 10_000;

export function shouldTriggerNewsletterOverlay(options: {
  idleElapsedMs: number;
  idleThresholdMs?: number;
  alreadySubscribed: boolean;
  dismissed: boolean;
  hasBlockingModalOpen: boolean;
}): boolean {
  const threshold = options.idleThresholdMs ?? NEWSLETTER_IDLE_TIMEOUT_MS;
  if (
    options.alreadySubscribed ||
    options.dismissed ||
    options.hasBlockingModalOpen
  ) {
    return false;
  }
  return options.idleElapsedMs >= threshold;
}

export function calculateZoomOrigin(options: {
  clientX: number;
  clientY: number;
  rect: { left: number; top: number; width: number; height: number };
}): { xPercent: number; yPercent: number } {
  const { clientX, clientY, rect } = options;
  if (rect.width <= 0 || rect.height <= 0) {
    return { xPercent: 50, yPercent: 50 };
  }
  const rawX = ((clientX - rect.left) / rect.width) * 100;
  const rawY = ((clientY - rect.top) / rect.height) * 100;
  const xPercent = Math.min(100, Math.max(0, Math.round(rawX * 10) / 10));
  const yPercent = Math.min(100, Math.max(0, Math.round(rawY * 10) / 10));
  return { xPercent, yPercent };
}

export const QUICK_VIEW_ZOOM_SCALE = 2.15;

export function getQuickViewTextureCue(
  category: Product['category'],
  lang: Language,
): string {
  if (category === 'watches') {
    return lang === 'bn'
      ? 'কুইক ভিউ · ডায়াল ও কেস (২.১৫×)'
      : 'Quick View · Dial & Bezel (2.15×)';
  }
  if (category === 'belts') {
    return lang === 'bn'
      ? 'কুইক ভিউ · লেদার ও বাকল (২.১৫×)'
      : 'Quick View · Leather & Buckle (2.15×)';
  }
  return lang === 'bn'
    ? 'কুইক ভিউ · লেদার গ্রেইন (২.১৫×)'
    : 'Quick View · Leather Grain (2.15×)';
}

function buildCheckpointsForStatus(
  status: TrackingStatus,
  destination: string,
  timestamps: {
    placed: string;
    processing: string;
    inTransit: string;
    delivered: string;
  },
): TrackingCheckpoint[] {
  const stageOrder: TrackingStatus[] = ['Processing', 'In Transit', 'Delivered'];
  const activeStageIndex = stageOrder.indexOf(status); // 0=Processing, 1=In Transit, 2=Delivered

  return [
    {
      step: 'placed',
      titleBn: 'অর্ডার গ্রহণ করা হয়েছে',
      titleEn: 'Order Confirmed',
      descriptionBn:
        'আপনার অর্ডারটি লাক্সুরিয়া বিডি সিস্টেমে নিশ্চিত হয়েছে।',
      descriptionEn:
        'Your order has been verified and registered in our Dhaka studio queue.',
      locationBn: 'অনলাইন স্টোরফ্রন্ট · ঢাকা',
      locationEn: 'Online Storefront · Dhaka',
      timestamp: timestamps.placed,
      completed: true,
      current: false,
    },
    {
      step: 'processing',
      titleBn: 'স্টুডিও মান যাচাই ও প্যাকেজিং',
      titleEn: 'Processing & Quality Inspection',
      descriptionBn:
        'হাতে সেলাই, ফিনিশ ও সাইজ যাচাই করে সিগনেচার বক্সে প্যাক করা হচ্ছে।',
      descriptionEn:
        'Hand-inspected for stitching, finish, and sizing before sealing in our signature box.',
      locationBn: 'বনানী ডিসপ্যাচ স্টুডিও, ঢাকা',
      locationEn: 'Banani Dispatch Studio, Dhaka',
      timestamp: timestamps.processing,
      completed: activeStageIndex > 0,
      current: activeStageIndex === 0,
    },
    {
      step: 'in_transit',
      titleBn: 'কুরিয়ারে হ্যান্ডওভার ও পথে আছে',
      titleEn: 'In Transit with Courier',
      descriptionBn:
        'পার্সেলটি ডেলিভারি রাইডারের কাছে হস্তান্তর করা হয়েছে এবং গন্তব্যের পথে রয়েছে।',
      descriptionEn:
        'Handed over to our courier partner and en route to your delivery hub.',
      locationBn: destination,
      locationEn: destination,
      timestamp: timestamps.inTransit,
      completed: activeStageIndex > 1,
      current: activeStageIndex === 1,
    },
    {
      step: 'delivered',
      titleBn: 'ডেলিভারি সম্পন্ন হয়েছে',
      titleEn: 'Delivered to Recipient',
      descriptionBn:
        'পণ্যটি যাচাইপূর্বক সফলভাবে গ্রাহকের হাতে পৌঁছে দেওয়া হয়েছে।',
      descriptionEn:
        'Parcel inspected and signed for at the delivery address.',
      locationBn: destination,
      locationEn: destination,
      timestamp: timestamps.delivered,
      completed: activeStageIndex === 2,
      current: activeStageIndex === 2,
    },
  ];
}

export const MOCK_TRACKING_ORDERS: readonly TrackingLookupResult[] = [
  {
    trackingId: 'LX-10482',
    status: 'Processing',
    estimatedDeliveryBn: '১৪–১৫ নভেম্বর ২০২৬ (ঢাকা এক্সপ্রেস)',
    estimatedDeliveryEn: '14–15 Nov 2026 (Dhaka Express)',
    courierName: 'Luxuria Direct Rider',
    customerName: 'Nafis Rahman',
    phoneMasked: '017••-•••419',
    destination: 'House 28, Road 11, Banani, Dhaka',
    paymentSummaryBn: 'ক্যাশ অন ডেলিভারি',
    paymentSummaryEn: 'Cash on Delivery',
    itemsSummary: [
      {
        nameBn: 'কগন্যাক ব্রোগ অক্সফোর্ড',
        nameEn: 'Cognac Brogue Oxford',
        variant: '42',
        quantity: 1,
        lineTotal: 4850,
      },
    ],
    totals: {
      subtotal: 4850,
      discountAmount: 485,
      shippingFee: 70,
      giftWrappingFee: 0,
      grandTotal: 4435,
    },
    discountCode: 'LUXURIA10',
    checkpoints: buildCheckpointsForStatus(
      'Processing',
      'Banani, Dhaka',
      {
        placed: '13 Nov 2026 · 09:15 AM',
        processing: '13 Nov 2026 · 11:40 AM',
        inTransit: 'Pending Dispatch',
        delivered: 'Pending',
      },
    ),
  },
  {
    trackingId: 'LX-20941',
    status: 'In Transit',
    estimatedDeliveryBn: 'আজ সন্ধ্যা ৬:০০ টার মধ্যে',
    estimatedDeliveryEn: 'Expected today by 6:00 PM',
    courierName: 'Steadfast Express · Hub #04',
    customerName: 'Farhana Chowdhury',
    phoneMasked: '018••-•••902',
    destination: 'Flat 4B, Nasirabad Housing Society, Chattogram',
    paymentSummaryBn: 'বিকাশ (পরিশোধিত)',
    paymentSummaryEn: 'bKash (Paid)',
    itemsSummary: [
      {
        nameBn: 'আর্কাইভ ক্রোনোগ্রাফ স্টিল',
        nameEn: 'Archive Chronograph Steel',
        variant: '40mm · Tan Strap',
        quantity: 1,
        lineTotal: 6850,
      },
      {
        nameBn: 'স্যাডল ব্রাস ড্রেস বেল্ট',
        nameEn: 'Saddle Brass Dress Belt',
        variant: '34"',
        quantity: 1,
        lineTotal: 1650,
      },
    ],
    totals: {
      subtotal: 8500,
      discountAmount: 0,
      shippingFee: 0,
      giftWrappingFee: 100,
      grandTotal: 8600,
    },
    giftWrapping: true,
    checkpoints: buildCheckpointsForStatus(
      'In Transit',
      'Chattogram Regional Hub',
      {
        placed: '11 Nov 2026 · 04:20 PM',
        processing: '11 Nov 2026 · 07:10 PM',
        inTransit: '13 Nov 2026 · 08:30 AM',
        delivered: 'Pending',
      },
    ),
  },
  {
    trackingId: 'LX-31507',
    status: 'Delivered',
    estimatedDeliveryBn: 'ডেলিভারি সম্পন্ন · ১২ নভেম্বর ২০২৬',
    estimatedDeliveryEn: 'Delivered · 12 Nov 2026',
    courierName: 'Pathao Parcel · Dhaka Metro',
    customerName: 'Mahmudul Hasan',
    phoneMasked: '019••-•••631',
    destination: 'Road 7/A, Dhanmondi, Dhaka',
    paymentSummaryBn: 'ক্যাশ অন ডেলিভারি (পরিশোধিত)',
    paymentSummaryEn: 'Cash on Delivery (Settled)',
    itemsSummary: [
      {
        nameBn: 'এসপ্রেসো সুয়েড পেনি লোফার',
        nameEn: 'Espresso Suede Penny Loafer',
        variant: '41',
        quantity: 1,
        lineTotal: 4350,
      },
    ],
    totals: {
      subtotal: 4350,
      discountAmount: 0,
      shippingFee: 70,
      giftWrappingFee: 0,
      grandTotal: 4420,
    },
    checkpoints: buildCheckpointsForStatus(
      'Delivered',
      'Dhanmondi, Dhaka',
      {
        placed: '10 Nov 2026 · 01:05 PM',
        processing: '10 Nov 2026 · 03:45 PM',
        inTransit: '11 Nov 2026 · 10:15 AM',
        delivered: '12 Nov 2026 · 02:50 PM',
      },
    ),
  },
];

export function getTrackingStatusProgress(status: TrackingStatus): {
  stepIndex: number;
  percent: number;
} {
  switch (status) {
    case 'Processing':
      return { stepIndex: 2, percent: 50 };
    case 'In Transit':
      return { stepIndex: 3, percent: 75 };
    case 'Delivered':
      return { stepIndex: 4, percent: 100 };
  }
}

function formatMaskedPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) {
    return phone;
  }
  return `${digits.slice(0, 3)}••-•••${digits.slice(-3)}`;
}

export function lookupOrderTracking(
  rawTrackingId: string,
  userOrders: OrderRecord[],
  lang: Language = 'bn',
  pastOrders: readonly OrderRecord[] = [],
):
  | { found: true; result: TrackingLookupResult }
  | { found: false; emptyInput: boolean; error: string } {
  const normalizedId = rawTrackingId.trim().toUpperCase();
  if (!normalizedId) {
    return {
      found: false,
      emptyInput: true,
      error:
        lang === 'bn'
          ? 'অনুগ্রহ করে একটি অর্ডার ট্র্যাকিং আইডি লিখুন (যেমন: LX-20941)।'
          : 'Please enter an order tracking ID (e.g. LX-20941).',
    };
  }

  const matchedUserOrder =
    userOrders.find((order) => order.orderId.toUpperCase() === normalizedId) ??
    pastOrders.find((order) => order.orderId.toUpperCase() === normalizedId);
  if (matchedUserOrder) {
    const status: TrackingStatus =
      matchedUserOrder.status === 'delivered'
        ? 'Delivered'
        : matchedUserOrder.status === 'shipped'
          ? 'In Transit'
          : 'Processing';
    const createdLabel = new Date(matchedUserOrder.createdAt).toLocaleString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );
    const paymentBn =
      matchedUserOrder.paymentMethod === 'cod'
        ? 'ক্যাশ অন ডেলিভারি'
        : matchedUserOrder.paymentMethod === 'bkash'
          ? 'বিকাশ'
          : 'নগদ';
    const paymentEn =
      matchedUserOrder.paymentMethod === 'cod'
        ? 'Cash on Delivery'
        : matchedUserOrder.paymentMethod === 'bkash'
          ? 'bKash'
          : 'Nagad';

    return {
      found: true,
      result: {
        trackingId: matchedUserOrder.orderId,
        status,
        estimatedDeliveryBn:
          status === 'Delivered'
            ? `ডেলিভারি সম্পন্ন · ${createdLabel}`
            : matchedUserOrder.deliveryZone === 'dhaka'
              ? '২৪–৪৮ ঘণ্টার মধ্যে (ঢাকা মেট্রো)'
              : '৩–৪ কর্মদিবসের মধ্যে (সারাদেশ)',
        estimatedDeliveryEn:
          status === 'Delivered'
            ? `Delivered · ${createdLabel}`
            : matchedUserOrder.deliveryZone === 'dhaka'
              ? 'Within 24–48 hours (Dhaka Metro)'
              : 'Within 3–4 business days (Nationwide)',
        courierName:
          matchedUserOrder.deliveryZone === 'dhaka'
            ? 'Luxuria Dhaka Dispatch'
            : 'Steadfast Nationwide',
        customerName: matchedUserOrder.customerName,
        phoneMasked: formatMaskedPhone(matchedUserOrder.phone),
        destination: matchedUserOrder.address,
        paymentSummaryBn: paymentBn,
        paymentSummaryEn: paymentEn,
        itemsSummary: matchedUserOrder.items.map((item) => ({
          nameBn: item.nameBn,
          nameEn: item.nameEn,
          variant: item.variant,
          quantity: item.quantity,
          lineTotal: item.price * item.quantity,
        })),
        totals: {
          subtotal: matchedUserOrder.totals.subtotal,
          discountAmount: matchedUserOrder.totals.discountAmount,
          shippingFee: matchedUserOrder.totals.shippingFee,
          giftWrappingFee: matchedUserOrder.totals.giftWrappingFee,
          grandTotal: matchedUserOrder.totals.grandTotal,
        },
        discountCode: matchedUserOrder.discountCode,
        giftWrapping: matchedUserOrder.giftWrapping,
        checkpoints: buildCheckpointsForStatus(
          status,
          matchedUserOrder.address,
          {
            placed: createdLabel,
            processing:
              status === 'Processing'
                ? lang === 'bn'
                  ? 'চলমান · মান যাচাই'
                  : 'In Progress · Studio QC'
                : createdLabel,
            inTransit:
              status === 'In Transit' || status === 'Delivered'
                ? createdLabel
                : 'Pending Dispatch',
            delivered: status === 'Delivered' ? createdLabel : 'Pending',
          },
        ),
        isUserOrder: matchedUserOrder.status !== 'delivered',
      },
    };
  }

  const matchedMock = MOCK_TRACKING_ORDERS.find(
    (entry) => entry.trackingId === normalizedId,
  );
  if (matchedMock) {
    return { found: true, result: matchedMock };
  }

  return {
    found: false,
    emptyInput: false,
    error:
      lang === 'bn'
        ? `"${normalizedId}" আইডির কোনো অর্ডার পাওয়া যায়নি। অনুগ্রহ করে LX-10482, LX-20941 বা LX-31507 দিয়ে চেষ্টা করুন।`
        : `No shipment found for "${normalizedId}". Try LX-10482, LX-20941, or LX-31507.`,
  };
}

const COMPLEMENTARY_CATEGORY_ORDER: Record<
  ProductCategory,
  readonly ProductCategory[]
> = {
  shoes: ['belts', 'watches'],
  watches: ['shoes', 'belts'],
  belts: ['shoes', 'watches'],
};

export function getRelatedProducts(
  currentProduct: Product,
  products: readonly Product[],
  limit = 3,
): Product[] {
  const safeLimit = Math.max(0, Math.floor(limit));
  if (safeLimit === 0 || products.length === 0) {
    return [];
  }

  const candidates = products.filter((item) => item.id !== currentProduct.id);
  const sortByRank = (a: Product, b: Product) => a.featuredRank - b.featuredRank;

  const sameCategory = candidates
    .filter((item) => item.category === currentProduct.category)
    .sort(sortByRank);

  if (sameCategory.length >= safeLimit) {
    return sameCategory.slice(0, safeLimit);
  }

  const chosen = [...sameCategory];
  const chosenIds = new Set(chosen.map((item) => item.id));
  const fallbackCategories = COMPLEMENTARY_CATEGORY_ORDER[currentProduct.category];

  for (const fallbackCategory of fallbackCategories) {
    const matches = candidates
      .filter(
        (item) =>
          item.category === fallbackCategory && !chosenIds.has(item.id),
      )
      .sort(sortByRank);

    for (const item of matches) {
      if (chosen.length >= safeLimit) {
        return chosen;
      }
      chosen.push(item);
      chosenIds.add(item.id);
    }
  }

  return chosen.slice(0, safeLimit);
}

function scoreProductSuggestion(
  product: Product,
  normalizedQuery: string,
  lang: Language,
): number {
  const primaryName = (
    lang === 'bn' ? product.nameBn : product.nameEn
  ).toLowerCase();
  const secondaryName = (
    lang === 'bn' ? product.nameEn : product.nameBn
  ).toLowerCase();

  if (primaryName.startsWith(normalizedQuery)) {
    return 400;
  }
  const primaryWords = primaryName.split(/\s+/);
  if (primaryWords.some((word) => word.startsWith(normalizedQuery))) {
    return 350;
  }
  if (
    secondaryName.startsWith(normalizedQuery) ||
    secondaryName.split(/\s+/).some((word) => word.startsWith(normalizedQuery))
  ) {
    return 300;
  }
  if (primaryName.includes(normalizedQuery)) {
    return 250;
  }
  if (secondaryName.includes(normalizedQuery)) {
    return 200;
  }

  const extraFields = [
    product.subtitleBn,
    product.subtitleEn,
    product.materialBn,
    product.materialEn,
    product.category,
    product.sku,
    ...(product.tags ?? []),
  ]
    .join(' ')
    .toLowerCase();

  if (extraFields.includes(normalizedQuery)) {
    return 100;
  }
  return 0;
}

export function getSearchSuggestions(
  products: readonly Product[],
  rawQuery: string,
  options: {
    lang?: Language;
    minSuggestions?: number;
    maxSuggestions?: number;
  } = {},
): Product[] {
  const normalizedQuery = rawQuery.trim().toLowerCase();
  if (!normalizedQuery || products.length === 0) {
    return [];
  }

  const lang = options.lang ?? 'bn';
  const maxSuggestions = Math.max(1, options.maxSuggestions ?? 5);
  const minSuggestions = Math.min(
    maxSuggestions,
    Math.max(1, options.minSuggestions ?? 3),
  );

  const scored = products
    .map((product) => ({
      product,
      score: scoreProductSuggestion(product, normalizedQuery, lang),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.product.featuredRank - b.product.featuredRank;
    });

  if (scored.length === 0) {
    return [];
  }

  const results = scored.slice(0, maxSuggestions).map((entry) => entry.product);
  if (results.length >= minSuggestions) {
    return results;
  }

  const chosenIds = new Set(results.map((item) => item.id));
  const relatedPad = getRelatedProducts(
    results[0],
    products,
    products.length,
  ).filter((item) => !chosenIds.has(item.id));

  for (const candidate of relatedPad) {
    if (results.length >= minSuggestions) {
      break;
    }
    results.push(candidate);
    chosenIds.add(candidate.id);
  }

  return results;
}

export const DHAKA_STORE_LOCATIONS: readonly StoreLocation[] = [
  {
    id: 'banani-pickup',
    type: 'pickup',
    nameBn: 'বনানী ফ্ল্যাগশিপ স্টুডিও ও পিকআপ',
    nameEn: 'Banani Studio & Pickup Hub',
    neighborhoodBn: 'বনানী, ঢাকা',
    neighborhoodEn: 'Banani, Dhaka',
    addressBn: 'বাড়ি ২৮, রোড ১১, ব্লক এফ, বনানী, ঢাকা ১২১৩',
    addressEn: 'House 28, Road 11, Block F, Banani, Dhaka 1213',
    hoursBn: 'শনি – বৃহস্পতি · সকাল ১০:৩০ – রাত ৮:৩০',
    hoursEn: 'Sat – Thu · 10:30 AM – 8:30 PM',
    servicesBn: 'অর্ডার পিকআপ, ট্রায়াল ও ৭ দিনের সাইজ এক্সচেঞ্জ',
    servicesEn: 'Order pickup, fitting & 7-day size exchange',
    phone: '+880 1410-823868',
    mapX: 54,
    mapY: 36,
  },
  {
    id: 'dhanmondi-pickup',
    type: 'pickup',
    nameBn: 'ধানমন্ডি পার্টনার পিকআপ পয়েন্ট',
    nameEn: 'Dhanmondi Partner Pickup Point',
    neighborhoodBn: 'ধানমন্ডি, ঢাকা',
    neighborhoodEn: 'Dhanmondi, Dhaka',
    addressBn: 'লেভেল ২, রোড ৭/এ, সাতমসজিদ রোড, ধানমন্ডি, ঢাকা ১২০৯',
    addressEn: 'Level 2, Road 7/A, Satmasjid Road, Dhanmondi, Dhaka 1209',
    hoursBn: 'শনি – বৃহস্পতি · সকাল ১১:০০ – রাত ৮:০০',
    hoursEn: 'Sat – Thu · 11:00 AM – 8:00 PM',
    servicesBn: 'এক্সপ্রেস পিকআপ ও ওয়াচ স্ট্র্যাপ অ্যাডজাস্টমেন্ট',
    servicesEn: 'Express pickup & watch strap sizing',
    phone: '+880 1700-000142',
    mapX: 34,
    mapY: 62,
  },
  {
    id: 'hazaribagh-workshop',
    type: 'workshop',
    nameBn: 'হাজারীবাগ লেদার ক্রাফট ওয়ার্কশপ',
    nameEn: 'Hazaribagh Leather Craft Workshop',
    neighborhoodBn: 'হাজারীবাগ, ঢাকা',
    neighborhoodEn: 'Hazaribagh, Dhaka',
    addressBn: 'ইউনিট ৪, লেদার আর্টিজান লেন, হাজারীবাগ, ঢাকা ১২০৯',
    addressEn: 'Unit 4, Leather Artisan Lane, Hazaribagh, Dhaka 1209',
    hoursBn: 'রবি – বৃহস্পতি · সকাল ৯:৩০ – সন্ধ্যা ৬:৩০',
    hoursEn: 'Sun – Thu · 9:30 AM – 6:30 PM',
    servicesBn: 'পার্টনার ফুটওয়্যার স্টিচিং, বার্নিশিং ও বেল্ট ক্রাফটিং',
    servicesEn: 'Partner shoe lasting, burnishing & belt crafting',
    phone: '+880 1700-000289',
    mapX: 25,
    mapY: 79,
  },
  {
    id: 'uttara-pickup',
    type: 'pickup',
    nameBn: 'উত্তরা সেক্টর ৭ ডিসপ্যাচ পয়েন্ট',
    nameEn: 'Uttara Sector 7 Dispatch Point',
    neighborhoodBn: 'উত্তরা, ঢাকা',
    neighborhoodEn: 'Uttara, Dhaka',
    addressBn: 'বাড়ি ১৫, রোড ১২, সেক্টর ৭, উত্তরা, ঢাকা ১২৩০',
    addressEn: 'House 15, Road 12, Sector 7, Uttara, Dhaka 1230',
    hoursBn: 'শনি – বৃহস্পতি · দুপুর ১২:০০ – রাত ৮:৩০',
    hoursEn: 'Sat – Thu · 12:00 PM – 8:30 PM',
    servicesBn: 'উত্তর ঢাকা সেম-ডে পিকআপ ও কোয়ালিটি চেক',
    servicesEn: 'North Dhaka same-day pickup & QC desk',
    phone: '+880 1700-000371',
    mapX: 46,
    mapY: 16,
  },
];

export function filterStoreLocations(
  locations: readonly StoreLocation[],
  filterType: StoreLocationType,
): StoreLocation[] {
  if (filterType === 'all') {
    return [...locations];
  }
  return locations.filter((loc) => loc.type === filterType);
}

export function resolveActiveStoreLocation(
  filteredLocations: readonly StoreLocation[],
  selectedId: string | null | undefined,
): StoreLocation | null {
  if (filteredLocations.length === 0) {
    return null;
  }
  if (selectedId) {
    const matched = filteredLocations.find((loc) => loc.id === selectedId);
    if (matched) {
      return matched;
    }
  }
  return filteredLocations[0];
}

export const PAST_ORDERS_STORAGE_KEY = 'luxuria_bd_past_orders_v1';

export const MOCK_PAST_ORDERS: readonly OrderRecord[] = [
  {
    orderId: 'LX-31507',
    createdAt: '2026-11-10T13:05:00.000Z',
    status: 'delivered',
    customerName: 'Mahmudul Hasan',
    phone: '01911220631',
    deliveryZone: 'dhaka',
    address: 'Road 7/A, Dhanmondi, Dhaka',
    paymentMethod: 'cod',
    items: [
      {
        key: 'loafer-espresso::41',
        productId: 'loafer-espresso',
        sku: 'LX-SH-102',
        nameBn: 'এসপ্রেসো সুয়েড পেনি লোফার',
        nameEn: 'Espresso Suede Penny Loafer',
        category: 'shoes',
        variant: '41',
        price: 4350,
        image: '',
        quantity: 1,
      },
    ],
    totals: {
      itemCount: 1,
      subtotal: 4350,
      discountAmount: 0,
      shippingFee: 70,
      giftWrappingFee: 0,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      amountToFreeShipping: 1650,
      grandTotal: 4420,
    },
  },
  {
    orderId: 'LX-28419',
    createdAt: '2026-11-04T15:30:00.000Z',
    status: 'delivered',
    customerName: 'Mahmudul Hasan',
    phone: '01911220631',
    deliveryZone: 'dhaka',
    address: 'Road 7/A, Dhanmondi, Dhaka',
    paymentMethod: 'bkash',
    transactionId: 'BK8942X',
    giftWrapping: true,
    discountCode: 'LUXURIA10',
    items: [
      {
        key: 'oxford-cognac::42',
        productId: 'oxford-cognac',
        sku: 'LX-SH-101',
        nameBn: 'কগন্যাক ব্রোগ অক্সফোর্ড',
        nameEn: 'Cognac Brogue Oxford',
        category: 'shoes',
        variant: '42',
        price: 4850,
        image: '',
        quantity: 1,
      },
      {
        key: 'belt-brass-saddle::34"',
        productId: 'belt-brass-saddle',
        sku: 'LX-BL-301',
        nameBn: 'স্যাডল ব্রাস ড্রেস বেল্ট',
        nameEn: 'Saddle Brass Dress Belt',
        category: 'belts',
        variant: '34"',
        price: 1650,
        image: '',
        quantity: 1,
      },
    ],
    totals: {
      itemCount: 2,
      subtotal: 6500,
      discountAmount: 650,
      shippingFee: 0,
      giftWrappingFee: GIFT_WRAPPING_FEE,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      amountToFreeShipping: 0,
      grandTotal: 5950,
    },
  },
  {
    orderId: 'LX-19204',
    createdAt: '2026-10-23T11:15:00.000Z',
    status: 'delivered',
    customerName: 'Mahmudul Hasan',
    phone: '01911220631',
    deliveryZone: 'outside',
    address: 'House 12, Upashahar, Sylhet',
    paymentMethod: 'nagad',
    transactionId: 'NG4108Z',
    items: [
      {
        key: 'dress-watch-ivory::40mm Classic',
        productId: 'dress-watch-ivory',
        sku: 'LX-WT-202',
        nameBn: 'হ্যারিটেজ আইভরি ড্রেস ওয়াচ',
        nameEn: 'Heritage Ivory Dress Watch',
        category: 'watches',
        variant: '40mm Classic',
        price: 5900,
        image: '',
        quantity: 1,
      },
    ],
    totals: {
      itemCount: 1,
      subtotal: 5900,
      discountAmount: 0,
      shippingFee: OUTSIDE_DHAKA_SHIPPING_FEE,
      giftWrappingFee: 0,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      amountToFreeShipping: 100,
      grandTotal: 6030,
    },
  },
];

export function resolvePastOrdersFromStorage(
  rawJson: string | null | undefined,
): OrderRecord[] {
  if (rawJson) {
    try {
      const parsed: unknown = JSON.parse(rawJson);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.every(
          (entry) =>
            entry !== null &&
            typeof entry === 'object' &&
            typeof (entry as OrderRecord).orderId === 'string' &&
            Array.isArray((entry as OrderRecord).items) &&
            typeof (entry as OrderRecord).totals?.grandTotal === 'number',
        )
      ) {
        return parsed as OrderRecord[];
      }
    } catch {
      // Fall back to seeded mock completed purchases
    }
  }
  return MOCK_PAST_ORDERS.map((order) => ({
    ...order,
    items: order.items.map((item) => ({ ...item })),
    totals: { ...order.totals },
  }));
}

function escapeReceiptHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildDigitalReceiptFilename(trackingId: string): string {
  const sanitized = trackingId
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '');
  return `Luxuria-BD-Receipt-${sanitized || 'ORDER'}.html`;
}

export function buildDigitalReceiptHtml(
  result: TrackingLookupResult,
  lang: Language,
): string {
  const isBn = lang === 'bn';
  const docTitle = isBn
    ? `ডিজিটাল রিসিপ্ট — ${result.trackingId} | লাক্সুরিয়া বিডি`
    : `Digital Receipt — ${result.trackingId} | Luxuria BD`;
  const statusText = isBn ? 'ডেলিভারি সম্পন্ন (Delivered)' : 'Delivered';
  const etaText = isBn
    ? result.estimatedDeliveryBn
    : result.estimatedDeliveryEn;
  const paymentText = isBn ? result.paymentSummaryBn : result.paymentSummaryEn;

  const itemRowsHtml = result.itemsSummary
    .map((item) => {
      const name = escapeReceiptHtml(isBn ? item.nameBn : item.nameEn);
      const variant = escapeReceiptHtml(item.variant);
      const lineTotal = escapeReceiptHtml(formatBDT(item.lineTotal));
      return `<tr>
        <td>${name} <span class="muted">(${variant})</span></td>
        <td class="num">× ${item.quantity}</td>
        <td class="num">${lineTotal}</td>
      </tr>`;
    })
    .join('\n');

  const discountRowHtml =
    result.totals.discountAmount > 0
      ? `<div class="total-row discount">
          <span>${isBn ? 'ডিসকাউন্ট (১০%)' : 'Discount (10%)'}${
            result.discountCode
              ? ` (${escapeReceiptHtml(result.discountCode)})`
              : ''
          }</span>
          <span class="num">-${escapeReceiptHtml(formatBDT(result.totals.discountAmount))}</span>
        </div>`
      : '';

  const giftWrapRowHtml =
    result.totals.giftWrappingFee > 0
      ? `<div class="total-row">
          <span>${isBn ? 'গিফট র‍্যাপিং' : 'Gift Wrapping'}</span>
          <span class="num">${escapeReceiptHtml(formatBDT(result.totals.giftWrappingFee))}</span>
        </div>`
      : '';

  const shippingValue =
    result.totals.shippingFee === 0
      ? isBn
        ? 'ফ্রি'
        : 'Free'
      : formatBDT(result.totals.shippingFee);

  return `<!doctype html>
<html lang="${isBn ? 'bn' : 'en'}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeReceiptHtml(docTitle)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px 16px;
      background: #f4f1eb;
      color: #171614;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.5;
    }
    .receipt {
      max-width: 640px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2ddd5;
      border-radius: 10px;
      padding: 32px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e2ddd5;
    }
    .brand {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .subtitle {
      font-size: 12px;
      color: #5e5850;
      margin-top: 2px;
    }
    .status {
      font-size: 12px;
      font-weight: 600;
      color: #2e5a36;
      background: #eef6ef;
      border: 1px solid #c5dfc9;
      border-radius: 6px;
      padding: 4px 10px;
      white-space: nowrap;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      padding: 20px 0;
      border-bottom: 1px solid #e2ddd5;
      font-size: 13px;
    }
    .label {
      font-size: 11px;
      color: #7b746b;
      margin-bottom: 2px;
    }
    .value {
      font-weight: 600;
      color: #171614;
    }
    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 13px;
    }
    th {
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      color: #5e5850;
      padding: 8px 0;
      border-bottom: 1px solid #e2ddd5;
    }
    td {
      padding: 10px 0;
      border-bottom: 1px solid #f0ece4;
      vertical-align: top;
    }
    .num {
      text-align: right;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .muted { color: #5e5850; }
    .totals {
      border-top: 1px solid #e2ddd5;
      padding-top: 14px;
      font-size: 13px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      color: #5e5850;
    }
    .total-row.discount { color: #2e5a36; font-weight: 600; }
    .grand-total {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #e2ddd5;
      font-size: 16px;
      font-weight: 700;
      color: #171614;
    }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px dashed #d8d1c7;
      font-size: 12px;
      color: #5e5850;
      text-align: center;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .receipt { border: none; padding: 16px; }
    }
  </style>
</head>
<body>
  <main class="receipt">
    <header class="header">
      <div>
        <div class="brand">Luxuria BD · লাক্সুরিয়া বিডি</div>
        <div class="subtitle">${
          isBn
            ? 'ডিজিটাল অর্ডার রিসিপ্ট (সম্পন্ন অর্ডার)'
            : 'Official Digital Receipt (Completed Order)'
        }</div>
      </div>
      <div class="status">${escapeReceiptHtml(statusText)}</div>
    </header>

    <section class="meta-grid">
      <div>
        <div class="label">${isBn ? 'অর্ডার ও ট্র্যাকিং আইডি' : 'Order & Tracking ID'}</div>
        <div class="value mono">${escapeReceiptHtml(result.trackingId)}</div>
      </div>
      <div>
        <div class="label">${isBn ? 'ডেলিভারি তথ্য' : 'Delivery Schedule'}</div>
        <div class="value">${escapeReceiptHtml(etaText)}</div>
      </div>
      <div>
        <div class="label">${isBn ? 'গ্রাহক ও ঠিকানা' : 'Recipient & Address'}</div>
        <div class="value">${escapeReceiptHtml(result.customerName)} · <span class="mono">${escapeReceiptHtml(result.phoneMasked)}</span></div>
        <div class="subtitle">${escapeReceiptHtml(result.destination)}</div>
      </div>
      <div>
        <div class="label">${isBn ? 'পেমেন্ট ও কুরিয়ার' : 'Payment & Courier'}</div>
        <div class="value">${escapeReceiptHtml(paymentText)}</div>
        <div class="subtitle">${escapeReceiptHtml(result.courierName)}</div>
      </div>
    </section>

    <table>
      <thead>
        <tr>
          <th>${isBn ? 'পণ্য ও ভ্যারিয়েন্ট' : 'Item & Variant'}</th>
          <th class="num">${isBn ? 'পরিমাণ' : 'Qty'}</th>
          <th class="num">${isBn ? 'মূল্য' : 'Amount'}</th>
        </tr>
      </thead>
      <tbody>
        ${itemRowsHtml}
      </tbody>
    </table>

    <section class="totals">
      <div class="total-row">
        <span>${isBn ? 'পণ্যের মূল্য' : 'Subtotal'}</span>
        <span class="num">${escapeReceiptHtml(formatBDT(result.totals.subtotal))}</span>
      </div>
      ${discountRowHtml}
      <div class="total-row">
        <span>${isBn ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}</span>
        <span class="num">${escapeReceiptHtml(shippingValue)}</span>
      </div>
      ${giftWrapRowHtml}
      <div class="grand-total">
        <span>${isBn ? 'সর্বমোট পরিশোধিত' : 'Grand Total'}</span>
        <span class="num">${escapeReceiptHtml(formatBDT(result.totals.grandTotal))}</span>
      </div>
    </section>

    <footer class="footer">
      ${
        isBn
          ? 'লাক্সুরিয়া বিডি থেকে কেনাকাটার জন্য ধন্যবাদ · বনানী / ধানমন্ডি ডিসপ্যাচ হাব, ঢাকা'
          : 'Thank you for shopping with Luxuria BD · Banani / Dhanmondi Dispatch Hub, Dhaka'
      }
    </footer>
  </main>
</body>
</html>`;
}

export const RECENTLY_VIEWED_STORAGE_KEY = 'luxuria_bd_recently_viewed_v1';
export const MAX_RECENTLY_VIEWED = 4;

export function recordRecentlyViewedProduct(
  currentIds: readonly string[],
  productId: string,
  maxItems = MAX_RECENTLY_VIEWED,
): string[] {
  const normalizedId = productId.trim();
  if (!normalizedId || maxItems <= 0) {
    return currentIds.slice(0, Math.max(0, maxItems));
  }

  const deduped = currentIds.filter((id) => id !== normalizedId);
  return [normalizedId, ...deduped].slice(0, maxItems);
}

export function resolveRecentlyViewedIdsFromStorage(
  rawJson: string | null | undefined,
  products: readonly Product[],
  maxItems = MAX_RECENTLY_VIEWED,
): string[] {
  if (!rawJson || maxItems <= 0) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(rawJson);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const validProductIds = new Set(products.map((product) => product.id));
    const seen = new Set<string>();
    const resolved: string[] = [];

    for (const entry of parsed) {
      if (typeof entry !== 'string') continue;
      const trimmed = entry.trim();
      if (!trimmed || !validProductIds.has(trimmed) || seen.has(trimmed)) {
        continue;
      }
      seen.add(trimmed);
      resolved.push(trimmed);
      if (resolved.length >= maxItems) {
        break;
      }
    }

    return resolved;
  } catch {
    return [];
  }
}

export function getRecentlyViewedProducts(
  products: readonly Product[],
  recentlyViewedIds: readonly string[],
  maxItems = MAX_RECENTLY_VIEWED,
): Product[] {
  if (maxItems <= 0 || recentlyViewedIds.length === 0) {
    return [];
  }

  const productById = new Map(products.map((product) => [product.id, product]));
  const result: Product[] = [];
  const seen = new Set<string>();

  for (const id of recentlyViewedIds) {
    if (seen.has(id)) continue;
    const match = productById.get(id);
    if (!match) continue;
    seen.add(id);
    result.push(match);
    if (result.length >= maxItems) {
      break;
    }
  }

  return result;
}

export const ZOOM_VIEW_LEVELS = [1.5, 2.5, 3.5] as const;
export const DEFAULT_ZOOM_VIEW_SCALE = 2.5;

export function stepZoomViewScale(
  currentScale: number,
  direction: 'in' | 'out',
): number {
  const levels: readonly number[] = ZOOM_VIEW_LEVELS;
  let nearestIdx = 0;
  let smallestDiff = Math.abs(levels[0] - currentScale);
  for (let i = 1; i < levels.length; i += 1) {
    const diff = Math.abs(levels[i] - currentScale);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      nearestIdx = i;
    }
  }
  const nextIdx =
    direction === 'in'
      ? Math.min(levels.length - 1, nearestIdx + 1)
      : Math.max(0, nearestIdx - 1);
  return levels[nextIdx];
}

export const PRICE_DROP_ALERTS_STORAGE_KEY = 'luxuria_bd_price_alerts_v1';

export function resolvePriceDropAlertsFromStorage(
  rawJson: string | null | undefined,
  products: readonly Product[],
): Record<
  string,
  {
    productId: string;
    email: string;
    targetPrice: number;
    createdAt: string;
  }
> {
  if (!rawJson) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    const validProductIds = new Set(products.map((product) => product.id));
    const resolved: Record<
      string,
      {
        productId: string;
        email: string;
        targetPrice: number;
        createdAt: string;
      }
    > = {};

    for (const [key, entry] of Object.entries(parsed)) {
      if (!validProductIds.has(key)) continue;
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
      const candidate = entry as Record<string, unknown>;
      const rawEmail =
        typeof candidate.email === 'string' ? candidate.email.trim() : '';
      if (validateCommunityEmail(rawEmail, 'en') !== null) continue;
      const targetPrice =
        typeof candidate.targetPrice === 'number' &&
        Number.isFinite(candidate.targetPrice) &&
        candidate.targetPrice > 0
          ? candidate.targetPrice
          : (products.find((p) => p.id === key)?.price ?? 0);
      if (targetPrice <= 0) continue;
      const createdAt =
        typeof candidate.createdAt === 'string' && candidate.createdAt.trim()
          ? candidate.createdAt
          : new Date().toISOString();

      resolved[key] = {
        productId: key,
        email: rawEmail.toLowerCase(),
        targetPrice,
        createdAt,
      };
    }

    return resolved;
  } catch {
    return {};
  }
}

export function upsertPriceDropAlert(
  currentAlerts: Record<
    string,
    {
      productId: string;
      email: string;
      targetPrice: number;
      createdAt: string;
    }
  >,
  product: Pick<Product, 'id' | 'price'>,
  rawEmail: string,
  createdAt = new Date().toISOString(),
): Record<
  string,
  {
    productId: string;
    email: string;
    targetPrice: number;
    createdAt: string;
  }
> {
  const normalizedEmail = rawEmail.trim().toLowerCase();
  if (!product.id || validateCommunityEmail(normalizedEmail, 'en') !== null) {
    return currentAlerts;
  }

  return {
    ...currentAlerts,
    [product.id]: {
      productId: product.id,
      email: normalizedEmail,
      targetPrice: product.price,
      createdAt,
    },
  };
}

export function removePriceDropAlert(
  currentAlerts: Record<
    string,
    {
      productId: string;
      email: string;
      targetPrice: number;
      createdAt: string;
    }
  >,
  productId: string,
): Record<
  string,
  {
    productId: string;
    email: string;
    targetPrice: number;
    createdAt: string;
  }
> {
  if (!productId || !(productId in currentAlerts)) {
    return currentAlerts;
  }
  const next = { ...currentAlerts };
  delete next[productId];
  return next;
}

export function computeModalScrollTargetTop(
  containerScrollTop: number,
  containerTop: number,
  targetTop: number,
  offsetPx = 8,
): number {
  const safeOffset = Number.isFinite(offsetPx) ? Math.max(0, offsetPx) : 0;
  return Math.max(
    0,
    Math.round(containerScrollTop + (targetTop - containerTop) - safeOffset),
  );
}

export const PRODUCT_VIDEO_CLIP_DURATION_SEC = 4;

export function formatVideoTimestamp(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function getNextVideoClipIndex(
  currentIndex: number,
  totalClips: number,
): number {
  if (totalClips <= 0) return 0;
  const safeCurrent = Math.max(0, Math.floor(currentIndex));
  return (safeCurrent + 1) % totalClips;
}

export function getProductVideoReel(
  product: Pick<
    Product,
    'id' | 'category' | 'nameBn' | 'nameEn' | 'materialBn' | 'materialEn'
  >,
  lang: Language,
): {
  productId: string;
  title: string;
  subtitle: string;
  totalDurationSec: number;
  clips: Array<{
    id: string;
    label: string;
    caption: string;
    durationSec: number;
    panX: string;
    panY: string;
    scaleTo: number;
  }>;
} {
  const clipDuration = PRODUCT_VIDEO_CLIP_DURATION_SEC;

  if (product.category === 'watches') {
    const clips =
      lang === 'bn'
        ? [
            {
              id: `${product.id}-clip-dial`,
              label: '০১ · ডায়াল',
              caption: 'আলোর কোণে ডায়াল ও স্যাফায়ার গ্লাসের ঝলক',
              durationSec: clipDuration,
              panX: '-3%',
              panY: '-2%',
              scaleTo: 1.24,
            },
            {
              id: `${product.id}-clip-bezel`,
              label: '০২ · কেস ফিনিশ',
              caption: 'ব্রাশড স্টিল বেজেল ও ক্রাউন ডিটেইল',
              durationSec: clipDuration,
              panX: '3.5%',
              panY: '-2.5%',
              scaleTo: 1.32,
            },
            {
              id: `${product.id}-clip-strap`,
              label: '০৩ · স্ট্র্যাপ',
              caption: 'হ্যান্ড-স্টিচড লেদার স্ট্র্যাপ ও বাকল ফিট',
              durationSec: clipDuration,
              panX: '-2.5%',
              panY: '3%',
              scaleTo: 1.26,
            },
          ]
        : [
            {
              id: `${product.id}-clip-dial`,
              label: '01 · Dial',
              caption: 'Sapphire crystal reflection and dial depth in motion',
              durationSec: clipDuration,
              panX: '-3%',
              panY: '-2%',
              scaleTo: 1.24,
            },
            {
              id: `${product.id}-clip-bezel`,
              label: '02 · Case',
              caption: 'Brushed bezel chamfer and tactile crown finish',
              durationSec: clipDuration,
              panX: '3.5%',
              panY: '-2.5%',
              scaleTo: 1.32,
            },
            {
              id: `${product.id}-clip-strap`,
              label: '03 · Strap',
              caption: 'Saddle-stitched leather strap flex and clasp profile',
              durationSec: clipDuration,
              panX: '-2.5%',
              panY: '3%',
              scaleTo: 1.26,
            },
          ];

    return {
      productId: product.id,
      title:
        lang === 'bn' ? 'প্রোডাক্ট ভিডিও · ঘড়ি ও কেস' : 'Product Video · Watch Motion',
      subtitle: lang === 'bn' ? product.materialBn : product.materialEn,
      totalDurationSec: clips.length * clipDuration,
      clips,
    };
  }

  if (product.category === 'belts') {
    const clips =
      lang === 'bn'
        ? [
            {
              id: `${product.id}-clip-grain`,
              label: '০১ · লেদার গ্রেইন',
              caption: 'ফুল-গ্রেইন স্ট্র্যাপের নমনীয়তা ও টেক্সচার',
              durationSec: clipDuration,
              panX: '-3.5%',
              panY: '-1.5%',
              scaleTo: 1.26,
            },
            {
              id: `${product.id}-clip-buckle`,
              label: '০২ · বাকল',
              caption: 'অ্যান্টিক ব্রাস / মেটাল বাকলের নিখুঁত ফিনিশ',
              durationSec: clipDuration,
              panX: '3%',
              panY: '2%',
              scaleTo: 1.34,
            },
            {
              id: `${product.id}-clip-edge`,
              label: '০৩ · এজ ফিনিশ',
              caption: 'হ্যান্ড-বার্নিশড এজ ও সিঙ্গেল-পিস চামড়ার পুরুত্ব',
              durationSec: clipDuration,
              panX: '-2%',
              panY: '3%',
              scaleTo: 1.28,
            },
          ]
        : [
            {
              id: `${product.id}-clip-grain`,
              label: '01 · Grain',
              caption: 'Full-grain hide grain catching natural studio light',
              durationSec: clipDuration,
              panX: '-3.5%',
              panY: '-1.5%',
              scaleTo: 1.26,
            },
            {
              id: `${product.id}-clip-buckle`,
              label: '02 · Buckle',
              caption: 'Cast metal buckle sheen and chamfered prong detail',
              durationSec: clipDuration,
              panX: '3%',
              panY: '2%',
              scaleTo: 1.34,
            },
            {
              id: `${product.id}-clip-edge`,
              label: '03 · Edge',
              caption: 'Hand-burnished strap edge and 3.8mm hide gauge',
              durationSec: clipDuration,
              panX: '-2%',
              panY: '3%',
              scaleTo: 1.28,
            },
          ];

    return {
      productId: product.id,
      title:
        lang === 'bn'
          ? 'প্রোডাক্ট ভিডিও · লেদার ও বাকল'
          : 'Product Video · Leather & Buckle',
      subtitle: lang === 'bn' ? product.materialBn : product.materialEn,
      totalDurationSec: clips.length * clipDuration,
      clips,
    };
  }

  const clips =
    lang === 'bn'
      ? [
          {
            id: `${product.id}-clip-sheen`,
            label: '০১ · প্যাটিনা',
            caption: 'হ্যান্ড-বার্নিশড লেদার আপারের স্বাভাবিক উজ্জ্বলতা',
            durationSec: clipDuration,
            panX: '-3%',
            panY: '-2%',
            scaleTo: 1.24,
          },
          {
            id: `${product.id}-clip-stitch`,
            label: '০২ · সেলাই ও ব্রোগিং',
            caption: 'ম্যাক্রো স্টিচিং, পারফোরেশন ও টো ক্যাপের কাজ',
            durationSec: clipDuration,
            panX: '3.5%',
            panY: '-2.5%',
            scaleTo: 1.34,
          },
          {
            id: `${product.id}-clip-welt`,
            label: '০৩ · সোল ও হিল',
            caption: 'স্টিচড ওয়েল্ট ও স্ট্যাকড লেদার হিলের প্রোফাইল',
            durationSec: clipDuration,
            panX: '-2.5%',
            panY: '3%',
            scaleTo: 1.28,
          },
        ]
      : [
          {
            id: `${product.id}-clip-sheen`,
            label: '01 · Patina',
            caption: 'Hand-burnished upper leather sheen in studio light',
            durationSec: clipDuration,
            panX: '-3%',
            panY: '-2%',
            scaleTo: 1.24,
          },
          {
            id: `${product.id}-clip-stitch`,
            label: '02 · Stitching',
            caption: 'Close pass along brogue perforations and cap-toe seams',
            durationSec: clipDuration,
            panX: '3.5%',
            panY: '-2.5%',
            scaleTo: 1.34,
          },
          {
            id: `${product.id}-clip-welt`,
            label: '03 · Welt & Heel',
            caption: 'Stitched welt joinery and stacked heel contour',
            durationSec: clipDuration,
            panX: '-2.5%',
            panY: '3%',
            scaleTo: 1.28,
          },
        ];

  return {
    productId: product.id,
    title:
      lang === 'bn'
        ? 'প্রোডাক্ট ভিডিও · লেদার টেক্সচার'
        : 'Product Video · Leather in Motion',
    subtitle: lang === 'bn' ? product.materialBn : product.materialEn,
    totalDurationSec: clips.length * clipDuration,
    clips,
  };
}




