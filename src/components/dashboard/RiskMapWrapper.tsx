"use client";

import dynamic from "next/dynamic";

// Dynamically import RiskMap to avoid SSR issues with Leaflet
const RiskMap = dynamic(() => import("./RiskMap").then((mod) => ({ default: mod.RiskMap })), {
  ssr: false,
  loading: () => (
    <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0b1120] p-6 text-white shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 animate-pulse rounded-full bg-blue-300"></div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            স্থানীয় ঝুঁকি মানচিত্র
          </p>
          <p className="text-xs text-slate-500">মানচিত্র লোড হচ্ছে...</p>
        </div>
      </div>
    </section>
  ),
});

export { RiskMap };

