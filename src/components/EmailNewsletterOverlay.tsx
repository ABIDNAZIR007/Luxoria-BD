import { Check, Mail, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { COPY } from '../data/i18n';
import { HERO_IMAGE } from '../data/products';
import type { Language } from '../types/store';
import { validateCommunityEmail } from '../utils/storeLogic';
import { ResilientImage } from './ResilientImage';

interface EmailNewsletterOverlayProps {
  isOpen: boolean;
  lang: Language;
  subscribedEmail: string | null;
  onSubscribe: (email: string) => void;
  onDismiss: () => void;
}

export function EmailNewsletterOverlay({
  isOpen,
  lang,
  subscribedEmail,
  onSubscribe,
  onDismiss,
}: EmailNewsletterOverlayProps) {
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [justSubscribedEmail, setJustSubscribedEmail] = useState<string | null>(
    null,
  );
  const prefersReducedMotion = useReducedMotion();
  const t = COPY[lang];

  useEffect(() => {
    if (!isOpen) {
      setEmailError(null);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onDismiss]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateCommunityEmail(emailInput, lang);
    if (error) {
      setEmailError(error);
      return;
    }
    const normalized = emailInput.trim().toLowerCase();
    setEmailError(null);
    setEmailInput('');
    setJustSubscribedEmail(normalized);
    onSubscribe(normalized);
  };

  const confirmedEmail = justSubscribedEmail ?? subscribedEmail;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="newsletter-backdrop"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="newsletter-overlay-heading"
          data-testid="email-newsletter-overlay"
          onClick={onDismiss}
        >
          <motion.div
            key="newsletter-card"
            initial={
              prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }
            }
            transition={{
              duration: prefersReducedMotion ? 0 : 0.22,
              ease: 'easeOut',
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl overflow-hidden bg-[#F8F7F4] dark:bg-[#161412] border border-[#E2DDD5] dark:border-[#2D2925] shadow-2xl"
          >
            {/* Editorial Visual Strip */}
            <div className="relative h-36 sm:h-40 w-full bg-[#EFECE6] dark:bg-[#23201D] overflow-hidden">
              <ResilientImage
                src={HERO_IMAGE}
                alt="Luxuria BD"
                fallbackTitle="Luxuria BD"
                className="w-full h-full object-cover object-center"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={onDismiss}
                aria-label={t.closeLabel}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#F8F7F4]/95 dark:bg-[#161412]/90 border border-[#D8D1C7] dark:border-[#3A3530] text-[#171614] dark:text-[#F3EFE8] hover:bg-white dark:hover:bg-[#23201D] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="absolute bottom-3 left-6 font-display text-lg font-semibold tracking-tight text-white">
                Luxuria BD
              </span>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-7">
              {confirmedEmail ? (
                <div className="space-y-4 text-center py-2">
                  <div className="w-11 h-11 rounded-full bg-[#2E5A36]/15 dark:bg-[#6EE7B7]/15 text-[#2E5A36] dark:text-[#6EE7B7] mx-auto flex items-center justify-center">
                    <Check className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1.5">
                    <h2
                      id="newsletter-overlay-heading"
                      className="font-display text-2xl font-semibold text-[#171614] dark:text-[#F3EFE8]"
                    >
                      {t.newsletterSuccessTitle}
                    </h2>
                    <p className="text-sm text-[#5E5850] dark:text-[#B8B0A4] leading-relaxed">
                      {t.newsletterSuccessBody}{' '}
                      <strong className="font-medium text-[#171614] dark:text-[#F3EFE8]">
                        {confirmedEmail}
                      </strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onDismiss}
                    className="w-full min-h-[44px] px-5 py-2.5 rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-sm font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] transition-colors cursor-pointer"
                  >
                    {t.newsletterContinueBtn}
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#8C6239] dark:text-[#D4A77A]">
                      <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t.newsletterEyebrow}</span>
                    </p>
                    <h2
                      id="newsletter-overlay-heading"
                      className="font-display text-2xl sm:text-[26px] font-semibold leading-tight text-[#171614] dark:text-[#F3EFE8]"
                    >
                      {t.newsletterHeading}
                    </h2>
                    <p className="text-sm text-[#4A453E] dark:text-[#C7BFB3] leading-relaxed">
                      {t.newsletterBody}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} noValidate className="space-y-3">
                    <div>
                      <label htmlFor="newsletter-overlay-email" className="sr-only">
                        {t.communityEmailLabel}
                      </label>
                      <input
                        id="newsletter-overlay-email"
                        type="email"
                        autoFocus
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          if (emailError) setEmailError(null);
                        }}
                        placeholder={t.communityEmailPlaceholder}
                        aria-invalid={emailError ? 'true' : 'false'}
                        aria-describedby={
                          emailError ? 'newsletter-overlay-error' : undefined
                        }
                        className="w-full min-h-[46px] px-3.5 py-2.5 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#1E1B18] text-sm text-[#171614] dark:text-[#F3EFE8] placeholder:text-[#7B746B] dark:placeholder:text-[#8E867B] focus:outline-2 focus:outline-[#8C6239] dark:focus:outline-[#D4A77A]"
                      />
                      {emailError && (
                        <p
                          id="newsletter-overlay-error"
                          role="alert"
                          className="text-xs text-[#A32E22] dark:text-[#FCA5A5] mt-1.5"
                        >
                          {emailError}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full min-h-[46px] px-5 py-2.5 rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-sm font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] transition-colors cursor-pointer"
                    >
                      {t.newsletterCta}
                    </button>
                  </form>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={onDismiss}
                      className="text-xs font-medium text-[#5E5850] dark:text-[#9A9287] hover:text-[#171614] dark:hover:text-[#F3EFE8] underline underline-offset-4 transition-colors cursor-pointer py-1"
                    >
                      {t.newsletterDismiss}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
