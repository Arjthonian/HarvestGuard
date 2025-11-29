"use client";

import { LanguageSwitch } from "@/components/LanguageSwitch";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { WeatherProvider } from "@/contexts/WeatherContext";
import { ReactNode } from "react";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <LanguageProvider>
      <WeatherProvider>
        {children}
        <LanguageSwitch />
      </WeatherProvider>
    </LanguageProvider>
  );
};

