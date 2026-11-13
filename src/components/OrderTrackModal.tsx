import { PackageCheck, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { COPY } from '../data/i18n';
import type { Language, OrderRecord } from '../types/store';
import { formatBDT, normalizeBangladeshPhone } from '../utils/storeLogic';

interface OrderTrackModalProps {
  isOpen: boolean;
  lang: Language;
  orders: OrderRecord[];
  onClose: () => void;
}

export function OrderTrackModal({
  isOpen,
  lang,
  orders,
  onClose,
}: OrderTrackModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

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
  const normalizedQuery = searchTerm.trim().toLowerCase();
  const normalizedPhoneQuery = normalizeBangladeshPhone(searchTerm.trim());

  const filteredOrders = orders.filter((order) => {
    if (!normalizedQuery) return true;
    return (
      order.orderId.toLowerCase().includes(normalizedQuery) ||
      order.phone.includes(normalizedPhoneQuery) ||
      order.customerName.toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171614]/60 dark:bg-black/75 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="track-modal-title"
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#F8F7F4] dark:bg-[#161412] border border-[#E2DDD5] dark:border-[#2D2925] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E2DDD5] dark:border-[#2D2925] flex items-center justify-between gap-4">
          <h2
            id="track-modal-title"
            className="font-display text-2xl font-semibold text-[#171614] dark:text-[#F3EFE8]"
          >
            {t.trackModalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeLabel}
            className="w-10 h-10 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] flex items-center justify-center text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6]/40 dark:bg-[#1E1B18]">
          <div className="relative">
            <Search
              className="w-4 h-4 text-[#5E5850] dark:text-[#9A9287] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.trackSearchPlaceholder}
              aria-label={t.trackSearchPlaceholder}
              className="w-full min-h-[42px] pl-10 pr-4 py-2 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#161412] text-sm text-[#171614] dark:text-[#F3EFE8] placeholder:text-[#7B746B] dark:placeholder:text-[#8E867B] focus:outline-2 focus:outline-[#8C6239] dark:focus:outline-[#D4A77A]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#5E5850] dark:text-[#9A9287]">
              {t.trackEmpty}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <article
                key={order.orderId}
                className="p-5 rounded-lg border border-[#E2DDD5] dark:border-[#2D2925] bg-white dark:bg-[#1A1816] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EAE5DC] dark:border-[#2D2925]">
                  <div className="flex items-center gap-2 text-sm">
                    <PackageCheck
                      className="w-4 h-4 text-[#2E5A36] dark:text-[#6EE7B7]"
                      aria-hidden="true"
                    />
                    <span className="font-mono font-semibold text-[#171614] dark:text-[#F3EFE8]">
                      {order.orderId}
                    </span>
                    <span aria-hidden="true" className="text-[#8C8378]">
                      ·
                    </span>
                    <span className="text-xs font-medium text-[#2E5A36] dark:text-[#6EE7B7]">
                      {t.statusConfirmed}
                    </span>
                  </div>
                  <span className="text-xs text-[#5E5850] dark:text-[#9A9287] tabular-nums">
                    {new Date(order.createdAt).toLocaleDateString(
                      lang === 'bn' ? 'bn-BD' : 'en-GB',
                      { day: 'numeric', month: 'short', year: 'numeric' },
                    )}
                  </span>
                </div>

                <div className="text-xs text-[#4A453E] dark:text-[#C7BFB3] space-y-1">
                  <p>
                    <span className="font-medium text-[#171614] dark:text-[#F3EFE8]">
                      {order.customerName}
                    </span>{' '}
                    · <span className="font-mono">{order.phone}</span>
                  </p>
                  <p>{order.address}</p>
                </div>

                <div className="pt-2 space-y-1.5 border-t border-[#EAE5DC] dark:border-[#2D2925]">
                  {order.items.map((item) => (
                    <div
                      key={item.key}
                      className="flex justify-between text-xs text-[#4A453E] dark:text-[#C7BFB3]"
                    >
                      <span>
                        {lang === 'bn' ? item.nameBn : item.nameEn} (
                        {item.variant}) × {item.quantity}
                      </span>
                      <span className="tabular-nums">
                        {formatBDT(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  {order.totals.discountAmount > 0 && (
                    <div className="flex justify-between text-xs text-[#2E5A36] dark:text-[#6EE7B7]">
                      <span>
                        {t.discountRowLabel}
                        {order.discountCode ? ` (${order.discountCode})` : ''}
                      </span>
                      <span className="tabular-nums font-medium">
                        -{formatBDT(order.totals.discountAmount)}
                      </span>
                    </div>
                  )}
                  {order.giftWrapping && (
                    <div className="flex justify-between text-xs text-[#4A453E] dark:text-[#C7BFB3]">
                      <span>{t.giftWrappingFeeRow}</span>
                      <span className="tabular-nums">
                        {formatBDT(order.totals.giftWrappingFee)}
                      </span>
                    </div>
                  )}
                  {order.giftMessage && (
                    <p className="text-xs italic text-[#5E5850] dark:text-[#B8B0A4] pt-1">
                      {t.giftMessageLabel}: &ldquo;{order.giftMessage}&rdquo;
                    </p>
                  )}
                  <div className="pt-2 flex justify-between text-sm font-semibold text-[#171614] dark:text-[#F3EFE8]">
                    <span>{t.totalLabel}</span>
                    <span className="tabular-nums">
                      {formatBDT(order.totals.grandTotal)}
                    </span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
