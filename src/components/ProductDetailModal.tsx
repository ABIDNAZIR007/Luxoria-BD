import {
  ArrowUpRight,
  Bell,
  BellRing,
  Camera,
  Check,
  ChevronDown,
  ExternalLink,
  Facebook,
  Heart,
  Link2,
  Maximize2,
  Minus,
  Plus,
  Ruler,
  Share2,
  Star,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { COPY, PRODUCT_CATEGORY_LABELS } from '../data/i18n';
import { FACEBOOK_SHARE_URL, PRODUCTS } from '../data/products';
import type {
  Language,
  PriceDropAlertPreference,
  Product,
  ProductReview,
} from '../types/store';
import {
  buildFacebookShareUrl,
  buildNativeSharePayload,
  buildProductShareUrl,
  calculateZoomOrigin,
  computeModalScrollTargetTop,
  DEFAULT_ZOOM_VIEW_SCALE,
  formatBDT,
  getRelatedProducts,
  getReviewSummary,
  stepZoomViewScale,
  validateCommunityEmail,
  validateProductReview,
  validateReviewImageFile,
  ZOOM_VIEW_LEVELS,
} from '../utils/storeLogic';
import { ProductVideo } from './ProductVideo';
import { ResilientImage } from './ResilientImage';
import { SizeGuideModal } from './SizeGuideModal';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onabort = () => reject(new Error('Aborted reading image file'));
    reader.onload = () => {
      if (typeof reader.result === 'string' && reader.result) {
        resolve(reader.result);
      } else {
        reject(new Error('Empty image data'));
      }
    };
    reader.readAsDataURL(file);
  });
}

async function readAndResizeReviewImage(file: File): Promise<string> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      const maxSide = 800;
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
      const targetHeight = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
        bitmap.close();
        return canvas.toDataURL('image/jpeg', 0.8);
      }
      bitmap.close();
    } catch {
      // Fall back to FileReader data URL when bitmap decoding fails
    }
  }
  return readFileAsDataUrl(file);
}

interface ProductDetailModalProps {
  product: Product | null;
  allProducts?: Product[];
  lang: Language;
  isWishlisted: boolean;
  reviews: ProductReview[];
  priceAlert?: PriceDropAlertPreference | null;
  onSavePriceAlert?: (product: Product, email: string) => void;
  onRemovePriceAlert?: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  onSubmitReview: (
    productId: string,
    input: {
      rating: number;
      comment: string;
      authorName?: string;
      imageDataUrl?: string;
    },
  ) => void;
  onClose: () => void;
  onAddToBag: (product: Product, variant: string, quantity: number) => void;
  onBuyNow: (product: Product, variant: string, quantity: number) => void;
  onSelectProduct?: (product: Product) => void;
}

export function ProductDetailModal({
  product,
  allProducts = PRODUCTS,
  lang,
  isWishlisted,
  reviews,
  priceAlert = null,
  onSavePriceAlert,
  onRemovePriceAlert,
  onToggleWishlist,
  onSubmitReview,
  onClose,
  onAddToBag,
  onBuyNow,
  onSelectProduct,
}: ProductDetailModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const [draftRating, setDraftRating] = useState<number>(0);
  const [draftAuthor, setDraftAuthor] = useState('');
  const [draftComment, setDraftComment] = useState('');
  const [draftImageDataUrl, setDraftImageDataUrl] = useState<string | null>(
    null,
  );
  const [isReadingImage, setIsReadingImage] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSaved, setReviewSaved] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<'shared' | 'copied' | null>(
    null,
  );
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState<{
    xPercent: number;
    yPercent: number;
  }>({ xPercent: 50, yPercent: 50 });
  const [isZoomViewOpen, setIsZoomViewOpen] = useState(false);
  const [zoomViewScale, setZoomViewScale] = useState<number>(
    DEFAULT_ZOOM_VIEW_SCALE,
  );
  const [isPriceAlertOpen, setIsPriceAlertOpen] = useState(false);
  const [priceAlertEmail, setPriceAlertEmail] = useState('');
  const [priceAlertError, setPriceAlertError] = useState<string | null>(null);
  const [isEditingPriceAlert, setIsEditingPriceAlert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const zoomScrollRef = useRef<HTMLDivElement>(null);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants[0] ?? 'Standard');
      setQuantity(1);
      setAdded(false);
      setDraftRating(0);
      setDraftAuthor('');
      setDraftComment('');
      setDraftImageDataUrl(null);
      setIsReadingImage(false);
      setLightboxImage(null);
      setReviewError(null);
      setReviewSaved(false);
      setIsSizeGuideOpen(false);
      setLinkCopied(false);
      setShareFeedback(null);
      setIsImageZoomed(false);
      setZoomOrigin({ xPercent: 50, yPercent: 50 });
      setIsZoomViewOpen(false);
      setZoomViewScale(DEFAULT_ZOOM_VIEW_SCALE);
      setIsPriceAlertOpen(false);
      setPriceAlertEmail(priceAlert?.email ?? '');
      setPriceAlertError(null);
      setIsEditingPriceAlert(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product]);

  useEffect(() => {
    if (!isZoomViewOpen || !zoomScrollRef.current) return;
    const container = zoomScrollRef.current;
    const frameId = window.requestAnimationFrame(() => {
      container.scrollLeft = Math.max(
        0,
        (container.scrollWidth - container.clientWidth) / 2,
      );
      container.scrollTop = Math.max(
        0,
        (container.scrollHeight - container.clientHeight) / 2,
      );
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [isZoomViewOpen]);

  useEffect(() => {
    if (!product || isSizeGuideOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZoomViewOpen) {
          setIsZoomViewOpen(false);
        } else if (lightboxImage) {
          setLightboxImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, isSizeGuideOpen, isZoomViewOpen, lightboxImage, onClose]);

  if (!product) {
    return null;
  }

  const t = COPY[lang];
  const title = lang === 'bn' ? product.nameBn : product.nameEn;
  const subtitle = lang === 'bn' ? product.subtitleBn : product.subtitleEn;
  const description =
    lang === 'bn' ? product.descriptionBn : product.descriptionEn;
  const categoryLabel = PRODUCT_CATEGORY_LABELS[lang][product.category];
  const variantLabel =
    lang === 'bn' ? product.variantLabelBn : product.variantLabelEn;
  const availability =
    lang === 'bn' ? product.availabilityBn : product.availabilityEn;

  const handleAdd = () => {
    onAddToBag(product, selectedVariant, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  const productShareUrl = buildProductShareUrl(
    window.location.origin,
    window.location.pathname,
    product.id,
  );
  const facebookShareHref = buildFacebookShareUrl(
    productShareUrl,
    `${title} — Luxuria BD (${formatBDT(product.price)})`,
  );

  const copyTextToClipboard = async (value: string): Promise<boolean> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch {
      // Fall back to temporary input selection
    }
    const tempInput = document.createElement('input');
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(tempInput);
    }
  };

  const handleCopyLink = async () => {
    const copied = await copyTextToClipboard(productShareUrl);
    if (copied) {
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    const payload = buildNativeSharePayload(product, productShareUrl, lang);
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
    };

    if (typeof nav.share === 'function') {
      try {
        await nav.share(payload);
        setShareFeedback('shared');
        window.setTimeout(() => setShareFeedback(null), 2200);
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        // Fall back to clipboard copy if navigator.share rejects for non-abort reasons
      }
    }

    const copied = await copyTextToClipboard(productShareUrl);
    if (copied) {
      setShareFeedback('copied');
      window.setTimeout(() => setShareFeedback(null), 2200);
    }
  };

  const handlePriceAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateCommunityEmail(priceAlertEmail, lang);
    if (error) {
      setPriceAlertError(error);
      return;
    }
    setPriceAlertError(null);
    onSavePriceAlert?.(product, priceAlertEmail.trim().toLowerCase());
    setPriceAlertEmail(priceAlertEmail.trim().toLowerCase());
    setIsEditingPriceAlert(false);
    setIsPriceAlertOpen(true);
  };

  const handleScrollToReviews = () => {
    const container = modalScrollRef.current;
    const target = reviewsSectionRef.current;
    if (!container || !target) return;

    const targetTop = computeModalScrollTargetTop(
      container.scrollTop,
      container.getBoundingClientRect().top,
      target.getBoundingClientRect().top,
      8,
    );
    const prefersReduced =
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

    container.scrollTo({
      top: targetTop,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  };

  const reviewSummary = getReviewSummary(reviews);
  const relatedProducts = getRelatedProducts(product, allProducts, 3);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageError = validateReviewImageFile(
      { type: file.type, size: file.size },
      lang,
    );
    if (imageError) {
      setReviewError(imageError);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setReviewError(null);
    setIsReadingImage(true);
    try {
      const dataUrl = await readAndResizeReviewImage(file);
      setDraftImageDataUrl(dataUrl);
    } catch {
      setReviewError(
        lang === 'bn'
          ? 'ছবিটি লোড করা যায়নি। অনুগ্রহ করে অন্য ছবি চেষ্টা করুন।'
          : 'Could not read that image. Please try another photo.',
      );
    } finally {
      setIsReadingImage(false);
    }
  };

  const handleRemoveDraftImage = () => {
    setDraftImageDataUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateProductReview(
      draftRating,
      draftComment,
      lang,
    );
    if (validationError) {
      setReviewError(validationError);
      setReviewSaved(false);
      return;
    }

    onSubmitReview(product.id, {
      rating: draftRating,
      comment: draftComment,
      authorName: draftAuthor,
      imageDataUrl: draftImageDataUrl ?? undefined,
    });
    setDraftRating(0);
    setDraftAuthor('');
    setDraftComment('');
    setDraftImageDataUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setReviewError(null);
    setReviewSaved(true);
    window.setTimeout(() => setReviewSaved(false), 2400);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#171614]/60 dark:bg-black/75 backdrop-blur-[2px]"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdp-modal-title"
      >
      <div
        ref={modalScrollRef}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#F8F7F4] dark:bg-[#161412] border border-[#E2DDD5] dark:border-[#2D2925] rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.closeLabel}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-md bg-[#F8F7F4]/90 dark:bg-[#23201D]/95 border border-[#D8D1C7] dark:border-[#3A3530] flex items-center justify-center text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#2F2B26] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A]"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left: Product Photography with Hover-to-Zoom */}
          <div className="md:col-span-6 bg-[#EFECE6] dark:bg-[#1E1B18] p-6 flex flex-col items-center justify-center gap-3 border-b md:border-b-0 md:border-r border-[#E2DDD5] dark:border-[#2D2925]">
            <div
              data-testid="pdp-image-zoom-stage"
              data-zoomed={isImageZoomed ? 'true' : 'false'}
              onMouseEnter={(e) => {
                const origin = calculateZoomOrigin({
                  clientX: e.clientX,
                  clientY: e.clientY,
                  rect: e.currentTarget.getBoundingClientRect(),
                });
                setZoomOrigin(origin);
                setIsImageZoomed(true);
              }}
              onMouseMove={(e) => {
                const origin = calculateZoomOrigin({
                  clientX: e.clientX,
                  clientY: e.clientY,
                  rect: e.currentTarget.getBoundingClientRect(),
                });
                setZoomOrigin(origin);
                if (!isImageZoomed) {
                  setIsImageZoomed(true);
                }
              }}
              onMouseLeave={() => {
                setIsImageZoomed(false);
                setZoomOrigin({ xPercent: 50, yPercent: 50 });
              }}
              onClick={(e) => {
                const origin = calculateZoomOrigin({
                  clientX: e.clientX,
                  clientY: e.clientY,
                  rect: e.currentTarget.getBoundingClientRect(),
                });
                setZoomOrigin(origin);
                setIsImageZoomed((prev) => !prev);
              }}
              className={`relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-[#E2DDD5] dark:border-[#2D2925] bg-[#F8F7F4] dark:bg-[#161412] select-none ${
                isImageZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
              }`}
            >
              <div
                className="w-full h-full transition-[transform] duration-200 ease-out motion-reduce:transition-none will-change-transform"
                style={{
                  transformOrigin: `${zoomOrigin.xPercent}% ${zoomOrigin.yPercent}%`,
                  transform: isImageZoomed ? 'scale(2.2)' : 'scale(1)',
                }}
              >
                <ResilientImage
                  src={product.image}
                  alt={title}
                  fallbackTitle={title}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
            </div>

            <div className="w-full flex flex-wrap items-center justify-between gap-2.5 text-xs text-[#5E5850] dark:text-[#9A9287]">
              <span className="inline-flex items-center gap-1.5 min-w-0 flex-1">
                <ZoomIn className="w-3.5 h-3.5 shrink-0 text-[#8C6239] dark:text-[#D4A77A]" aria-hidden="true" />
                <span className="truncate">
                  {isImageZoomed ? t.zoomHintActive : t.zoomHintIdle}
                </span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setZoomOrigin({ xPercent: 50, yPercent: 50 });
                    setIsImageZoomed((prev) => !prev);
                  }}
                  aria-pressed={isImageZoomed}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[34px] rounded border border-[#D8D1C7] dark:border-[#3A3530] bg-[#F8F7F4] dark:bg-[#161412] text-[11px] font-medium text-[#171614] dark:text-[#F3EFE8] hover:bg-white dark:hover:bg-[#23201D] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A]"
                >
                  {isImageZoomed ? (
                    <ZoomOut className="w-3 h-3" aria-hidden="true" />
                  ) : (
                    <ZoomIn className="w-3 h-3" aria-hidden="true" />
                  )}
                  <span>{t.zoomToggleBtn}</span>
                </button>
                <button
                  type="button"
                  data-testid="pdp-zoom-view-btn"
                  onClick={() => {
                    setZoomViewScale(DEFAULT_ZOOM_VIEW_SCALE);
                    setIsZoomViewOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-[11px] font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A]"
                >
                  <Maximize2 className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span>{t.zoomViewBtn}</span>
                </button>
              </div>
            </div>

            <ProductVideo product={product} lang={lang} />
          </div>

          {/* Right: Contiguous Purchase Module */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#5E5850] dark:text-[#9A9287] mb-2 pr-10">
                <span>{categoryLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{product.sku}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#8C6239] dark:text-[#D4A77A] font-medium">
                  {availability}
                </span>
              </div>

              <h2
                id="pdp-modal-title"
                className="font-display text-2xl sm:text-3xl font-semibold text-[#171614] dark:text-[#F3EFE8] leading-tight"
              >
                {title}
              </h2>
              <p className="text-sm text-[#5E5850] dark:text-[#B8B0A4] mt-1">
                {subtitle}
              </p>

              {/* Interactive Rating Summary & Smooth Scroll-to-Reviews Control */}
              <div className="mt-2.5">
                <button
                  type="button"
                  data-testid="pdp-rating-scroll-btn"
                  onClick={handleScrollToReviews}
                  aria-label={t.scrollToReviewsAriaLabel}
                  className="group -mx-1.5 px-1.5 py-1 min-h-[34px] rounded-md inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#4A453E] dark:text-[#C7BFB3] hover:bg-[#EFECE6]/75 dark:hover:bg-[#23201D] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A]"
                >
                  <span className="inline-flex items-center gap-0.5" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((starIndex) => {
                      const filled =
                        reviewSummary.count > 0 &&
                        starIndex <= Math.round(reviewSummary.averageRating);
                      return (
                        <Star
                          key={starIndex}
                          className={`w-3.5 h-3.5 ${
                            filled
                              ? 'fill-current text-[#8C6239] dark:text-[#D4A77A]'
                              : 'text-[#C2BAB0] dark:text-[#5E5850]'
                          }`}
                        />
                      );
                    })}
                  </span>

                  {reviewSummary.count > 0 ? (
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                      <span className="font-semibold text-[#171614] dark:text-[#F3EFE8]">
                        {reviewSummary.averageRating.toFixed(1)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {reviewSummary.count} {t.reviewsCountSuffix}
                      </span>
                    </span>
                  ) : (
                    <span>{t.noReviewsHeaderLabel}</span>
                  )}

                  <span aria-hidden="true" className="text-[#B8B0A4] dark:text-[#5E5850]">
                    ·
                  </span>

                  <span className="inline-flex items-center gap-1 font-medium text-[#8C6239] dark:text-[#D4A77A] group-hover:underline underline-offset-4 whitespace-nowrap">
                    <span>
                      {reviewSummary.count > 0
                        ? t.scrollToReviewsBtn
                        : t.writeFirstReviewCta}
                    </span>
                    <ChevronDown
                      className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-y-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </button>
              </div>

              <div className="mt-3.5 flex items-baseline gap-3 tabular-nums">
                <span className="text-2xl font-semibold text-[#171614] dark:text-[#F3EFE8]">
                  {formatBDT(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-[#7B746B] dark:text-[#8E867B] line-through">
                    {formatBDT(product.compareAtPrice)}
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#4A453E] dark:text-[#C7BFB3]">
                {description}
              </p>

              {/* Variant / Size Selector */}
              <div className="mt-6">
                <div className="flex items-center justify-between gap-3 text-xs font-medium text-[#171614] dark:text-[#F3EFE8] mb-2.5">
                  <span>{variantLabel}</span>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8C6239] dark:text-[#D4A77A] hover:text-[#171614] dark:hover:text-[#F3EFE8] underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A] rounded-sm px-1 py-0.5"
                  >
                    <Ruler className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{t.sizeGuideButton}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariant === variant;
                    return (
                      <button
                        key={variant}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        aria-pressed={isSelected}
                        className={`px-3.5 py-2 min-h-[40px] rounded-md text-xs font-medium border transition-colors duration-100 whitespace-nowrap cursor-pointer ${
                          isSelected
                            ? 'bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] border-[#171614] dark:border-[#F3EFE8]'
                            : 'bg-[#F8F7F4] dark:bg-[#1E1B18] text-[#171614] dark:text-[#F3EFE8] border-[#D8D1C7] dark:border-[#3A3530] hover:border-[#8C6239] dark:hover:border-[#D4A77A]'
                        }`}
                      >
                        {variant}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity, Add to Bag & Direct Buy Now */}
              <div className="mt-6 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div
                    className="inline-flex items-center border border-[#D8D1C7] dark:border-[#3A3530] rounded-md bg-[#F8F7F4] dark:bg-[#1E1B18]"
                    aria-label={t.quantityLabel}
                  >
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      className="w-10 h-11 flex items-center justify-center text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#2A2622] cursor-pointer"
                    >
                      <Minus className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <span className="w-9 text-center text-sm font-medium text-[#171614] dark:text-[#F3EFE8] tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      aria-label="Increase quantity"
                      className="w-10 h-11 flex items-center justify-center text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#2A2622] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAdd}
                    className={`flex-1 min-h-[44px] px-5 py-2.5 rounded-md text-sm font-medium inline-flex items-center justify-center gap-2 border transition-colors whitespace-nowrap cursor-pointer ${
                      added
                        ? 'bg-[#2E5A36] border-[#2E5A36] text-white'
                        : 'border-[#171614] dark:border-[#F3EFE8] bg-transparent text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D]'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4" aria-hidden="true" />
                        <span>{t.addedFeedback}</span>
                      </>
                    ) : (
                      <span>
                        {t.addToBagCta} — {formatBDT(product.price * quantity)}
                      </span>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onBuyNow(product, selectedVariant, quantity)}
                  className="w-full min-h-[44px] px-5 py-2.5 rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-sm font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A]"
                >
                  <span>
                    {t.buyNowCta} — {formatBDT(product.price * quantity)}
                  </span>
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => onToggleWishlist(product.id)}
                  aria-pressed={isWishlisted}
                  className={`min-h-[40px] px-4 py-2 rounded-md border text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isWishlisted
                      ? 'bg-[#EFECE6] dark:bg-[#26231F] border-[#8C6239] dark:border-[#D4A77A] text-[#171614] dark:text-[#F3EFE8]'
                      : 'border-[#D8D1C7] dark:border-[#3A3530] text-[#4A453E] dark:text-[#C7BFB3] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] hover:text-[#171614] dark:hover:text-[#F3EFE8]'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current text-[#8C6239] dark:text-[#D4A77A]' : ''}`}
                    aria-hidden="true"
                  />
                  <span>
                    {isWishlisted ? t.savedLabel : t.saveToWishlist}
                  </span>
                </button>

                <a
                  href={FACEBOOK_SHARE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[40px] px-4 py-2 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] text-xs font-medium text-[#4A453E] dark:text-[#C7BFB3] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] hover:text-[#171614] dark:hover:text-[#F3EFE8] inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>{t.messengerOrderCta}</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>

              {/* Price Drop Alert Trigger & Inline Form */}
              <div className="mt-2.5">
                <button
                  type="button"
                  data-testid="pdp-price-alert-btn"
                  aria-expanded={isPriceAlertOpen}
                  onClick={() => {
                    setIsPriceAlertOpen((prev) => !prev);
                    setPriceAlertError(null);
                    if (priceAlert && !priceAlertEmail) {
                      setPriceAlertEmail(priceAlert.email);
                    }
                  }}
                  className={`w-full min-h-[40px] px-4 py-2 rounded-md border text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A] ${
                    priceAlert
                      ? 'bg-[#EFECE6] dark:bg-[#26231F] border-[#8C6239] dark:border-[#D4A77A] text-[#171614] dark:text-[#F3EFE8]'
                      : 'border-[#D8D1C7] dark:border-[#3A3530] bg-transparent text-[#4A453E] dark:text-[#C7BFB3] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] hover:text-[#171614] dark:hover:text-[#F3EFE8]'
                  }`}
                >
                  {priceAlert ? (
                    <BellRing
                      className="w-3.5 h-3.5 shrink-0 text-[#8C6239] dark:text-[#D4A77A]"
                      aria-hidden="true"
                    />
                  ) : (
                    <Bell className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate">
                    {priceAlert ? t.priceDropAlertActiveBtn : t.priceDropAlertBtn}
                  </span>
                </button>

                {isPriceAlertOpen && (
                  <div
                    data-testid="pdp-price-alert-panel"
                    className="mt-2.5 p-3.5 rounded-lg border border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6]/55 dark:bg-[#161412]"
                  >
                    <p className="text-xs font-semibold text-[#171614] dark:text-[#F3EFE8]">
                      {t.priceDropAlertTitle}
                    </p>
                    <p className="text-[11px] text-[#5E5850] dark:text-[#9A9287] mt-1 leading-relaxed tabular-nums">
                      {t.priceDropAlertHintPrefix} {formatBDT(product.price)}
                      {t.priceDropAlertHintSuffix}
                    </p>

                    {priceAlert && !isEditingPriceAlert ? (
                      <div
                        data-testid="pdp-price-alert-saved"
                        className="mt-3 space-y-2.5"
                      >
                        <div className="flex items-start gap-2 text-xs text-[#2E5A36] dark:text-[#6EE7B7]">
                          <Check
                            className="w-3.5 h-3.5 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <span>{t.priceDropAlertSavedPrefix} </span>
                            <span className="font-medium text-[#171614] dark:text-[#F3EFE8] break-all">
                              {priceAlert.email}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPriceAlertEmail(priceAlert.email);
                              setPriceAlertError(null);
                              setIsEditingPriceAlert(true);
                            }}
                            className="min-h-[34px] px-3 py-1.5 rounded border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#1E1B18] text-[11px] font-medium text-[#171614] dark:text-[#F3EFE8] hover:bg-[#F8F7F4] dark:hover:bg-[#23201D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            {t.priceDropAlertUpdateBtn}
                          </button>
                          <button
                            type="button"
                            data-testid="pdp-price-alert-remove"
                            onClick={() => {
                              onRemovePriceAlert?.(product.id);
                              setPriceAlertEmail('');
                              setPriceAlertError(null);
                              setIsEditingPriceAlert(false);
                            }}
                            className="min-h-[34px] px-3 py-1.5 rounded border border-[#D8D1C7] dark:border-[#3A3530] bg-transparent text-[11px] font-medium text-[#5E5850] dark:text-[#B8B0A4] hover:text-[#9E2A2B] dark:hover:text-[#F87171] hover:border-[#9E2A2B]/40 dark:hover:border-[#F87171]/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            {t.priceDropAlertRemoveBtn}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form
                        onSubmit={handlePriceAlertSubmit}
                        noValidate
                        className="mt-3 space-y-2"
                      >
                        <label
                          htmlFor="pdp-price-alert-email"
                          className="sr-only"
                        >
                          {t.priceDropAlertEmailLabel}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            id="pdp-price-alert-email"
                            data-testid="pdp-price-alert-email"
                            type="email"
                            value={priceAlertEmail}
                            onChange={(e) => {
                              setPriceAlertEmail(e.target.value);
                              if (priceAlertError) setPriceAlertError(null);
                            }}
                            placeholder={t.priceDropAlertEmailPlaceholder}
                            className="flex-1 min-w-0 min-h-[38px] px-3 py-1.5 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#1E1B18] text-xs text-[#171614] dark:text-[#F3EFE8] placeholder:text-[#8E867B] dark:placeholder:text-[#7B746B] focus:outline-none focus:border-[#8C6239] dark:focus:border-[#D4A77A]"
                          />
                          <button
                            type="submit"
                            data-testid="pdp-price-alert-submit"
                            className="min-h-[38px] px-4 py-1.5 rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-xs font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            {t.priceDropAlertSubmitBtn}
                          </button>
                        </div>
                        {priceAlertError && (
                          <p
                            data-testid="pdp-price-alert-error"
                            role="alert"
                            className="text-[11px] text-[#9E2A2B] dark:text-[#F87171]"
                          >
                            {priceAlertError}
                          </p>
                        )}
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* Social Media Share Actions */}
              <div className="mt-3 pt-3 border-t border-[#E2DDD5]/70 dark:border-[#2D2925] flex flex-wrap items-center justify-between gap-2.5">
                <span className="text-xs font-medium text-[#5E5850] dark:text-[#9A9287]">
                  {t.shareProductLabel}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    data-testid="pdp-native-share-btn"
                    onClick={handleNativeShare}
                    className={`min-h-[36px] px-3 py-1.5 rounded-md border text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A] ${
                      shareFeedback
                        ? 'bg-[#EFECE6] dark:bg-[#23201D] border-[#2E5A36] dark:border-[#6EE7B7] text-[#2E5A36] dark:text-[#6EE7B7]'
                        : 'border-[#171614] dark:border-[#F3EFE8] bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5]'
                    }`}
                  >
                    {shareFeedback ? (
                      <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    )}
                    <span>
                      {shareFeedback === 'shared'
                        ? t.shareCompletedFeedback
                        : shareFeedback === 'copied'
                          ? t.linkCopiedFeedback
                          : t.nativeShareBtn}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`min-h-[36px] px-3 py-1.5 rounded-md border text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      linkCopied
                        ? 'bg-[#EFECE6] dark:bg-[#23201D] border-[#2E5A36] dark:border-[#6EE7B7] text-[#2E5A36] dark:text-[#6EE7B7]'
                        : 'border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#1E1B18] text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#2A2622]'
                    }`}
                  >
                    {linkCopied ? (
                      <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <Link2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    )}
                    <span>
                      {linkCopied ? t.linkCopiedFeedback : t.copyLinkBtn}
                    </span>
                  </button>

                  <a
                    href={facebookShareHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[36px] px-3 py-1.5 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#1E1B18] text-xs font-medium text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#2A2622] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Facebook
                      className="w-3.5 h-3.5 text-[#8C6239] dark:text-[#D4A77A] shrink-0"
                      aria-hidden="true"
                    />
                    <span>{t.shareFacebookBtn}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Specifications Table */}
            {product.specs.length > 0 && (
              <dl className="pt-5 border-t border-[#E2DDD5] dark:border-[#2D2925] space-y-2.5 text-xs">
                {product.specs.map((spec) => (
                  <div
                    key={spec.labelEn}
                    className="flex items-start justify-between gap-4"
                  >
                    <dt className="text-[#5E5850] dark:text-[#9A9287]">
                      {lang === 'bn' ? spec.labelBn : spec.labelEn}
                    </dt>
                    <dd className="text-right font-medium text-[#171614] dark:text-[#F3EFE8]">
                      {lang === 'bn' ? spec.valueBn : spec.valueEn}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        {/* Ratings & Reviews Section */}
        <div
          id="pdp-reviews-section"
          ref={reviewsSectionRef}
          data-testid="pdp-reviews-section"
          className="border-t border-[#E2DDD5] dark:border-[#2D2925] p-6 sm:p-8 bg-[#EFECE6]/35 dark:bg-[#121110]/70"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
            <h3 className="font-display text-2xl font-semibold text-[#171614] dark:text-[#F3EFE8]">
              {t.reviewsHeading}
            </h3>
            {reviewSummary.count > 0 && (
              <div className="flex items-center gap-2 text-xs text-[#4A453E] dark:text-[#C7BFB3] tabular-nums">
                <Star
                  className="w-3.5 h-3.5 fill-current text-[#8C6239] dark:text-[#D4A77A]"
                  aria-hidden="true"
                />
                <span className="font-semibold text-[#171614] dark:text-[#F3EFE8]">
                  {reviewSummary.averageRating.toFixed(1)} / 5
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {reviewSummary.count} {t.reviewsCountSuffix}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            {/* Review Form */}
            <form
              onSubmit={handleReviewSubmit}
              noValidate
              className="md:col-span-5 space-y-3.5"
            >
              <div>
                <span className="block text-xs font-medium text-[#171614] dark:text-[#F3EFE8] mb-1.5">
                  {t.ratingLabel}
                </span>
                <div
                  className="inline-flex items-center gap-1"
                  role="group"
                  aria-label={t.ratingLabel}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = star <= draftRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setDraftRating(star);
                          if (reviewError) setReviewError(null);
                        }}
                        aria-pressed={draftRating === star}
                        aria-label={`${star} / 5`}
                        className="w-9 h-9 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#1E1B18] flex items-center justify-center hover:border-[#8C6239] dark:hover:border-[#D4A77A] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A]"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            filled
                              ? 'fill-current text-[#8C6239] dark:text-[#D4A77A]'
                              : 'text-[#B8B0A4] dark:text-[#5E5850]'
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="review-author"
                  className="block text-xs font-medium text-[#171614] dark:text-[#F3EFE8] mb-1"
                >
                  {t.reviewerNameLabel}
                </label>
                <input
                  id="review-author"
                  type="text"
                  value={draftAuthor}
                  onChange={(e) => setDraftAuthor(e.target.value)}
                  placeholder={t.reviewerNamePlaceholder}
                  className="w-full min-h-[40px] px-3 py-2 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#1A1816] text-xs text-[#171614] dark:text-[#F3EFE8] placeholder:text-[#7B746B] dark:placeholder:text-[#8E867B] focus:outline-2 focus:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A]"
                />
              </div>

              <div>
                <label
                  htmlFor="review-comment"
                  className="block text-xs font-medium text-[#171614] dark:text-[#F3EFE8] mb-1"
                >
                  {t.reviewTextLabel}
                </label>
                <textarea
                  id="review-comment"
                  rows={3}
                  value={draftComment}
                  onChange={(e) => {
                    setDraftComment(e.target.value);
                    if (reviewError) setReviewError(null);
                  }}
                  placeholder={t.reviewTextPlaceholder}
                  className="w-full px-3 py-2 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#1A1816] text-xs text-[#171614] dark:text-[#F3EFE8] placeholder:text-[#7B746B] dark:placeholder:text-[#8E867B] focus:outline-2 focus:outline-[#8C6239] dark:focus:outline-[#D4A77A]"
                />
              </div>

              <div>
                <label
                  htmlFor="review-photo-input"
                  className="block text-xs font-medium text-[#171614] dark:text-[#F3EFE8] mb-1.5"
                >
                  {t.reviewPhotoLabel}
                </label>
                <input
                  ref={fileInputRef}
                  id="review-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
                {draftImageDataUrl ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#1A1816]">
                    <img
                      src={draftImageDataUrl}
                      alt={t.reviewPhotoAlt}
                      className="w-14 h-14 rounded object-cover border border-[#E2DDD5] dark:border-[#2D2925] shrink-0"
                    />
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded border border-[#D8D1C7] dark:border-[#3A3530] text-[11px] font-medium text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] transition-colors cursor-pointer"
                      >
                        {t.reviewPhotoChangeBtn}
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveDraftImage}
                        className="px-2.5 py-1.5 rounded text-[11px] font-medium text-[#9E2A2B] dark:text-[#FCA5A5] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] transition-colors cursor-pointer"
                      >
                        {t.reviewPhotoRemoveBtn}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <button
                      type="button"
                      disabled={isReadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full min-h-[40px] px-3 py-2 rounded-md border border-dashed border-[#C9BFAF] dark:border-[#4A433B] bg-white/80 dark:bg-[#1A1816] text-xs font-medium text-[#4A453E] dark:text-[#C7BFB3] hover:border-[#8C6239] dark:hover:border-[#D4A77A] hover:text-[#171614] dark:hover:text-[#F3EFE8] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <Camera className="w-4 h-4 text-[#8C6239] dark:text-[#D4A77A] shrink-0" aria-hidden="true" />
                      <span>{t.reviewPhotoUploadBtn}</span>
                    </button>
                    <p className="text-[11px] text-[#7B746B] dark:text-[#8E867B]">
                      {t.reviewPhotoHint}
                    </p>
                  </div>
                )}
              </div>

              {reviewError && (
                <p className="text-xs text-[#9E2A2B] dark:text-[#FCA5A5]" role="alert">
                  {reviewError}
                </p>
              )}

              {reviewSaved && (
                <p className="text-xs text-[#2E5A36] dark:text-[#6EE7B7] font-medium">
                  {t.reviewSavedMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={isReadingImage}
                className="w-full min-h-[40px] px-4 py-2 rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-xs font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] transition-colors cursor-pointer disabled:opacity-60"
              >
                {t.submitReviewBtn}
              </button>
            </form>

            {/* Saved Reviews List */}
            <div className="md:col-span-7">
              {reviews.length === 0 ? (
                <div className="h-full min-h-[140px] flex items-center justify-center rounded-lg border border-dashed border-[#D8D1C7] dark:border-[#3A3530] bg-[#F8F7F4]/70 dark:bg-[#1A1816]/60 p-6 text-center text-xs text-[#5E5850] dark:text-[#9A9287]">
                  {t.noReviewsYet}
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {reviews.map((review) => (
                    <article
                      key={review.id}
                      className="p-4 rounded-lg border border-[#E2DDD5] dark:border-[#2D2925] bg-white dark:bg-[#1A1816] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold text-[#171614] dark:text-[#F3EFE8]">
                            {review.authorName || t.anonymousReviewer}
                          </span>
                          <span aria-hidden="true" className="text-[#B8B0A4] dark:text-[#5E5850]">
                            ·
                          </span>
                          <span
                            className="inline-flex items-center gap-0.5 text-[#8C6239] dark:text-[#D4A77A]"
                            aria-label={`${review.rating} / 5`}
                          >
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= review.rating
                                    ? 'fill-current text-[#8C6239] dark:text-[#D4A77A]'
                                    : 'text-[#DED7CC] dark:text-[#3A3530]'
                                }`}
                                aria-hidden="true"
                              />
                            ))}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#7B746B] dark:text-[#8E867B] tabular-nums">
                          {new Date(review.createdAt).toLocaleDateString(
                            lang === 'bn' ? 'bn-BD' : 'en-GB',
                            { day: 'numeric', month: 'short', year: 'numeric' },
                          )}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#4A453E] dark:text-[#C7BFB3]">
                        {review.comment}
                      </p>
                      {review.imageDataUrl && (
                        <button
                          type="button"
                          onClick={() => setLightboxImage(review.imageDataUrl!)}
                          aria-label={t.reviewPhotoAlt}
                          className="block w-24 h-24 rounded-md overflow-hidden border border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6] dark:bg-[#23201D] hover:opacity-90 transition-opacity cursor-pointer focus-visible:outline-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A]"
                        >
                          <img
                            src={review.imageDataUrl}
                            alt={t.reviewPhotoAlt}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* You Might Also Like Section */}
        {relatedProducts.length > 0 && (
          <section
            data-testid="related-products-section"
            aria-labelledby="pdp-related-heading"
            className="border-t border-[#E2DDD5] dark:border-[#2D2925] p-6 sm:p-8 bg-[#F8F7F4] dark:bg-[#161412]"
          >
            <div className="mb-5">
              <h3
                id="pdp-related-heading"
                className="font-display text-2xl font-semibold text-[#171614] dark:text-[#F3EFE8]"
              >
                {t.youMightAlsoLikeHeading}
              </h3>
              <p className="text-xs text-[#5E5850] dark:text-[#9A9287] mt-1">
                {t.youMightAlsoLikeSubheading}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedProducts.map((related) => {
                const relatedTitle =
                  lang === 'bn' ? related.nameBn : related.nameEn;
                const relatedSubtitle =
                  lang === 'bn' ? related.subtitleBn : related.subtitleEn;
                const relatedCategory =
                  PRODUCT_CATEGORY_LABELS[lang][related.category];
                return (
                  <button
                    key={related.id}
                    type="button"
                    data-testid={`related-product-card-${related.id}`}
                    onClick={() => onSelectProduct?.(related)}
                    className="group text-left rounded-lg border border-[#E2DDD5] dark:border-[#2D2925] bg-white dark:bg-[#1A1816] hover:border-[#8C6239] dark:hover:border-[#D4A77A] overflow-hidden flex flex-col transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A]"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-[#EFECE6] dark:bg-[#23201D] border-b border-[#E2DDD5]/70 dark:border-[#2D2925]">
                      <ResilientImage
                        src={related.image}
                        alt={relatedTitle}
                        fallbackTitle={relatedTitle}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#5E5850] dark:text-[#9A9287]">
                          <span className="font-medium text-[#8C6239] dark:text-[#D4A77A]">
                            {relatedCategory}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{relatedSubtitle}</span>
                        </div>
                        <h4 className="font-display text-base font-semibold text-[#171614] dark:text-[#F3EFE8] mt-1 leading-snug line-clamp-1 group-hover:text-[#8C6239] dark:group-hover:text-[#D4A77A] transition-colors">
                          {relatedTitle}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#EFECE6] dark:border-[#25221E]">
                        <div className="flex items-baseline gap-2 tabular-nums">
                          <span className="text-sm font-semibold text-[#171614] dark:text-[#F3EFE8]">
                            {formatBDT(related.price)}
                          </span>
                          {related.compareAtPrice && (
                            <span className="text-[11px] text-[#7B746B] dark:text-[#8E867B] line-through">
                              {formatBDT(related.compareAtPrice)}
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5E5850] dark:text-[#B8B0A4] group-hover:text-[#8C6239] dark:group-hover:text-[#D4A77A] transition-colors shrink-0">
                          <span>{t.viewDetails}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>

    <SizeGuideModal
      isOpen={isSizeGuideOpen}
      lang={lang}
      productCategory={product.category}
      selectedVariant={selectedVariant}
      onSelectSize={(size) => setSelectedVariant(size)}
      onClose={() => setIsSizeGuideOpen(false)}
    />

    {isZoomViewOpen && (
      <div
        data-testid="pdp-zoom-view-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdp-zoom-view-title"
        className="fixed inset-0 z-[70] flex flex-col bg-[#11100E]/96 backdrop-blur-sm text-[#F3EFE8]"
        onClick={() => setIsZoomViewOpen(false)}
      >
        {/* Top Inspection Toolbar */}
        <div
          className="px-4 sm:px-6 py-3.5 border-b border-[#2D2925] bg-[#161412]/95 flex flex-wrap items-center justify-between gap-3 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#D4A77A]">
              {t.zoomViewTitle}
            </p>
            <h3
              id="pdp-zoom-view-title"
              className="font-display text-lg sm:text-xl font-semibold text-[#F3EFE8] truncate"
            >
              {title}{' '}
              <span className="text-xs font-sans font-normal text-[#9A9287]">
                · {lang === 'bn' ? product.materialBn : product.materialEn}
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              className="inline-flex items-center p-1 rounded-md border border-[#3A3530] bg-[#1C1A17]"
              role="group"
              aria-label={t.zoomViewTitle}
            >
              <button
                type="button"
                data-testid="pdp-zoom-view-out"
                disabled={zoomViewScale <= ZOOM_VIEW_LEVELS[0]}
                onClick={() =>
                  setZoomViewScale((s) => stepZoomViewScale(s, 'out'))
                }
                aria-label={t.zoomViewZoomOut}
                className="w-8 h-8 rounded flex items-center justify-center text-[#F3EFE8] hover:bg-[#2A2622] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ZoomOut className="w-4 h-4" aria-hidden="true" />
              </button>

              <div className="flex items-center gap-0.5 px-1">
                {ZOOM_VIEW_LEVELS.map((level) => {
                  const active = zoomViewScale === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setZoomViewScale(level)}
                      aria-pressed={active}
                      className={`px-2 py-1 min-h-[28px] rounded text-[11px] font-mono tabular-nums transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#D4A77A] text-[#121110] font-semibold'
                          : 'text-[#C7BFB3] hover:text-white hover:bg-[#2A2622]'
                      }`}
                    >
                      {level.toFixed(1)}×
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                data-testid="pdp-zoom-view-in"
                disabled={
                  zoomViewScale >= ZOOM_VIEW_LEVELS[ZOOM_VIEW_LEVELS.length - 1]
                }
                onClick={() =>
                  setZoomViewScale((s) => stepZoomViewScale(s, 'in'))
                }
                aria-label={t.zoomViewZoomIn}
                className="w-8 h-8 rounded flex items-center justify-center text-[#F3EFE8] hover:bg-[#2A2622] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ZoomIn className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              data-testid="pdp-zoom-view-close"
              onClick={() => setIsZoomViewOpen(false)}
              aria-label={t.closeLabel}
              className="w-10 h-10 rounded-md border border-[#3A3530] bg-[#1C1A17] text-[#F3EFE8] hover:bg-[#2A2622] flex items-center justify-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#D4A77A]"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* High-Resolution Scrollable Texture Canvas */}
        <div
          ref={zoomScrollRef}
          data-testid="pdp-zoom-view-scroll-container"
          className="flex-1 overflow-auto p-4 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            data-testid="pdp-zoom-view-canvas"
            style={{ width: `${Math.round(zoomViewScale * 720)}px` }}
            className="mx-auto aspect-[4/3] max-w-none rounded-lg overflow-hidden border border-[#3A3530] bg-[#1C1A17] shadow-2xl"
          >
            <ResilientImage
              src={product.image}
              alt={`${title} — ${t.zoomViewTitle}`}
              fallbackTitle={title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Quiet Footer Caption */}
        <div
          className="px-4 sm:px-6 py-2.5 border-t border-[#2D2925] bg-[#161412]/95 flex flex-wrap items-center justify-between gap-2 text-xs text-[#B8B0A4] shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <span>{t.zoomViewHint}</span>
          <span className="font-mono tabular-nums text-[#D4A77A]">
            {Math.round(zoomViewScale * 100)}% · {Math.round(zoomViewScale * 720)}px
          </span>
        </div>
      </div>
    )}

    {lightboxImage && (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        aria-label={t.reviewPhotoAlt}
        onClick={() => setLightboxImage(null)}
      >
        <div
          className="relative max-w-xl w-full rounded-xl overflow-hidden bg-[#161412] border border-[#2D2925] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            aria-label={t.closeLabel}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#161412]/90 border border-[#3A3530] text-[#F3EFE8] hover:bg-[#23201D] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
          <img
            src={lightboxImage}
            alt={t.reviewPhotoAlt}
            className="w-full max-h-[75vh] object-contain"
          />
        </div>
      </div>
    )}
  </>
  );
}
