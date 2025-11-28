"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { mockScanCrop } from "@/lib/scanner";
import { motion } from "framer-motion";
import { Camera, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { useState } from "react";

type State = "idle" | "scanning" | "complete";

export const CropScanner = () => {
  const { dictionary } = useLanguage();
  const [state, setState] = useState<State>("idle");
  const [verdict, setVerdict] = useState<"fresh" | "rotten" | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);

  const handleScan = async () => {
    setState("scanning");
    const result = await mockScanCrop();
    setVerdict(result.verdict);
    setNotes(result.notes);
    setConfidence(result.confidence);
    setState("complete");
  };

  return (
    <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#260c1a] via-[#360b2d] to-[#1d0715] p-6 text-white shadow-xl">
      <div className="mb-4 flex items-center gap-2">
        <ShieldAlert className="h-6 w-6 text-rose-300" />
        <h2 className="text-xl font-semibold">
          {dictionary.dashboard.scannerTitle}
        </h2>
      </div>
      <p className="text-sm text-rose-100/80">{dictionary.scanner.uploadPrompt}</p>

      <div className="mt-6 flex flex-col gap-4 md:flex-row">
        <motion.button
          type="button"
          onClick={handleScan}
          disabled={state === "scanning"}
          whileTap={{ scale: 0.97 }}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-6 py-10 text-center text-lg font-semibold uppercase tracking-wide transition hover:bg-white/15 disabled:cursor-wait"
        >
          {state === "scanning" ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              {dictionary.scanner.scanning}
            </>
          ) : (
            <>
              <Camera className="h-6 w-6" />
              {dictionary.scanner.startScan}
            </>
          )}
        </motion.button>
        <div className="flex-1 rounded-2xl bg-black/30 px-6 py-4">
          {state === "idle" && (
            <p className="text-sm text-rose-100/80">
              {dictionary.scanner.uploadPrompt}
            </p>
          )}
          {state === "scanning" && (
            <div className="flex flex-col items-center justify-center gap-3 py-6 text-rose-100">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>{dictionary.scanner.scanning}</p>
            </div>
          )}
          {state === "complete" && verdict && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-lg font-semibold">
                {verdict === "fresh" ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-300" />
                ) : (
                  <ShieldAlert className="h-6 w-6 text-amber-300" />
                )}
                <span>
                  {verdict === "fresh"
                    ? dictionary.scanner.fresh
                    : dictionary.scanner.rotten}
                </span>
              </div>
              <p className="text-sm text-rose-100/90">{notes}</p>
              <p className="text-xs uppercase tracking-wide text-rose-200/80">
                Confidence: {confidence}%
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

