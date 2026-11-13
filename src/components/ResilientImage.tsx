import { useState } from 'react';
import { Watch } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-[#EFECE6] dark:bg-[#23201D] text-[#5E5850] dark:text-[#B8B0A4] p-6 text-center ${className}`}
      >
        <Watch className="w-8 h-8 mb-2 stroke-[1.25] text-[#8C6239] dark:text-[#D4A77A]" aria-hidden="true" />
        <span className="text-xs font-medium tracking-wide">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
