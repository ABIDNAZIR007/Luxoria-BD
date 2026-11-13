import { ExternalLink } from 'lucide-react';
import { COPY } from '../data/i18n';
import { FACEBOOK_SHARE_URL } from '../data/products';
import type { Language } from '../types/store';

interface StorySectionProps {
  lang: Language;
}

export function StorySection({ lang }: StorySectionProps) {
  const t = COPY[lang];

  return (
    <section
      id="story"
      className="scroll-mt-20 border-t border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6]/60 dark:bg-[#181614] py-14 lg:py-20 transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-7">
            <p className="text-xs font-medium tracking-wider text-[#8C6239] dark:text-[#D4A77A] mb-3">
              {t.storyEyebrow}
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-semibold text-[#171614] dark:text-[#F3EFE8] leading-tight mb-5"
              style={{ textWrap: 'balance' }}
            >
              {t.storyHeading}
            </h2>
            <div className="space-y-4 text-[15px] leading-relaxed text-[#4A453E] dark:text-[#C7BFB3] max-w-2xl">
              <p>{t.storyBody1}</p>
              <p>{t.storyBody2}</p>
            </div>
            <div className="mt-7">
              <a
                href={FACEBOOK_SHARE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-sm font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] transition-colors whitespace-nowrap"
              >
                <span>{t.storyCta}</span>
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 gap-4">
            {t.storyStats.map((stat) => (
              <div
                key={stat.label}
                className="p-6 rounded-lg bg-[#F8F7F4] dark:bg-[#1E1B18] border border-[#E2DDD5] dark:border-[#2D2925] flex items-baseline justify-between gap-4"
              >
                <span className="font-display text-3xl font-semibold text-[#171614] dark:text-[#F3EFE8] tabular-nums shrink-0">
                  {stat.value}
                </span>
                <span className="text-sm text-[#5E5850] dark:text-[#B8B0A4] text-right">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
