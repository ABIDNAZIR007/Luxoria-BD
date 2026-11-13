import { Heart, Moon, Sun, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BagToast, type BagToastState } from './components/BagToast';
import { CartCheckoutDrawer } from './components/CartCheckoutDrawer';
import { CatalogSearchInput } from './components/CatalogSearchInput';
import { CompareTray } from './components/CompareTray';
import { ComparisonModal } from './components/ComparisonModal';
import { EmailNewsletterOverlay } from './components/EmailNewsletterOverlay';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { OrderTrackingPage } from './components/OrderTrackingPage';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { RecentlyViewedBar } from './components/RecentlyViewedBar';
import { StorySection } from './components/StorySection';
import { WhatsAppFab } from './components/WhatsAppFab';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CATEGORY_LABELS, COPY } from './data/i18n';
import { PRODUCTS } from './data/products';
import type {
  CartItem,
  Category,
  DeliveryZone,
  Language,
  OrderRecord,
  PriceDropAlertsByProduct,
  Product,
  ReviewsByProduct,
  SortOption,
  ThemeMode,
} from './types/store';
import {
  addItemToCart,
  addProductReview,
  calculateCartTotals,
  createDirectBuyCartItem,
  filterAndSortProducts,
  getCompareProducts,
  getProductIdFromSearch,
  getRecentlyViewedProducts,
  getWishlistProducts,
  NEWSLETTER_IDLE_TIMEOUT_MS,
  PAST_ORDERS_STORAGE_KEY,
  PRICE_DROP_ALERTS_STORAGE_KEY,
  RECENTLY_VIEWED_STORAGE_KEY,
  recordRecentlyViewedProduct,
  removeCartItem,
  removePriceDropAlert,
  resolveInitialTheme,
  resolvePastOrdersFromStorage,
  resolvePriceDropAlertsFromStorage,
  resolveRecentlyViewedIdsFromStorage,
  shouldTriggerNewsletterOverlay,
  toggleCompareItem,
  toggleWishlistItem,
  updateCartItemQuantity,
  upsertPriceDropAlert,
} from './utils/storeLogic';

const CART_STORAGE_KEY = 'luxuria_bd_cart_v1';
const ORDERS_STORAGE_KEY = 'luxuria_bd_orders_v1';
const WISHLIST_STORAGE_KEY = 'luxuria_bd_wishlist_v1';
const REVIEWS_STORAGE_KEY = 'luxuria_bd_reviews_v1';
const LANG_STORAGE_KEY = 'luxuria_bd_lang_v1';
const THEME_STORAGE_KEY = 'luxuria_bd_theme_v1';
const COMMUNITY_STORAGE_KEY = 'luxuria_bd_community_email_v1';
const NEWSLETTER_DISMISSED_KEY = 'luxuria_bd_newsletter_dismissed_v1';

function loadStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = loadStoredJson<string>(LANG_STORAGE_KEY, 'bn');
    return saved === 'en' ? 'en' : 'bn';
  });
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = loadStoredJson<string | null>(THEME_STORAGE_KEY, null);
    const prefersDark =
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches);
    return resolveInitialTheme(saved, prefersDark);
  });
  const [category, setCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('dhaka');
  const [giftWrapping, setGiftWrapping] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() =>
    loadStoredJson<CartItem[]>(CART_STORAGE_KEY, []),
  );
  const [orders, setOrders] = useState<OrderRecord[]>(() =>
    loadStoredJson<OrderRecord[]>(ORDERS_STORAGE_KEY, []),
  );
  const [pastOrders, setPastOrders] = useState<OrderRecord[]>(() => {
    try {
      const raw = window.localStorage.getItem(PAST_ORDERS_STORAGE_KEY);
      return resolvePastOrdersFromStorage(raw);
    } catch {
      return resolvePastOrdersFromStorage(null);
    }
  });
  const [wishlistIds, setWishlistIds] = useState<string[]>(() =>
    loadStoredJson<string[]>(WISHLIST_STORAGE_KEY, []),
  );
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
      return resolveRecentlyViewedIdsFromStorage(raw, PRODUCTS);
    } catch {
      return [];
    }
  });
  const [reviewsByProduct, setReviewsByProduct] = useState<ReviewsByProduct>(
    () => loadStoredJson<ReviewsByProduct>(REVIEWS_STORAGE_KEY, {}),
  );
  const [priceAlertsByProduct, setPriceAlertsByProduct] =
    useState<PriceDropAlertsByProduct>(() => {
      try {
        const raw = window.localStorage.getItem(PRICE_DROP_ALERTS_STORAGE_KEY);
        return resolvePriceDropAlertsFromStorage(raw, PRODUCTS);
      } catch {
        return {};
      }
    });

  const [activeProduct, setActiveProduct] = useState<Product | null>(() =>
    getProductIdFromSearch(window.location.search, PRODUCTS),
  );
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [directCheckoutItem, setDirectCheckoutItem] = useState<CartItem | null>(
    null,
  );
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [bagToast, setBagToast] = useState<BagToastState | null>(null);
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(() => {
    try {
      const saved = window.localStorage.getItem(COMMUNITY_STORAGE_KEY);
      return saved || null;
    } catch {
      return null;
    }
  });
  const [newsletterDismissed, setNewsletterDismissed] = useState<boolean>(
    () => {
      try {
        return window.sessionStorage.getItem(NEWSLETTER_DISMISSED_KEY) === '1';
      } catch {
        return false;
      }
    },
  );
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);

  useEffect(() => {
    if (!bagToast) return;
    const timer = window.setTimeout(() => {
      setBagToast(null);
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [bagToast]);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (activeProduct) {
        url.searchParams.set('product', activeProduct.id);
      } else {
        url.searchParams.delete('product');
      }
      window.history.replaceState(null, '', url.toString());
    } catch {
      // Ignore history API errors in restricted environments
    }
  }, [activeProduct]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Ignore storage quota errors
    }
  }, [orders]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        PAST_ORDERS_STORAGE_KEY,
        JSON.stringify(pastOrders),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [pastOrders]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(wishlistIds),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        REVIEWS_STORAGE_KEY,
        JSON.stringify(reviewsByProduct),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [reviewsByProduct]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        RECENTLY_VIEWED_STORAGE_KEY,
        JSON.stringify(recentlyViewedIds),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [recentlyViewedIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        PRICE_DROP_ALERTS_STORAGE_KEY,
        JSON.stringify(priceAlertsByProduct),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [priceAlertsByProduct]);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, JSON.stringify(lang));
    } catch {
      // Ignore storage quota errors
    }
  }, [lang]);

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = theme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    } catch {
      // Ignore storage quota errors
    }
  }, [theme]);

  const hasBlockingModalOpen = Boolean(
    activeProduct ||
      isBagOpen ||
      isWishlistOpen ||
      isTrackerOpen ||
      isCompareOpen,
  );

  useEffect(() => {
    if (
      isNewsletterOpen ||
      !shouldTriggerNewsletterOverlay({
        idleElapsedMs: NEWSLETTER_IDLE_TIMEOUT_MS,
        alreadySubscribed: subscribedEmail !== null,
        dismissed: newsletterDismissed,
        hasBlockingModalOpen,
      })
    ) {
      return;
    }

    let timerId = 0;

    const scheduleTimer = () => {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(() => {
        setIsNewsletterOpen(true);
      }, NEWSLETTER_IDLE_TIMEOUT_MS);
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'pointerdown',
    ];

    scheduleTimer();
    for (const eventName of activityEvents) {
      window.addEventListener(eventName, scheduleTimer, { passive: true });
    }

    return () => {
      window.clearTimeout(timerId);
      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, scheduleTimer);
      }
    };
  }, [
    isNewsletterOpen,
    subscribedEmail,
    newsletterDismissed,
    hasBlockingModalOpen,
  ]);

  const handleSubscribeEmail = (normalizedEmail: string) => {
    setSubscribedEmail(normalizedEmail);
    try {
      window.localStorage.setItem(COMMUNITY_STORAGE_KEY, normalizedEmail);
    } catch {
      // Ignore storage quota errors
    }
  };

  const handleResetSubscription = () => {
    setSubscribedEmail(null);
    try {
      window.localStorage.removeItem(COMMUNITY_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  const handleDismissNewsletter = () => {
    setIsNewsletterOpen(false);
    setNewsletterDismissed(true);
    try {
      window.sessionStorage.setItem(NEWSLETTER_DISMISSED_KEY, '1');
    } catch {
      // Ignore storage errors
    }
  };

  const t = COPY[lang];

  const visibleProducts = useMemo(
    () =>
      filterAndSortProducts(PRODUCTS, {
        category,
        query: searchQuery,
        sortBy,
      }),
    [category, searchQuery, sortBy],
  );

  const totals = useMemo(
    () =>
      calculateCartTotals(cart, deliveryZone, giftWrapping, discountCode),
    [cart, deliveryZone, giftWrapping, discountCode],
  );

  const drawerItems = useMemo(
    () => (directCheckoutItem ? [directCheckoutItem] : cart),
    [directCheckoutItem, cart],
  );

  const drawerTotals = useMemo(
    () =>
      calculateCartTotals(
        drawerItems,
        deliveryZone,
        giftWrapping,
        discountCode,
      ),
    [drawerItems, deliveryZone, giftWrapping, discountCode],
  );

  const wishlistProducts = useMemo(
    () => getWishlistProducts(PRODUCTS, wishlistIds),
    [wishlistIds],
  );

  const compareProducts = useMemo(
    () => getCompareProducts(PRODUCTS, compareIds),
    [compareIds],
  );

  const recentlyViewedProducts = useMemo(
    () => getRecentlyViewedProducts(PRODUCTS, recentlyViewedIds),
    [recentlyViewedIds],
  );

  const handleInspectProduct = (product: Product) => {
    setActiveProduct(product);
    setRecentlyViewedIds((prev) =>
      recordRecentlyViewedProduct(prev, product.id),
    );
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) => toggleWishlistItem(prev, productId));
  };

  const handleToggleCompare = (productId: string) => {
    setCompareIds((prev) => toggleCompareItem(prev, productId));
  };

  const handleSubmitReview = (
    productId: string,
    input: {
      rating: number;
      comment: string;
      authorName?: string;
      imageDataUrl?: string;
    },
  ) => {
    setReviewsByProduct((prev) => addProductReview(prev, productId, input));
  };

  const handleSavePriceAlert = (product: Product, email: string) => {
    setPriceAlertsByProduct((prev) =>
      upsertPriceDropAlert(prev, product, email),
    );
  };

  const handleRemovePriceAlert = (productId: string) => {
    setPriceAlertsByProduct((prev) => removePriceDropAlert(prev, productId));
  };

  const handleAddToBag = (product: Product, variant: string, quantity = 1) => {
    setCart((prev) => addItemToCart(prev, product, variant, quantity));
    setBagToast({
      id: Date.now() + Math.random(),
      product,
      variant,
      quantity,
    });
  };

  const handleQuickAdd = (product: Product) => {
    const defaultVariant = product.variants[0] ?? 'Standard';
    handleAddToBag(product, defaultVariant, 1);
  };

  const handleBuyNow = (
    product: Product,
    variant?: string,
    quantity = 1,
  ) => {
    const item = createDirectBuyCartItem(product, variant, quantity);
    setDirectCheckoutItem(item);
    setBagToast(null);
    setActiveProduct(null);
    setIsBagOpen(true);
  };

  const handleUpdateQuantity = (itemKey: string, delta: number) => {
    setCart((prev) => updateCartItemQuantity(prev, itemKey, delta));
  };

  const handleRemoveItem = (itemKey: string) => {
    setCart((prev) => removeCartItem(prev, itemKey));
  };

  const handleOrderConfirmed = (order: OrderRecord) => {
    setOrders((prev) => [order, ...prev]);
    if (directCheckoutItem) {
      setDirectCheckoutItem(null);
    } else {
      setCart([]);
    }
    setGiftWrapping(false);
    setDiscountCode(null);
  };

  const handleExploreClick = () => {
    const el = document.getElementById('collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] dark:bg-[#121110] text-[#171614] dark:text-[#F3EFE8] transition-colors duration-200">
      {/* Slim non-sticky announcement strip (<= 38px) */}
      {!bannerDismissed && (
        <div className="bg-[#171614] dark:bg-[#1C1A17] text-[#E6E1D9] border-b border-transparent dark:border-[#2D2925] text-xs px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <p className="truncate">{t.announcement}</p>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              aria-label="Dismiss announcement"
              className="text-[#B8B0A4] hover:text-white cursor-pointer shrink-0 p-0.5"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Strict 3-zone sticky Header */}
      <Header
        lang={lang}
        bagCount={totals.itemCount}
        onSelectCategory={(cat) => setCategory(cat)}
        onOpenBag={() => {
          setDirectCheckoutItem(null);
          setBagToast(null);
          setIsBagOpen(true);
        }}
      />

      <main className="flex-1">
        {/* Section 1: Editorial Split Hero + 4-column Service Strip */}
        <HeroSection lang={lang} onExploreClick={handleExploreClick} />

        {/* Section 2: Signature Collection Toolbar & 3-Column Product Grid */}
        <section
          id="collection"
          className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#171614] dark:text-[#F3EFE8]">
                {t.collectionHeading}
              </h2>
              <p className="text-sm text-[#5E5850] dark:text-[#B8B0A4] mt-1.5">
                {t.collectionSubheading}
              </p>
            </div>

            {/* Utility Controls: Wishlist + Track Order + Theme Toggle + Language Switch */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setIsWishlistOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-[#F8F7F4] dark:bg-[#1A1816] text-xs font-medium text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${wishlistProducts.length > 0 ? 'fill-current text-[#8C6239] dark:text-[#D4A77A]' : ''}`}
                  aria-hidden="true"
                />
                <span className="tabular-nums">
                  {t.wishlistButton} ({wishlistProducts.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsTrackerOpen(true)}
                className="px-3.5 py-2 min-h-[40px] rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-[#F8F7F4] dark:bg-[#1A1816] text-xs font-medium text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.navTrack}
                {orders.length > 0 ? ` (${orders.length})` : ''}
              </button>

              <div
                className="inline-flex items-center p-1 rounded-md bg-[#EFECE6] dark:bg-[#1E1B18] border border-[#E2DDD5] dark:border-[#2D2925]"
                role="group"
                aria-label={t.themeToggleLabel}
              >
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  aria-pressed={theme === 'light'}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                    theme === 'light'
                      ? 'bg-white text-[#171614] shadow-xs'
                      : 'text-[#5E5850] dark:text-[#B8B0A4] hover:text-[#171614] dark:hover:text-[#F3EFE8]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.themeLight}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  aria-pressed={theme === 'dark'}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                    theme === 'dark'
                      ? 'dark:bg-[#2F2B26] dark:text-[#F3EFE8] bg-white text-[#171614] shadow-xs'
                      : 'text-[#5E5850] dark:text-[#B8B0A4] hover:text-[#171614] dark:hover:text-[#F3EFE8]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.themeDark}</span>
                </button>
              </div>

              <div
                className="inline-flex items-center p-1 rounded-md bg-[#EFECE6] dark:bg-[#1E1B18] border border-[#E2DDD5] dark:border-[#2D2925]"
                role="group"
                aria-label="Language toggle"
              >
                <button
                  type="button"
                  onClick={() => setLang('bn')}
                  aria-pressed={lang === 'bn'}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                    lang === 'bn'
                      ? 'bg-white dark:bg-[#2F2B26] text-[#171614] dark:text-[#F3EFE8] shadow-xs'
                      : 'text-[#5E5850] dark:text-[#B8B0A4] hover:text-[#171614] dark:hover:text-[#F3EFE8]'
                  }`}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  aria-pressed={lang === 'en'}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                    lang === 'en'
                      ? 'bg-white dark:bg-[#2F2B26] text-[#171614] dark:text-[#F3EFE8] shadow-xs'
                      : 'text-[#5E5850] dark:text-[#B8B0A4] hover:text-[#171614] dark:hover:text-[#F3EFE8]'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>

          {/* Collection Filter Tabs + Search + Sort Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E2DDD5] dark:border-[#2D2925]">
            <div
              className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#EFECE6] dark:bg-[#1E1B18] self-start overflow-x-auto max-w-full"
              role="tablist"
              aria-label="Product categories"
            >
              {(['all', 'shoes', 'watches', 'belts'] as Category[]).map(
                (cat) => {
                  const active = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 min-h-[38px] text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110]'
                          : 'text-[#4A453E] dark:text-[#C7BFB3] hover:text-[#171614] dark:hover:text-[#F3EFE8]'
                      }`}
                    >
                      {CATEGORY_LABELS[lang][cat]}
                    </button>
                  );
                },
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <CatalogSearchInput
                products={PRODUCTS}
                lang={lang}
                value={searchQuery}
                onChange={setSearchQuery}
              />

              <div className="inline-flex items-center gap-2 min-h-[40px] px-3 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#1A1816] focus-within:outline-2 focus-within:outline-[#8C6239] dark:focus-within:outline-[#D4A77A]">
                <label
                  htmlFor="catalog-sort"
                  className="text-xs text-[#5E5850] dark:text-[#9A9287] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t.sortByLabel}
                </label>
                <select
                  id="catalog-sort"
                  data-testid="catalog-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent py-2 pr-1 text-xs font-medium text-[#171614] dark:text-[#F3EFE8] focus:outline-none cursor-pointer"
                >
                  <option
                    value="featured"
                    className="bg-white dark:bg-[#1A1816] text-[#171614] dark:text-[#F3EFE8]"
                  >
                    {t.sortFeatured}
                  </option>
                  <option
                    value="newest"
                    className="bg-white dark:bg-[#1A1816] text-[#171614] dark:text-[#F3EFE8]"
                  >
                    {t.sortNewest}
                  </option>
                  <option
                    value="price-asc"
                    className="bg-white dark:bg-[#1A1816] text-[#171614] dark:text-[#F3EFE8]"
                  >
                    {t.sortLowHigh}
                  </option>
                  <option
                    value="price-desc"
                    className="bg-white dark:bg-[#1A1816] text-[#171614] dark:text-[#F3EFE8]"
                  >
                    {t.sortHighLow}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {visibleProducts.length === 0 ? (
            <div className="py-16 px-6 rounded-lg border border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6]/40 dark:bg-[#1A1816] text-center">
              <h3 className="text-lg font-semibold text-[#171614] dark:text-[#F3EFE8]">
                {t.noResultsTitle}
              </h3>
              <p className="text-sm text-[#5E5850] dark:text-[#B8B0A4] mt-1.5">
                {t.noResultsDesc}
              </p>
              <button
                type="button"
                onClick={() => {
                  setCategory('all');
                  setSearchQuery('');
                  setSortBy('featured');
                }}
                className="mt-5 px-5 py-2.5 min-h-[42px] rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-xs font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] cursor-pointer"
              >
                {t.resetFilters}
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#5E5850] dark:text-[#9A9287] mb-5 tabular-nums">
                {visibleProducts.length} {t.showingCount}
              </p>
              <div
                data-testid="product-grid"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
              >
                {visibleProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    lang={lang}
                    index={index}
                    isWishlisted={wishlistIds.includes(product.id)}
                    isCompared={compareIds.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onToggleCompare={handleToggleCompare}
                    onInspect={handleInspectProduct}
                    onQuickAdd={handleQuickAdd}
                    onBuyNow={(p) => handleBuyNow(p)}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Section 3: Facebook Origins & Craftsmanship Story */}
        <StorySection lang={lang} />

        {/* Section 4: Frequently Asked Questions (Care, Delivery & Returns) */}
        <FAQSection lang={lang} />

        {/* Section 5: Recently Viewed Products Horizontal Bar */}
        <RecentlyViewedBar
          items={recentlyViewedProducts}
          lang={lang}
          onInspect={handleInspectProduct}
          onQuickAdd={handleQuickAdd}
          onClear={() => setRecentlyViewedIds([])}
        />
      </main>

      {/* Section 4: Editorial Footer */}
      <Footer
        lang={lang}
        subscribedEmail={subscribedEmail}
        onSubscribeEmail={handleSubscribeEmail}
        onResetSubscription={handleResetSubscription}
        onSelectCategory={(cat) => setCategory(cat)}
        onOpenOrderTracker={() => setIsTrackerOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={activeProduct}
        allProducts={PRODUCTS}
        lang={lang}
        isWishlisted={
          activeProduct ? wishlistIds.includes(activeProduct.id) : false
        }
        reviews={activeProduct ? reviewsByProduct[activeProduct.id] ?? [] : []}
        priceAlert={
          activeProduct
            ? priceAlertsByProduct[activeProduct.id] ?? null
            : null
        }
        onSavePriceAlert={handleSavePriceAlert}
        onRemovePriceAlert={handleRemovePriceAlert}
        onToggleWishlist={handleToggleWishlist}
        onSubmitReview={handleSubmitReview}
        onClose={() => setActiveProduct(null)}
        onAddToBag={handleAddToBag}
        onBuyNow={handleBuyNow}
        onSelectProduct={handleInspectProduct}
      />

      {/* Slide-Over Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        lang={lang}
        items={wishlistProducts}
        onClose={() => setIsWishlistOpen(false)}
        onRemoveItem={(productId) =>
          setWishlistIds((prev) => prev.filter((id) => id !== productId))
        }
        onClearAll={() => setWishlistIds([])}
        onInspectProduct={handleInspectProduct}
        onAddToBag={handleQuickAdd}
      />

      {/* Slide-Over Shopping Bag & Checkout Drawer */}
      <CartCheckoutDrawer
        isOpen={isBagOpen}
        isDirectCheckout={directCheckoutItem !== null}
        lang={lang}
        cart={drawerItems}
        totals={drawerTotals}
        deliveryZone={deliveryZone}
        giftWrapping={giftWrapping}
        discountCode={discountCode}
        onChangeDeliveryZone={setDeliveryZone}
        onChangeGiftWrapping={setGiftWrapping}
        onChangeDiscountCode={setDiscountCode}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOrderConfirmed={handleOrderConfirmed}
        onOpenOrderTracker={() => setIsTrackerOpen(true)}
        onClose={() => {
          setIsBagOpen(false);
          setDirectCheckoutItem(null);
        }}
      />

      {/* Order Tracking Overlay */}
      <OrderTrackingPage
        isOpen={isTrackerOpen}
        lang={lang}
        userOrders={orders}
        pastOrders={pastOrders}
        onClose={() => setIsTrackerOpen(false)}
      />

      {/* Side-by-Side Comparison Dock & Modal */}
      {!isCompareOpen && (
        <CompareTray
          items={compareProducts}
          lang={lang}
          onRemoveItem={(productId) =>
            setCompareIds((prev) => prev.filter((id) => id !== productId))
          }
          onClearAll={() => {
            setCompareIds([]);
            setIsCompareOpen(false);
          }}
          onOpenCompare={() => setIsCompareOpen(true)}
        />
      )}

      <ComparisonModal
        isOpen={isCompareOpen}
        items={compareProducts}
        lang={lang}
        onClose={() => setIsCompareOpen(false)}
        onInspectProduct={handleInspectProduct}
        onAddToBag={handleQuickAdd}
      />

      {/* Floating WhatsApp Quick-Inquiry Action Button */}
      <WhatsAppFab lang={lang} />

      {/* 10s Inactivity Email Newsletter Overlay */}
      <EmailNewsletterOverlay
        isOpen={isNewsletterOpen}
        lang={lang}
        subscribedEmail={subscribedEmail}
        onSubscribe={handleSubscribeEmail}
        onDismiss={handleDismissNewsletter}
      />

      {/* Non-blocking Bag Addition Toast */}
      <BagToast
        toast={isBagOpen ? null : bagToast}
        lang={lang}
        onViewBag={() => {
          setDirectCheckoutItem(null);
          setBagToast(null);
          setIsBagOpen(true);
        }}
        onDismiss={() => setBagToast(null)}
      />
    </div>
  );
}
