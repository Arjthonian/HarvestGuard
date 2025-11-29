"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useWeather } from "@/contexts/WeatherContext";
import { fetchWeatherByLocation, WeatherReport } from "@/lib/weather";
import { AlertTriangle, CloudRain, Droplets, MapPin, ThermometerSun } from "lucide-react";
import { useEffect, useState } from "react";

type LocationState = "idle" | "requesting" | "granted" | "denied" | "error";

export const WeatherBuddy = () => {
  const { dictionary, language } = useLanguage();
  const { weather, setWeather } = useWeather();
  const [report, setReport] = useState<WeatherReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError(language === "bn" ? "আপনার ব্রাউজার অবস্থানের অনুমতি সমর্থন করে না" : "Your browser doesn't support geolocation");
      setLocationState("error");
      setLoading(false);
      return;
    }

    setLocationState("requesting");
    setLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocationState("granted");
        try {
          const data = await fetchWeatherByLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setReport(data);
          setWeather(data); // Share weather with other components
        } catch (error) {
          console.error("Failed to fetch weather:", error);
          const errorMsg = error instanceof Error ? error.message : (language === "bn" ? "আবহাওয়া তথ্য লোড করতে ব্যর্থ" : "Failed to load weather data");
          
          // Check if it's an API key error
          if (errorMsg.includes("Invalid API key") || errorMsg.includes("401")) {
            setLocationError(
              language === "bn" 
                ? "API কী সঠিক নয়। .env.local ফাইলে OpenWeatherMap API কী যাচাই করুন।" 
                : "Invalid API key. Please check your OpenWeatherMap API key in .env.local"
            );
          } else if (errorMsg.includes("rate limit") || errorMsg.includes("429")) {
            setLocationError(
              language === "bn"
                ? "API সীমা অতিক্রম করেছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।"
                : "API rate limit exceeded. Please try again later."
            );
          } else {
            setLocationError(errorMsg);
          }
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationState("denied");
        setLocationError(
          error.code === 1
            ? language === "bn"
              ? "অবস্থানের অনুমতি দেওয়া হয়নি"
              : "Location permission denied"
            : language === "bn"
              ? "অবস্থান নির্ধারণ করতে ব্যর্থ"
              : "Failed to get location"
        );
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    // Only request location once on mount
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rainAlert =
    report && report.rainProbability >= 70
      ? dictionary.weather.rainAlert(report.rainProbability)
      : dictionary.weather.defaultMessage;

  return (
    <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0b1120] p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CloudRain className="h-6 w-6 text-amber-300" />
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              {dictionary.dashboard.weatherModuleTitle}
            </p>
            <h2 className="text-2xl font-semibold">{report?.location ?? "..."}</h2>
          </div>
        </div>
        {(locationState === "denied" || locationState === "error") && (
          <button
            onClick={requestLocation}
            className="flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-200 hover:bg-amber-500/30 transition"
            title={language === "bn" ? "অবস্থানের অনুমতি দিন" : "Allow location access"}
          >
            <MapPin className="h-4 w-4" />
            {language === "bn" ? "অবস্থান" : "Location"}
          </button>
        )}
      </div>

      {locationState === "requesting" && (
        <div className="mt-6 space-y-2">
          <p className="text-sm text-amber-300 animate-pulse">
            {language === "bn" ? "অবস্থানের অনুমতি অনুরোধ করা হচ্ছে..." : "Requesting location permission..."}
          </p>
        </div>
      )}

      {locationError && locationState !== "requesting" && (
        <div className="mt-6 rounded-2xl bg-rose-500/20 px-4 py-3 text-sm text-rose-200">
          <p>{locationError}</p>
        </div>
      )}

      {loading && locationState !== "requesting" ? (
        <p className="mt-6 animate-pulse text-slate-300">
          {dictionary.weather.defaultMessage}
        </p>
      ) : (
        report && (
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <ThermometerSun className="h-6 w-6 text-rose-300" />
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-400">
                  {dictionary.weather.tempLabel}
                </p>
                <p className="text-2xl font-bold">{report.temperature}°C</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <Droplets className="h-6 w-6 text-cyan-300" />
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-400">
                  {dictionary.weather.humidityLabel}
                </p>
                <p className="text-2xl font-bold">{report.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <CloudRain className="h-6 w-6 text-amber-300" />
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-400">
                  {dictionary.weather.rainLabel}
                </p>
                <p className="text-2xl font-bold">
                  {report.rainProbability}%
                </p>
              </div>
            </div>
          </div>
        )
      )}

      {report && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white/10 px-4 py-4 text-sm text-rose-50">
          <AlertTriangle className="mt-1 h-5 w-5 text-amber-400" />
          <p>{rainAlert}</p>
        </div>
      )}
    </section>
  );
};

