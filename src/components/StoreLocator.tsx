import { Clock, MapPin, Phone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { COPY } from '../data/i18n';
import type { Language, StoreLocationType } from '../types/store';
import {
  DHAKA_STORE_LOCATIONS,
  filterStoreLocations,
  resolveActiveStoreLocation,
} from '../utils/storeLogic';

interface StoreLocatorProps {
  lang: Language;
}

const DHAKA_DISTRICTS_WATERMARK = [
  { label: 'Uttara', x: 72, y: 15 },
  { label: 'Mirpur', x: 18, y: 28 },
  { label: 'Banani', x: 74, y: 35 },
  { label: 'Gulshan', x: 82, y: 49 },
  { label: 'Dhanmondi', x: 54, y: 61 },
  { label: 'Motijheel', x: 76, y: 74 },
  { label: 'Hazaribagh', x: 48, y: 83 },
] as const;

export function StoreLocator({ lang }: StoreLocatorProps) {
  const t = COPY[lang];
  const [filterType, setFilterType] = useState<StoreLocationType>('all');
  const [selectedId, setSelectedId] = useState<string>(
    DHAKA_STORE_LOCATIONS[0].id,
  );

  const visibleLocations = useMemo(
    () => filterStoreLocations(DHAKA_STORE_LOCATIONS, filterType),
    [filterType],
  );

  const activeLocation = useMemo(
    () => resolveActiveStoreLocation(visibleLocations, selectedId),
    [visibleLocations, selectedId],
  );

  return (
    <section
      id="store-locator"
      data-testid="store-locator-section"
      aria-labelledby="footer-store-locator-heading"
      className="pb-10 mb-10 border-b border-white/10"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div className="max-w-xl">
          <h2
            id="footer-store-locator-heading"
            className="font-display text-2xl sm:text-3xl font-semibold text-white"
          >
            {t.storeLocatorHeading}
          </h2>
          <p className="text-sm text-[#B8B0A4] mt-1.5 leading-relaxed">
            {t.storeLocatorSubcopy}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={t.storeLocatorHeading}
          className="inline-flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10 self-start lg:self-auto max-w-full overflow-x-auto"
        >
          {(['all', 'pickup', 'workshop'] as StoreLocationType[]).map(
            (type) => {
              const active = filterType === type;
              return (
                <button
                  key={type}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilterType(type)}
                  className={`px-3.5 py-2 min-h-[38px] text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#D6B18A] text-[#171614]'
                      : 'text-[#B8B0A4] hover:text-white'
                  }`}
                >
                  {t.storeLocatorFilters[type]}
                </button>
              );
            },
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Dhaka Pickup & Partner Workshop List */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          {visibleLocations.map((loc) => {
            const isSelected = activeLocation?.id === loc.id;
            const name = lang === 'bn' ? loc.nameBn : loc.nameEn;
            const neighborhood =
              lang === 'bn' ? loc.neighborhoodBn : loc.neighborhoodEn;
            const address = lang === 'bn' ? loc.addressBn : loc.addressEn;
            const typeLabel = t.storeLocatorTypeLabels[loc.type];

            return (
              <button
                key={loc.id}
                type="button"
                data-testid={`locator-list-item-${loc.id}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedId(loc.id)}
                className={`w-full text-left p-3.5 rounded-lg border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D6B18A] ${
                  isSelected
                    ? 'border-[#D6B18A]/70 bg-white/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-medium text-[#D6B18A] truncate">
                      {typeLabel}
                    </span>
                    <span aria-hidden="true" className="text-[#78716C]">
                      ·
                    </span>
                    <span className="text-[#958D82] truncate">
                      {neighborhood}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white mt-1 leading-snug">
                  {name}
                </p>
                <p className="text-xs text-[#B8B0A4] mt-0.5 line-clamp-1">
                  {address}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right: Interactive Schematic Dhaka Placeholder Map */}
        <div className="lg:col-span-7 flex flex-col rounded-lg border border-white/15 bg-[#11100E] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/10 bg-[#171614] flex items-center justify-between gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#E6E1D9]">
              <MapPin
                className="w-3.5 h-3.5 text-[#D6B18A] shrink-0"
                aria-hidden="true"
              />
              <span>{t.storeLocatorMapLabel}</span>
            </span>
            <span className="text-[11px] text-[#958D82] tabular-nums shrink-0">
              23.81° N · 90.41° E
            </span>
          </div>

          <div
            data-testid="store-locator-map"
            className="relative flex-1 min-h-[260px] sm:min-h-[290px] w-full overflow-hidden select-none"
          >
            {/* Schematic Dhaka City Cartography SVG */}
            <svg
              viewBox="0 0 600 360"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              {/* Subtle coordinate grid */}
              <g stroke="rgba(255,255,255,0.04)" strokeWidth="1">
                <line x1="100" y1="0" x2="100" y2="360" />
                <line x1="200" y1="0" x2="200" y2="360" />
                <line x1="300" y1="0" x2="300" y2="360" />
                <line x1="400" y1="0" x2="400" y2="360" />
                <line x1="500" y1="0" x2="500" y2="360" />
                <line x1="0" y1="72" x2="600" y2="72" />
                <line x1="0" y1="144" x2="600" y2="144" />
                <line x1="0" y1="216" x2="600" y2="216" />
                <line x1="0" y1="288" x2="600" y2="288" />
              </g>

              {/* Turag / Buriganga river western-southern arc */}
              <path
                d="M 48 0 C 38 72, 72 135, 58 210 C 48 265, 92 318, 210 356 L 600 356"
                fill="none"
                stroke="#22313F"
                strokeWidth="18"
                strokeLinecap="round"
                opacity="0.7"
              />
              {/* Hatirjheel & Gulshan-Banani lake silhouette */}
              <path
                d="M 325 110 C 350 128, 344 162, 378 175 C 402 184, 412 204, 382 222"
                fill="none"
                stroke="#22313F"
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.8"
              />
              {/* Dhanmondi crescent lake */}
              <path
                d="M 190 198 C 198 220, 216 238, 232 246"
                fill="none"
                stroke="#22313F"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.8"
              />

              {/* Primary arterial corridors: Airport Rd -> Farmgate -> Motijheel & Mirpur Rd */}
              <g stroke="rgba(214,177,138,0.18)" strokeWidth="2.5" fill="none">
                <path d="M 276 20 L 298 92 L 315 160 L 325 235 L 385 280" />
                <path d="M 135 55 L 185 150 L 204 225 L 160 302" />
                <path d="M 170 155 L 315 160 L 460 152" />
                <path d="M 204 225 L 325 235 L 440 245" />
              </g>

              {/* Secondary neighborhood streets */}
              <g stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none">
                <path d="M 240 60 L 415 62" />
                <path d="M 260 124 L 445 124" />
                <path d="M 140 268 L 350 268" />
                <path d="M 355 85 L 368 255" />
              </g>
            </svg>

            {/* Area reference labels */}
            {DHAKA_DISTRICTS_WATERMARK.map((district) => (
              <span
                key={district.label}
                style={{ left: `${district.x}%`, top: `${district.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-[10px] tracking-wider uppercase text-[#78716C] pointer-events-none font-medium"
              >
                {district.label}
              </span>
            ))}

            {/* Interactive Location Pins */}
            {visibleLocations.map((loc) => {
              const isSelected = activeLocation?.id === loc.id;
              const shortLabel =
                lang === 'bn'
                  ? loc.neighborhoodBn.split(',')[0]
                  : loc.neighborhoodEn.split(',')[0];
              const fullName = lang === 'bn' ? loc.nameBn : loc.nameEn;

              return (
                <button
                  key={loc.id}
                  type="button"
                  data-testid={`locator-pin-${loc.id}`}
                  aria-label={fullName}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(loc.id)}
                  style={{ left: `${loc.mapX}%`, top: `${loc.mapY}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-medium whitespace-nowrap transition-transform cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D6B18A] ${
                    isSelected
                      ? 'bg-[#D6B18A] border-[#D6B18A] text-[#171614] scale-105 shadow-lg z-30'
                      : 'bg-[#1C1A17]/95 border-[#D6B18A]/50 text-[#F3EFE8] hover:border-[#D6B18A] hover:scale-105'
                  }`}
                >
                  <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span>{shortLabel}</span>
                </button>
              );
            })}

            <p className="absolute bottom-2.5 left-3 right-3 text-[11px] text-[#958D82] pointer-events-none truncate">
              {t.storeLocatorNote}
            </p>
          </div>

          {/* Active Hub Detail Bar */}
          {activeLocation && (
            <div
              data-testid="store-locator-active-details"
              className="p-4 border-t border-white/10 bg-[#171614] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">
                  {lang === 'bn' ? activeLocation.nameBn : activeLocation.nameEn}
                </p>
                <p className="text-xs text-[#B8B0A4] mt-0.5">
                  {lang === 'bn'
                    ? activeLocation.servicesBn
                    : activeLocation.servicesEn}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#D6B18A] shrink-0 tabular-nums">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    {lang === 'bn'
                      ? activeLocation.hoursBn
                      : activeLocation.hoursEn}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{activeLocation.phone}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
