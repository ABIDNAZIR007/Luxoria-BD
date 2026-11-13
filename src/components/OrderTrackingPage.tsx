import {
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Download,
  MapPin,
  Package,
  Search,
  Truck,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { COPY } from '../data/i18n';
import type {
  Language,
  OrderRecord,
  TrackingLookupResult,
  TrackingStatus,
} from '../types/store';
import {
  buildDigitalReceiptFilename,
  buildDigitalReceiptHtml,
  formatBDT,
  getTrackingStatusProgress,
  lookupOrderTracking,
  MOCK_TRACKING_ORDERS,
} from '../utils/storeLogic';

interface OrderTrackingPageProps {
  isOpen: boolean;
  lang: Language;
  userOrders: OrderRecord[];
  pastOrders: OrderRecord[];
  onClose: () => void;
}

function getStatusAccentClasses(status: TrackingStatus): {
  text: string;
  bar: string;
  border: string;
} {
  switch (status) {
    case 'Delivered':
      return {
        text: 'text-[#2E5A36] dark:text-[#6EE7B7]',
        bar: 'bg-[#2E5A36] dark:bg-[#6EE7B7]',
        border: 'border-[#2E5A36]/35 dark:border-[#6EE7B7]/35',
      };
    case 'In Transit':
      return {
        text: 'text-[#8C6239] dark:text-[#D4A77A]',
        bar: 'bg-[#8C6239] dark:bg-[#D4A77A]',
        border: 'border-[#8C6239]/35 dark:border-[#D4A77A]/35',
      };
    case 'Processing':
      return {
        text: 'text-[#4A453E] dark:text-[#E2DDD5]',
        bar: 'bg-[#171614] dark:bg-[#F3EFE8]',
        border: 'border-[#D8D1C7] dark:border-[#3A3530]',
      };
  }
}

function renderStatusIcon(status: TrackingStatus, className: string) {
  switch (status) {
    case 'Delivered':
      return <CheckCircle2 className={className} aria-hidden="true" />;
    case 'In Transit':
      return <Truck className={className} aria-hidden="true" />;
    case 'Processing':
      return <Package className={className} aria-hidden="true" />;
  }
}

export function OrderTrackingPage({
  isOpen,
  lang,
  userOrders,
  pastOrders,
  onClose,
}: OrderTrackingPageProps) {
  const [trackingInput, setTrackingInput] = useState('');
  const [activeResult, setActiveResult] = useState<TrackingLookupResult | null>(
    null,
  );
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [downloadedReceiptId, setDownloadedReceiptId] = useState<string | null>(
    null,
  );
  const wasOpenRef = useRef(false);
  const bodyScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      return;
    }
    const justOpened = !wasOpenRef.current;
    wasOpenRef.current = true;
    if (justOpened) {
      setLookupError(null);
      setDownloadedReceiptId(null);
      if (userOrders.length > 0) {
        const latestId = userOrders[0].orderId;
        setTrackingInput(latestId);
        const match = lookupOrderTracking(latestId, userOrders, lang, pastOrders);
        setActiveResult(match.found ? match.result : null);
      } else {
        setTrackingInput('');
        setActiveResult(null);
      }
    }
  }, [isOpen, userOrders, pastOrders, lang]);

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

  const runLookup = (rawId: string, scrollTop = false) => {
    setTrackingInput(rawId);
    const outcome = lookupOrderTracking(rawId, userOrders, lang, pastOrders);
    if (outcome.found) {
      setActiveResult(outcome.result);
      setLookupError(null);
      if (scrollTop) {
        bodyScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setActiveResult(null);
      setLookupError(outcome.error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runLookup(trackingInput);
  };

  const triggerDigitalReceiptDownload = (receiptResult: TrackingLookupResult) => {
    const filename = buildDigitalReceiptFilename(receiptResult.trackingId);
    const htmlContent = buildDigitalReceiptHtml(receiptResult, lang);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

    setDownloadedReceiptId(receiptResult.trackingId);
    window.setTimeout(() => {
      setDownloadedReceiptId((current) =>
        current === receiptResult.trackingId ? null : current,
      );
    }, 2200);
  };

  const handleDownloadPastOrderReceipt = (order: OrderRecord) => {
    const outcome = lookupOrderTracking(order.orderId, userOrders, lang, [
      order,
    ]);
    if (outcome.found) {
      triggerDigitalReceiptDownload(outcome.result);
    }
  };

  const progress = activeResult
    ? getTrackingStatusProgress(activeResult.status)
    : null;
  const statusStyles = activeResult
    ? getStatusAccentClasses(activeResult.status)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#171614]/65 dark:bg-black/80 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-tracking-page-title"
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#F8F7F4] dark:bg-[#161412] border border-[#E2DDD5] dark:border-[#2D2925] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2DDD5] dark:border-[#2D2925] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#8C6239] dark:text-[#D4A77A]">
              {t.trackingPageEyebrow}
            </p>
            <h2
              id="order-tracking-page-title"
              className="font-display text-2xl sm:text-[28px] font-semibold text-[#171614] dark:text-[#F3EFE8] leading-tight"
            >
              {t.trackingPageTitle}
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

        {/* Lookup Bar & Sample IDs */}
        <div className="px-6 py-4 border-b border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6]/55 dark:bg-[#1E1B18] space-y-3">
          <p className="text-xs sm:text-sm text-[#4A453E] dark:text-[#C7BFB3]">
            {t.trackingPageSubtitle}
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
          >
            <div className="relative flex-1">
              <label htmlFor="order-tracking-id-input" className="sr-only">
                {t.trackingInputLabel}
              </label>
              <Search
                className="w-4 h-4 text-[#5E5850] dark:text-[#9A9287] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="order-tracking-id-input"
                type="text"
                value={trackingInput}
                onChange={(e) => {
                  setTrackingInput(e.target.value);
                  if (lookupError) setLookupError(null);
                }}
                placeholder={t.trackingInputPlaceholder}
                aria-invalid={lookupError ? 'true' : 'false'}
                className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#161412] text-sm font-mono uppercase text-[#171614] dark:text-[#F3EFE8] placeholder:normal-case placeholder:font-sans placeholder:text-[#7B746B] dark:placeholder:text-[#8E867B] focus:outline-2 focus:outline-[#8C6239] dark:focus:outline-[#D4A77A]"
              />
            </div>

            <button
              type="submit"
              className="min-h-[44px] px-5 py-2.5 rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-sm font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.trackingSubmitBtn}
            </button>
          </form>

          {/* Interactive Sample & Recent Order Quick-Select Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-xs text-[#5E5850] dark:text-[#9A9287]">
              {t.trackingSamplesLabel}
            </span>
            {MOCK_TRACKING_ORDERS.map((sample) => {
              const isSelected =
                activeResult?.trackingId === sample.trackingId;
              return (
                <button
                  key={sample.trackingId}
                  type="button"
                  onClick={() => runLookup(sample.trackingId)}
                  aria-pressed={isSelected}
                  className={`px-2.5 py-1 min-h-[32px] rounded-md border text-xs font-mono transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] border-[#171614] dark:border-[#F3EFE8]'
                      : 'bg-white dark:bg-[#161412] text-[#171614] dark:text-[#F3EFE8] border-[#D8D1C7] dark:border-[#3A3530] hover:bg-[#EFECE6] dark:hover:bg-[#23201D]'
                  }`}
                >
                  {sample.trackingId} · {sample.status}
                </button>
              );
            })}
            {userOrders.map((order) => {
              const isSelected = activeResult?.trackingId === order.orderId;
              return (
                <button
                  key={order.orderId}
                  type="button"
                  onClick={() => runLookup(order.orderId)}
                  aria-pressed={isSelected}
                  className={`px-2.5 py-1 min-h-[32px] rounded-md border text-xs font-mono transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#8C6239] dark:bg-[#D4A77A] text-white dark:text-[#121110] border-[#8C6239] dark:border-[#D4A77A]'
                      : 'bg-white dark:bg-[#161412] text-[#8C6239] dark:text-[#D4A77A] border-[#8C6239]/40 dark:border-[#D4A77A]/40 hover:bg-[#EFECE6] dark:hover:bg-[#23201D]'
                  }`}
                >
                  {order.orderId}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body Content */}
        <div
          ref={bodyScrollRef}
          className="flex-1 overflow-y-auto p-5 space-y-6"
        >
          {lookupError && (
            <div
              role="alert"
              className="p-5 rounded-lg border border-[#9E2A2B]/35 dark:border-[#FCA5A5]/35 bg-[#9E2A2B]/5 dark:bg-[#9E2A2B]/15 text-sm text-[#9E2A2B] dark:text-[#FCA5A5]"
            >
              {lookupError}
            </div>
          )}

          {!activeResult && !lookupError && (
            <div className="py-12 px-6 text-center border border-dashed border-[#D8D1C7] dark:border-[#3A3530] rounded-xl bg-white/60 dark:bg-[#1A1816]/60">
              <div className="w-12 h-12 rounded-full bg-[#EFECE6] dark:bg-[#23201D] text-[#8C6239] dark:text-[#D4A77A] flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-semibold text-[#171614] dark:text-[#F3EFE8]">
                {t.trackingEmptyPromptTitle}
              </h3>
              <p className="text-sm text-[#5E5850] dark:text-[#B8B0A4] mt-2 max-w-md mx-auto leading-relaxed">
                {t.trackingEmptyPromptDesc}
              </p>
            </div>
          )}

          {activeResult && progress && statusStyles && (
            <div className="space-y-4" data-testid="tracking-result-panel">
              {/* Top Status Summary Strip */}
              <div
                className={`p-4 rounded-lg border bg-white dark:bg-[#1A1816] ${statusStyles.border}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#EAE5DC] dark:border-[#2D2925]">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#5E5850] dark:text-[#9A9287]">
                      <span className="font-mono font-semibold text-sm text-[#171614] dark:text-[#F3EFE8]">
                        {activeResult.trackingId}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {t.trackingCourierLabel}: {activeResult.courierName}
                      </span>
                    </div>
                    <div
                      className={`inline-flex items-center gap-2 text-lg font-semibold ${statusStyles.text}`}
                    >
                      {renderStatusIcon(activeResult.status, 'w-5 h-5')}
                      <span data-testid="tracking-status-label">
                        {t.trackingStatusLabels[activeResult.status]}
                      </span>
                    </div>
                  </div>

                  <div className="md:text-right">
                    <span className="block text-xs text-[#5E5850] dark:text-[#9A9287]">
                      {t.trackingEtaLabel}
                    </span>
                    <span className="text-sm font-semibold text-[#171614] dark:text-[#F3EFE8]">
                      {lang === 'bn'
                        ? activeResult.estimatedDeliveryBn
                        : activeResult.estimatedDeliveryEn}
                    </span>
                  </div>
                </div>

                {/* 4-Stage Progress Bar & Labels */}
                <div className="pt-3 space-y-2.5">
                  <div
                    className="h-2 w-full rounded-full bg-[#EAE5DC] dark:bg-[#2A2622] overflow-hidden"
                    role="progressbar"
                    aria-valuenow={progress.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={t.trackingTimelineHeading}
                  >
                    <div
                      className={`h-full transition-all duration-300 ${statusStyles.bar}`}
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {activeResult.checkpoints.map((cp, idx) => {
                      const stageName = t.trackingStageNames[cp.step];
                      return (
                        <div
                          key={cp.step}
                          className={`text-xs ${
                            cp.completed || cp.current
                              ? 'text-[#171614] dark:text-[#F3EFE8] font-semibold'
                              : 'text-[#8C8378] dark:text-[#787066]'
                          }`}
                        >
                          <span className="tabular-nums">0{idx + 1}.</span>{' '}
                          {stageName}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 2-Column Details: Timeline Checkpoints + Order Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Left: Checkpoint Log */}
                <section
                  aria-labelledby="tracking-timeline-heading"
                  className="lg:col-span-7 p-4 rounded-lg border border-[#E2DDD5] dark:border-[#2D2925] bg-white dark:bg-[#1A1816]"
                >
                  <h3
                    id="tracking-timeline-heading"
                    className="text-sm font-semibold text-[#171614] dark:text-[#F3EFE8] mb-3"
                  >
                    {t.trackingTimelineHeading}
                  </h3>

                  <ol className="space-y-3">
                    {activeResult.checkpoints.map((cp, index) => {
                      const isReached = cp.completed || cp.current;
                      const StepIcon =
                        cp.step === 'placed'
                          ? ClipboardCheck
                          : cp.step === 'processing'
                            ? Package
                            : cp.step === 'in_transit'
                              ? Truck
                              : CheckCircle2;

                      return (
                        <li
                          key={cp.step}
                          className="relative flex items-start gap-3"
                        >
                          {index < activeResult.checkpoints.length - 1 && (
                            <span
                              aria-hidden="true"
                              className={`absolute left-4 top-8 bottom-[-12px] w-px ${
                                cp.completed
                                  ? 'bg-[#8C6239] dark:bg-[#D4A77A]'
                                  : 'bg-[#E2DDD5] dark:bg-[#2D2925]'
                              }`}
                            />
                          )}

                          <div
                            className={`w-8 h-8 rounded-md border flex items-center justify-center shrink-0 z-10 ${
                              cp.current
                                ? 'bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] border-[#171614] dark:border-[#F3EFE8]'
                                : cp.completed
                                  ? 'bg-[#EFECE6] dark:bg-[#26231F] text-[#8C6239] dark:text-[#D4A77A] border-[#8C6239]/40 dark:border-[#D4A77A]/40'
                                  : 'bg-[#F8F7F4] dark:bg-[#161412] text-[#8C8378] dark:text-[#787066] border-[#E2DDD5] dark:border-[#2D2925]'
                            }`}
                          >
                            <StepIcon className="w-4 h-4" aria-hidden="true" />
                          </div>

                          <div className="flex-1 min-w-0 pb-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <p
                                className={`text-sm font-semibold ${
                                  isReached
                                    ? 'text-[#171614] dark:text-[#F3EFE8]'
                                    : 'text-[#7B746B] dark:text-[#8E867B]'
                                }`}
                              >
                                {lang === 'bn' ? cp.titleBn : cp.titleEn}
                              </p>
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono tabular-nums text-[#5E5850] dark:text-[#9A9287]">
                                <Clock
                                  className="w-3 h-3"
                                  aria-hidden="true"
                                />
                                {cp.timestamp}
                              </span>
                            </div>

                            <p
                              className={`text-xs mt-1 leading-relaxed ${
                                isReached
                                  ? 'text-[#4A453E] dark:text-[#C7BFB3]'
                                  : 'text-[#8C8378] dark:text-[#787066]'
                              }`}
                            >
                              {lang === 'bn'
                                ? cp.descriptionBn
                                : cp.descriptionEn}
                            </p>

                            <p className="inline-flex items-center gap-1 text-[11px] text-[#5E5850] dark:text-[#9A9287] mt-1.5">
                              <MapPin
                                className="w-3 h-3 shrink-0"
                                aria-hidden="true"
                              />
                              <span>
                                {lang === 'bn' ? cp.locationBn : cp.locationEn}
                              </span>
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>

                {/* Right: Order Details & Totals */}
                <section
                  aria-labelledby="tracking-summary-heading"
                  className="lg:col-span-5 p-4 rounded-lg border border-[#E2DDD5] dark:border-[#2D2925] bg-white dark:bg-[#1A1816] space-y-3.5"
                >
                  <h3
                    id="tracking-summary-heading"
                    className="text-sm font-semibold text-[#171614] dark:text-[#F3EFE8]"
                  >
                    {t.trackingSummaryHeading}
                  </h3>

                  <div className="space-y-2 text-xs text-[#4A453E] dark:text-[#C7BFB3] pb-3 border-b border-[#EAE5DC] dark:border-[#2D2925]">
                    <div>
                      <span className="block text-[11px] text-[#7B746B] dark:text-[#8E867B]">
                        {t.trackingRecipientLabel}
                      </span>
                      <p className="font-medium text-[#171614] dark:text-[#F3EFE8] mt-0.5">
                        {activeResult.customerName} ·{' '}
                        <span className="font-mono">
                          {activeResult.phoneMasked}
                        </span>
                      </p>
                      <p className="mt-0.5">{activeResult.destination}</p>
                    </div>

                    <div>
                      <span className="block text-[11px] text-[#7B746B] dark:text-[#8E867B]">
                        {t.trackingPaymentLabel}
                      </span>
                      <p className="font-medium text-[#171614] dark:text-[#F3EFE8] mt-0.5">
                        {lang === 'bn'
                          ? activeResult.paymentSummaryBn
                          : activeResult.paymentSummaryEn}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    {activeResult.itemsSummary.map((item, idx) => (
                      <div
                        key={`${item.nameEn}-${idx}`}
                        className="flex justify-between gap-2 text-[#4A453E] dark:text-[#C7BFB3]"
                      >
                        <span>
                          {lang === 'bn' ? item.nameBn : item.nameEn} (
                          {item.variant}){' '}
                          <span className="whitespace-nowrap">
                            × {item.quantity}
                          </span>
                        </span>
                        <span className="tabular-nums font-medium shrink-0">
                          {formatBDT(item.lineTotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[#EAE5DC] dark:border-[#2D2925] space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#5E5850] dark:text-[#9A9287]">
                      <span>{t.subtotalLabel}</span>
                      <span className="tabular-nums">
                        {formatBDT(activeResult.totals.subtotal)}
                      </span>
                    </div>
                    {activeResult.totals.discountAmount > 0 && (
                      <div className="flex justify-between text-[#2E5A36] dark:text-[#6EE7B7]">
                        <span>
                          {t.discountRowLabel}
                          {activeResult.discountCode
                            ? ` (${activeResult.discountCode})`
                            : ''}
                        </span>
                        <span className="tabular-nums font-medium">
                          -{formatBDT(activeResult.totals.discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#5E5850] dark:text-[#9A9287]">
                      <span>{t.shippingLabel}</span>
                      <span className="tabular-nums">
                        {activeResult.totals.shippingFee === 0
                          ? t.freeLabel
                          : formatBDT(activeResult.totals.shippingFee)}
                      </span>
                    </div>
                    {activeResult.totals.giftWrappingFee > 0 && (
                      <div className="flex justify-between text-[#5E5850] dark:text-[#9A9287]">
                        <span>{t.giftWrappingFeeRow}</span>
                        <span className="tabular-nums">
                          {formatBDT(activeResult.totals.giftWrappingFee)}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-[#EAE5DC] dark:border-[#2D2925] flex justify-between text-sm font-semibold text-[#171614] dark:text-[#F3EFE8]">
                      <span>{t.totalLabel}</span>
                      <span className="tabular-nums">
                        {formatBDT(activeResult.totals.grandTotal)}
                      </span>
                    </div>
                  </div>

                  {activeResult.status === 'Delivered' && (
                    <div className="pt-1">
                      <button
                        type="button"
                        data-testid="download-digital-receipt-btn"
                        onClick={() => triggerDigitalReceiptDownload(activeResult)}
                        className={`w-full min-h-[40px] px-4 py-2 rounded-md border text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A] ${
                          downloadedReceiptId === activeResult.trackingId
                            ? 'bg-[#EFECE6] dark:bg-[#23201D] border-[#2E5A36] dark:border-[#6EE7B7] text-[#2E5A36] dark:text-[#6EE7B7]'
                            : 'bg-[#171614] dark:bg-[#F3EFE8] border-[#171614] dark:border-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5]'
                        }`}
                      >
                        {downloadedReceiptId === activeResult.trackingId ? (
                          <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                        ) : (
                          <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                        )}
                        <span>
                          {downloadedReceiptId === activeResult.trackingId
                            ? t.digitalReceiptDownloaded
                            : t.digitalReceiptDownloadBtn}
                        </span>
                      </button>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {/* Past Completed Purchases Section (Persisted in Local Storage) */}
          <section
            data-testid="past-orders-section"
            aria-labelledby="past-orders-heading"
            className="pt-5 border-t border-[#E2DDD5] dark:border-[#2D2925]"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h3
                  id="past-orders-heading"
                  className="font-display text-xl font-semibold text-[#171614] dark:text-[#F3EFE8]"
                >
                  {t.pastOrdersHeading}
                </h3>
                <p className="text-xs text-[#5E5850] dark:text-[#9A9287] mt-0.5">
                  {t.pastOrdersSubcopy}
                </p>
              </div>
              <span className="shrink-0 pt-1 text-xs font-medium text-[#5E5850] dark:text-[#9A9287] tabular-nums">
                {pastOrders.length}
              </span>
            </div>

            {pastOrders.length === 0 ? (
              <div className="p-5 rounded-lg border border-dashed border-[#D8D1C7] dark:border-[#3A3530] bg-white/60 dark:bg-[#1A1816]/60 text-xs text-[#5E5850] dark:text-[#9A9287] text-center">
                {t.pastOrdersEmpty}
              </div>
            ) : (
              <div className="space-y-3">
                {pastOrders.map((order) => {
                  const isCurrentlyInspected =
                    activeResult?.trackingId === order.orderId;
                  const formattedDate = new Date(
                    order.createdAt,
                  ).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const firstItem = order.items[0];
                  const firstItemName = firstItem
                    ? lang === 'bn'
                      ? firstItem.nameBn
                      : firstItem.nameEn
                    : '';
                  const extraItemCount = Math.max(0, order.items.length - 1);
                  const paymentLabel =
                    order.paymentMethod === 'cod'
                      ? lang === 'bn'
                        ? 'ক্যাশ অন ডেলিভারি'
                        : 'Cash on Delivery'
                      : order.paymentMethod === 'bkash'
                        ? 'bKash'
                        : 'Nagad';

                  return (
                    <article
                      key={order.orderId}
                      data-testid={`past-order-card-${order.orderId}`}
                      className={`p-4 rounded-lg border bg-white dark:bg-[#1A1816] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        isCurrentlyInspected
                          ? 'border-[#8C6239] dark:border-[#D4A77A]'
                          : 'border-[#E2DDD5] dark:border-[#2D2925]'
                      }`}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono font-semibold text-[#171614] dark:text-[#F3EFE8]">
                            {order.orderId}
                          </span>
                          <span
                            aria-hidden="true"
                            className="text-[#B8B0A4] dark:text-[#5E5850]"
                          >
                            ·
                          </span>
                          <span className="text-[#5E5850] dark:text-[#9A9287] tabular-nums">
                            {formattedDate}
                          </span>
                          <span
                            aria-hidden="true"
                            className="text-[#B8B0A4] dark:text-[#5E5850]"
                          >
                            ·
                          </span>
                          <span className="inline-flex items-center gap-1 font-medium text-[#2E5A36] dark:text-[#6EE7B7]">
                            <CheckCircle2
                              className="w-3.5 h-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            <span>{t.pastOrdersDeliveredLabel}</span>
                          </span>
                        </div>

                        <p className="text-sm font-medium text-[#171614] dark:text-[#F3EFE8] truncate">
                          {firstItemName}
                          {firstItem ? ` (${firstItem.variant})` : ''}
                          {extraItemCount > 0
                            ? lang === 'bn'
                              ? ` + আরও ${extraItemCount}টি`
                              : ` + ${extraItemCount} more`
                            : ''}
                        </p>

                        <p className="text-xs text-[#5E5850] dark:text-[#9A9287] truncate">
                          {order.address} · {paymentLabel}
                        </p>
                      </div>

                      <div className="flex flex-wrap sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                        <span className="text-sm font-semibold text-[#171614] dark:text-[#F3EFE8] tabular-nums">
                          {formatBDT(order.totals.grandTotal)}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            data-testid={`past-order-receipt-btn-${order.orderId}`}
                            onClick={() => handleDownloadPastOrderReceipt(order)}
                            className={`px-3 py-1.5 min-h-[36px] rounded-md border text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                              downloadedReceiptId === order.orderId
                                ? 'bg-[#EFECE6] dark:bg-[#23201D] border-[#2E5A36] dark:border-[#6EE7B7] text-[#2E5A36] dark:text-[#6EE7B7]'
                                : 'border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#161412] text-[#171614] dark:text-[#F3EFE8] hover:border-[#8C6239] dark:hover:border-[#D4A77A]'
                            }`}
                          >
                            {downloadedReceiptId === order.orderId ? (
                              <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            ) : (
                              <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            )}
                            <span>
                              {downloadedReceiptId === order.orderId
                                ? t.digitalReceiptDownloaded
                                : t.digitalReceiptShortBtn}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => runLookup(order.orderId, true)}
                            className="px-3 py-1.5 min-h-[36px] rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-[#F8F7F4] dark:bg-[#23201D] text-xs font-medium text-[#171614] dark:text-[#F3EFE8] hover:border-[#8C6239] dark:hover:border-[#D4A77A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            {t.pastOrdersViewReceiptBtn}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
