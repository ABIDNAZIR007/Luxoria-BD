import { Scale, X } from 'lucide-react';
import { COPY } from '../data/i18n';
import type { Language, Product } from '../types/store';

interface CompareTrayProps {
  items: Product[];
  lang: Language;
  onRemoveItem: (productId: string) => void;
  onClearAll: () => void;
  onOpenCompare: () => void;
}

export function CompareTray({
  items,
  lang,
  onRemoveItem,
  onClearAll,
  onOpenCompare,
}: CompareTrayProps) {
  if (items.length === 0) {
    return null;
  }

  const t = COPY[lang];
  const canCompare = items.length === 2;

  return (
    <aside
      aria-label={t.compareDockTitle}
      className="fixed bottom-5 left-5 z-30 max-w-md w-[calc(100vw-2.5rem)] rounded-lg border border-[#D8D1C7] dark:border-[#3A3530] bg-[#F8F7F4]/95 dark:bg-[#1A1816]/95 backdrop-blur-sm shadow-xl p-3.5"
    >
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#171614] dark:text-[#F3EFE8]">
          <Scale
            className="w-4 h-4 text-[#8C6239] dark:text-[#D4A77A]"
            aria-hidden="true"
          />
          <span className="tabular-nums">
            {t.compareDockTitle} ({items.length}/2)
          </span>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="text-[11px] font-medium text-[#5E5850] dark:text-[#B8B0A4] hover:text-[#171614] dark:hover:text-[#F3EFE8] underline underline-offset-4 cursor-pointer"
        >
          {t.compareClearBtn}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {[0, 1].map((slot) => {
          const item = items[slot];
          if (!item) {
            return (
              <div
                key={slot}
                className="min-h-[42px] px-2.5 py-1.5 rounded border border-dashed border-[#D8D1C7] dark:border-[#3A3530] bg-[#EFECE6]/45 dark:bg-[#23201D]/60 flex items-center text-[11px] text-[#5E5850] dark:text-[#9A9287]"
              >
                {t.compareSelectSecond}
              </div>
            );
          }

          const title = lang === 'bn' ? item.nameBn : item.nameEn;
          return (
            <div
              key={item.id}
              className="min-h-[42px] px-2.5 py-1.5 rounded border border-[#E2DDD5] dark:border-[#2D2925] bg-white dark:bg-[#161412] flex items-center justify-between gap-2 min-w-0"
            >
              <span className="text-xs font-medium text-[#171614] dark:text-[#F3EFE8] truncate">
                {title}
              </span>
              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                aria-label={`${t.removeFromCompare}: ${title}`}
                className="w-6 h-6 rounded flex items-center justify-center text-[#5E5850] dark:text-[#9A9287] hover:text-[#171614] dark:hover:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!canCompare}
        onClick={onOpenCompare}
        className={`w-full min-h-[38px] px-4 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
          canCompare
            ? 'bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] cursor-pointer'
            : 'bg-[#E2DDD5] dark:bg-[#2A2622] text-[#5E5850] dark:text-[#8E867B] cursor-not-allowed'
        }`}
      >
        {t.compareNowBtn} ({items.length}/2)
      </button>
    </aside>
  );
}
