"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SectionLabel } from "./ui/section-label";

const quotes = [
  {
    arabic: "يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ",
    translation:
      "...niscaya Allah akan mengangkat derajat orang-orang yang beriman di antaramu dan orang-orang yang diberi ilmu beberapa derajat.",
    source: "Q.S. Al-Mujadilah: 11",
    isArabic: true,
  },
  {
    text: "I have no special talents. I am only passionately curious.",
    source: "Albert Einstein",
    isArabic: false,
  },
];

interface AboutProps {
  bio?: string | null;
  interests?: readonly (string | null)[] | null;
}

export function About({ bio, interests }: AboutProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const defaultInterests = [
    "Software Engineering",
    "AI Agents",
    "Networking",
    "Operating Systems",
    "Hardware",
    "Repair HP & Laptop",
    "OS Installation",
    "Linux",
  ];

  const bioParagraphs = bio
    ? bio.split("\n\n").filter(Boolean)
    : [
        "Saya adalah seorang tech enthusiast yang memiliki ketertarikan mendalam pada pengembangan software dan sistem komputer. Saya senang mengulik teknologi baru, membuat aplikasi web fungsional, serta mengeksplorasi seluk-beluk hardware dan sistem operasi.",
        "Saat ini, saya terbuka untuk proyek freelance, kolaborasi kreatif, atau sekadar berdiskusi tentang ide-ide teknologi baru yang bermanfaat.",
      ];

  const activeInterests = (interests && interests.length > 0)
    ? interests.filter((i): i is string => typeof i === "string")
    : defaultInterests;

  return (
    <motion.section
      id="about"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="border-t border-border-default py-16 max-w-3xl mx-auto px-6 md:px-8"
    >
      <SectionLabel label="ABOUT" />
      <div className="mt-6">
        <div className="space-y-6 font-sans text-sm md:text-base text-text-secondary leading-relaxed max-w-2xl">
          {bioParagraphs.map((paragraph, idx) => (
            <p key={`${idx}-${paragraph.slice(0, 10)}`}>
              {paragraph}
            </p>
          ))}

          <div>
            <span className="font-mono text-[10px] tracking-[0.15em] text-text-muted uppercase block mb-3">
              TINKERING & EXPLORATIONS
            </span>
            <div className="flex flex-wrap gap-2">
              {activeInterests.map((interest) => (
                <span
                  key={interest}
                  className="font-mono text-[11px] bg-bg-surface border border-border-default text-text-secondary px-2.5 py-1 rounded transition-colors hover:border-text-placeholder hover:text-text-primary"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          <div 
            className="pt-2 min-h-[140px] md:min-h-[120px] flex flex-col justify-between"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="border-l-2 border-accent/70 pl-4 font-mono text-xs md:text-sm text-text-muted flex-1"
              >
                {quotes[currentIndex].isArabic ? (
                  <div className="space-y-1.5">
                    <p
                      className="font-sans text-right text-base md:text-lg mb-2 font-medium"
                      dir="rtl"
                    >
                      {quotes[currentIndex].arabic}
                    </p>
                    <p className="italic">{quotes[currentIndex].translation}</p>
                  </div>
                ) : (
                  <p className="italic leading-relaxed">
                    "{quotes[currentIndex].text}"
                  </p>
                )}
                <span className="block text-[10px] text-text-placeholder mt-2 not-italic font-mono uppercase">
                  — {quotes[currentIndex].source}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Navigation Indicators */}
            <div className="flex gap-1.5 mt-4 pl-4">
              {quotes.map((quote, index) => (
                <button
                  type="button"
                  key={quote.source}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    index === currentIndex
                      ? "bg-accent w-3"
                      : "bg-border-default hover:bg-text-placeholder"
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
