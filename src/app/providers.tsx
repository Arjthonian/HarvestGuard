"use client";

import { LanguageSwitch } from "@/components/LanguageSwitch";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ReactNode } from "react";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <LanguageProvider>
      {children}
      <LanguageSwitch />
    </LanguageProvider>
  );
};

