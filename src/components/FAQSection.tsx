import { ChevronDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { FAQ_ITEMS } from '../data/faq';
import { COPY } from '../data/i18n';
import { WHATSAPP_NUMBER } from '../data/products';
import type { FaqTopic, Language } from '../types/store';
import { buildWhatsAppInquiryUrl, filterFaqItems } from '../utils/storeLogic';

interface FAQSectionProps {
  lang: Language;
}

const TOPICS: FaqTopic[] = ['all', 'care', 'delivery', 'returns'];

export function FAQSection({ lang }: FAQSectionProps) {
  const [selectedTopic, setSelectedTopic] = useState<FaqTopic>('all');
  const [openId, setOpenId] = useState<string | null>(
    FAQ_ITEMS[0]?.id ?? null,
  );

  const t = COPY[lang];
  const visibleItems = filterFaqItems(FAQ_ITEMS, selectedTopic);
  const whatsappUrl = buildWhatsAppInquiryUrl(
    WHATSAPP_NUMBER,
    t.whatsappPrefillMessage,
  );

  const handleTopicChange = (topic: FaqTopic) => {
    setSelectedTopic(topic);
    const nextItems = filterFaqItems(FAQ_ITEMS, topic);
    if (nextItems.length > 0 && !nextItems.some((item) => item.id === openId)) {
      setOpenId(nextItems[0].id);
    }
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-section-heading"
      className="scroll-mt-20 border-t border-[#E2DDD5] dark:border-[#2D2925] bg-[#F8F7F4] dark:bg-[#121110] py-14 lg:py-20 transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Editorial Intro & Topic Filter */}
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-wider text-[#8C6239] dark:text-[#D4A77A] mb-3">
              {t.faqEyebrow}
            </p>
            <h2
              id="faq-section-heading"
              className="font-display text-3xl sm:text-4xl font-semibold text-[#171614] dark:text-[#F3EFE8] leading-tight mb-4"
              style={{ textWrap: 'balance' }}
            >
              {t.faqHeading}
            </h2>
            <p className="text-[15px] leading-relaxed text-[#4A453E] dark:text-[#C7BFB3] max-w-md mb-6">
              {t.faqSubheading}
            </p>

            <div
              role="tablist"
              aria-label={t.faqEyebrow}
              className="flex flex-wrap items-center gap-2 mb-8"
            >
              {TOPICS.map((topic) => {
                const active = selectedTopic === topic;
                return (
                  <button
                    key={topic}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => handleTopicChange(topic)}
                    className={`px-3.5 py-2 min-h-[38px] rounded-md text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-[#171614] dark:bg-[#F3EFE8] border-[#171614] dark:border-[#F3EFE8] text-[#F8F7F4] dark:text-[#121110]'
                        : 'bg-[#EFECE6]/70 dark:bg-[#1A1816] border-[#D8D1C7] dark:border-[#3A3530] text-[#4A453E] dark:text-[#C7BFB3] hover:text-[#171614] dark:hover:text-[#F3EFE8] hover:border-[#8C6239] dark:hover:border-[#D4A77A]'
                    }`}
                  >
                    {t.faqTopics[topic]}
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-lg border border-[#E2DDD5] dark:border-[#2D2925] bg-[#EFECE6]/55 dark:bg-[#1A1816] inline-flex flex-wrap items-center gap-3 text-xs">
              <span className="text-[#4A453E] dark:text-[#C7BFB3]">
                {t.faqMorePrompt}
              </span>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-[#8C6239] dark:text-[#D4A77A] hover:text-[#171614] dark:hover:text-[#F3EFE8] underline underline-offset-4 whitespace-nowrap"
              >
                <span>{t.faqMoreCta}</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Right Accordion List */}
          <div className="lg:col-span-7">
            <div className="divide-y divide-[#E2DDD5] dark:divide-[#2D2925] border border-[#E2DDD5] dark:border-[#2D2925] rounded-lg bg-white dark:bg-[#1A1816] overflow-hidden">
              {visibleItems.map((item) => {
                const isOpen = openId === item.id;
                const question = lang === 'bn' ? item.questionBn : item.questionEn;
                const answer = lang === 'bn' ? item.answerBn : item.answerEn;
                const topicLabel = t.faqTopics[item.topic];
                const panelId = `faq-panel-${item.id}`;
                const triggerId = `faq-trigger-${item.id}`;

                return (
                  <div key={item.id}>
                    <h3>
                      <button
                        id={triggerId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenId(isOpen ? null : item.id)}
                        className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-start justify-between gap-4 hover:bg-[#EFECE6]/45 dark:hover:bg-[#23201D] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#8C6239] dark:focus-visible:outline-[#D4A77A]"
                      >
                        <div className="space-y-1">
                          <span className="block text-[11px] font-medium text-[#8C6239] dark:text-[#D4A77A]">
                            {topicLabel}
                          </span>
                          <span className="block text-sm sm:text-[15px] font-semibold text-[#171614] dark:text-[#F3EFE8] leading-snug">
                            {question}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-[#5E5850] dark:text-[#9A9287] shrink-0 mt-1 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-[#171614] dark:text-[#F3EFE8]' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    </h3>
                    {isOpen && (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={triggerId}
                        className="px-5 sm:px-6 pb-5 pt-0.5 text-sm leading-relaxed text-[#4A453E] dark:text-[#C7BFB3]"
                      >
                        {answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
