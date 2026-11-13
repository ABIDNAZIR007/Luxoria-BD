import { Check, ShoppingBag, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { COPY } from '../data/i18n';
import type { Language, Product } from '../types/store';
import { buildBagToastContent } from '../utils/storeLogic';

export interface BagToastState {
  id: number;
  product: Product;
  variant: string;
  quantity: number;
}

interface BagToastProps {
  toast: BagToastState | null;
  lang: Language;
  onViewBag: () => void;
  onDismiss: () => void;
}

export function BagToast({
  toast,
  lang,
  onViewBag,
  onDismiss,
}: BagToastProps) {
  const t = COPY[lang];

  return (
    <div
      className="fixed bottom-[5.5rem] right-5 z-[70] pointer-events-none max-w-sm w-[calc(100vw-2.5rem)]"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="pointer-events-auto rounded-lg border border-white/15 dark:border-[#3A3530] bg-[#171614] dark:bg-[#23201D] text-[#F8F7F4] dark:text-[#F3EFE8] shadow-xl px-4 py-3 flex items-center justify-between gap-3"
          >
            {(() => {
              const { title, subtitle } = buildBagToastContent(
                toast.product,
                toast.variant,
                toast.quantity,
                lang,
              );
              return (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-[#8C6239]/25 border border-[#D6B18A]/35 flex items-center justify-center shrink-0">
                      <Check
                        className="w-4 h-4 text-[#D6B18A]"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {title}
                      </p>
                      <p className="text-[11px] text-[#C8C0B4] truncate tabular-nums">
                        {subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onDismiss();
                        onViewBag();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[32px] rounded border border-white/20 text-[11px] font-medium text-[#F8F7F4] hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <ShoppingBag className="w-3 h-3 shrink-0" aria-hidden="true" />
                      <span>{t.toastViewBag}</span>
                    </button>
                    <button
                      type="button"
                      onClick={onDismiss}
                      aria-label={t.toastDismiss}
                      className="w-7 h-7 rounded flex items-center justify-center text-[#B8B0A4] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
