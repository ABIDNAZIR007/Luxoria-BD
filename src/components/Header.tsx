import { Menu, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { COPY } from '../data/i18n';
import type { Category, Language } from '../types/store';

interface HeaderProps {
  lang: Language;
  bagCount: number;
  onSelectCategory: (category: Category) => void;
  onOpenBag: () => void;
}

export function Header({
  lang,
  bagCount,
  onSelectCategory,
  onOpenBag,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = COPY[lang];

  const handleNavClick = (category?: Category, sectionId = 'collection') => {
    if (category) {
      onSelectCategory(category);
    }
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F7F4]/95 dark:bg-[#121110]/95 backdrop-blur-sm border-b border-[#E2DDD5] dark:border-[#2D2925] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element Brand Wordmark */}
        <a
          href="#top"
          className="font-display text-2xl sm:text-[26px] font-semibold tracking-tight text-[#171614] dark:text-[#F3EFE8] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A]"
        >
          Luxuria BD
        </a>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4A453E] dark:text-[#C7BFB3]"
        >
          <a
            href="#collection"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('all', 'collection');
            }}
            className="hover:text-[#171614] dark:hover:text-[#F3EFE8] hover:underline underline-offset-8 decoration-[#8C6239] dark:decoration-[#D4A77A] transition-colors whitespace-nowrap shrink-0 py-1"
          >
            {t.navCollection}
          </a>
          <a
            href="#collection"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('shoes', 'collection');
            }}
            className="hover:text-[#171614] dark:hover:text-[#F3EFE8] hover:underline underline-offset-8 decoration-[#8C6239] dark:decoration-[#D4A77A] transition-colors whitespace-nowrap shrink-0 py-1"
          >
            {t.navShoes}
          </a>
          <a
            href="#collection"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('watches', 'collection');
            }}
            className="hover:text-[#171614] dark:hover:text-[#F3EFE8] hover:underline underline-offset-8 decoration-[#8C6239] dark:decoration-[#D4A77A] transition-colors whitespace-nowrap shrink-0 py-1"
          >
            {t.navWatches}
          </a>
          <a
            href="#story"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(undefined, 'story');
            }}
            className="hover:text-[#171614] dark:hover:text-[#F3EFE8] hover:underline underline-offset-8 decoration-[#8C6239] dark:decoration-[#D4A77A] transition-colors whitespace-nowrap shrink-0 py-1"
          >
            {t.navStory}
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action (Shopping Bag) + mobile menu toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenBag}
            aria-label={`${t.bagButton} (${bagCount})`}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-md bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] text-sm font-medium hover:bg-[#2E2B26] dark:hover:bg-[#E2DDD5] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A]"
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
            <span className="tabular-nums">
              {t.bagButton} ({bagCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-[#E2DDD5] dark:border-[#2D2925] bg-[#F8F7F4] dark:bg-[#121110] px-4 py-3 flex flex-col gap-1"
        >
          <a
            href="#collection"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('all', 'collection');
            }}
            className="py-2.5 px-2 text-sm font-medium text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] rounded"
          >
            {t.navCollection}
          </a>
          <a
            href="#collection"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('shoes', 'collection');
            }}
            className="py-2.5 px-2 text-sm font-medium text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] rounded"
          >
            {t.navShoes}
          </a>
          <a
            href="#collection"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('watches', 'collection');
            }}
            className="py-2.5 px-2 text-sm font-medium text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] rounded"
          >
            {t.navWatches}
          </a>
          <a
            href="#story"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(undefined, 'story');
            }}
            className="py-2.5 px-2 text-sm font-medium text-[#171614] dark:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#23201D] rounded"
          >
            {t.navStory}
          </a>
        </nav>
      )}
    </header>
  );
}
