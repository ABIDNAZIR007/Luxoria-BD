import { Check, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { COPY, PRODUCT_CATEGORY_LABELS } from '../data/i18n';
import type { Language, Product } from '../types/store';
import { formatBDT, MAX_RECENTLY_VIEWED } from '../utils/storeLogic';
import { ResilientImage } from './ResilientImage';

interface RecentlyViewedBarProps {
  items: readonly Product[];
  lang: Language;
  onInspect: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onClear: () => void;
}

export function RecentlyViewedBar({
  items,
  lang,
  onInspect,
  onQuickAdd,
  onClear,
}: RecentlyViewedBarProps) {
  const [addedId, setAddedId] = useState<string | null>(null);

  if (items.length === 0) {
    return null;
  }

  const t = COPY[lang];

  const handleQuickAdd = (product: Product) => {
    onQuickAdd(product);
    setAddedId(product.id);
    window.setTimeout(() => {
      setAddedId((current) => (current === product.id ? null : current));
    }, 1400);
  };

  return (
    <section
      aria-labelledby="recently-viewed-heading"
      data-testid="recently-viewed-section"
      className="border-t border-[#E2DDD5] dark:border-[#2D2925] bg-[#F4F1EB]/55 dark:bg-[#151311]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="flex items-baseline gap-2.5">
              <h2
                id="recently-viewed-heading"
                className="font-display text-2xl sm:text-[28px] font-semibold text-[#171614] dark:text-[#F3EFE8] leading-tight"
              >
                {t.recentlyViewedHeading}
              </h2>
              <span className="text-xs font-medium text-[#7B746B] dark:text-[#9A9287] tabular-nums">
                ({items.length}/{MAX_RECENTLY_VIEWED})
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5E5850] dark:text-[#B8B0A4] mt-1">
              {t.recentlyViewedSubcopy}
            </p>
          </div>

          <button
            type="button"
            onClick={onClear}
            data-testid="recently-viewed-clear-btn"
            className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 min-h-[36px] rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-[#F8F7F4] dark:bg-[#1A1816] text-xs font-medium text-[#4A453E] dark:text-[#C7BFB3] hover:text-[#171614] dark:hover:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A]"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.recentlyViewedClearBtn}</span>
          </button>
        </div>

        <div
          data-testid="recently-viewed-bar"
          className="flex items-stretch gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth"
        >
          {items.map((product) => {
            const title = lang === 'bn' ? product.nameBn : product.nameEn;
            const categoryLabel =
              PRODUCT_CATEGORY_LABELS[lang][product.category];
            const materialLabel =
              lang === 'bn' ? product.materialBn : product.materialEn;
            const isJustAdded = addedId === product.id;

            return (
              <article
                key={product.id}
                data-testid={`recently-viewed-card-${product.id}`}
                className="group w-[248px] sm:w-[276px] lg:w-[288px] shrink-0 snap-start flex flex-col bg-[#F8F7F4] dark:bg-[#1A1816] border border-[#E2DDD5] dark:border-[#2D2925] rounded-lg overflow-hidden transition-colors duration-200 hover:border-[#C9BFAF] dark:hover:border-[#4A433B]"
              >
                <button
                  type="button"
                  onClick={() => onInspect(product)}
                  aria-label={`${title} — ${t.viewDetails}`}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-[#EFECE6] dark:bg-[#23201D] text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A]"
                >
                  <ResilientImage
                    src={product.image}
                    alt={title}
                    fallbackTitle={title}
                    className="w-full h-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                </button>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-[#5E5850] dark:text-[#9A9287] truncate">
                      {categoryLabel} <span aria-hidden="true">·</span>{' '}
                      {materialLabel}
                    </p>
                    <h3 className="text-sm font-semibold text-[#171614] dark:text-[#F3EFE8] mt-1 leading-snug">
                      <button
                        type="button"
                        onClick={() => onInspect(product)}
                        className="text-left hover:text-[#8C6239] dark:hover:text-[#D4A77A] transition-colors line-clamp-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A]"
                      >
                        {title}
                      </button>
                    </h3>
                  </div>

                  <div className="pt-2.5 border-t border-[#EAE5DC] dark:border-[#2D2925] flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1.5 tabular-nums min-w-0">
                      <span className="text-sm font-semibold text-[#171614] dark:text-[#F3EFE8]">
                        {formatBDT(product.price)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-[11px] text-[#7B746B] dark:text-[#8E867B] line-through">
                          {formatBDT(product.compareAtPrice)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickAdd(product)}
                      aria-label={`${t.quickAdd}: ${title}`}
                      className={`inline-flex items-center justify-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A] ${
                        isJustAdded
                          ? 'bg-[#2E5A36] text-white'
                          : 'bg-[#EFECE6] dark:bg-[#26231F] text-[#171614] dark:text-[#F3EFE8] hover:bg-[#E2DDD5] dark:hover:bg-[#322E29]'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check
                            className="w-3.5 h-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{t.addedFeedback}</span>
                        </>
                      ) : (
                        <>
                          <Plus
                            className="w-3.5 h-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{t.quickAdd}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
