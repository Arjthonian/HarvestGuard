"use client";

import { BatchManager } from "@/components/dashboard/BatchManager";
import { CropScanner } from "@/components/dashboard/CropScanner";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { WeatherBuddy } from "@/components/dashboard/WeatherBuddy";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050505] to-[#0e0b12] px-4 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <DashboardHero />
        <div className="grid gap-8">
          <WeatherBuddy />
          <CropScanner />
          <BatchManager />
        </div>
      </div>
    </div>
  );
}

