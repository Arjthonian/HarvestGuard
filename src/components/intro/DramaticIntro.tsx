"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, useEffect } from "react";

// Background images matching the emotional context of each slide
// Slide 1: Sad - farmer struggling with crop loss (damaged/withered crops)
// Slide 2: Concerned - food waste and loss (spoiled crops, waste)
// Slide 3: Hopeful - happy farmers protecting harvest (successful harvest, smiling farmers)

// Local images from public/images directory (prioritized for reliability)
// Note: Make sure these are actual image files, not text files
const slideImages = [
  "/images/slide1.jpg", // Sad - farmer struggling
  "/images/slide2.jpg", // Fact - food waste/concerned
  "/images/slide3.jpg", // Happy - successful harvest
];

// Google Drive URLs as fallback (if local images fail)
const fallbackImages = [
  "https://drive.google.com/uc?export=view&id=18ERBg-TG1YUNXNHGKmXeGRMg6RZ2XSbE", // Sad - farmer struggling
  "https://drive.google.com/uc?export=view&id=1ucTsGlm16xN9UcfHttEGTIbCSZipqFpE", // Fact - food waste/concerned
  "https://drive.google.com/uc?export=view&id=1mt3FHcRd4U8JRkYITiICxQEEvkTUVoAg", // Happy - successful harvest
];

const getImageSrc = (index: number, hasError: boolean) => {
  // Use local images first (faster and more reliable)
  // If local image fails, fallback to Google Drive
  if (hasError) {
    return fallbackImages[index] || "";
  }
  return slideImages[index] || fallbackImages[index] || "";
};

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
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const isLastSlide = index === slides.length - 1;

  // Handle image load errors
  const handleImageError = (slideIndex: number) => {
    setImageErrors((prev) => new Set(prev).add(slideIndex));
  };

  // Preload local images
  useEffect(() => {
    slideImages.forEach((src, idx) => {
      const img = new Image();
      img.onerror = () => handleImageError(idx);
      img.src = src;
    });
  }, []);

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
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="h-full w-full relative"
            style={{
              backgroundImage: `url(${getImageSrc(index, imageErrors.has(index))})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundColor: "#0c0b0b", // Fallback color if image fails
            }}
          >
            {/* Hidden img for error detection */}
            <img
              src={getImageSrc(index, imageErrors.has(index))}
              alt=""
              className="sr-only"
              onError={() => {
                console.error(`Failed to load image for slide ${index + 1}:`, getImageSrc(index, imageErrors.has(index)));
                handleImageError(index);
              }}
              onLoad={() => {
                // Image loaded successfully
                setImageErrors((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(index);
                  return newSet;
                });
              }}
            />
            {/* Dark overlay to ensure text readability */}
            <div className="absolute inset-0 bg-black/50" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black via-black/40 to-transparent" />
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

