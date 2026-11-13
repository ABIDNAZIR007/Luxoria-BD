import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addItemToCart,
  addProductReview,
  buildBagToastContent,
  buildComparisonSpecRows,
  buildDigitalReceiptFilename,
  buildDigitalReceiptHtml,
  buildFacebookShareUrl,
  buildNativeSharePayload,
  buildProductShareUrl,
  buildWhatsAppInquiryUrl,
  calculateCartTotals,
  calculateZoomOrigin,
  computeModalScrollTargetTop,
  createDirectBuyCartItem,
  createOrderRecord,
  DEFAULT_ZOOM_VIEW_SCALE,
  DHAKA_STORE_LOCATIONS,
  DISCOUNT_RATE,
  filterAndSortProducts,
  filterFaqItems,
  filterStoreLocations,
  formatBDT,
  formatVideoTimestamp,
  getCompareProducts,
  getNextVideoClipIndex,
  getProductIdFromSearch,
  getProductTags,
  getProductVideoReel,
  getQuickViewTextureCue,
  getRecentlyViewedProducts,
  getRecommendedSizeGuideTab,
  getRelatedProducts,
  getReviewSummary,
  getSearchSuggestions,
  getTrackingStatusProgress,
  getWishlistProducts,
  GIFT_WRAPPING_FEE,
  lookupOrderTracking,
  MAX_RECENTLY_VIEWED,
  MOCK_PAST_ORDERS,
  MOCK_TRACKING_ORDERS,
  NEWSLETTER_IDLE_TIMEOUT_MS,
  normalizeBangladeshPhone,
  PRICE_DROP_ALERTS_STORAGE_KEY,
  PRODUCT_VIDEO_CLIP_DURATION_SEC,
  QUICK_VIEW_ZOOM_SCALE,
  recordRecentlyViewedProduct,
  removeCartItem,
  removePriceDropAlert,
  resolveActiveStoreLocation,
  resolveInitialTheme,
  resolvePastOrdersFromStorage,
  resolvePriceDropAlertsFromStorage,
  resolveRecentlyViewedIdsFromStorage,
  shouldTriggerNewsletterOverlay,
  stepZoomViewScale,
  toggleCompareItem,
  toggleThemeMode,
  toggleWishlistItem,
  updateCartItemQuantity,
  upsertPriceDropAlert,
  VALID_DISCOUNT_CODES,
  validateCheckoutForm,
  validateCommunityEmail,
  validateDiscountCode,
  validateProductReview,
  validateReviewImageFile,
  ZOOM_VIEW_LEVELS,
} from './storeLogic';
import type { CheckoutFormState, Product } from '../types/store';

const sampleProducts: Product[] = [
  {
    id: 'shoe-1',
    sku: 'LX-SH-01',
    category: 'shoes',
    nameBn: 'কগন্যাক অক্সফোর্ড',
    nameEn: 'Cognac Oxford',
    subtitleBn: 'হাতে তৈরি লেদার',
    subtitleEn: 'Handcrafted Leather',
    descriptionBn: 'প্রিমিয়াম অক্সফোর্ড জুতা',
    descriptionEn: 'Premium Oxford dress shoes',
    materialBn: 'ইতালিয়ান ফুল-গ্রেইন লেদার',
    materialEn: 'Italian Full-Grain Leather',
    price: 4850,
    image: '/shoe.jpg',
    variants: ['40', '41', '42'],
    variantLabelBn: 'সাইজ',
    variantLabelEn: 'Size',
    availabilityBn: 'ইন স্টক',
    availabilityEn: 'In Stock',
    featuredRank: 1,
    specs: [],
  },
  {
    id: 'watch-1',
    sku: 'LX-WT-01',
    category: 'watches',
    nameBn: 'ক্রোনোগ্রাফ স্টিল',
    nameEn: 'Chronograph Steel',
    subtitleBn: 'স্যাফায়ার গ্লাস',
    subtitleEn: 'Sapphire Crystal',
    descriptionBn: 'ক্লাসিক ক্রোনোগ্রাফ ঘড়ি',
    descriptionEn: 'Classic chronograph watch',
    materialBn: '৩১৬এল স্টেইনলেস স্টিল',
    materialEn: '316L Stainless Steel',
    price: 7200,
    image: '/watch.jpg',
    variants: ['40mm'],
    variantLabelBn: 'ডায়াল',
    variantLabelEn: 'Case',
    availabilityBn: 'লিমিটেড রান',
    availabilityEn: 'Limited Run',
    featuredRank: 2,
    specs: [],
  },
  {
    id: 'belt-1',
    sku: 'LX-BL-01',
    category: 'belts',
    nameBn: 'ব্রাস স্যাডল বেল্ট',
    nameEn: 'Brass Saddle Belt',
    subtitleBn: 'সলিড ব্রাস বাকল',
    subtitleEn: 'Solid Brass Buckle',
    descriptionBn: 'হাতে তৈরি বেল্ট',
    descriptionEn: 'Handcrafted leather belt',
    materialBn: 'ভেজিটেবল ট্যানড লেদার',
    materialEn: 'Vegetable-Tanned Leather',
    price: 1650,
    image: '/belt.jpg',
    variants: ['34"', '36"'],
    variantLabelBn: 'কোমর',
    variantLabelEn: 'Waist',
    availabilityBn: 'ইন স্টক',
    availabilityEn: 'In Stock',
    featuredRank: 3,
    specs: [],
  },
];

test('filterAndSortProducts filters by category, bilingual query, and sorts by price', () => {
  const watches = filterAndSortProducts(sampleProducts, {
    category: 'watches',
    query: '',
    sortBy: 'featured',
  });
  assert.equal(watches.length, 1);
  assert.equal(watches[0].id, 'watch-1');

  const queryMatch = filterAndSortProducts(sampleProducts, {
    category: 'all',
    query: 'অক্সফোর্ড',
    sortBy: 'featured',
  });
  assert.equal(queryMatch.length, 1);
  assert.equal(queryMatch[0].id, 'shoe-1');

  const sortedDesc = filterAndSortProducts(sampleProducts, {
    category: 'all',
    query: '',
    sortBy: 'price-desc',
  });
  assert.deepEqual(
    sortedDesc.map((p) => p.id),
    ['watch-1', 'shoe-1', 'belt-1'],
  );

  const sortedAsc = filterAndSortProducts(sampleProducts, {
    category: 'all',
    query: '',
    sortBy: 'price-asc',
  });
  assert.deepEqual(
    sortedAsc.map((p) => p.id),
    ['belt-1', 'shoe-1', 'watch-1'],
  );

  const taggedAndDated: Product[] = [
    { ...sampleProducts[0], featuredRank: 1, releasedAt: '2026-09-25' },
    {
      ...sampleProducts[1],
      featuredRank: 2,
      tags: ['New Arrival'],
      releasedAt: '2026-11-01',
    },
    {
      ...sampleProducts[2],
      featuredRank: 3,
      tags: ['New Arrival'],
      releasedAt: '2026-11-10',
    },
  ];
  const sortedNewest = filterAndSortProducts(taggedAndDated, {
    category: 'all',
    query: '',
    sortBy: 'newest',
  });
  assert.deepEqual(
    sortedNewest.map((p) => p.id),
    ['belt-1', 'watch-1', 'shoe-1'],
  );
});

test('cart operations merge identical product+variant and step quantities cleanly', () => {
  let cart = addItemToCart([], sampleProducts[0], '42', 1);
  cart = addItemToCart(cart, sampleProducts[0], '42', 2);
  cart = addItemToCart(cart, sampleProducts[0], '41', 1);

  assert.equal(cart.length, 2);
  assert.equal(cart[0].quantity, 3);
  assert.equal(cart[1].quantity, 1);

  cart = updateCartItemQuantity(cart, cart[1].key, -1);
  assert.equal(cart.length, 1);

  cart = removeCartItem(cart, cart[0].key);
  assert.equal(cart.length, 0);
});

test('createDirectBuyCartItem builds a single-item checkout payload without altering existing cart', () => {
  const existingCart = addItemToCart([], sampleProducts[2], '34"', 1);
  const directItem = createDirectBuyCartItem(sampleProducts[0], '42', 2);

  assert.equal(directItem.productId, 'shoe-1');
  assert.equal(directItem.variant, '42');
  assert.equal(directItem.quantity, 2);
  assert.equal(existingCart.length, 1);

  const directTotals = calculateCartTotals([directItem], 'dhaka', false);
  assert.equal(directTotals.subtotal, 4850 * 2);
  assert.equal(directTotals.shippingFee, 0);
  assert.equal(directTotals.grandTotal, 9700);

  const fallbackVariantItem = createDirectBuyCartItem(sampleProducts[0], '', 0);
  assert.equal(fallbackVariantItem.variant, '40');
  assert.equal(fallbackVariantItem.quantity, 1);
});

test('calculateCartTotals computes Dhaka/outside shipping, gift wrapping fee, and free shipping threshold', () => {
  const emptyTotals = calculateCartTotals([], 'dhaka', true);
  assert.equal(emptyTotals.grandTotal, 0);
  assert.equal(emptyTotals.shippingFee, 0);
  assert.equal(emptyTotals.giftWrappingFee, 0);

  const singleBeltCart = addItemToCart([], sampleProducts[2], '34"', 1);
  const dhakaTotals = calculateCartTotals(singleBeltCart, 'dhaka');
  assert.equal(dhakaTotals.subtotal, 1650);
  assert.equal(dhakaTotals.shippingFee, 70);
  assert.equal(dhakaTotals.giftWrappingFee, 0);
  assert.equal(dhakaTotals.grandTotal, 1720);

  const giftWrappedDhakaTotals = calculateCartTotals(singleBeltCart, 'dhaka', true);
  assert.equal(giftWrappedDhakaTotals.giftWrappingFee, GIFT_WRAPPING_FEE);
  assert.equal(giftWrappedDhakaTotals.grandTotal, 1720 + GIFT_WRAPPING_FEE);

  const outsideTotals = calculateCartTotals(singleBeltCart, 'outside');
  assert.equal(outsideTotals.shippingFee, 130);
  assert.equal(outsideTotals.grandTotal, 1780);

  const watchCart = addItemToCart([], sampleProducts[1], '40mm', 1);
  const freeShippingTotals = calculateCartTotals(watchCart, 'outside');
  assert.equal(freeShippingTotals.shippingFee, 0);
  assert.equal(freeShippingTotals.amountToFreeShipping, 0);
  assert.equal(freeShippingTotals.grandTotal, 7200);

  const giftWrappedFreeShipping = calculateCartTotals(watchCart, 'outside', true);
  assert.equal(giftWrappedFreeShipping.shippingFee, 0);
  assert.equal(giftWrappedFreeShipping.giftWrappingFee, GIFT_WRAPPING_FEE);
  assert.equal(giftWrappedFreeShipping.grandTotal, 7200 + GIFT_WRAPPING_FEE);
});

test('validateCheckoutForm validates Bangladesh phone numbers and required fields', () => {
  assert.equal(normalizeBangladeshPhone('+880 1712-345678'), '01712345678');

  const invalidForm: CheckoutFormState = {
    customerName: 'A',
    phone: '012345',
    deliveryZone: 'dhaka',
    address: 'Dhaka',
    paymentMethod: 'bkash',
    transactionId: '',
    note: '',
    giftWrapping: false,
    giftMessage: '',
  };
  const errors = validateCheckoutForm(invalidForm, 'en');
  assert.ok(errors.customerName);
  assert.ok(errors.phone);
  assert.ok(errors.address);
  assert.ok(errors.transactionId);

  const validCodForm: CheckoutFormState = {
    customerName: 'Tanvir Ahmed',
    phone: '+8801712345678',
    deliveryZone: 'dhaka',
    address: 'House 14, Road 6, Dhanmondi, Dhaka',
    paymentMethod: 'cod',
    transactionId: '',
    note: 'Call before arrival',
    giftWrapping: true,
    giftMessage: '  Eid Mubarak, bhai!  ',
  };
  assert.deepEqual(validateCheckoutForm(validCodForm, 'en'), {});

  const cart = addItemToCart([], sampleProducts[0], '42', 1);
  const totals = calculateCartTotals(cart, 'dhaka', validCodForm.giftWrapping);
  const order = createOrderRecord(
    validCodForm,
    cart,
    totals,
    new Date('2026-11-13T10:00:00.000Z'),
  );
  assert.match(order.orderId, /^LX-\d{5}$/);
  assert.equal(order.phone, '01712345678');
  assert.equal(order.giftWrapping, true);
  assert.equal(order.giftMessage, 'Eid Mubarak, bhai!');
  assert.equal(order.totals.giftWrappingFee, GIFT_WRAPPING_FEE);
  assert.equal(order.totals.grandTotal, 4920 + GIFT_WRAPPING_FEE);
  assert.equal(formatBDT(4920), '৳ 4,920');

  // Unchecked giftWrapping does not persist leftover giftMessage text
  const plainOrder = createOrderRecord(
    { ...validCodForm, giftWrapping: false },
    cart,
    calculateCartTotals(cart, 'dhaka', false),
    new Date('2026-11-13T10:05:00.000Z'),
  );
  assert.equal(plainOrder.giftWrapping, undefined);
  assert.equal(plainOrder.giftMessage, undefined);
});

test('wishlist helpers toggle items without duplicates and resolve valid products', () => {
  let wishlist = toggleWishlistItem([], 'shoe-1');
  wishlist = toggleWishlistItem(wishlist, 'watch-1');
  assert.deepEqual(wishlist, ['watch-1', 'shoe-1']);

  const resolved = getWishlistProducts(sampleProducts, [
    ...wishlist,
    'non-existent-id',
  ]);
  assert.deepEqual(
    resolved.map((p) => p.id),
    ['watch-1', 'shoe-1'],
  );

  wishlist = toggleWishlistItem(wishlist, 'watch-1');
  assert.deepEqual(wishlist, ['shoe-1']);
});

test('product review validation, addition, and average summary work accurately', () => {
  assert.ok(validateProductReview(0, 'Great fit', 'en'));
  assert.ok(validateProductReview(5, 'Hi', 'en'));
  assert.equal(validateProductReview(5, 'Superb craftsmanship', 'en'), null);

  let store = addProductReview(
    {},
    'shoe-1',
    { rating: 5, comment: 'Comfortable leather', authorName: 'Tanvir' },
    new Date('2026-11-13T10:00:00Z'),
  );
  store = addProductReview(
    store,
    'shoe-1',
    { rating: 4, comment: 'Nice finish' },
    new Date('2026-11-13T11:00:00Z'),
  );

  assert.equal(store['shoe-1'].length, 2);
  assert.equal(store['shoe-1'][0].rating, 4);
  assert.equal(store['shoe-1'][1].authorName, 'Tanvir');

  const summary = getReviewSummary(store['shoe-1']);
  assert.deepEqual(summary, { count: 2, averageRating: 4.5 });
  assert.deepEqual(getReviewSummary([]), { count: 0, averageRating: 0 });

  // Image validation & optional review image attachment
  assert.ok(validateReviewImageFile({ type: 'application/pdf', size: 1024 }, 'en'));
  assert.ok(validateReviewImageFile({ type: 'image/jpeg', size: 11 * 1024 * 1024 }, 'en'));
  assert.equal(validateReviewImageFile({ type: 'image/png', size: 2048 }, 'en'), null);

  const withPhoto = addProductReview(
    store,
    'shoe-1',
    {
      rating: 5,
      comment: 'Looks sharp in person',
      imageDataUrl: 'data:image/jpeg;base64,abc123',
    },
    new Date('2026-11-13T12:00:00Z'),
  );
  assert.equal(withPhoto['shoe-1'][0].imageDataUrl, 'data:image/jpeg;base64,abc123');
  assert.equal(store['shoe-1'][0].imageDataUrl, undefined);
});

test('getRecommendedSizeGuideTab maps belt category to belts tab and others to shoes', () => {
  assert.equal(getRecommendedSizeGuideTab('belts'), 'belts');
  assert.equal(getRecommendedSizeGuideTab('shoes'), 'shoes');
  assert.equal(getRecommendedSizeGuideTab('watches'), 'shoes');
});

test('share URL helpers construct valid deep links, Facebook sharer URLs, and resolve products', () => {
  const productUrl = buildProductShareUrl(
    'https://luxuriabd.example.com/',
    '/',
    'shoe-1',
  );
  assert.equal(productUrl, 'https://luxuriabd.example.com/?product=shoe-1');

  const fbUrl = buildFacebookShareUrl(productUrl, 'Cognac Oxford — Luxuria BD');
  const parsedFb = new URL(fbUrl);
  assert.equal(parsedFb.origin, 'https://www.facebook.com');
  assert.equal(parsedFb.pathname, '/sharer/sharer.php');
  assert.equal(parsedFb.searchParams.get('u'), productUrl);
  assert.equal(
    parsedFb.searchParams.get('quote'),
    'Cognac Oxford — Luxuria BD',
  );

  assert.equal(
    getProductIdFromSearch('?product=shoe-1', sampleProducts)?.id,
    'shoe-1',
  );
  assert.equal(getProductIdFromSearch('?product=unknown', sampleProducts), null);
  assert.equal(getProductIdFromSearch('', sampleProducts), null);

  const enSharePayload = buildNativeSharePayload(
    sampleProducts[0],
    productUrl,
    'en',
  );
  assert.equal(enSharePayload.url, productUrl);
  assert.match(enSharePayload.title, /Luxuria BD/);
  assert.match(enSharePayload.text, /4,850/);

  const bnSharePayload = buildNativeSharePayload(
    sampleProducts[0],
    productUrl,
    'bn',
  );
  assert.equal(bnSharePayload.url, productUrl);
  assert.match(bnSharePayload.title, /লাক্সুরিয়া বিডি/);
});

test('validateCommunityEmail validates empty, malformed, and valid email addresses', () => {
  assert.ok(validateCommunityEmail('', 'en'));
  assert.ok(validateCommunityEmail('   ', 'bn'));
  assert.ok(validateCommunityEmail('not-an-email', 'en'));
  assert.ok(validateCommunityEmail('user@domain', 'en'));
  assert.equal(validateCommunityEmail('  reader@luxuriabd.com  ', 'en'), null);
  assert.equal(validateCommunityEmail('member@example.com.bd', 'bn'), null);
});

test('buildBagToastContent formats bilingual product title, variant, and quantity', () => {
  const bnToast = buildBagToastContent(sampleProducts[0], '42', 2, 'bn');
  assert.equal(bnToast.title, 'কগন্যাক অক্সফোর্ড');
  assert.equal(bnToast.subtitle, '42 · 2টি ব্যাগে যোগ হয়েছে');

  const enToast = buildBagToastContent(sampleProducts[0], '', 1, 'en');
  assert.equal(enToast.title, 'Cognac Oxford');
  assert.equal(enToast.subtitle, '40 · 1 added to bag');
});

test('comparison helpers limit selection to 2 items and merge spec rows cleanly', () => {
  let compareIds = toggleCompareItem([], 'shoe-1');
  compareIds = toggleCompareItem(compareIds, 'watch-1');
  assert.deepEqual(compareIds, ['shoe-1', 'watch-1']);

  // Adding a 3rd item slides the 2-item window
  compareIds = toggleCompareItem(compareIds, 'belt-1');
  assert.deepEqual(compareIds, ['watch-1', 'belt-1']);

  const resolved = getCompareProducts(sampleProducts, compareIds);
  assert.deepEqual(
    resolved.map((p) => p.id),
    ['watch-1', 'belt-1'],
  );

  // Removing an item
  compareIds = toggleCompareItem(compareIds, 'watch-1');
  assert.deepEqual(compareIds, ['belt-1']);

  const productA: Product = {
    ...sampleProducts[0],
    specs: [
      { labelBn: 'উপাদান', labelEn: 'Material', valueBn: 'লেদার', valueEn: 'Leather' },
      { labelBn: 'হিল', labelEn: 'Heel', valueBn: 'রাবার', valueEn: 'Rubber' },
    ],
  };
  const productB: Product = {
    ...sampleProducts[1],
    specs: [
      { labelBn: 'উপাদান', labelEn: 'Material', valueBn: 'স্টিল', valueEn: 'Steel' },
      { labelBn: 'ওয়াটার রেজিস্ট্যান্স', labelEn: 'Water Resistance', valueBn: '৫০ মি', valueEn: '50m' },
    ],
  };

  const rows = buildComparisonSpecRows(productA, productB, 'en');
  assert.deepEqual(rows, [
    { label: 'Material', firstValue: 'Leather', secondValue: 'Steel' },
    { label: 'Heel', firstValue: 'Rubber', secondValue: '—' },
    { label: 'Water Resistance', firstValue: '—', secondValue: '50m' },
  ]);
});

test('buildWhatsAppInquiryUrl formats international phone digits and prefilled message', () => {
  assert.equal(
    buildWhatsAppInquiryUrl('+8801410823868', 'Hello Luxuria BD'),
    'https://wa.me/8801410823868?text=Hello%20Luxuria%20BD',
  );
  assert.equal(
    buildWhatsAppInquiryUrl('+880 1410-823868'),
    'https://wa.me/8801410823868',
  );
});

test('filterFaqItems returns all items or filters cleanly by FAQ topic', () => {
  const sampleFaq = [
    {
      id: '1',
      topic: 'care' as const,
      questionBn: 'যত্ন',
      questionEn: 'Care',
      answerBn: 'উত্তর',
      answerEn: 'Answer',
    },
    {
      id: '2',
      topic: 'delivery' as const,
      questionBn: 'ডেলিভারি',
      questionEn: 'Delivery',
      answerBn: 'উত্তর',
      answerEn: 'Answer',
    },
    {
      id: '3',
      topic: 'returns' as const,
      questionBn: 'রিটার্ন',
      questionEn: 'Returns',
      answerBn: 'উত্তর',
      answerEn: 'Answer',
    },
  ];

  assert.equal(filterFaqItems(sampleFaq, 'all').length, 3);
  assert.deepEqual(
    filterFaqItems(sampleFaq, 'care').map((i) => i.id),
    ['1'],
  );
  assert.deepEqual(
    filterFaqItems(sampleFaq, 'returns').map((i) => i.id),
    ['3'],
  );
});

test('theme helpers resolve stored preference or system fallback and toggle cleanly', () => {
  assert.equal(resolveInitialTheme('dark', false), 'dark');
  assert.equal(resolveInitialTheme('light', true), 'light');
  assert.equal(resolveInitialTheme(null, true), 'dark');
  assert.equal(resolveInitialTheme(null, false), 'light');
  assert.equal(resolveInitialTheme('unknown', false), 'light');

  assert.equal(toggleThemeMode('light'), 'dark');
  assert.equal(toggleThemeMode('dark'), 'light');
});

test('getProductTags resolves valid tags cleanly and filterAndSortProducts matches tag queries', () => {
  assert.deepEqual(getProductTags({ tags: undefined }), []);
  assert.deepEqual(getProductTags({ tags: [] }), []);
  assert.deepEqual(
    getProductTags({
      tags: ['Best Seller', 'Sale', 'Best Seller', 'InvalidTag' as never],
    }),
    ['Best Seller', 'Sale'],
  );

  const taggedProducts: Product[] = [
    { ...sampleProducts[0], tags: ['Best Seller', 'Sale'] },
    { ...sampleProducts[1], tags: ['New Arrival'] },
    sampleProducts[2],
  ];
  const saleMatches = filterAndSortProducts(taggedProducts, {
    category: 'all',
    query: 'sale',
    sortBy: 'featured',
  });
  assert.deepEqual(
    saleMatches.map((p) => p.id),
    ['shoe-1'],
  );
});

test('shouldTriggerNewsletterOverlay enforces 10s inactivity and suppression guards', () => {
  assert.equal(NEWSLETTER_IDLE_TIMEOUT_MS, 10_000);
  assert.equal(
    shouldTriggerNewsletterOverlay({
      idleElapsedMs: 9_999,
      alreadySubscribed: false,
      dismissed: false,
      hasBlockingModalOpen: false,
    }),
    false,
  );
  assert.equal(
    shouldTriggerNewsletterOverlay({
      idleElapsedMs: 10_000,
      alreadySubscribed: false,
      dismissed: false,
      hasBlockingModalOpen: false,
    }),
    true,
  );
  assert.equal(
    shouldTriggerNewsletterOverlay({
      idleElapsedMs: 15_000,
      alreadySubscribed: true,
      dismissed: false,
      hasBlockingModalOpen: false,
    }),
    false,
  );
  assert.equal(
    shouldTriggerNewsletterOverlay({
      idleElapsedMs: 15_000,
      alreadySubscribed: false,
      dismissed: true,
      hasBlockingModalOpen: false,
    }),
    false,
  );
  assert.equal(
    shouldTriggerNewsletterOverlay({
      idleElapsedMs: 15_000,
      alreadySubscribed: false,
      dismissed: false,
      hasBlockingModalOpen: true,
    }),
    false,
  );
});

test('calculateZoomOrigin maps pointer coordinates to clamped percentages and handles zero-sized bounds', () => {
  const rect = { left: 100, top: 50, width: 400, height: 300 };

  assert.deepEqual(
    calculateZoomOrigin({ clientX: 300, clientY: 200, rect }),
    { xPercent: 50, yPercent: 50 },
  );
  assert.deepEqual(
    calculateZoomOrigin({ clientX: 200, clientY: 125, rect }),
    { xPercent: 25, yPercent: 25 },
  );
  assert.deepEqual(
    calculateZoomOrigin({ clientX: 50, clientY: 400, rect }),
    { xPercent: 0, yPercent: 100 },
  );
  assert.deepEqual(
    calculateZoomOrigin({
      clientX: 200,
      clientY: 200,
      rect: { left: 0, top: 0, width: 0, height: 0 },
    }),
    { xPercent: 50, yPercent: 50 },
  );
});

test('validateDiscountCode validates hardcoded promo codes case-insensitively and handles invalid input', () => {
  assert.equal(DISCOUNT_RATE, 0.1);
  assert.ok(VALID_DISCOUNT_CODES.includes('LUXURIA10'));

  const emptyResult = validateDiscountCode('   ', 'en');
  assert.equal(emptyResult.valid, false);
  assert.ok(emptyResult.error);

  const invalidResult = validateDiscountCode('FAKE20', 'en');
  assert.equal(invalidResult.valid, false);
  assert.ok(invalidResult.error);

  const validLower = validateDiscountCode('  luxuria10  ', 'en');
  assert.deepEqual(validLower, { valid: true, normalizedCode: 'LUXURIA10' });

  const validWelcome = validateDiscountCode('welcome10', 'bn');
  assert.deepEqual(validWelcome, { valid: true, normalizedCode: 'WELCOME10' });
});

test('calculateCartTotals applies 10% subtotal discount cleanly alongside shipping and gift wrapping', () => {
  const emptyWithDiscount = calculateCartTotals([], 'dhaka', false, 'LUXURIA10');
  assert.equal(emptyWithDiscount.discountAmount, 0);
  assert.equal(emptyWithDiscount.grandTotal, 0);

  const shoeCart = addItemToCart([], sampleProducts[0], '42', 1); // 4850
  const discountedDhaka = calculateCartTotals(shoeCart, 'dhaka', false, 'luxuria10');
  assert.equal(discountedDhaka.subtotal, 4850);
  assert.equal(discountedDhaka.discountAmount, 485);
  assert.equal(discountedDhaka.shippingFee, 70);
  assert.equal(discountedDhaka.grandTotal, 4850 - 485 + 70);

  const discountedWithGift = calculateCartTotals(shoeCart, 'dhaka', true, 'LUXURIA10');
  assert.equal(discountedWithGift.giftWrappingFee, GIFT_WRAPPING_FEE);
  assert.equal(discountedWithGift.grandTotal, 4850 - 485 + 70 + GIFT_WRAPPING_FEE);

  const invalidDiscountTotals = calculateCartTotals(shoeCart, 'dhaka', false, 'FAKE20');
  assert.equal(invalidDiscountTotals.discountAmount, 0);
  assert.equal(invalidDiscountTotals.grandTotal, 4920);

  // Free shipping threshold remains evaluated against pre-discount subtotal (7200 >= 6000)
  const watchCart = addItemToCart([], sampleProducts[1], '40mm', 1);
  const watchDiscounted = calculateCartTotals(watchCart, 'outside', false, 'DHAKA10');
  assert.equal(watchDiscounted.discountAmount, 720);
  assert.equal(watchDiscounted.shippingFee, 0);
  assert.equal(watchDiscounted.grandTotal, 6480);

  const validForm: CheckoutFormState = {
    customerName: 'Tanvir Ahmed',
    phone: '01712345678',
    deliveryZone: 'dhaka',
    address: 'House 14, Road 6, Dhanmondi, Dhaka',
    paymentMethod: 'cod',
    transactionId: '',
    note: '',
    giftWrapping: false,
    giftMessage: '',
    discountCode: '  luxuria10 ',
  };
  const orderWithDiscount = createOrderRecord(validForm, shoeCart, discountedDhaka);
  assert.equal(orderWithDiscount.discountCode, 'LUXURIA10');
  assert.equal(orderWithDiscount.totals.discountAmount, 485);
  assert.equal(orderWithDiscount.totals.grandTotal, 4435);
});

test('getTrackingStatusProgress and lookupOrderTracking resolve mock orders, user orders, and invalid IDs', () => {
  assert.deepEqual(getTrackingStatusProgress('Processing'), {
    stepIndex: 2,
    percent: 50,
  });
  assert.deepEqual(getTrackingStatusProgress('In Transit'), {
    stepIndex: 3,
    percent: 75,
  });
  assert.deepEqual(getTrackingStatusProgress('Delivered'), {
    stepIndex: 4,
    percent: 100,
  });

  assert.equal(MOCK_TRACKING_ORDERS.length, 3);

  const emptyLookup = lookupOrderTracking('   ', [], 'en');
  assert.equal(emptyLookup.found, false);
  if (!emptyLookup.found) {
    assert.equal(emptyLookup.emptyInput, true);
  }

  const unknownLookup = lookupOrderTracking('LX-99999', [], 'en');
  assert.equal(unknownLookup.found, false);
  if (!unknownLookup.found) {
    assert.equal(unknownLookup.emptyInput, false);
    assert.match(unknownLookup.error, /LX-99999/);
  }

  const inTransitLookup = lookupOrderTracking('  lx-20941  ', [], 'en');
  assert.equal(inTransitLookup.found, true);
  if (inTransitLookup.found) {
    assert.equal(inTransitLookup.result.status, 'In Transit');
    assert.equal(inTransitLookup.result.checkpoints.length, 4);
    assert.equal(inTransitLookup.result.checkpoints[2].current, true);
  }

  const deliveredLookup = lookupOrderTracking('LX-31507', [], 'en');
  assert.equal(deliveredLookup.found, true);
  if (deliveredLookup.found) {
    assert.equal(deliveredLookup.result.status, 'Delivered');
    assert.equal(deliveredLookup.result.checkpoints[3].completed, true);
  }

  // Matches user-placed order as well
  const shoeCart = addItemToCart([], sampleProducts[0], '42', 1);
  const totals = calculateCartTotals(shoeCart, 'dhaka', false, 'LUXURIA10');
  const userOrder = createOrderRecord(
    {
      customerName: 'Tanvir Ahmed',
      phone: '01712345678',
      deliveryZone: 'dhaka',
      address: 'House 14, Road 6, Dhanmondi, Dhaka',
      paymentMethod: 'cod',
      transactionId: '',
      note: '',
      giftWrapping: false,
      giftMessage: '',
      discountCode: 'LUXURIA10',
    },
    shoeCart,
    totals,
    new Date('2026-11-13T10:00:00Z'),
  );
  const userLookup = lookupOrderTracking(userOrder.orderId, [userOrder], 'en');
  assert.equal(userLookup.found, true);
  if (userLookup.found) {
    assert.equal(userLookup.result.isUserOrder, true);
    assert.equal(userLookup.result.status, 'Processing');
    assert.equal(userLookup.result.totals.discountAmount, 485);
    assert.equal(userLookup.result.totals.grandTotal, 4435);
  }
});

test('getRelatedProducts prioritizes same-category products, excludes active item, and fills to 3 items', () => {
  // Expanded catalog with 4 shoes + 2 watches + 2 belts
  const catalogWithFourShoes: Product[] = [
    ...sampleProducts,
    { ...sampleProducts[0], id: 'shoe-2', featuredRank: 4 },
    { ...sampleProducts[0], id: 'shoe-3', featuredRank: 5 },
    { ...sampleProducts[0], id: 'shoe-4', featuredRank: 6 },
    { ...sampleProducts[1], id: 'watch-2', featuredRank: 7 },
    { ...sampleProducts[2], id: 'belt-2', featuredRank: 8 },
  ];

  const shoeRelated = getRelatedProducts(
    catalogWithFourShoes[0],
    catalogWithFourShoes,
    3,
  );
  assert.deepEqual(
    shoeRelated.map((p) => p.id),
    ['shoe-2', 'shoe-3', 'shoe-4'],
  );
  assert.ok(shoeRelated.every((p) => p.id !== 'shoe-1'));

  // When a category only has 2 items total, puts same-category item first and supplements from complementary categories
  const watchRelated = getRelatedProducts(
    catalogWithFourShoes[1],
    catalogWithFourShoes,
    3,
  );
  assert.equal(watchRelated.length, 3);
  assert.equal(watchRelated[0].id, 'watch-2');
  assert.deepEqual(
    watchRelated.map((p) => p.id),
    ['watch-2', 'shoe-1', 'shoe-2'],
  );
  assert.ok(watchRelated.every((p) => p.id !== 'watch-1'));

  assert.deepEqual(getRelatedProducts(sampleProducts[0], sampleProducts, 0), []);
});

test('getSearchSuggestions returns 3-5 ranked predictive suggestions for matching queries and empty for non-matching queries', () => {
  assert.deepEqual(getSearchSuggestions(sampleProducts, '   ', { lang: 'en' }), []);
  assert.deepEqual(
    getSearchSuggestions(sampleProducts, 'zzzznotfound', { lang: 'en' }),
    [],
  );

  // Expanded catalog of 6 items: typing "leather" or "a" caps at 5 suggestions
  const expanded: Product[] = [
    ...sampleProducts,
    {
      ...sampleProducts[0],
      id: 'shoe-2',
      nameEn: 'Espresso Suede Loafer',
      nameBn: 'এসপ্রেসো সুয়েড লোফার',
      featuredRank: 4,
    },
    {
      ...sampleProducts[1],
      id: 'watch-2',
      nameEn: 'Heritage Dress Watch',
      nameBn: 'হ্যারিটেজ ড্রেস ওয়াচ',
      featuredRank: 5,
    },
    {
      ...sampleProducts[2],
      id: 'belt-2',
      nameEn: 'Obsidian Formal Belt',
      nameBn: 'অবসিডিয়ান ফরমাল বেল্ট',
      featuredRank: 6,
    },
  ];

  // Prefix / word-prefix match ("c" -> Cognac Oxford, Chronograph Steel first, then padded to >= 3)
  const cMatches = getSearchSuggestions(expanded, 'c', { lang: 'en' });
  assert.ok(cMatches.length >= 3 && cMatches.length <= 5);
  assert.equal(cMatches[0].id, 'shoe-1');
  assert.equal(cMatches[1].id, 'watch-1');

  // Broad letter query returns max 5 suggestions
  const broadMatches = getSearchSuggestions(expanded, 'e', { lang: 'en' });
  assert.equal(broadMatches.length, 5);

  // Specific match pads to 3 suggestions with direct match first
  const oxfordMatches = getSearchSuggestions(expanded, 'oxford', { lang: 'en' });
  assert.equal(oxfordMatches.length, 3);
  assert.equal(oxfordMatches[0].id, 'shoe-1');

  // Bengali query works accurately
  const bnMatches = getSearchSuggestions(expanded, 'অক্সফোর্ড', { lang: 'bn' });
  assert.equal(bnMatches.length, 3);
  assert.equal(bnMatches[0].id, 'shoe-1');
});

test('Dhaka store locator filters workshops/pickup points and resolves active pin safely', () => {
  assert.equal(DHAKA_STORE_LOCATIONS.length, 4);

  const all = filterStoreLocations(DHAKA_STORE_LOCATIONS, 'all');
  assert.equal(all.length, 4);

  const pickups = filterStoreLocations(DHAKA_STORE_LOCATIONS, 'pickup');
  assert.equal(pickups.length, 3);
  assert.ok(pickups.every((loc) => loc.type === 'pickup'));

  const workshops = filterStoreLocations(DHAKA_STORE_LOCATIONS, 'workshop');
  assert.equal(workshops.length, 1);
  assert.equal(workshops[0].id, 'hazaribagh-workshop');

  assert.equal(
    resolveActiveStoreLocation(all, 'dhanmondi-pickup')?.id,
    'dhanmondi-pickup',
  );
  // When active ID is excluded by a filter, falls back cleanly to first visible location
  assert.equal(
    resolveActiveStoreLocation(workshops, 'dhanmondi-pickup')?.id,
    'hazaribagh-workshop',
  );
  assert.equal(resolveActiveStoreLocation([], 'banani-pickup'), null);
});

test('resolvePastOrdersFromStorage seeds mock completed orders cleanly and lookupOrderTracking resolves them as Delivered', () => {
  assert.equal(MOCK_PAST_ORDERS.length, 3);
  assert.ok(MOCK_PAST_ORDERS.every((o) => o.status === 'delivered'));

  const seededFromEmpty = resolvePastOrdersFromStorage(null);
  assert.equal(seededFromEmpty.length, 3);
  assert.equal(seededFromEmpty[0].orderId, 'LX-31507');

  const seededFromCorrupt = resolvePastOrdersFromStorage('{bad json');
  assert.equal(seededFromCorrupt.length, 3);

  const customStored = JSON.stringify([MOCK_PAST_ORDERS[1]]);
  const restoredCustom = resolvePastOrdersFromStorage(customStored);
  assert.equal(restoredCustom.length, 1);
  assert.equal(restoredCustom[0].orderId, 'LX-28419');

  const pastLookup = lookupOrderTracking('LX-28419', [], 'en', seededFromEmpty);
  assert.equal(pastLookup.found, true);
  if (pastLookup.found) {
    assert.equal(pastLookup.result.status, 'Delivered');
    assert.equal(pastLookup.result.totals.grandTotal, 5950);
    assert.equal(pastLookup.result.checkpoints[3].completed, true);
  }
});

test('getQuickViewTextureCue returns bilingual category-specific macro cues and valid zoom scale', () => {
  assert.ok(QUICK_VIEW_ZOOM_SCALE > 2);
  assert.match(getQuickViewTextureCue('shoes', 'en'), /Leather Grain/);
  assert.match(getQuickViewTextureCue('watches', 'en'), /Dial & Bezel/);
  assert.match(getQuickViewTextureCue('belts', 'en'), /Leather & Buckle/);
  assert.match(getQuickViewTextureCue('shoes', 'bn'), /কুইক ভিউ/);
  assert.match(getQuickViewTextureCue('watches', 'bn'), /ডায়াল/);
  assert.match(getQuickViewTextureCue('belts', 'bn'), /বাকল/);
});

test('buildDigitalReceiptFilename and buildDigitalReceiptHtml generate escaped stylized HTML receipts', () => {
  assert.equal(
    buildDigitalReceiptFilename(' lx-31507 '),
    'Luxuria-BD-Receipt-LX-31507.html',
  );
  assert.equal(
    buildDigitalReceiptFilename('../bad?id'),
    'Luxuria-BD-Receipt-BADID.html',
  );

  const lookup = lookupOrderTracking('LX-31507', [], 'en', MOCK_PAST_ORDERS);
  assert.equal(lookup.found, true);
  if (lookup.found) {
    const html = buildDigitalReceiptHtml(
      { ...lookup.result, customerName: 'Tariq <script>alert(1)</script>' },
      'en',
    );
    assert.match(html, /^<!doctype html>/);
    assert.match(html, /Official Digital Receipt/);
    assert.match(html, /LX-31507/);
    assert.match(html, /Espresso Suede Penny Loafer/);
    assert.match(html, /4,420/);
    assert.ok(!html.includes('<script>alert(1)</script>'));
    assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));

    const bnHtml = buildDigitalReceiptHtml(lookup.result, 'bn');
    assert.match(bnHtml, /ডিজিটাল অর্ডার রিসিপ্ট/);
  }
});

test('recently viewed helpers track last 4 clicked products with deduping and safe storage resolution', () => {
  assert.equal(MAX_RECENTLY_VIEWED, 4);

  let ids: string[] = [];
  ids = recordRecentlyViewedProduct(ids, 'shoe-1');
  ids = recordRecentlyViewedProduct(ids, 'watch-1');
  ids = recordRecentlyViewedProduct(ids, 'belt-1');
  ids = recordRecentlyViewedProduct(ids, 'shoe-2');
  assert.deepEqual(ids, ['shoe-2', 'belt-1', 'watch-1', 'shoe-1']);

  // Clicking a 5th unique product drops the oldest and caps at 4
  ids = recordRecentlyViewedProduct(ids, 'watch-2');
  assert.deepEqual(ids, ['watch-2', 'shoe-2', 'belt-1', 'watch-1']);

  // Re-clicking an existing product moves it to the front without duplication
  ids = recordRecentlyViewedProduct(ids, 'belt-1');
  assert.deepEqual(ids, ['belt-1', 'watch-2', 'shoe-2', 'watch-1']);

  // Blank IDs do not pollute state
  ids = recordRecentlyViewedProduct(ids, '   ');
  assert.deepEqual(ids, ['belt-1', 'watch-2', 'shoe-2', 'watch-1']);

  const fiveCatalogProducts: Product[] = [
    ...sampleProducts,
    { ...sampleProducts[0], id: 'shoe-2' },
    { ...sampleProducts[1], id: 'watch-2' },
  ];

  // Storage resolution filters unknown/non-string IDs, deduplicates, and caps at 4
  assert.deepEqual(
    resolveRecentlyViewedIdsFromStorage(null, fiveCatalogProducts),
    [],
  );
  assert.deepEqual(
    resolveRecentlyViewedIdsFromStorage('{corrupt', fiveCatalogProducts),
    [],
  );
  const storedRaw = JSON.stringify([
    'watch-1',
    'unknown-id',
    123,
    'shoe-1',
    'watch-1',
    'belt-1',
    'shoe-2',
    'watch-2',
  ]);
  assert.deepEqual(
    resolveRecentlyViewedIdsFromStorage(storedRaw, fiveCatalogProducts),
    ['watch-1', 'shoe-1', 'belt-1', 'shoe-2'],
  );

  // Resolved products match exact recency order
  const resolvedProducts = getRecentlyViewedProducts(fiveCatalogProducts, [
    'belt-1',
    'missing',
    'shoe-1',
  ]);
  assert.deepEqual(
    resolvedProducts.map((p) => p.id),
    ['belt-1', 'shoe-1'],
  );
});

test('stepZoomViewScale steps cleanly within ZOOM_VIEW_LEVELS bounds', () => {
  assert.deepEqual([...ZOOM_VIEW_LEVELS], [1.5, 2.5, 3.5]);
  assert.equal(DEFAULT_ZOOM_VIEW_SCALE, 2.5);
  assert.equal(stepZoomViewScale(2.5, 'in'), 3.5);
  assert.equal(stepZoomViewScale(3.5, 'in'), 3.5);
  assert.equal(stepZoomViewScale(2.5, 'out'), 1.5);
  assert.equal(stepZoomViewScale(1.5, 'out'), 1.5);
});

test('price drop alert helpers persist, validate, update, and remove preferences cleanly', () => {
  assert.equal(PRICE_DROP_ALERTS_STORAGE_KEY, 'luxuria_bd_price_alerts_v1');

  // Empty/corrupt storage resolves to empty map
  assert.deepEqual(
    resolvePriceDropAlertsFromStorage(null, sampleProducts),
    {},
  );
  assert.deepEqual(
    resolvePriceDropAlertsFromStorage('{corrupt', sampleProducts),
    {},
  );

  // Upsert rejects invalid emails cleanly without mutating state
  const emptyAlerts = upsertPriceDropAlert(
    {},
    sampleProducts[0],
    'not-an-email',
  );
  assert.deepEqual(emptyAlerts, {});

  // Upsert normalizes email and stores product price threshold
  const firstAdded = upsertPriceDropAlert(
    {},
    sampleProducts[0],
    '  Buyer@Example.com ',
    '2026-11-13T08:30:00.000Z',
  );
  assert.equal(firstAdded['shoe-1']?.email, 'buyer@example.com');
  assert.equal(firstAdded['shoe-1']?.targetPrice, sampleProducts[0].price);

  const twoAlerts = upsertPriceDropAlert(
    firstAdded,
    sampleProducts[1],
    'watchfan@example.com',
    '2026-11-13T08:31:00.000Z',
  );
  assert.equal(Object.keys(twoAlerts).length, 2);

  // Storage parser drops unknown products and invalid emails while keeping valid records
  const serializedWithJunk = JSON.stringify({
    ...twoAlerts,
    'unknown-prod': {
      productId: 'unknown-prod',
      email: 'valid@example.com',
      targetPrice: 1200,
      createdAt: '2026-11-13T08:31:00.000Z',
    },
    'belt-1': {
      productId: 'belt-1',
      email: 'bad-email',
      targetPrice: 1450,
      createdAt: '2026-11-13T08:31:00.000Z',
    },
  });
  const parsed = resolvePriceDropAlertsFromStorage(
    serializedWithJunk,
    sampleProducts,
  );
  assert.deepEqual(Object.keys(parsed), ['shoe-1', 'watch-1']);

  // Removing a single product alert leaves others intact
  const afterRemove = removePriceDropAlert(parsed, 'shoe-1');
  assert.equal(afterRemove['shoe-1'], undefined);
  assert.equal(afterRemove['watch-1']?.email, 'watchfan@example.com');
});

test('computeModalScrollTargetTop computes bounded container scroll destination', () => {
  assert.equal(computeModalScrollTargetTop(0, 40, 620, 8), 572);
  assert.equal(computeModalScrollTargetTop(120, 40, 620, 8), 692);
  assert.equal(computeModalScrollTargetTop(0, 100, 95, 12), 0);
});

test('getProductVideoReel builds category-specific 3-clip motion reels and formats timestamps cleanly', () => {
  assert.equal(PRODUCT_VIDEO_CLIP_DURATION_SEC, 4);
  assert.equal(formatVideoTimestamp(0), '0:00');
  assert.equal(formatVideoTimestamp(12), '0:12');
  assert.equal(getNextVideoClipIndex(0, 3), 1);
  assert.equal(getNextVideoClipIndex(2, 3), 0);

  const shoeReel = getProductVideoReel(sampleProducts[0], 'en');
  assert.equal(shoeReel.clips.length, 3);
  assert.equal(shoeReel.totalDurationSec, 12);
  assert.match(shoeReel.clips[1].caption, /brogue|stitch/i);

  const watchReel = getProductVideoReel(sampleProducts[1], 'bn');
  assert.equal(watchReel.clips.length, 3);
  assert.match(watchReel.clips[0].label, /ডায়াল/);

  const beltReel = getProductVideoReel(sampleProducts[2], 'en');
  assert.equal(beltReel.clips.length, 3);
  assert.match(beltReel.clips[1].label, /Buckle/);
});




