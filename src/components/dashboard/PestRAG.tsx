"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { AlertTriangle, Camera, Loader2, ShieldAlert } from "lucide-react";
import Image from "next/image";
import { FormEvent, useState } from "react";

type RiskLevel = "High" | "Medium" | "Low" | "Unknown";

type PestResult = {
  pestNameBn: string;
  riskLevel: RiskLevel;
  summaryBn: string;
  actionPlanBn: string[];
  rawText?: string;
};

const riskColor = (level: RiskLevel) => {
  switch (level) {
    case "High":
      return "bg-red-500/15 text-red-200 border-red-500/50";
    case "Medium":
      return "bg-amber-500/15 text-amber-200 border-amber-500/50";
    case "Low":
      return "bg-emerald-500/15 text-emerald-200 border-emerald-500/50";
    default:
      return "bg-slate-500/15 text-slate-200 border-slate-500/50";
  }
};

export const PestRAG = () => {
  const { language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationNote, setLocationNote] = useState("");
  const [result, setResult] = useState<PestResult | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] ?? null;
    setResult(null);
    setError(null);
    if (!next) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!next.type.startsWith("image/")) {
      setError(
        language === "bn"
          ? "শুধু ছবি (JPG/PNG) আপলোড করুন।"
          : "Please upload an image (JPG/PNG).",
      );
      return;
    }
    setFile(next);
    const url = URL.createObjectURL(next);
    setPreviewUrl(url);
  };

  const normalizeRisk = (value: unknown): RiskLevel => {
    if (!value) return "Unknown";
    const str = String(value).toLowerCase();
    if (str.includes("high") || str.includes("উচ্চ")) return "High";
    if (str.includes("medium") || str.includes("মাঝারি")) return "Medium";
    if (str.includes("low") || str.includes("নিম্ন")) return "Low";
    return "Unknown";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError(
        language === "bn"
          ? "প্রথমে একটি পোকা বা ক্ষতির ছবি আপলোড করুন।"
          : "Please upload a pest/damage image first.",
      );
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      if (locationNote.trim()) {
        formData.append("context", locationNote.trim());
      }

      const response = await fetch("/api/pest-rag", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Request failed");
      }

      const structured = data.structured ?? {};
      const pestNameBn =
        structured.pest_name_bn ??
        (language === "bn" ? "অজানা পোকা/ক্ষতি" : "Unknown pest/damage");
      const riskLevel = normalizeRisk(structured.risk_level);
      const summaryBn =
        structured.summary_bn ??
        (language === "bn"
          ? "বিস্তারিত তথ্য পাওয়া যায়নি। আবার চেষ্টা করুন বা ছবি স্পষ্ট করুন।"
          : "No detailed information returned.");
      const actionPlanBn: string[] =
        Array.isArray(structured.action_plan_bn) &&
        structured.action_plan_bn.length > 0
          ? structured.action_plan_bn
          : [
              "ক্ষতিগ্রস্ত অংশ ভালোভাবে পর্যবেক্ষণ করুন এবং খুব বেশি পোকা থাকলে হাত দিয়ে বা জাল দিয়ে তুলে ফেলুন।",
              "প্রথমে প্রাকৃতিক পদ্ধতি ব্যবহার করুন, যেমন নীম তেল স্প্রে বা সাবানের হালকা দ্রবণ।",
            ];

      setResult({
        pestNameBn,
        riskLevel,
        summaryBn,
        actionPlanBn,
        rawText: data.rawText,
      });
    } catch (err) {
      console.error("PestRAG error:", err);
      setError(
        language === "bn"
          ? "পোকা শনাক্তকরণে সমস্যা হয়েছে। ইন্টারনেট সংযোগ ও API কী ঠিক আছে কিনা দেখুন।"
          : "Failed to analyze image. Check internet and API key.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#100b18] via-[#1b1021] to-[#050308] p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-rose-300" />
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-rose-200/80">
              {language === "bn"
                ? "পোকা শনাক্তকরণ ও করণীয়"
                : "Pest Identification & Action"}
            </p>
            <p className="text-xs text-white/60">
              {language === "bn"
                ? "ছবি তুলুন, সাথে সাথে ঝুঁকি ও করণীয় জানুন"
                : "Upload a photo, get instant risk & plan"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <label className="flex flex-col gap-3 rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-sm text-white/80">
          <span className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-rose-300" />
            {language === "bn"
              ? "পোকা বা ক্ষতির ছবি আপলোড করুন"
              : "Upload pest or damage photo"}
          </span>
          <p className="text-xs text-white/50">
            {language === "bn"
              ? "JPG বা PNG ফরম্যাট, যতটা সম্ভব কাছ থেকে ও স্পষ্ট ছবি তুলুন।"
              : "JPG/PNG, as close and clear as possible."}
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="flex-1 cursor-pointer rounded-full bg-white/10 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white hover:bg-white/20">
              {language === "bn" ? "ছবি নির্বাচন করুন" : "Choose Image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {previewUrl && (
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src={previewUrl}
                  alt="Pest preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </label>

        <label className="flex flex-col gap-2 text-xs text-white/70">
          {language === "bn"
            ? "স্থান/ফসল সম্পর্কে সংক্ষিপ্ত তথ্য (ঐচ্ছিক)"
            : "Short note about location/crop (optional)"}
          <textarea
            rows={2}
            value={locationNote}
            onChange={(e) => setLocationNote(e.target.value)}
            className="rounded-2xl bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/40"
            placeholder={
              language === "bn"
                ? "যেমন: বরিশাল, ধানক্ষেতে পাতায় দাগ পড়েছে..."
                : "e.g. Barishal, spots on rice leaves..."
            }
          />
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {language === "bn" ? "বিশ্লেষণ করুন" : "Analyze"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-rose-500/15 px-4 py-3 text-xs text-rose-100">
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-5 space-y-4">
          <div
            className={`rounded-2xl border px-4 py-3 text-xs ${riskColor(
              result.riskLevel,
            )}`}
          >
            <p className="text-[11px] uppercase tracking-[0.2em]">
              {language === "bn" ? "ঝুঁকির স্তর" : "Risk Level"}
            </p>
            <p className="mt-1 text-lg font-semibold">
              {result.riskLevel === "High"
                ? "উচ্চ"
                : result.riskLevel === "Medium"
                  ? "মাঝারি"
                  : result.riskLevel === "Low"
                    ? "নিম্ন"
                    : "অজানা"}
            </p>
            <p className="mt-1 text-[11px] text-slate-200/80">
              {language === "bn"
                ? "এই ঝুঁকি তৎক্ষণাৎ নজর দেওয়ার প্রয়োজন বোঝায়।"
                : "Represents current threat level."}
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-100">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">
              {language === "bn" ? "পোকা / রোগ" : "Pest / Disease"}
            </p>
            <p className="mt-1 text-base font-semibold">{result.pestNameBn}</p>
            <p className="mt-2 text-xs text-slate-200/90">{result.summaryBn}</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-100">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">
              {language === "bn" ? "ধাপে ধাপে করণীয়" : "Step-by-step plan"}
            </p>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-slate-100">
              {result.actionPlanBn.map((step, index) => (
                <li key={index} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};


