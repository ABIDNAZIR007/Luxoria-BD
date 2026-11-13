import { COPY } from '../data/i18n';
import { WHATSAPP_NUMBER } from '../data/products';
import type { Language } from '../types/store';
import { buildWhatsAppInquiryUrl } from '../utils/storeLogic';

interface WhatsAppFabProps {
  lang: Language;
}

export function WhatsAppFab({ lang }: WhatsAppFabProps) {
  const t = COPY[lang];
  const whatsappUrl = buildWhatsAppInquiryUrl(
    WHATSAPP_NUMBER,
    t.whatsappPrefillMessage,
  );

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsappFabLabel}
      title={t.whatsappFabLabel}
      className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#1E6B43] hover:bg-[#175535] text-white shadow-xl border border-white/15 flex items-center justify-center transition-transform duration-150 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6239]"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.79 14.07c-.24.68-1.42 1.3-1.97 1.38-.51.07-1.15.1-1.85-.12-.43-.14-.98-.32-1.69-.63-2.97-1.28-4.91-4.27-5.06-4.47-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.59-.38.79-.38.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.07.92 2.22.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.17-.32.39-.45.52-.15.15-.31.31-.13.61.18.3.79 1.31 1.7 2.12 1.17 1.04 2.16 1.36 2.46 1.51.3.15.48.13.66-.07.18-.2.76-.89.96-1.19.2-.3.4-.25.67-.15.27.1 1.73.82 2.02.97.3.15.49.22.56.34.07.12.07.7-.17 1.38z" />
      </svg>
    </a>
  );
}
