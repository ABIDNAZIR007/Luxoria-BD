import {
  ArrowLeft,
  CheckCircle2,
  Gift,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { COPY } from '../data/i18n';
import type {
  CartItem,
  CartTotals,
  CheckoutFormState,
  DeliveryZone,
  Language,
  OrderRecord,
  PaymentMethod,
  ValidationErrors,
} from '../types/store';
import {
  createOrderRecord,
  formatBDT,
  GIFT_WRAPPING_FEE,
  validateCheckoutForm,
  validateDiscountCode,
} from '../utils/storeLogic';
import { ResilientImage } from './ResilientImage';

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  isDirectCheckout?: boolean;
  lang: Language;
  cart: CartItem[];
  totals: CartTotals;
  deliveryZone: DeliveryZone;
  giftWrapping: boolean;
  discountCode: string | null;
  onChangeDeliveryZone: (zone: DeliveryZone) => void;
  onChangeGiftWrapping: (enabled: boolean) => void;
  onChangeDiscountCode: (code: string | null) => void;
  onUpdateQuantity: (itemKey: string, delta: number) => void;
  onRemoveItem: (itemKey: string) => void;
  onOrderConfirmed: (order: OrderRecord) => void;
  onOpenOrderTracker: () => void;
  onClose: () => void;
}

const initialFormState = (
  deliveryZone: DeliveryZone,
  giftWrapping = false,
  discountCode?: string | null,
): CheckoutFormState => ({
  customerName: '',
  phone: '',
  deliveryZone,
  address: '',
  paymentMethod: 'cod',
  transactionId: '',
  note: '',
  giftWrapping,
  giftMessage: '',
  discountCode: discountCode ?? undefined,
});

export function CartCheckoutDrawer({
  isOpen,
  isDirectCheckout = false,
  lang,
  cart,
  totals,
  deliveryZone,
  giftWrapping,
  discountCode,
  onChangeDeliveryZone,
  onChangeGiftWrapping,
  onChangeDiscountCode,
  onUpdateQuantity,
  onRemoveItem,
  onOrderConfirmed,
  onOpenOrderTracker,
  onClose,
}: CartCheckoutDrawerProps) {
  const [step, setStep] = useState<'bag' | 'checkout' | 'confirmed'>(() =>
    isDirectCheckout ? 'checkout' : 'bag',
  );
  const [form, setForm] = useState<CheckoutFormState>(() =>
    initialFormState(deliveryZone, giftWrapping, discountCode),
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [draftDiscountCode, setDraftDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    setForm((prev) => ({ ...prev, deliveryZone }));
  }, [deliveryZone]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, giftWrapping }));
  }, [giftWrapping]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, discountCode: discountCode ?? undefined }));
  }, [discountCode]);

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      return;
    }
    const justOpened = !wasOpenRef.current;
    wasOpenRef.current = true;
    if (justOpened || isDirectCheckout) {
      setConfirmedOrder(null);
      setErrors({});
      setDiscountError(null);
      setStep(isDirectCheckout ? 'checkout' : 'bag');
    }
  }, [isOpen, isDirectCheckout]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setStep('bag');
        setConfirmedOrder(null);
        setErrors({});
        setDiscountError(null);
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

  const handleClose = () => {
    setStep('bag');
    setConfirmedOrder(null);
    setErrors({});
    setDiscountError(null);
    onClose();
  };

  const handleFieldChange = <K extends keyof CheckoutFormState>(
    field: K,
    value: CheckoutFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (field === 'deliveryZone') {
      onChangeDeliveryZone(value as DeliveryZone);
    }
    if (field === 'giftWrapping') {
      onChangeGiftWrapping(Boolean(value));
    }
  };

  const handleApplyDiscount = () => {
    const result = validateDiscountCode(draftDiscountCode, lang);
    if (!result.valid || !result.normalizedCode) {
      setDiscountError(result.error ?? null);
      return;
    }
    setDiscountError(null);
    setDraftDiscountCode('');
    onChangeDiscountCode(result.normalizedCode);
  };

  const handleRemoveDiscount = () => {
    setDiscountError(null);
    setDraftDiscountCode('');
    onChangeDiscountCode(null);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCheckoutForm(form, lang);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    const order = createOrderRecord(form, cart, totals);
    setConfirmedOrder(order);
    onOrderConfirmed(order);
    setForm(initialFormState(deliveryZone, false, null));
    setErrors({});
    setDraftDiscountCode('');
    setDiscountError(null);
    setStep('confirmed');
  };

  const freeShippingProgress = Math.min(
    100,
    Math.round((totals.subtotal / totals.freeShippingThreshold) * 100),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#171614]/55 dark:bg-black/75 backdrop-blur-[2px]"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-heading"
    >
      <div
        className="w-full max-w-md h-full bg-[#F8F7F4] dark:bg-[#161412] border-l border-[#E2DDD5] dark:border-[#2D2925] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#E2DDD5] dark:border-[#2D2925] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {step === 'checkout' && !isDirectCheckout && (
              <button
                type="button"
                onClick={() => setStep('bag')}
                aria-label={t.backToBag}
                className="w-9 h-9 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] flex items-center justify-center text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
            <h2
              id="drawer-heading"
              className="font-display text-2xl font-semibold text-[#171614] dark:text-[#F3EFE8] truncate"
            >
              {step === 'bag'
                ? `${t.bagTitle} (${totals.itemCount})`
                : step === 'checkout'
                  ? t.checkoutTitle
                  : t.orderReceiptTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label={t.closeLabel}
            className="w-10 h-10 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] flex items-center justify-center text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Step 1: Bag View */}
        {step === 'bag' && (
          <>
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-[#EFECE6] dark:bg-[#23201D] flex items-center justify-center text-[#8C6239] dark:text-[#D4A77A] mb-4">
                  <ShoppingBag className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-[#171614] dark:text-[#F3EFE8]">
                  {t.bagEmptyTitle}
                </h3>
                <p className="text-sm text-[#5E5850] dark:text-[#B8B0A4] mt-2 max-w-xs">
                  {t.bagEmptyDesc}
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-6 px-5 py-2.5 min-h-[44px] rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-sm font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] cursor-pointer"
                >
                  {t.continueShopping}
                </button>
              </div>
            ) : (
              <>
                <div className="px-6 py-3 bg-[#EFECE6]/70 dark:bg-[#1E1B18] border-b border-[#E2DDD5] dark:border-[#2D2925]">
                  <p className="text-xs text-[#4A453E] dark:text-[#C7BFB3] mb-2">
                    {totals.amountToFreeShipping === 0
                      ? t.freeShippingUnlocked
                      : `${t.freeShippingRemainingPrefix} ${formatBDT(totals.amountToFreeShipping)} ${t.freeShippingRemainingSuffix}`}
                  </p>
                  <div className="h-1.5 w-full rounded-full bg-[#DED7CC] dark:bg-[#2F2B26] overflow-hidden">
                    <div
                      className="h-full bg-[#8C6239] dark:bg-[#D4A77A] transition-all duration-300"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#EAE5DC] dark:divide-[#2D2925]">
                  {cart.map((item) => {
                    const itemTitle = lang === 'bn' ? item.nameBn : item.nameEn;
                    return (
                      <div key={item.key} className="py-4 flex gap-4">
                        <div className="w-20 h-20 rounded-md overflow-hidden border border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6] dark:bg-[#23201D] shrink-0">
                          <ResilientImage
                            src={item.image}
                            alt={itemTitle}
                            fallbackTitle={itemTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-[#171614] dark:text-[#F3EFE8] truncate">
                                {itemTitle}
                              </h3>
                              <p className="text-xs text-[#5E5850] dark:text-[#9A9287] mt-0.5">
                                {item.variant} <span aria-hidden="true">·</span>{' '}
                                <span className="font-mono">{item.sku}</span>
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.key)}
                              aria-label={`Remove ${itemTitle} (${item.variant})`}
                              className="w-8 h-8 flex items-center justify-center text-[#7B746B] dark:text-[#9A9287] hover:text-[#9E2A2B] dark:hover:text-[#FCA5A5] cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-3 mt-3">
                            <div className="inline-flex items-center border border-[#D8D1C7] dark:border-[#3A3530] rounded bg-[#F8F7F4] dark:bg-[#1E1B18]">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.key, -1)}
                                aria-label={`Decrease quantity of ${itemTitle}`}
                                className="w-8 h-8 flex items-center justify-center text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#2A2622] cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                              <span className="w-7 text-center text-xs font-medium text-[#171614] dark:text-[#F3EFE8] tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.key, 1)}
                                aria-label={`Increase quantity of ${itemTitle}`}
                                className="w-8 h-8 flex items-center justify-center text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#2A2622] cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                            </div>

                            <span className="text-sm font-semibold text-[#171614] dark:text-[#F3EFE8] tabular-nums">
                              {formatBDT(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Optional Gift Wrapping & Gift Message in Bag */}
                  <div className="pt-4 pb-1">
                    <div
                      className={`p-3.5 rounded-lg border transition-colors ${
                        giftWrapping
                          ? 'bg-[#EFECE6]/70 dark:bg-[#221F1B] border-[#8C6239] dark:border-[#D4A77A]'
                          : 'bg-white/70 dark:bg-[#1A1816] border-[#E2DDD5] dark:border-[#2D2925]'
                      }`}
                    >
                      <label
                        htmlFor="bag-gift-wrapping"
                        className="flex items-start gap-3 cursor-pointer"
                      >
                        <input
                          id="bag-gift-wrapping"
                          type="checkbox"
                          checked={giftWrapping}
                          onChange={(e) =>
                            handleFieldChange('giftWrapping', e.target.checked)
                          }
                          className="mt-0.5 w-4 h-4 rounded accent-[#8C6239] dark:accent-[#D4A77A] cursor-pointer shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#171614] dark:text-[#F3EFE8]">
                              <Gift
                                className="w-3.5 h-3.5 text-[#8C6239] dark:text-[#D4A77A]"
                                aria-hidden="true"
                              />
                              {t.giftWrappingLabel}
                            </span>
                            <span className="text-xs font-semibold text-[#8C6239] dark:text-[#D4A77A] tabular-nums shrink-0">
                              +{formatBDT(GIFT_WRAPPING_FEE)}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5E5850] dark:text-[#9A9287] mt-0.5 leading-relaxed">
                            {t.giftWrappingDesc}
                          </p>
                        </div>
                      </label>

                      {giftWrapping && (
                        <div className="mt-3 pt-3 border-t border-[#E2DDD5] dark:border-[#2D2925]">
                          <label
                            htmlFor="bag-gift-message"
                            className="block text-xs font-medium text-[#171614] dark:text-[#F3EFE8] mb-1.5"
                          >
                            {t.giftMessageLabel}
                          </label>
                          <textarea
                            id="bag-gift-message"
                            rows={2}
                            maxLength={240}
                            value={form.giftMessage}
                            onChange={(e) =>
                              handleFieldChange('giftMessage', e.target.value)
                            }
                            placeholder={t.giftMessagePlaceholder}
                            className="w-full px-3 py-2 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#161412] text-xs text-[#171614] dark:text-[#F3EFE8] placeholder:text-[#7B746B] dark:placeholder:text-[#8E867B] focus:outline-2 focus:outline-[#8C6239] dark:focus:outline-[#D4A77A] resize-y"
                          />
                        </div>
                      )}
                    </div>

                    {/* Discount Code in Bag */}
                    <div
                      className={`mt-3 p-3.5 rounded-lg border transition-colors ${
                        discountCode
                          ? 'bg-[#EFECE6]/70 dark:bg-[#221F1B] border-[#2E5A36] dark:border-[#6EE7B7]/60'
                          : 'bg-white/70 dark:bg-[#1A1816] border-[#E2DDD5] dark:border-[#2D2925]'
                      }`}
                    >
                      <label
                        htmlFor="bag-discount-code"
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#171614] dark:text-[#F3EFE8] mb-2"
                      >
                        <Tag
                          className="w-3.5 h-3.5 text-[#8C6239] dark:text-[#D4A77A]"
                          aria-hidden="true"
                        />
                        {t.discountCodeLabel}
                      </label>

                      {discountCode ? (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="px-2 py-0.5 rounded bg-[#2E5A36]/12 dark:bg-[#2E5A36]/30 text-[#2E5A36] dark:text-[#6EE7B7] font-mono text-xs font-semibold">
                              {discountCode}
                            </span>
                            <span className="text-xs text-[#2E5A36] dark:text-[#6EE7B7] truncate">
                              {t.discountAppliedBadge}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveDiscount}
                            className="px-2.5 py-1.5 rounded border border-[#D8D1C7] dark:border-[#3A3530] text-xs font-medium text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] cursor-pointer shrink-0"
                          >
                            {t.removeDiscountBtn}
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <input
                              id="bag-discount-code"
                              type="text"
                              value={draftDiscountCode}
                              onChange={(e) => {
                                setDraftDiscountCode(e.target.value);
                                if (discountError) setDiscountError(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleApplyDiscount();
                                }
                              }}
                              placeholder={t.discountCodePlaceholder}
                              className="flex-1 min-w-0 min-h-[38px] px-3 py-1.5 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#161412] text-xs font-mono uppercase text-[#171614] dark:text-[#F3EFE8] placeholder:normal-case placeholder:font-sans placeholder:text-[#7B746B] dark:placeholder:text-[#8E867B] focus:outline-2 focus:outline-[#8C6239] dark:focus:outline-[#D4A77A]"
                            />
                            <button
                              type="button"
                              onClick={handleApplyDiscount}
                              className="px-3.5 min-h-[38px] rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-xs font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] cursor-pointer shrink-0"
                            >
                              {t.applyDiscountBtn}
                            </button>
                          </div>
                          {discountError && (
                            <p className="mt-1.5 text-xs text-[#9E2A2B] dark:text-[#FCA5A5]">
                              {discountError}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Zone & Bag Footer */}
                <div className="p-6 border-t border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6]/50 dark:bg-[#1E1B18] space-y-4">
                  <div>
                    <span className="block text-xs font-medium text-[#4A453E] dark:text-[#C7BFB3] mb-2">
                      {t.deliveryZoneLabel}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onChangeDeliveryZone('dhaka')}
                        aria-pressed={deliveryZone === 'dhaka'}
                        className={`px-3 py-2 min-h-[40px] rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                          deliveryZone === 'dhaka'
                            ? 'bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] border-[#171614] dark:border-[#F3EFE8]'
                            : 'bg-[#F8F7F4] dark:bg-[#161412] text-[#171614] dark:text-[#F3EFE8] border-[#D8D1C7] dark:border-[#3A3530]'
                        }`}
                      >
                        {t.dhakaCity}
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeDeliveryZone('outside')}
                        aria-pressed={deliveryZone === 'outside'}
                        className={`px-3 py-2 min-h-[40px] rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                          deliveryZone === 'outside'
                            ? 'bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] border-[#171614] dark:border-[#F3EFE8]'
                            : 'bg-[#F8F7F4] dark:bg-[#161412] text-[#171614] dark:text-[#F3EFE8] border-[#D8D1C7] dark:border-[#3A3530]'
                        }`}
                      >
                        {t.outsideDhaka}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-[#4A453E] dark:text-[#C7BFB3]">
                      <span>{t.subtotalLabel}</span>
                      <span className="tabular-nums font-medium">
                        {formatBDT(totals.subtotal)}
                      </span>
                    </div>
                    {totals.discountAmount > 0 && (
                      <div className="flex justify-between text-[#2E5A36] dark:text-[#6EE7B7]">
                        <span>
                          {t.discountRowLabel}
                          {discountCode ? ` (${discountCode})` : ''}
                        </span>
                        <span className="tabular-nums font-medium">
                          -{formatBDT(totals.discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#4A453E] dark:text-[#C7BFB3]">
                      <span>{t.shippingLabel}</span>
                      <span className="tabular-nums font-medium">
                        {totals.shippingFee === 0
                          ? t.freeLabel
                          : formatBDT(totals.shippingFee)}
                      </span>
                    </div>
                    {totals.giftWrappingFee > 0 && (
                      <div className="flex justify-between text-[#4A453E] dark:text-[#C7BFB3]">
                        <span>{t.giftWrappingFeeRow}</span>
                        <span className="tabular-nums font-medium">
                          {formatBDT(totals.giftWrappingFee)}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-[#D8D1C7] dark:border-[#2D2925] flex justify-between text-base font-semibold text-[#171614] dark:text-[#F3EFE8]">
                      <span>{t.totalLabel}</span>
                      <span className="tabular-nums">
                        {formatBDT(totals.grandTotal)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep('checkout')}
                    className="w-full min-h-[46px] px-5 py-3 rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-sm font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] transition-colors cursor-pointer"
                  >
                    {t.proceedCheckout}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Step 2: Checkout Form */}
        {step === 'checkout' && (
          <form
            onSubmit={handleSubmitOrder}
            noValidate
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5">
              {isDirectCheckout && cart.length > 0 && (
                <div
                  data-testid="direct-checkout-summary"
                  className="p-3 rounded-lg border border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6]/60 dark:bg-[#1E1B18] space-y-2"
                >
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-[#8C6239] dark:text-[#D4A77A]">
                    {t.directCheckoutBadge}
                  </span>
                  {cart.map((item) => {
                    const itemTitle = lang === 'bn' ? item.nameBn : item.nameEn;
                    return (
                      <div key={item.key} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded overflow-hidden border border-[#E2DDD5] dark:border-[#2D2925] bg-[#F8F7F4] dark:bg-[#161412] shrink-0">
                          <ResilientImage
                            src={item.image}
                            alt={itemTitle}
                            fallbackTitle={itemTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#171614] dark:text-[#F3EFE8] truncate">
                            {itemTitle}
                          </p>
                          <p className="text-[11px] text-[#5E5850] dark:text-[#9A9287]">
                            {item.variant} <span aria-hidden="true">·</span> ×{' '}
                            {item.quantity}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-[#171614] dark:text-[#F3EFE8] tabular-nums shrink-0">
                          {formatBDT(item.price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div>
                <label
                  htmlFor="checkout-name"
                  className="block text-xs font-medium text-[#171614] dark:text-[#F3EFE8] mb-1.5"
                >
                  {t.fullNameLabel}
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  value={form.customerName}
                  onChange={(e) =>
                    handleFieldChange('customerName', e.target.value)
                  }
                  placeholder={t.fullNamePlaceholder}
                  className="w-full min-h-[42px] px-3.5 py-2 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#1E1B18] text-sm text-[#171614] dark:text-[#F3EFE8] placeholder:text-[#7B746B] dark:placeholder:text-[#8E867B] focus:outline-2 focus:outline-[#8C6239] dark:focus:outline-[#D4A77A]"
                />
                {errors.customerName && (
                  <p className="mt-1 text-xs text-[#9E2A2B] dark:text-[#FCA5A5]">
                    {errors.customerName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-phone"
                  className="block text-xs font-medium text-[#171614] dark:text-[#F3EFE8] mb-1.5"
                >
                  {t.phoneLabel}
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className="w-full min-h-[42px] px-3.5 py-2 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#1E1B18] text-sm text-[#171614] dark:text-[#F3EFE8] placeholder:text-[#7B746B] dark:placeholder:text-[#8E867B] font-mono focus:outline-2 focus:outline-[#8C6239] dark:focus:outline-[#D4A77A]"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-[#9E2A2B] dark:text-[#FCA5A5]">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <span className="block text-xs font-medium text-[#171614] dark:text-[#F3EFE8] mb-1.5">
                  {t.deliveryZoneLabel}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleFieldChange('deliveryZone', 'dhaka')}
                    aria-pressed={form.deliveryZone === 'dhaka'}
                    className={`px-3 py-2 min-h-[40px] rounded-md text-xs font-medium border cursor-pointer ${
                      form.deliveryZone === 'dhaka'
                        ? 'bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] border-[#171614] dark:border-[#F3EFE8]'
                        : 'bg-white dark:bg-[#1E1B18] text-[#171614] dark:text-[#F3EFE8] border-[#D8D1C7] dark:border-[#3A3530]'
                    }`}
                  >
                    {t.dhakaCity}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('deliveryZone', 'outside')}
                    aria-pressed={form.deliveryZone === 'outside'}
                    className={`px-3 py-2 min-h-[40px] rounded-md text-xs font-medium border cursor-pointer ${
                      form.deliveryZone === 'outside'
                        ? 'bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] border-[#171614] dark:border-[#F3EFE8]'
                        : 'bg-white dark:bg-[#1E1B18] text-[#171614] dark:text-[#F3EFE8] border-[#D8D1C7] dark:border-[#3A3530]'
                    }`}
                  >
                    {t.outsideDhaka}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="checkout-address"
                  className="block text-xs font-medium text-[#171614] dark:text-[#F3EFE8] mb-1.5"
                >
                  {t.addressLabel}
                </label>
                <textarea
                  id="checkout-address"
                  rows={2}
                  value={form.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  placeholder={t.addressPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#1E1B18] text-sm text-[#171614] dark:text-[#F3EFE8] placeholder:text-[#7B746B] dark:placeholder:text-[#8E867B] focus:outline-2 focus:outline-[#8C6239] dark:focus:outline-[#D4A77A]"
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-[#9E2A2B] dark:text-[#FCA5A5]">
                    {errors.address}
                  </p>
                )}
              </div>

              <div>
                <span className="block text-xs font-medium text-[#171614] dark:text-[#F3EFE8] mb-1.5">
                  {t.paymentLabel}
                </span>
                <div className="space-y-2">
                  {(
                    [
                      ['cod', t.paymentCod],
                      ['bkash', t.paymentBkash],
                      ['nagad', t.paymentNagad],
                    ] as [PaymentMethod, string][]
                  ).map(([method, label]) => (
                    <label
                      key={method}
                      className={`flex items-center gap-2.5 p-3 rounded-md border text-xs font-medium cursor-pointer ${
                        form.paymentMethod === method
                          ? 'bg-[#EFECE6] dark:bg-[#26231F] border-[#8C6239] dark:border-[#D4A77A] text-[#171614] dark:text-[#F3EFE8]'
                          : 'bg-white dark:bg-[#1E1B18] border-[#D8D1C7] dark:border-[#3A3530] text-[#4A453E] dark:text-[#C7BFB3]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={form.paymentMethod === method}
                        onChange={() =>
                          handleFieldChange('paymentMethod', method)
                        }
                        className="accent-[#171614] dark:accent-[#D4A77A]"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {form.paymentMethod !== 'cod' && (
                <div>
                  <label
                    htmlFor="checkout-trx"
                    className="block text-xs font-medium text-[#171614] dark:text-[#F3EFE8] mb-1.5"
                  >
                    {t.trxIdLabel}
                  </label>
                  <input
                    id="checkout-trx"
                    type="text"
                    value={form.transactionId}
                    onChange={(e) =>
                      handleFieldChange('transactionId', e.target.value)
                    }
                    placeholder={t.trxIdPlaceholder}
                    className="w-full min-h-[42px] px-3.5 py-2 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#1E1B18] text-sm text-[#171614] dark:text-[#F3EFE8] placeholder:text-[#7B746B] dark:placeholder:text-[#8E867B] font-mono focus:outline-2 focus:outline-[#8C6239] dark:focus:outline-[#D4A77A]"
                  />
                  {errors.transactionId && (
                    <p className="mt-1 text-xs text-[#9E2A2B] dark:text-[#FCA5A5]">
                      {errors.transactionId}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="checkout-note"
                  className="block text-xs font-medium text-[#171614] dark:text-[#F3EFE8] mb-1.5"
                >
                  {t.noteLabel}
                </label>
                <input
                  id="checkout-note"
                  type="text"
                  value={form.note}
                  onChange={(e) => handleFieldChange('note', e.target.value)}
                  placeholder={t.notePlaceholder}
                  className="w-full min-h-[42px] px-3.5 py-2 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#1E1B18] text-sm text-[#171614] dark:text-[#F3EFE8] placeholder:text-[#7B746B] dark:placeholder:text-[#8E867B] focus:outline-2 focus:outline-[#8C6239] dark:focus:outline-[#D4A77A]"
                />
              </div>

              <div
                className={`p-3.5 rounded-lg border transition-colors ${
                  form.giftWrapping
                    ? 'bg-[#EFECE6]/70 dark:bg-[#26231F] border-[#8C6239] dark:border-[#D4A77A]'
                    : 'bg-white dark:bg-[#1E1B18] border-[#D8D1C7] dark:border-[#3A3530]'
                }`}
              >
                <label
                  htmlFor="checkout-gift-wrapping"
                  className="flex items-start gap-3 cursor-pointer"
                >
                  <input
                    id="checkout-gift-wrapping"
                    type="checkbox"
                    checked={form.giftWrapping}
                    onChange={(e) =>
                      handleFieldChange('giftWrapping', e.target.checked)
                    }
                    className="mt-0.5 w-4 h-4 rounded accent-[#8C6239] dark:accent-[#D4A77A] cursor-pointer shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#171614] dark:text-[#F3EFE8]">
                        <Gift
                          className="w-3.5 h-3.5 text-[#8C6239] dark:text-[#D4A77A]"
                          aria-hidden="true"
                        />
                        {t.giftWrappingLabel}
                      </span>
                      <span className="text-xs font-semibold text-[#8C6239] dark:text-[#D4A77A] tabular-nums shrink-0">
                        +{formatBDT(GIFT_WRAPPING_FEE)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5E5850] dark:text-[#9A9287] mt-0.5 leading-relaxed">
                      {t.giftWrappingDesc}
                    </p>
                  </div>
                </label>

                {form.giftWrapping && (
                  <div className="mt-3 pt-3 border-t border-[#E2DDD5] dark:border-[#2D2925]">
                    <label
                      htmlFor="checkout-gift-message"
                      className="block text-xs font-medium text-[#171614] dark:text-[#F3EFE8] mb-1.5"
                    >
                      {t.giftMessageLabel}
                    </label>
                    <textarea
                      id="checkout-gift-message"
                      rows={2}
                      maxLength={240}
                      value={form.giftMessage}
                      onChange={(e) =>
                        handleFieldChange('giftMessage', e.target.value)
                      }
                      placeholder={t.giftMessagePlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#161412] text-sm text-[#171614] dark:text-[#F3EFE8] placeholder:text-[#7B746B] dark:placeholder:text-[#8E867B] focus:outline-2 focus:outline-[#8C6239] dark:focus:outline-[#D4A77A] resize-y"
                    />
                  </div>
                )}
              </div>

              {/* Discount Code in Checkout */}
              <div
                className={`p-3.5 rounded-lg border transition-colors ${
                  discountCode
                    ? 'bg-[#EFECE6]/70 dark:bg-[#26231F] border-[#2E5A36] dark:border-[#6EE7B7]/60'
                    : 'bg-white dark:bg-[#1E1B18] border-[#D8D1C7] dark:border-[#3A3530]'
                }`}
              >
                <label
                  htmlFor="checkout-discount-code"
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#171614] dark:text-[#F3EFE8] mb-2"
                >
                  <Tag
                    className="w-3.5 h-3.5 text-[#8C6239] dark:text-[#D4A77A]"
                    aria-hidden="true"
                  />
                  {t.discountCodeLabel}
                </label>

                {discountCode ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded bg-[#2E5A36]/12 dark:bg-[#2E5A36]/30 text-[#2E5A36] dark:text-[#6EE7B7] font-mono text-xs font-semibold">
                        {discountCode}
                      </span>
                      <span className="text-xs text-[#2E5A36] dark:text-[#6EE7B7] truncate">
                        {t.discountAppliedBadge}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveDiscount}
                      className="px-2.5 py-1.5 rounded border border-[#D8D1C7] dark:border-[#3A3530] text-xs font-medium text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] cursor-pointer shrink-0"
                    >
                      {t.removeDiscountBtn}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        id="checkout-discount-code"
                        type="text"
                        value={draftDiscountCode}
                        onChange={(e) => {
                          setDraftDiscountCode(e.target.value);
                          if (discountError) setDiscountError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyDiscount();
                          }
                        }}
                        placeholder={t.discountCodePlaceholder}
                        className="flex-1 min-w-0 min-h-[38px] px-3 py-1.5 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#161412] text-xs font-mono uppercase text-[#171614] dark:text-[#F3EFE8] placeholder:normal-case placeholder:font-sans placeholder:text-[#7B746B] dark:placeholder:text-[#8E867B] focus:outline-2 focus:outline-[#8C6239] dark:focus:outline-[#D4A77A]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyDiscount}
                        className="px-3.5 min-h-[38px] rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-xs font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] cursor-pointer shrink-0"
                      >
                        {t.applyDiscountBtn}
                      </button>
                    </div>
                    {discountError && (
                      <p className="mt-1.5 text-xs text-[#9E2A2B] dark:text-[#FCA5A5]">
                        {discountError}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6]/50 dark:bg-[#1E1B18] space-y-2.5">
              {(isDirectCheckout || totals.discountAmount > 0) && (
                <>
                  <div className="flex justify-between text-xs text-[#4A453E] dark:text-[#C7BFB3]">
                    <span>{t.subtotalLabel}</span>
                    <span className="tabular-nums font-medium">
                      {formatBDT(totals.subtotal)}
                    </span>
                  </div>
                  {totals.discountAmount > 0 && (
                    <div className="flex justify-between text-xs text-[#2E5A36] dark:text-[#6EE7B7]">
                      <span>
                        {t.discountRowLabel}
                        {discountCode ? ` (${discountCode})` : ''}
                      </span>
                      <span className="tabular-nums font-medium">
                        -{formatBDT(totals.discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-[#4A453E] dark:text-[#C7BFB3]">
                    <span>{t.shippingLabel}</span>
                    <span className="tabular-nums font-medium">
                      {totals.shippingFee === 0
                        ? t.freeLabel
                        : formatBDT(totals.shippingFee)}
                    </span>
                  </div>
                </>
              )}
              {totals.giftWrappingFee > 0 && (
                <div className="flex justify-between text-xs text-[#4A453E] dark:text-[#C7BFB3]">
                  <span>{t.giftWrappingFeeRow}</span>
                  <span className="tabular-nums font-medium">
                    {formatBDT(totals.giftWrappingFee)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold text-[#171614] dark:text-[#F3EFE8]">
                <span>{t.totalLabel}</span>
                <span className="tabular-nums">
                  {formatBDT(totals.grandTotal)}
                </span>
              </div>
              <button
                type="submit"
                className="w-full min-h-[46px] px-5 py-3 rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-sm font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] transition-colors cursor-pointer"
              >
                {t.confirmOrderBtn}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Order Confirmed Receipt */}
        {step === 'confirmed' && confirmedOrder && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between gap-6">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#2E5A36]/10 dark:bg-[#2E5A36]/25 text-[#2E5A36] dark:text-[#6EE7B7] flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-[#171614] dark:text-[#F3EFE8]">
                {t.orderConfirmedTitle}
              </h3>
              <p className="text-sm text-[#4A453E] dark:text-[#C7BFB3] mt-1.5 leading-relaxed">
                {t.orderConfirmedSubtitle}
              </p>

              <div className="mt-6 p-4 rounded-lg border border-[#E2DDD5] dark:border-[#2D2925] bg-white dark:bg-[#1A1816] space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#5E5850] dark:text-[#9A9287]">
                    {t.orderIdLabel}
                  </span>
                  <span className="font-mono font-semibold text-[#171614] dark:text-[#F3EFE8]">
                    {confirmedOrder.orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5E5850] dark:text-[#9A9287]">
                    {t.fullNameLabel}
                  </span>
                  <span className="font-medium text-[#171614] dark:text-[#F3EFE8]">
                    {confirmedOrder.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5E5850] dark:text-[#9A9287]">
                    {t.phoneLabel}
                  </span>
                  <span className="font-mono text-[#171614] dark:text-[#F3EFE8]">
                    {confirmedOrder.phone}
                  </span>
                </div>
                {confirmedOrder.totals.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#5E5850] dark:text-[#9A9287]">
                      {t.discountRowLabel}
                      {confirmedOrder.discountCode
                        ? ` (${confirmedOrder.discountCode})`
                        : ''}
                    </span>
                    <span className="tabular-nums font-medium text-[#2E5A36] dark:text-[#6EE7B7]">
                      -{formatBDT(confirmedOrder.totals.discountAmount)}
                    </span>
                  </div>
                )}
                {confirmedOrder.giftWrapping && (
                  <div className="flex justify-between">
                    <span className="text-[#5E5850] dark:text-[#9A9287]">
                      {t.giftWrappingFeeRow}
                    </span>
                    <span className="tabular-nums font-medium text-[#171614] dark:text-[#F3EFE8]">
                      {formatBDT(confirmedOrder.totals.giftWrappingFee)}
                    </span>
                  </div>
                )}
                {confirmedOrder.giftMessage && (
                  <div className="pt-2 border-t border-[#EAE5DC] dark:border-[#2D2925] text-xs">
                    <span className="block text-[#5E5850] dark:text-[#9A9287] mb-1">
                      {t.giftMessageLabel}
                    </span>
                    <p className="italic text-[#171614] dark:text-[#F3EFE8]">
                      &ldquo;{confirmedOrder.giftMessage}&rdquo;
                    </p>
                  </div>
                )}
                <div className="pt-2 border-t border-[#EAE5DC] dark:border-[#2D2925] flex justify-between font-semibold text-[#171614] dark:text-[#F3EFE8]">
                  <span>{t.totalLabel}</span>
                  <span className="tabular-nums">
                    {formatBDT(confirmedOrder.totals.grandTotal)}
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {confirmedOrder.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex justify-between text-xs text-[#4A453E] dark:text-[#C7BFB3]"
                  >
                    <span>
                      {lang === 'bn' ? item.nameBn : item.nameEn} ({item.variant})
                      × {item.quantity}
                    </span>
                    <span className="tabular-nums font-medium">
                      {formatBDT(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-[#E2DDD5] dark:border-[#2D2925]">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onOpenOrderTracker();
                }}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-sm font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] cursor-pointer"
              >
                {t.trackOrdersBtn}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] text-sm font-medium text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] cursor-pointer"
              >
                {t.continueShopping}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
