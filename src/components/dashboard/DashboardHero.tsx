"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { ShieldHalf, Sparkles } from "lucide-react";
import Link from "next/link";

export const DashboardHero = () => {
  const { dictionary } = useLanguage();

  return (
    <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#1a0f0d] via-[#1f1c24] to-[#050406] p-8 text-white shadow-2xl">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.6em] text-rose-200/70">
            HarvestGuard
          </p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
            {dictionary.dashboard.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70">
            {dictionary.dashboard.subtitle}
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="w-full md:w-auto"
        >
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 rounded-full bg-rose-500/90 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-2xl"
          >
            <Sparkles className="h-4 w-4" />
            {dictionary.dashboard.heroCta}
          </Link>
        </motion.div>
      </div>
      <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-white/50">
        <ShieldHalf className="h-4 w-4 text-emerald-400" />
        {dictionary.ui.brandTagline}
      </div>
    </section>
  );
};

