import { Film, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { COPY } from '../data/i18n';
import type { Language, Product } from '../types/store';
import {
  formatVideoTimestamp,
  getNextVideoClipIndex,
  getProductVideoReel,
} from '../utils/storeLogic';
import { ResilientImage } from './ResilientImage';

interface ProductVideoProps {
  product: Product;
  lang: Language;
}

export function ProductVideo({ product, lang }: ProductVideoProps) {
  const t = COPY[lang];
  const reel = getProductVideoReel(product, lang);
  const title = lang === 'bn' ? product.nameBn : product.nameEn;

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [activeClipIdx, setActiveClipIdx] = useState(0);
  const [clipSecond, setClipSecond] = useState(0);

  // Reset to auto-playing muted start whenever the active product changes
  useEffect(() => {
    setIsPlaying(true);
    setIsMuted(true);
    setActiveClipIdx(0);
    setClipSecond(0);
  }, [product.id]);

  // 1Hz timeline ticker for auto-advancing simulated short material clips
  useEffect(() => {
    if (!isPlaying) return;
    const activeDuration = reel.clips[activeClipIdx]?.durationSec ?? 4;
    const timer = window.setInterval(() => {
      setClipSecond((prev) => {
        if (prev + 1 >= activeDuration) {
          setActiveClipIdx((curr) =>
            getNextVideoClipIndex(curr, reel.clips.length),
          );
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPlaying, activeClipIdx, reel.clips]);

  const activeClip = reel.clips[activeClipIdx] ?? reel.clips[0];
  const elapsedTotalSec =
    reel.clips
      .slice(0, activeClipIdx)
      .reduce((acc, clip) => acc + clip.durationSec, 0) + clipSecond;
  const progressRatio = Math.min(
    1,
    Math.max(0.05, (elapsedTotalSec + 0.5) / Math.max(1, reel.totalDurationSec)),
  );

  const motionVars = {
    '--reel-pan-x': activeClip.panX,
    '--reel-pan-y': activeClip.panY,
    '--reel-scale': String(activeClip.scaleTo),
    animationPlayState: isPlaying ? 'running' : 'paused',
  } as CSSProperties;

  return (
    <section
      data-testid="pdp-product-video"
      data-playing={isPlaying ? 'true' : 'false'}
      data-muted={isMuted ? 'true' : 'false'}
      data-clip-index={activeClipIdx}
      aria-label={reel.title}
      className="w-full pt-3 mt-1 border-t border-[#E2DDD5] dark:border-[#2D2925]"
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#171614] dark:text-[#F3EFE8]">
            <Film
              className="w-3.5 h-3.5 shrink-0 text-[#8C6239] dark:text-[#D4A77A]"
              aria-hidden="true"
            />
            <h3 data-testid="pdp-video-heading" className="truncate">
              {reel.title}
            </h3>
          </div>
          <p className="text-[11px] text-[#5E5850] dark:text-[#9A9287] mt-0.5 truncate">
            {reel.subtitle} · {t.productVideoLoopNote}
          </p>
        </div>

        <span className="text-[11px] font-mono tabular-nums text-[#5E5850] dark:text-[#9A9287] shrink-0">
          {formatVideoTimestamp(elapsedTotalSec)} /{' '}
          {formatVideoTimestamp(reel.totalDurationSec)}
        </span>
      </div>

      {/* Auto-playing Muted Short Clip Viewport */}
      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-[#E2DDD5] dark:border-[#2D2925] bg-[#161412]">
        <div
          key={activeClip.id}
          style={motionVars}
          className="w-full h-full pdp-reel-animate"
        >
          <ResilientImage
            src={product.image}
            alt={`${title} — ${activeClip.caption}`}
            fallbackTitle={title}
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>

        {/* Diagonal studio light reflection sweep */}
        <div
          aria-hidden="true"
          style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent pdp-reel-sheen"
        />

        {/* High-contrast bottom scrim & playback controls */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 pt-8 pb-2.5 text-[#F8F7F4]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                type="button"
                data-testid="pdp-video-play-toggle"
                onClick={() => setIsPlaying((prev) => !prev)}
                aria-label={
                  isPlaying ? t.productVideoPauseBtn : t.productVideoPlayBtn
                }
                aria-pressed={isPlaying}
                className="w-8 h-8 rounded bg-black/55 hover:bg-black/80 border border-white/20 flex items-center justify-center text-white shrink-0 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#D4A77A]"
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Play className="w-3.5 h-3.5" aria-hidden="true" />
                )}
              </button>

              <p
                data-testid="pdp-video-caption"
                className="text-[11px] font-medium text-[#F3EFE8] truncate"
              >
                {activeClip.caption}
              </p>
            </div>

            <button
              type="button"
              data-testid="pdp-video-mute-toggle"
              onClick={() => setIsMuted((prev) => !prev)}
              aria-label={
                isMuted ? t.productVideoMutedLabel : t.productVideoUnmutedLabel
              }
              aria-pressed={isMuted}
              className="inline-flex items-center gap-1 px-2 py-1 min-h-[28px] rounded bg-black/55 hover:bg-black/80 border border-white/20 text-[10px] font-medium text-[#F3EFE8] whitespace-nowrap shrink-0 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#D4A77A]"
            >
              {isMuted ? (
                <VolumeX className="w-3 h-3 text-[#D4A77A]" aria-hidden="true" />
              ) : (
                <Volume2 className="w-3 h-3 text-[#D4A77A]" aria-hidden="true" />
              )}
              <span>
                {isMuted
                  ? t.productVideoMutedLabel
                  : t.productVideoUnmutedLabel}
              </span>
            </button>
          </div>

          {/* Compositor-scaled progress bar */}
          <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full w-full origin-left bg-[#D4A77A] transition-transform duration-300 ease-out"
              style={{ transform: `scaleX(${progressRatio})` }}
            />
          </div>
        </div>
      </div>

      {/* Chapter Switcher Tabs */}
      <div
        className="mt-2.5 grid grid-cols-3 gap-1.5"
        role="tablist"
        aria-label={reel.title}
      >
        {reel.clips.map((clip, index) => {
          const active = index === activeClipIdx;
          return (
            <button
              key={clip.id}
              type="button"
              role="tab"
              aria-selected={active}
              data-testid={`pdp-video-clip-tab-${index}`}
              onClick={() => {
                setActiveClipIdx(index);
                setClipSecond(0);
              }}
              className={`px-2 py-1.5 min-h-[34px] rounded border text-[11px] font-medium transition-colors truncate cursor-pointer focus-visible:outline-2 focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A] ${
                active
                  ? 'bg-[#171614] dark:bg-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110] border-[#171614] dark:border-[#F3EFE8]'
                  : 'bg-[#F8F7F4] dark:bg-[#161412] text-[#4A453E] dark:text-[#C7BFB3] border-[#D8D1C7] dark:border-[#3A3530] hover:border-[#8C6239] dark:hover:border-[#D4A77A]'
              }`}
            >
              {clip.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
