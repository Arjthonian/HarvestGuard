"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";

const slideImages = [
  "/images/slide1.jpg",
  "/images/slide2.jpg",
  "/images/slide3.jpg",
];

export const DramaticIntro = ({ onComplete }: { onComplete: () => void }) => {
  const { dictionary } = useLanguage();
  const slides = useMemo(
    () => [
      dictionary.intro.slide1,
      dictionary.intro.slide2,
      dictionary.intro.slide3,
    ],
    [dictionary.intro.slide1, dictionary.intro.slide2, dictionary.intro.slide3],
  );
  const [index, setIndex] = useState(0);

  const isLastSlide = index === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
      return;
    }
    setIndex((prev) => Math.min(prev + 1, slides.length - 1));
  };

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[#0c0b0b] via-[#1b120d] to-[#040302] text-white">
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={slideImages[index]}
            alt="Storytelling backdrop"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 0.35, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div className="relative z-10 flex flex-1 flex-col justify-end px-6 py-16 md:px-16 lg:px-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="max-w-3xl space-y-6"
          >
            <p className="text-sm uppercase tracking-[0.5em] text-rose-200/80">
              HarvestGuard
            </p>
            <h1 className="text-3xl font-semibold leading-snug text-rose-50 drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] md:text-5xl">
              {slides[index]}
            </h1>
            <div className="h-[2px] w-32 bg-gradient-to-r from-rose-500 via-amber-400 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between">
          <div className="flex gap-3">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`h-1 w-12 rounded-full transition ${
                  idx <= index ? "bg-rose-400" : "bg-white/30"
                }`}
              />
            ))}
          </div>
          <motion.button
            type="button"
            onClick={handleNext}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="pointer-events-auto rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-wide shadow-lg backdrop-blur"
          >
            {isLastSlide ? dictionary.intro.cta : dictionary.actions.continue}
          </motion.button>
        </div>
      </div>
    </section>
  );
};

