"use client";

import {
  DEFAULT_LANGUAGE,
  SupportedLanguage,
  TranslationSections,
  translations,
} from "@/lib/translations";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type LanguageContextValue = {
  language: SupportedLanguage;
  dictionary: TranslationSections;
  localeLabel: string;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
};

const STORAGE_KEY = "harvestguard-language";

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    if (typeof window === "undefined") return DEFAULT_LANGUAGE;
    const stored = window.localStorage.getItem(STORAGE_KEY) as
      | SupportedLanguage
      | null;
    return stored ?? DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const handleSetLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguage(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === "bn" ? "en" : "bn"));
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const config = translations[language];
    return {
      language,
      dictionary: config.sections,
      localeLabel: config.localeLabel,
      setLanguage: handleSetLanguage,
      toggleLanguage,
    };
  }, [language, handleSetLanguage, toggleLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

