import { Check, Heart, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { COPY, PRODUCT_CATEGORY_LABELS } from '../data/i18n';
import type { Language, Product } from '../types/store';
import { formatBDT } from '../utils/storeLogic';
import { ResilientImage } from './ResilientImage';

interface WishlistDrawerProps {
  isOpen: boolean;
  lang: Language;
  items: Product[];
  onClose: () => void;
  onRemoveItem: (productId: string) => void;
  onClearAll: () => void;
  onInspectProduct: (product: Product) => void;
  onAddToBag: (product: Product) => void;
}

export function WishlistDrawer({
  isOpen,
  lang,
  items,
  onClose,
  onRemoveItem,
  onClearAll,
  onInspectProduct,
  onAddToBag,
}: WishlistDrawerProps) {
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const t = COPY[lang];

  const handleMoveToBag = (product: Product) => {
    onAddToBag(product);
    setRecentlyAddedId(product.id);
    window.setTimeout(() => {
      setRecentlyAddedId((current) =>
        current === product.id ? null : current,
      );
    }, 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#171614]/55 dark:bg-black/75 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wishlist-drawer-heading"
    >
      <div
        className="w-full max-w-md h-full bg-[#F8F7F4] dark:bg-[#161412] border-l border-[#E2DDD5] dark:border-[#2D2925] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E2DDD5] dark:border-[#2D2925] flex items-center justify-between gap-4">
          <h2
            id="wishlist-drawer-heading"
            className="font-display text-2xl font-semibold text-[#171614] dark:text-[#F3EFE8] truncate"
          >
            {t.wishlistTitle} ({items.length})
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeLabel}
            className="w-10 h-10 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] flex items-center justify-center text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-[#EFECE6] dark:bg-[#23201D] flex items-center justify-center text-[#8C6239] dark:text-[#D4A77A] mb-4">
              <Heart className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-[#171614] dark:text-[#F3EFE8]">
              {t.wishlistEmptyTitle}
            </h3>
            <p className="text-sm text-[#5E5850] dark:text-[#B8B0A4] mt-2 max-w-xs">
              {t.wishlistEmptyDesc}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 px-5 py-2.5 min-h-[44px] rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-sm font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] cursor-pointer"
            >
              {t.continueShopping}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#EAE5DC] dark:divide-[#2D2925]">
              {items.map((product) => {
                const title = lang === 'bn' ? product.nameBn : product.nameEn;
                const categoryLabel =
                  PRODUCT_CATEGORY_LABELS[lang][product.category];
                const materialLabel =
                  lang === 'bn' ? product.materialBn : product.materialEn;
                const isAdded = recentlyAddedId === product.id;

                return (
                  <article key={product.id} className="py-4 flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onInspectProduct(product);
                      }}
                      aria-label={`${title} — ${t.viewDetails}`}
                      className="w-20 h-20 rounded-md overflow-hidden border border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6] dark:bg-[#23201D] shrink-0 cursor-pointer"
                    >
                      <ResilientImage
                        src={product.image}
                        alt={title}
                        fallbackTitle={title}
                        className="w-full h-full object-cover"
                      />
                    </button>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] text-[#5E5850] dark:text-[#9A9287] truncate">
                            {categoryLabel} <span aria-hidden="true">·</span>{' '}
                            {materialLabel}
                          </p>
                          <h3 className="text-sm font-semibold text-[#171614] dark:text-[#F3EFE8] truncate mt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onInspectProduct(product);
                              }}
                              className="text-left hover:text-[#8C6239] dark:hover:text-[#D4A77A] transition-colors cursor-pointer"
                            >
                              {title}
                            </button>
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(product.id)}
                          aria-label={`${t.removeFromWishlist}: ${title}`}
                          className="w-8 h-8 flex items-center justify-center text-[#7B746B] dark:text-[#9A9287] hover:text-[#9E2A2B] dark:hover:text-[#FCA5A5] cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-3 mt-3">
                        <span className="text-sm font-semibold text-[#171614] dark:text-[#F3EFE8] tabular-nums">
                          {formatBDT(product.price)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleMoveToBag(product)}
                          aria-label={`${t.moveToBag}: ${title}`}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                            isAdded
                              ? 'bg-[#2E5A36] text-white'
                              : 'bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5]'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{t.addedFeedback}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{t.moveToBag}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="p-6 border-t border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6]/50 dark:bg-[#1E1B18] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClearAll}
                className="px-4 py-2.5 min-h-[42px] rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-[#F8F7F4] dark:bg-[#161412] text-xs font-medium text-[#4A453E] dark:text-[#C7BFB3] hover:text-[#9E2A2B] dark:hover:text-[#FCA5A5] hover:border-[#9E2A2B]/40 dark:hover:border-[#FCA5A5]/40 transition-colors cursor-pointer"
              >
                {t.clearWishlist}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-5 py-2.5 min-h-[42px] rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-sm font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] transition-colors cursor-pointer"
              >
                {t.continueShopping}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
