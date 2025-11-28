export type ScanResult = {
  verdict: "fresh" | "rotten";
  confidence: number;
  notes: string;
};

export async function mockScanCrop(): Promise<ScanResult> {
  await new Promise((resolve) => setTimeout(resolve, 2200));

  const isFresh = Math.random() > 0.35;
  return {
    verdict: isFresh ? "fresh" : "rotten",
    confidence: Math.round(70 + Math.random() * 25),
    notes: isFresh
      ? "পাতা এবং দানার ঘনত্ব সুস্থ আছে। আর্দ্রতা সহনীয় সীমায় আছে।"
      : "দানা নরম হয়ে গেছে, ছত্রাকের লক্ষণ দেখা যাচ্ছে। দ্রুত ব্যবস্থা নিন।",
  };
}

