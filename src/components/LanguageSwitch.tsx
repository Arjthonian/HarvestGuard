"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Languages } from "lucide-react";

export const LanguageSwitch = () => {
  const { language, toggleLanguage, dictionary } = useLanguage();
  const label =
    language === "bn"
      ? dictionary.actions.switchToEnglish
      : dictionary.actions.switchToBangla;

  return (
    <motion.button
      type="button"
      onClick={toggleLanguage}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur transition hover:bg-emerald-600"
    >
      <Languages className="h-4 w-4" />
      {label}
    </motion.button>
  );
};

