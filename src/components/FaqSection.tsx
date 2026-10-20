"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { STORE_FAQS, getFaqSchema } from "@/lib/business-info";

interface FaqSectionProps {
  title?: string;
  subtitle?: string;
  faqs?: { question: string; answer: string }[];
  includeSchema?: boolean;
}

export default function FaqSection({
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know about visiting PLAYO toy showroom, ride-on cars, ordering, and directions.",
  faqs = STORE_FAQS,
  includeSchema = true,
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  const faqSchema = includeSchema ? getFaqSchema(faqs) : null;

  return (
    <section
      id="faq"
      className="py-8 sm:py-14 bg-[#FAFCFF] border-b border-gray-100 scroll-mt-20"
      aria-label="Frequently Asked Questions"
    >
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/70 text-[#FF9800] text-[11px] font-bold uppercase tracking-wider mb-2 sm:mb-2.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-[#0D1B2A] tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2 leading-relaxed px-2">
            {subtitle}
          </p>
        </div>

        {/* FAQ Accordion List - Clean, modern compact cards */}
        <div className="space-y-2 sm:space-y-3" itemScope itemType="https://schema.org/FAQPage">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
                className={`rounded-xl sm:rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-white border-[#FF9800]/50 shadow-xs"
                    : "bg-white border-gray-200/80 hover:border-gray-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full text-left px-3.5 py-3 sm:px-5 sm:py-4 flex items-center justify-between gap-3 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF9800]"
                  aria-expanded={isOpen}
                >
                  <span
                    itemProp="name"
                    className={`text-xs xs:text-sm sm:text-[15px] font-semibold sm:font-bold leading-snug sm:leading-normal transition-colors flex-1 pr-1 ${
                      isOpen ? "text-[#FF9800]" : "text-[#0D1B2A]"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? "bg-[#FF9800] text-white rotate-180 shadow-xs"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                    className="px-3.5 sm:px-5 pb-3.5 sm:pb-4.5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100"
                  >
                    <div itemProp="text" className="pt-1">{faq.answer}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
