import { Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { COPY } from '../data/i18n';
import { FACEBOOK_PAGE_URL, FACEBOOK_SHARE_URL } from '../data/products';
import type { Category, Language } from '../types/store';
import { validateCommunityEmail } from '../utils/storeLogic';
import { StoreLocator } from './StoreLocator';

interface FooterProps {
  lang: Language;
  subscribedEmail: string | null;
  onSubscribeEmail: (email: string) => void;
  onResetSubscription: () => void;
  onSelectCategory: (category: Category) => void;
  onOpenOrderTracker: () => void;
  onOpenWishlist: () => void;
}

export function Footer({
  lang,
  subscribedEmail,
  onSubscribeEmail,
  onResetSubscription,
  onSelectCategory,
  onOpenOrderTracker,
  onOpenWishlist,
}: FooterProps) {
  const t = COPY[lang];
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const jumpToCategory = (category: Category) => {
    onSelectCategory(category);
    const el = document.getElementById('collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateCommunityEmail(emailInput, lang);
    if (validationError) {
      setEmailError(validationError);
      return;
    }
    const normalized = emailInput.trim().toLowerCase();
    onSubscribeEmail(normalized);
    setEmailInput('');
    setEmailError(null);
  };

  const handleResetSubscription = () => {
    setEmailError(null);
    onResetSubscription();
  };

  return (
    <footer className="border-t border-[#E2DDD5] dark:border-[#2D2925] bg-[#171614] dark:bg-[#0B0A09] text-[#E6E1D9] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Join Our Community Subscription Strip */}
        <section
          aria-labelledby="footer-community-heading"
          className="pb-10 mb-10 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          <div className="max-w-xl">
            <h2
              id="footer-community-heading"
              className="font-display text-2xl sm:text-3xl font-semibold text-white"
            >
              {t.communityHeading}
            </h2>
            <p className="text-sm text-[#B8B0A4] mt-1.5 leading-relaxed">
              {t.communitySubcopy}
            </p>
          </div>

          <div className="w-full lg:w-auto lg:min-w-[420px] max-w-md">
            {subscribedEmail ? (
              <div className="p-4 rounded-lg border border-white/15 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5 text-xs text-[#E6E1D9]">
                  <Check
                    className="w-4 h-4 text-[#A7F3D0] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    {t.communitySuccessPrefix}{' '}
                    <strong className="font-medium text-white">
                      {subscribedEmail}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetSubscription}
                  className="text-xs font-medium text-[#D6B18A] hover:text-white underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  {t.communityChangeBtn}
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribeSubmit}
                noValidate
                className="space-y-2"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <label htmlFor="community-email" className="sr-only">
                    {t.communityEmailLabel}
                  </label>
                  <input
                    id="community-email"
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    placeholder={t.communityEmailPlaceholder}
                    aria-invalid={emailError ? 'true' : 'false'}
                    aria-describedby={
                      emailError ? 'community-email-error' : undefined
                    }
                    className="flex-1 min-h-[44px] px-3.5 py-2 rounded-md border border-white/20 bg-white/10 text-sm text-white placeholder:text-[#958D82] focus:outline-2 focus:outline-[#D6B18A]"
                  />
                  <button
                    type="submit"
                    className="min-h-[44px] px-5 py-2.5 rounded-md bg-[#8C6239] hover:bg-[#A07244] text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {t.communitySubmitBtn}
                  </button>
                </div>
                {emailError && (
                  <p
                    id="community-email-error"
                    role="alert"
                    className="text-xs text-[#FCA5A5]"
                  >
                    {emailError}
                  </p>
                )}
              </form>
            )}
          </div>
        </section>

        {/* Dhaka Store Locator Placeholder Map Section */}
        <StoreLocator lang={lang} />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10">
          <div className="md:col-span-5 space-y-3">
            <span className="font-display text-2xl font-semibold tracking-tight text-white block">
              Luxuria BD
            </span>
            <p className="text-sm text-[#B8B0A4] leading-relaxed max-w-sm">
              {t.footerTagline}
            </p>
            <p className="text-xs text-[#958D82]">{t.footerLocation}</p>
          </div>

          <div className="md:col-span-2 space-y-2.5">
            <h3 className="text-xs font-semibold tracking-wider text-white">
              {t.footerShopHeading}
            </h3>
            <ul className="space-y-2 text-sm text-[#B8B0A4]">
              <li>
                <button
                  type="button"
                  onClick={() => jumpToCategory('shoes')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'জুতা' : 'Shoes'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jumpToCategory('watches')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'ঘড়ি' : 'Watches'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jumpToCategory('belts')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'বেল্ট' : 'Belts'}
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-2.5">
            <h3 className="text-xs font-semibold tracking-wider text-white">
              {t.footerSupportHeading}
            </h3>
            <ul className="space-y-2 text-sm text-[#B8B0A4]">
              <li>
                <button
                  type="button"
                  onClick={onOpenWishlist}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.wishlistButton}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenOrderTracker}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.navTrack}
                </button>
              </li>
              <li>{t.footerHours}</li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-xs font-semibold tracking-wider text-white">
              {t.footerConnectHeading}
            </h3>
            <div className="flex flex-col gap-2 text-sm text-[#B8B0A4]">
              <a
                href={FACEBOOK_SHARE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-white hover:underline underline-offset-4"
              >
                <span>Facebook · Luxuria BD</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#958D82] hover:text-[#E6E1D9] truncate"
              >
                facebook.com/LuxoriaBDoriginal
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#958D82]">
          <p>{t.footerCopyright}</p>
          <p>
            {lang === 'bn'
              ? 'ক্যাশ অন ডেলিভারি · বিকাশ · নগদ'
              : 'Cash on Delivery · bKash · Nagad'}
          </p>
        </div>
      </div>
    </footer>
  );
}
