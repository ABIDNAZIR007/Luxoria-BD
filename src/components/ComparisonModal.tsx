import { Plus, Scale, X } from 'lucide-react';
import { useEffect } from 'react';
import { COPY, PRODUCT_CATEGORY_LABELS } from '../data/i18n';
import type { Language, Product } from '../types/store';
import { buildComparisonSpecRows, formatBDT } from '../utils/storeLogic';
import { ResilientImage } from './ResilientImage';

interface ComparisonModalProps {
  isOpen: boolean;
  items: Product[];
  lang: Language;
  onClose: () => void;
  onInspectProduct: (product: Product) => void;
  onAddToBag: (product: Product) => void;
}

export function ComparisonModal({
  isOpen,
  items,
  lang,
  onClose,
  onInspectProduct,
  onAddToBag,
}: ComparisonModalProps) {
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

  if (!isOpen || items.length < 2) {
    return null;
  }

  const [first, second] = items;
  const t = COPY[lang];
  const specRows = buildComparisonSpecRows(first, second, lang);

  const firstTitle = lang === 'bn' ? first.nameBn : first.nameEn;
  const secondTitle = lang === 'bn' ? second.nameBn : second.nameEn;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#171614]/60 dark:bg-black/75 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#F8F7F4] dark:bg-[#161412] border border-[#E2DDD5] dark:border-[#2D2925] rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E2DDD5] dark:border-[#2D2925] flex items-center justify-between gap-4 sticky top-0 bg-[#F8F7F4] dark:bg-[#161412] z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <Scale
              className="w-5 h-5 text-[#8C6239] dark:text-[#D4A77A] shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <h2
                id="compare-modal-title"
                className="font-display text-2xl font-semibold text-[#171614] dark:text-[#F3EFE8] truncate"
              >
                {t.compareModalTitle}
              </h2>
              <p className="text-xs text-[#5E5850] dark:text-[#B8B0A4] truncate">
                {t.compareModalSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeLabel}
            className="w-10 h-10 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] flex items-center justify-center text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto rounded-lg border border-[#E2DDD5] dark:border-[#2D2925] bg-white dark:bg-[#1A1816]">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6]/55 dark:bg-[#23201D] align-top">
                  <th className="py-4 px-4 font-semibold text-[#4A453E] dark:text-[#C7BFB3] w-44">
                    {t.compareFeatureCol}
                  </th>
                  {[first, second].map((product, index) => {
                    const title = index === 0 ? firstTitle : secondTitle;
                    return (
                      <th key={product.id} className="py-4 px-4 min-w-[210px]">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onInspectProduct(product);
                          }}
                          className="text-left group cursor-pointer w-full"
                        >
                          <div className="w-full aspect-[4/3] rounded-md overflow-hidden border border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6] dark:bg-[#1E1B18] mb-3">
                            <ResilientImage
                              src={product.image}
                              alt={title}
                              fallbackTitle={title}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                            />
                          </div>
                          <span className="block text-sm font-semibold text-[#171614] dark:text-[#F3EFE8] group-hover:text-[#8C6239] dark:group-hover:text-[#D4A77A] transition-colors">
                            {title}
                          </span>
                          <span className="block text-[11px] font-mono font-normal text-[#5E5850] dark:text-[#9A9287] mt-0.5">
                            {product.sku}
                          </span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DC] dark:divide-[#2D2925]">
                <tr>
                  <th className="py-3 px-4 font-medium text-[#5E5850] dark:text-[#9A9287]">
                    {t.comparePriceRow}
                  </th>
                  {[first, second].map((product) => (
                    <td
                      key={product.id}
                      className="py-3 px-4 tabular-nums font-semibold text-[#171614] dark:text-[#F3EFE8]"
                    >
                      <div className="flex items-baseline gap-2">
                        <span>{formatBDT(product.price)}</span>
                        {product.compareAtPrice && (
                          <span className="text-xs font-normal text-[#7B746B] dark:text-[#8E867B] line-through">
                            {formatBDT(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <th className="py-3 px-4 font-medium text-[#5E5850] dark:text-[#9A9287]">
                    {t.compareCategoryRow}
                  </th>
                  <td className="py-3 px-4 text-[#171614] dark:text-[#F3EFE8]">
                    {PRODUCT_CATEGORY_LABELS[lang][first.category]}
                  </td>
                  <td className="py-3 px-4 text-[#171614] dark:text-[#F3EFE8]">
                    {PRODUCT_CATEGORY_LABELS[lang][second.category]}
                  </td>
                </tr>

                <tr>
                  <th className="py-3 px-4 font-medium text-[#5E5850] dark:text-[#9A9287]">
                    {t.compareMaterialRow}
                  </th>
                  <td className="py-3 px-4 text-[#171614] dark:text-[#F3EFE8]">
                    {lang === 'bn' ? first.materialBn : first.materialEn}
                  </td>
                  <td className="py-3 px-4 text-[#171614] dark:text-[#F3EFE8]">
                    {lang === 'bn' ? second.materialBn : second.materialEn}
                  </td>
                </tr>

                <tr>
                  <th className="py-3 px-4 font-medium text-[#5E5850] dark:text-[#9A9287]">
                    {t.compareAvailabilityRow}
                  </th>
                  <td className="py-3 px-4 text-[#8C6239] dark:text-[#D4A77A] font-medium">
                    {lang === 'bn' ? first.availabilityBn : first.availabilityEn}
                  </td>
                  <td className="py-3 px-4 text-[#8C6239] dark:text-[#D4A77A] font-medium">
                    {lang === 'bn' ? second.availabilityBn : second.availabilityEn}
                  </td>
                </tr>

                <tr>
                  <th className="py-3 px-4 font-medium text-[#5E5850] dark:text-[#9A9287]">
                    {t.compareVariantsRow}
                  </th>
                  <td className="py-3 px-4 text-[#4A453E] dark:text-[#C7BFB3] tabular-nums">
                    {first.variants.join(', ')}
                  </td>
                  <td className="py-3 px-4 text-[#4A453E] dark:text-[#C7BFB3] tabular-nums">
                    {second.variants.join(', ')}
                  </td>
                </tr>

                {specRows.map((row) => (
                  <tr key={row.label}>
                    <th className="py-3 px-4 font-medium text-[#5E5850] dark:text-[#9A9287]">
                      {row.label}
                    </th>
                    <td className="py-3 px-4 text-[#171614] dark:text-[#F3EFE8]">
                      {row.firstValue}
                    </td>
                    <td className="py-3 px-4 text-[#171614] dark:text-[#F3EFE8]">
                      {row.secondValue}
                    </td>
                  </tr>
                ))}

                <tr className="bg-[#EFECE6]/35 dark:bg-[#1E1B18]">
                  <th className="py-3.5 px-4 font-medium text-[#5E5850] dark:text-[#9A9287]">
                    {t.compareActionRow}
                  </th>
                  {[first, second].map((product) => (
                    <td key={product.id} className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => onAddToBag(product)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[38px] rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-xs font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{t.quickAdd}</span>
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
