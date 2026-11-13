import { Ruler, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { COPY } from '../data/i18n';
import { BELT_SIZE_ROWS, SHOE_SIZE_ROWS } from '../data/sizeGuide';
import type { Language, ProductCategory } from '../types/store';
import { getRecommendedSizeGuideTab } from '../utils/storeLogic';

interface SizeGuideModalProps {
  isOpen: boolean;
  lang: Language;
  productCategory: ProductCategory;
  selectedVariant: string;
  onSelectSize?: (size: string) => void;
  onClose: () => void;
}

export function SizeGuideModal({
  isOpen,
  lang,
  productCategory,
  selectedVariant,
  onSelectSize,
  onClose,
}: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'shoes' | 'belts'>(() =>
    getRecommendedSizeGuideTab(productCategory),
  );

  useEffect(() => {
    if (isOpen) {
      setActiveTab(getRecommendedSizeGuideTab(productCategory));
    }
  }, [isOpen, productCategory]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const t = COPY[lang];
  const canApplyShoeSize = productCategory === 'shoes' && Boolean(onSelectSize);
  const canApplyBeltSize = productCategory === 'belts' && Boolean(onSelectSize);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-[#171614]/65 dark:bg-black/80 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
    >
      <div
        className="w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-[#F8F7F4] dark:bg-[#161412] border border-[#E2DDD5] dark:border-[#2D2925] rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E2DDD5] dark:border-[#2D2925] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <Ruler
              className="w-5 h-5 text-[#8C6239] dark:text-[#D4A77A] shrink-0"
              aria-hidden="true"
            />
            <h2
              id="size-guide-title"
              className="font-display text-2xl font-semibold text-[#171614] dark:text-[#F3EFE8] truncate"
            >
              {t.sizeGuideTitle}
            </h2>
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

        <div className="p-6 space-y-5">
          <p className="text-sm text-[#4A453E] dark:text-[#C7BFB3] leading-relaxed">
            {t.sizeGuideSubtitle}
          </p>

          {/* Category Switcher */}
          <div
            className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#EFECE6] dark:bg-[#1E1B18]"
            role="tablist"
            aria-label={t.sizeGuideTitle}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'shoes'}
              onClick={() => setActiveTab('shoes')}
              className={`px-4 py-2 min-h-[38px] text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'shoes'
                  ? 'bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110]'
                  : 'text-[#4A453E] dark:text-[#C7BFB3] hover:text-[#171614] dark:hover:text-[#F3EFE8]'
              }`}
            >
              {t.shoeGuideTab}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'belts'}
              onClick={() => setActiveTab('belts')}
              className={`px-4 py-2 min-h-[38px] text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'belts'
                  ? 'bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110]'
                  : 'text-[#4A453E] dark:text-[#C7BFB3] hover:text-[#171614] dark:hover:text-[#F3EFE8]'
              }`}
            >
              {t.beltGuideTab}
            </button>
          </div>

          {activeTab === 'shoes' ? (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border border-[#E2DDD5] dark:border-[#2D2925] bg-white dark:bg-[#1A1816]">
                <table className="w-full text-left border-collapse text-xs sm:text-sm tabular-nums">
                  <thead>
                    <tr className="border-b border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6]/60 dark:bg-[#23201D] text-[#4A453E] dark:text-[#C7BFB3]">
                      <th className="py-3 px-4 font-semibold">{t.shoeColEu}</th>
                      <th className="py-3 px-4 font-semibold">{t.shoeColUk}</th>
                      <th className="py-3 px-4 font-semibold">{t.shoeColUs}</th>
                      <th className="py-3 px-4 font-semibold">{t.shoeColCm}</th>
                      <th className="py-3 px-4 font-semibold">{t.shoeColIn}</th>
                      {canApplyShoeSize && (
                        <th className="py-3 px-4 font-semibold text-right">
                          {t.sizeActionCol}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE5DC] dark:divide-[#2D2925]">
                    {SHOE_SIZE_ROWS.map((row) => {
                      const isSelected =
                        productCategory === 'shoes' &&
                        selectedVariant === row.eu;
                      return (
                        <tr
                          key={row.eu}
                          className={
                            isSelected
                              ? 'bg-[#EFECE6]/70 dark:bg-[#26231F] font-medium'
                              : ''
                          }
                        >
                          <td className="py-3 px-4 font-semibold text-[#171614] dark:text-[#F3EFE8]">
                            {row.eu}
                          </td>
                          <td className="py-3 px-4 text-[#4A453E] dark:text-[#C7BFB3]">
                            {row.uk}
                          </td>
                          <td className="py-3 px-4 text-[#4A453E] dark:text-[#C7BFB3]">
                            {row.us}
                          </td>
                          <td className="py-3 px-4 text-[#171614] dark:text-[#F3EFE8]">
                            {row.cm}
                          </td>
                          <td className="py-3 px-4 text-[#4A453E] dark:text-[#C7BFB3]">
                            {row.inches}
                          </td>
                          {canApplyShoeSize && (
                            <td className="py-2.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectSize?.(row.eu);
                                  onClose();
                                }}
                                className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                                  isSelected
                                    ? 'bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110]'
                                    : 'border border-[#D8D1C7] dark:border-[#3A3530] text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#2A2622]'
                                }`}
                              >
                                {isSelected
                                  ? t.selectedSizeLabel
                                  : `${t.selectSizeAction} ${row.eu}`}
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[#5E5850] dark:text-[#B8B0A4] leading-relaxed p-3.5 rounded-lg border border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6]/50 dark:bg-[#1E1B18]">
                {t.shoeFitTip}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border border-[#E2DDD5] dark:border-[#2D2925] bg-white dark:bg-[#1A1816]">
                <table className="w-full text-left border-collapse text-xs sm:text-sm tabular-nums">
                  <thead>
                    <tr className="border-b border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6]/60 dark:bg-[#23201D] text-[#4A453E] dark:text-[#C7BFB3]">
                      <th className="py-3 px-4 font-semibold">{t.beltColTag}</th>
                      <th className="py-3 px-4 font-semibold">
                        {t.beltColWaistIn}
                      </th>
                      <th className="py-3 px-4 font-semibold">
                        {t.beltColWaistCm}
                      </th>
                      <th className="py-3 px-4 font-semibold">
                        {t.beltColLength}
                      </th>
                      {canApplyBeltSize && (
                        <th className="py-3 px-4 font-semibold text-right">
                          {t.sizeActionCol}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE5DC] dark:divide-[#2D2925]">
                    {BELT_SIZE_ROWS.map((row) => {
                      const isSelected =
                        productCategory === 'belts' &&
                        selectedVariant === row.beltTag;
                      return (
                        <tr
                          key={row.beltTag}
                          className={
                            isSelected
                              ? 'bg-[#EFECE6]/70 dark:bg-[#26231F] font-medium'
                              : ''
                          }
                        >
                          <td className="py-3 px-4 font-semibold text-[#171614] dark:text-[#F3EFE8]">
                            {row.beltTag}
                          </td>
                          <td className="py-3 px-4 text-[#4A453E] dark:text-[#C7BFB3]">
                            {row.pantWaistInches}
                          </td>
                          <td className="py-3 px-4 text-[#4A453E] dark:text-[#C7BFB3]">
                            {row.pantWaistCm}
                          </td>
                          <td className="py-3 px-4 text-[#171614] dark:text-[#F3EFE8]">
                            {row.totalLengthCm} ({row.totalLengthInches})
                          </td>
                          {canApplyBeltSize && (
                            <td className="py-2.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectSize?.(row.beltTag);
                                  onClose();
                                }}
                                className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                                  isSelected
                                    ? 'bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110]'
                                    : 'border border-[#D8D1C7] dark:border-[#3A3530] text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#2A2622]'
                                }`}
                              >
                                {isSelected
                                  ? t.selectedSizeLabel
                                  : `${t.selectSizeAction} ${row.beltTag}`}
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[#5E5850] dark:text-[#B8B0A4] leading-relaxed p-3.5 rounded-lg border border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6]/50 dark:bg-[#1E1B18]">
                {t.beltFitTip}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
