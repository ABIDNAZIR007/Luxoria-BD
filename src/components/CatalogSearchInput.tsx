import { Search, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { COPY, PRODUCT_CATEGORY_LABELS } from '../data/i18n';
import type { Language, Product } from '../types/store';
import { formatBDT, getSearchSuggestions } from '../utils/storeLogic';
import { ResilientImage } from './ResilientImage';

interface CatalogSearchInputProps {
  products: readonly Product[];
  lang: Language;
  value: string;
  onChange: (nextValue: string) => void;
}

function renderHighlightedTitle(text: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return text;
  }
  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);
  if (matchIndex === -1) {
    return text;
  }
  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + trimmed.length);
  const after = text.slice(matchIndex + trimmed.length);

  return (
    <>
      {before}
      <mark className="bg-transparent text-[#8C6239] dark:text-[#D4A77A] font-semibold">
        {match}
      </mark>
      {after}
    </>
  );
}

export function CatalogSearchInput({
  products,
  lang,
  value,
  onChange,
}: CatalogSearchInputProps) {
  const t = COPY[lang];
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const suggestions = useMemo(
    () =>
      getSearchSuggestions(products, value, {
        lang,
        minSuggestions: 3,
        maxSuggestions: 5,
      }),
    [products, value, lang],
  );

  const showDropdown = isOpen && value.trim().length > 0 && suggestions.length > 0;

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [value, lang]);

  useEffect(() => {
    const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('touchstart', handlePointerDownOutside, {
      passive: true,
    });
    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('touchstart', handlePointerDownOutside);
    };
  }, []);

  const handleSelectSuggestion = (product: Product) => {
    const nextTitle = lang === 'bn' ? product.nameBn : product.nameEn;
    onChange(nextTitle);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1,
      );
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightedIndex]);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const activeDescendantId =
    showDropdown && highlightedIndex >= 0 && suggestions[highlightedIndex]
      ? `${listboxId}-option-${suggestions[highlightedIndex].id}`
      : undefined;

  return (
    <div ref={containerRef} className="relative flex-1 sm:w-72">
      <Search
        className="w-4 h-4 text-[#5E5850] dark:text-[#9A9287] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-controls={showDropdown ? listboxId : undefined}
        aria-activedescendant={activeDescendantId}
        aria-label={t.searchPlaceholder}
        value={value}
        onFocus={() => {
          if (value.trim().length > 0) {
            setIsOpen(true);
          }
        }}
        onChange={(e) => {
          const next = e.target.value;
          onChange(next);
          setIsOpen(next.trim().length > 0);
        }}
        onKeyDown={handleKeyDown}
        placeholder={t.searchPlaceholder}
        className={`w-full min-h-[40px] pl-10 ${value ? 'pr-9' : 'pr-3.5'} py-2 rounded-md border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#1A1816] text-sm text-[#171614] dark:text-[#F3EFE8] placeholder:text-[#7B746B] dark:placeholder:text-[#8E867B] focus:outline-2 focus:outline-[#8C6239] dark:focus:outline-[#D4A77A]`}
      />

      {value.length > 0 && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            setIsOpen(false);
            setHighlightedIndex(-1);
            inputRef.current?.focus();
          }}
          aria-label={t.clearSearchLabel}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center text-[#5E5850] dark:text-[#9A9287] hover:text-[#171614] dark:hover:text-[#F3EFE8] hover:bg-[#EFECE6] dark:hover:bg-[#2A2622] transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}

      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={t.searchSuggestionsLabel}
          data-testid="search-suggestions-dropdown"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 rounded-lg border border-[#D8D1C7] dark:border-[#3A3530] bg-white dark:bg-[#1A1816] shadow-xl overflow-hidden"
        >
          <div className="px-3 py-1.5 border-b border-[#EFECE6] dark:border-[#26231F] text-[11px] font-medium text-[#7B746B] dark:text-[#9A9287] bg-[#F8F7F4]/70 dark:bg-[#161412]">
            {t.searchSuggestionsLabel}
          </div>
          <div className="py-1 max-h-96 overflow-y-auto divide-y divide-[#EFECE6]/70 dark:divide-[#26231F]">
            {suggestions.map((item, idx) => {
              const title = lang === 'bn' ? item.nameBn : item.nameEn;
              const categoryLabel = PRODUCT_CATEGORY_LABELS[lang][item.category];
              const isHighlighted = idx === highlightedIndex;
              return (
                <button
                  key={item.id}
                  id={`${listboxId}-option-${item.id}`}
                  type="button"
                  role="option"
                  aria-selected={isHighlighted}
                  data-testid={`search-suggestion-${item.id}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectSuggestion(item);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                    isHighlighted
                      ? 'bg-[#EFECE6] dark:bg-[#26231F]'
                      : 'hover:bg-[#F8F7F4] dark:hover:bg-[#201D1A]'
                  }`}
                >
                  <div className="w-10 h-10 rounded border border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6] dark:bg-[#23201D] overflow-hidden shrink-0">
                    <ResilientImage
                      src={item.image}
                      alt={title}
                      fallbackTitle={title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#171614] dark:text-[#F3EFE8] truncate">
                      {renderHighlightedTitle(title, value)}
                    </p>
                    <p className="text-[11px] text-[#5E5850] dark:text-[#9A9287] flex items-center gap-1.5 mt-0.5 tabular-nums">
                      <span className="text-[#8C6239] dark:text-[#D4A77A]">
                        {categoryLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatBDT(item.price)}</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
