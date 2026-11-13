import { Check, Heart, Plus, Scale, ZoomIn } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import {
  COPY,
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_TAG_LABELS,
} from '../data/i18n';
import type { Language, Product, ProductTag } from '../types/store';
import {
  calculateZoomOrigin,
  formatBDT,
  getProductTags,
  getQuickViewTextureCue,
  QUICK_VIEW_ZOOM_SCALE,
} from '../utils/storeLogic';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
  lang: Language;
  index?: number;
  isWishlisted: boolean;
  isCompared: boolean;
  onToggleWishlist: (productId: string) => void;
  onToggleCompare: (productId: string) => void;
  onInspect: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

const TAG_BADGE_STYLES: Record<ProductTag, string> = {
  'New Arrival':
    'bg-[#171614]/92 text-[#F8F7F4] border-[#171614] dark:bg-[#F3EFE8]/95 dark:text-[#121110] dark:border-[#F3EFE8]',
  'Best Seller':
    'bg-[#8C6239] text-[#F8F7F4] border-[#78532F] dark:bg-[#D4A77A] dark:text-[#121110] dark:border-[#E2BA91]',
  Sale: 'bg-[#8B2E24] text-[#F8F7F4] border-[#73241C] dark:bg-[#A63D32] dark:text-[#F8F7F4] dark:border-[#BF4C40]',
};

export function ProductCard({
  product,
  lang,
  index = 0,
  isWishlisted,
  isCompared,
  onToggleWishlist,
  onToggleCompare,
  onInspect,
  onQuickAdd,
  onBuyNow,
}: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);
  const [isQuickViewZoomed, setIsQuickViewZoomed] = useState(false);
  const [quickZoomOrigin, setQuickZoomOrigin] = useState<{
    xPercent: number;
    yPercent: number;
  }>({ xPercent: 50, yPercent: 50 });

  const prefersReducedMotion = useReducedMotion();
  const t = COPY[lang];
  const title = lang === 'bn' ? product.nameBn : product.nameEn;
  const categoryLabel = PRODUCT_CATEGORY_LABELS[lang][product.category];
  const materialLabel = lang === 'bn' ? product.materialBn : product.materialEn;
  const availabilityLabel =
    lang === 'bn' ? product.availabilityBn : product.availabilityEn;
  const tags = getProductTags(product);
  const quickViewCue = getQuickViewTextureCue(product.category, lang);

  const handleQuickAdd = () => {
    onQuickAdd(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  const updateQuickViewZoom = (clientX: number, clientY: number, rect: DOMRect) => {
    const origin = calculateZoomOrigin({ clientX, clientY, rect });
    setQuickZoomOrigin(origin);
    if (!isQuickViewZoomed) {
      setIsQuickViewZoomed(true);
    }
  };

  const resetQuickViewZoom = () => {
    setIsQuickViewZoomed(false);
    setQuickZoomOrigin({ xPercent: 50, yPercent: 50 });
  };

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.35,
        ease: 'easeOut',
        delay: prefersReducedMotion ? 0 : (index % 3) * 0.06,
      }}
      className="group flex flex-col bg-[#F8F7F4] dark:bg-[#1A1816] border border-[#E2DDD5] dark:border-[#2D2925] rounded-lg overflow-hidden transition-colors duration-200 hover:border-[#C9BFAF] dark:hover:border-[#4A433B]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EFECE6] dark:bg-[#23201D]">
        <button
          type="button"
          onClick={() => onInspect(product)}
          data-testid={`product-quick-view-${product.id}`}
          data-quick-zoom={isQuickViewZoomed ? 'true' : 'false'}
          onMouseEnter={(e) =>
            updateQuickViewZoom(
              e.clientX,
              e.clientY,
              e.currentTarget.getBoundingClientRect(),
            )
          }
          onMouseMove={(e) =>
            updateQuickViewZoom(
              e.clientX,
              e.clientY,
              e.currentTarget.getBoundingClientRect(),
            )
          }
          onMouseLeave={resetQuickViewZoom}
          aria-label={`${title} — ${t.viewDetails}`}
          className={`w-full h-full text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A] ${
            isQuickViewZoomed ? 'cursor-zoom-in' : 'cursor-pointer'
          }`}
        >
          <div
            data-testid={`product-quick-view-stage-${product.id}`}
            className="w-full h-full transition-transform duration-200 ease-out motion-reduce:transition-none will-change-transform"
            style={{
              transformOrigin: `${quickZoomOrigin.xPercent}% ${quickZoomOrigin.yPercent}%`,
              transform: isQuickViewZoomed
                ? `scale(${QUICK_VIEW_ZOOM_SCALE})`
                : 'scale(1)',
            }}
          >
            <ResilientImage
              src={product.image}
              alt={title}
              fallbackTitle={title}
              className="w-full h-full object-cover pointer-events-none"
            />
          </div>
        </button>

        {tags.length > 0 && (
          <div
            className={`pointer-events-none absolute top-3 left-3 flex flex-wrap items-center gap-1.5 max-w-[calc(100%-7.5rem)] transition-opacity duration-150 ${
              isQuickViewZoomed ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                data-tag={tag}
                className={`inline-flex items-center px-2.5 py-1 rounded-[4px] border text-[11px] font-semibold leading-none tracking-wide shadow-sm ${TAG_BADGE_STYLES[tag]}`}
              >
                {PRODUCT_TAG_LABELS[lang][tag]}
              </span>
            ))}
          </div>
        )}

        <div
          className="absolute top-3 right-3 flex items-center gap-2"
          onMouseEnter={resetQuickViewZoom}
        >
          <button
            type="button"
            onClick={() => onToggleCompare(product.id)}
            aria-pressed={isCompared}
            aria-label={
              isCompared
                ? `${t.removeFromCompare}: ${title}`
                : `${t.addToCompare}: ${title}`
            }
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A] ${
              isCompared
                ? 'bg-[#8C6239] dark:bg-[#D4A77A] border-[#8C6239] dark:border-[#D4A77A] text-white dark:text-[#121110]'
                : 'bg-[#F8F7F4]/90 dark:bg-[#171614]/85 border-[#D8D1C7] dark:border-[#3A3530] text-[#171614] dark:text-[#F3EFE8] hover:bg-white dark:hover:bg-[#23201D]'
            }`}
          >
            <Scale className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onToggleWishlist(product.id)}
            aria-pressed={isWishlisted}
            aria-label={
              isWishlisted
                ? `${t.removeFromWishlist}: ${title}`
                : `${t.saveToWishlist}: ${title}`
            }
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A] ${
              isWishlisted
                ? 'bg-[#171614] dark:bg-[#F3EFE8] border-[#171614] dark:border-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110]'
                : 'bg-[#F8F7F4]/90 dark:bg-[#171614]/85 border-[#D8D1C7] dark:border-[#3A3530] text-[#171614] dark:text-[#F3EFE8] hover:bg-white dark:hover:bg-[#23201D]'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Quick-View Macro Texture Scrim Overlay on Hover */}
        <div
          data-testid={`product-quick-view-scrim-${product.id}`}
          aria-hidden={!isQuickViewZoomed}
          className={`pointer-events-none absolute inset-x-0 bottom-0 px-3.5 pt-8 pb-2.5 bg-gradient-to-t from-[#171614]/90 via-[#171614]/45 to-transparent flex items-center justify-between gap-2 text-[11px] font-medium text-[#F8F7F4] transition-opacity duration-150 ${
            isQuickViewZoomed ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="inline-flex items-center gap-1.5 min-w-0 truncate">
            <ZoomIn
              className="w-3.5 h-3.5 shrink-0 text-[#D4A77A]"
              aria-hidden="true"
            />
            <span className="truncate">{quickViewCue}</span>
          </span>
          <span className="shrink-0 text-[#E6DDD0] whitespace-nowrap">
            {t.viewDetails}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          {/* Clean Unboxed Metadata with typographic separator (zero pill spam) */}
          <div className="flex items-center justify-between gap-2 text-xs text-[#5E5850] dark:text-[#9A9287] mb-1.5">
            <span className="truncate">
              {categoryLabel} <span aria-hidden="true">·</span> {materialLabel}
            </span>
            <span className="shrink-0 text-[#8C6239] dark:text-[#D4A77A] font-medium">
              {availabilityLabel}
            </span>
          </div>

          <h3 className="text-base font-semibold text-[#171614] dark:text-[#F3EFE8] leading-snug">
            <button
              type="button"
              onClick={() => onInspect(product)}
              className="text-left hover:text-[#8C6239] dark:hover:text-[#D4A77A] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A]"
            >
              {title}
            </button>
          </h3>

          <p className="text-[13px] text-[#5E5850] dark:text-[#B8B0A4] mt-1 line-clamp-1">
            {lang === 'bn' ? product.subtitleBn : product.subtitleEn}
          </p>
        </div>

        <div className="pt-3 border-t border-[#EAE5DC] dark:border-[#2D2925] space-y-3">
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="text-[15px] font-semibold text-[#171614] dark:text-[#F3EFE8]">
              {formatBDT(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-[#7B746B] dark:text-[#8E867B] line-through">
                {formatBDT(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`${t.quickAdd}: ${title}`}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A] ${
                justAdded
                  ? 'bg-[#2E5A36] text-white'
                  : 'bg-[#EFECE6] dark:bg-[#26231F] text-[#171614] dark:text-[#F3EFE8] hover:bg-[#E2DDD5] dark:hover:bg-[#322E29]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{t.addedFeedback}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{t.quickAdd}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onBuyNow(product)}
              aria-label={`${t.buyNowCta}: ${title}`}
              className="inline-flex items-center justify-center px-3 py-2 min-h-[40px] rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-xs font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A]"
            >
              <span>{t.buyNowCta}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
