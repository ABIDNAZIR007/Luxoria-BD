import { ArrowDownRight, ExternalLink } from 'lucide-react';
import { COPY } from '../data/i18n';
import { FACEBOOK_SHARE_URL, HERO_IMAGE } from '../data/products';
import type { Language } from '../types/store';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  lang: Language;
  onExploreClick: () => void;
}

export function HeroSection({ lang, onExploreClick }: HeroSectionProps) {
  const t = COPY[lang];

  return (
    <section
      id="top"
      className="border-b border-[#E2DDD5] dark:border-[#2D2925] bg-[#F8F7F4] dark:bg-[#121110] transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 lg:pt-12 lg:pb-14">
        {/* 2-Column Balanced Split Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs font-medium tracking-wider text-[#8C6239] dark:text-[#D4A77A] mb-4">
                {t.heroEyebrow}
              </p>
              <h1
                className="font-display text-4xl sm:text-5xl lg:text-[52px] font-semibold leading-[1.22] tracking-tight text-[#171614] dark:text-[#F3EFE8] mb-5"
                style={{ textWrap: 'balance' }}
              >
                {t.heroHeadline}
              </h1>
              <p className="text-base leading-relaxed text-[#4A453E] dark:text-[#C7BFB3] max-w-lg mb-8">
                {t.heroSubcopy}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-sm font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A]"
              >
                <span>{t.heroPrimaryCta}</span>
                <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <a
                href={FACEBOOK_SHARE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-3 min-h-[44px] rounded-md border border-[#D8D1C7] dark:border-[#3A3530] text-sm font-medium text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] transition-colors whitespace-nowrap shrink-0"
              >
                <span>{t.heroSecondaryCta}</span>
                <ExternalLink
                  className="w-3.5 h-3.5 text-[#5E5850] dark:text-[#9A9287]"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative h-full min-h-[260px] sm:min-h-[340px] lg:min-h-[420px] rounded-lg overflow-hidden border border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6] dark:bg-[#1E1B18]">
              <ResilientImage
                src={HERO_IMAGE}
                alt={
                  lang === 'bn'
                    ? 'লাক্সুরিয়া বিডি হ্যান্ডক্রাফটেড লেদার জুতা, ক্রোনোগ্রাফ ঘড়ি এবং ব্রাস-বাকল বেল্টের সংগ্রহ'
                    : 'Luxuria BD handcrafted leather Oxford shoes, chronograph watch, and solid-brass belt flat-lay'
                }
                fallbackTitle="Luxuria BD Signature Trio"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Trust & Delivery Strip Below Split */}
        <div className="mt-10 pt-8 border-t border-[#E2DDD5] dark:border-[#2D2925] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.trustItems.map((item) => (
            <div key={item.title} className="space-y-1">
              <p className="text-sm font-semibold text-[#171614] dark:text-[#F3EFE8]">
                {item.title}
              </p>
              <p className="text-[13px] leading-snug text-[#5E5850] dark:text-[#9A9287]">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
