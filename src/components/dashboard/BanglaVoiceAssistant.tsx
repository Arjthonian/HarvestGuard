"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useWeather } from "@/contexts/WeatherContext";
import { useBanglaSpeech } from "@/hooks/useBanglaSpeech";
import {
  generateAlertsForBatches,
  SmartAlert,
} from "@/lib/alertEngine";
import { getLocalBatches } from "@/lib/storage";
import { Mic, MicOff, MessageCircle, Send, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ConversationEntry = {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
};

const SAMPLE_QUERIES = [
  "আজকের আবহাওয়া কেমন?",
  "আমার ধানের ঝুঁকি কত?",
  "গুদামে কী করব?",
  "কবে কাটব?",
  "স্টোরেজে বাতাস লাগাবো কি?",
];

const MAX_HISTORY = 5;

const speakBangla = (text: string) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "bn-BD";
  utterance.pitch = 1;
  utterance.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

export const BanglaVoiceAssistant = () => {
  const { language } = useLanguage();
  const { weather } = useWeather();
  const {
    supported,
    status,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useBanglaSpeech();

  const [alertSnapshots, setAlertSnapshots] = useState<SmartAlert[]>([]);
  const [history, setHistory] = useState<ConversationEntry[]>([]);
  const [textQuery, setTextQuery] = useState("");
  const [fallbackMode, setFallbackMode] = useState(false);

  useEffect(() => {
    if (!weather) return;
    const batches = getLocalBatches();
    const alerts = generateAlertsForBatches(batches, weather);
    setAlertSnapshots(alerts);
  }, [weather]);

  const highestRiskAlert = useMemo(() => {
    return [...alertSnapshots].sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 } as const;
      return order[a.riskLevel] - order[b.riskLevel];
    })[0];
  }, [alertSnapshots]);

  const pushConversation = (question: string, answer: string) => {
    setHistory((prev) => {
      const next = [
        {
          id: crypto.randomUUID(),
          question,
          answer,
          timestamp: new Date().toLocaleTimeString("bn-BD", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...prev,
      ];
      return next.slice(0, MAX_HISTORY);
    });
  };

  const buildWeatherAnswer = () => {
    if (!weather) {
      return "আবহাওয়ার তথ্য এখনই পাওয়া যাচ্ছে না। একটু পরে চেষ্টা করুন।";
    }
    return `আজ ${weather.location}-এ তাপমাত্রা ${weather.temperature}°C, আর্দ্রতা ${weather.humidity}%, আর বৃষ্টির সম্ভাবনা ${weather.rainProbability}%। ${weather.narrative}`;
  };

  const buildRiskAnswer = () => {
    if (!highestRiskAlert) {
      return "কোনো সক্রিয় ব্যাচের ঝুঁকি তথ্য পাওয়া যায়নি। ব্যাচ যোগ করুন বা স্ক্যান করুন।";
    }
    return `${highestRiskAlert.cropType} ব্যাচের বর্তমান ঝুঁকি ${highestRiskAlert.riskLevel === "critical" ? "সমালোচনামূলক" : highestRiskAlert.riskLevel === "high" ? "উচ্চ" : highestRiskAlert.riskLevel === "medium" ? "মাঝারি" : "নিম্ন"}। ${highestRiskAlert.message}`;
  };

  const buildStorageAnswer = () => {
    if (highestRiskAlert && highestRiskAlert.actionRequired) {
      return `গুদামে এখনই ব্যবস্থা নিন: ${highestRiskAlert.message}`;
    }
    return "গুদাম শুকনা রাখুন, বাতাস চলাচল নিশ্চিত করুন এবং আর্দ্রতা ৬৫%-এর নিচে রাখার চেষ্টা করুন।";
  };

  const buildHarvestAnswer = () => {
    if (!weather) {
      return "কাটার পরিকল্পনার আগে আবহাওয়া তথ্য নিন। এখন ডেটা নেই।";
    }
    if (weather.rainProbability >= 70) {
      return "আগামী ১-২ দিনের মধ্যেই কাটাই সেরে ফেলুন, কারণ বৃষ্টির ঝুঁকি বেশি।";
    }
    if (highestRiskAlert && highestRiskAlert.riskLevel === "critical") {
      return `${highestRiskAlert.cropType} ব্যাচ দ্রুত কাটুন অথবা ঢেকে রাখুন, কারণ ঝুঁকি ${highestRiskAlert.riskLevel}।`;
    }
    return "ফসল পরিপক্বতা অনুযায়ী পরিকল্পনা করুন। ঝুঁকি কম, তাই আবহাওয়া নজরে রেখে ঠিক সময়ে কাটুন।";
  };

  const buildDefaultAnswer = () => {
    return "দুঃখিত, প্রশ্নটি বুঝতে পারিনি। উদাহরণ: 'আজকের আবহাওয়া কেমন?' বা 'গুদামে কী করব?'.";
  };

  const interpretQuestion = (question: string) => {
    const normalized = question.replace(/\s+/g, "").toLowerCase();
    if (normalized.includes("আবহাও")) return buildWeatherAnswer();
    if (normalized.includes("ঝুঁকি") || normalized.includes("নষ্ট") || normalized.includes("ধান")) {
      return buildRiskAnswer();
    }
    if (normalized.includes("গুদাম") || normalized.includes("স্টোরেজ") || normalized.includes("সংরক্ষণ")) {
      return buildStorageAnswer();
    }
    if (normalized.includes("কাটব") || normalized.includes("কাটাই") || normalized.includes("হারভেস্ট")) {
      return buildHarvestAnswer();
    }
    if (normalized.includes("ফ্যান") || normalized.includes("বাতাস")) {
      return "গুদামে বাতাস চলাচল বজায় রাখতে ফ্যান চালু রাখুন, বিশেষ করে আর্দ্রতা ৭০%-এর বেশি হলে।";
    }
    return buildDefaultAnswer();
  };

  const handleQuery = (question: string, via: "voice" | "text") => {
    if (!question.trim()) return;
    const answer = interpretQuestion(question.trim());
    pushConversation(question.trim(), answer);
    speakBangla(answer);
    setTextQuery((prev) => (via === "text" ? "" : prev));
  };

  useEffect(() => {
    if (!transcript) return;
    handleQuery(transcript, "voice");
    resetTranscript();
  }, [transcript, resetTranscript]);

  useEffect(() => {
    if (!supported && speechError) {
      setFallbackMode(true);
    }
  }, [supported, speechError]);

  const micActive = status === "listening";

  return (
    <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#110f16] via-[#1c1b22] to-[#09060d] p-6 text-white shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            {language === "bn" ? "বাংলা ভয়েস সহায়ক" : "Bangla Voice Assistant"}
          </p>
          <h2 className="text-2xl font-semibold text-white/90">
            {language === "bn" ? "কণ্ঠে প্রশ্ন করুন" : "Ask hands-free"}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Volume2 className="h-4 w-4 text-emerald-300" />
          {supported && !fallbackMode ? (
            <span>{language === "bn" ? "ভয়েস মোড সক্রিয়" : "Voice mode ready"}</span>
          ) : (
            <span>{language === "bn" ? "টেক্সট মোড সক্রিয়" : "Fallback to text"}</span>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!supported || fallbackMode}
            onClick={() => (micActive ? stopListening() : startListening())}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              micActive
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                : "bg-white/10 text-white hover:bg-white/20"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {micActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {micActive
              ? language === "bn" ? "শোনা বন্ধ করুন" : "Stop listening"
              : language === "bn" ? "ভয়েস শুরু করুন" : "Start listening"}
          </button>
          {!supported || fallbackMode ? (
            <span className="text-xs text-amber-200">
              {language === "bn" ? "আপনার ব্রাউজার ভয়েস সমর্থন করে না। কীবোর্ড ব্যবহার করুন।" : "Voice not supported, use text input."}
            </span>
          ) : (
            <span className="text-xs text-slate-300">
              {micActive
                ? language === "bn" ? "শুনছে..." : "Listening..."
                : language === "bn" ? "মাইক্রোফোন ট্যাপ করে কথা বলুন" : "Tap mic and speak Bangla"}
            </span>
          )}
        </div>

        <div className="text-xs text-slate-300">
          {language === "bn" ? "উদাহরণ:" : "Try:"}{" "}
          {SAMPLE_QUERIES.map((sample, index) => (
            <button
              key={sample}
              onClick={() => handleQuery(sample, "text")}
              className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white transition hover:bg-white/20 mr-2 mb-2"
            >
              {sample}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-black/30 p-3">
          <input
            type="text"
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
            placeholder={language === "bn" ? "বাংলায় প্রশ্ন লিখুন..." : "Type your question in Bangla..."}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
          />
          <button
            type="button"
            onClick={() => handleQuery(textQuery, "text")}
            className="rounded-full bg-emerald-500/80 p-2 text-black transition hover:bg-emerald-400 disabled:opacity-50"
            disabled={!textQuery.trim()}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {history.length === 0 ? (
          <p className="text-sm text-slate-400">
            {language === "bn"
              ? "এখনও কোনো প্রশ্ন নেই। মাইক্রোফোন অথবা কীবোর্ড দিয়ে প্রশ্ন করুন।"
              : "No questions yet. Use mic or keyboard to ask."}
          </p>
        ) : (
          history.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-100"
            >
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest text-white/60">
                <span>{language === "bn" ? "প্রশ্ন" : "Question"}</span>
                <span>{entry.timestamp}</span>
              </div>
              <p className="font-semibold text-white">{entry.question}</p>
              <div className="mt-3 rounded-xl bg-black/30 p-3 text-[13px] leading-relaxed text-slate-200">
                {entry.answer}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

