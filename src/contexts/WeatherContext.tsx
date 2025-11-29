"use client";

import { WeatherReport } from "@/lib/weather";
import { createContext, useContext, useState, ReactNode } from "react";

type WeatherContextValue = {
  weather: WeatherReport | null;
  setWeather: (weather: WeatherReport | null) => void;
};

const WeatherContext = createContext<WeatherContextValue | undefined>(
  undefined,
);

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
  const [weather, setWeather] = useState<WeatherReport | null>(null);

  return (
    <WeatherContext.Provider value={{ weather, setWeather }}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
};

