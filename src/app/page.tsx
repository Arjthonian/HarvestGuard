"use client";

import { DramaticIntro } from "@/components/intro/DramaticIntro";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabaseClient";
import { HAS_VISITED_KEY, readLocalFlag, writeLocalFlag } from "@/lib/storage";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ViewState = "loading" | "story" | "redirecting";

export default function Home() {
  const router = useRouter();
  const [state, setState] = useState<ViewState>("loading");
  const { dictionary } = useLanguage();

  useEffect(() => {
    let mounted = true;
    const evaluate = async () => {
      const visited = readLocalFlag(HAS_VISITED_KEY);
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (data.session) {
        setState("redirecting");
        router.replace("/dashboard");
        return;
      }
      if (visited) {
        setState("redirecting");
        router.replace("/login");
        return;
      }
      setState("story");
    };
    evaluate();
    return () => {
      mounted = false;
    };
  }, [router]);

  const handleComplete = () => {
    writeLocalFlag(HAS_VISITED_KEY, "true");
    router.push("/register");
  };

  if (state === "loading" || state === "redirecting") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 text-sm uppercase tracking-[0.6em] text-white/70"
        >
          <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
          {state === "loading"
            ? dictionary.ui.loadingStory
            : dictionary.ui.redirecting}
        </motion.div>
      </div>
    );
  }

  return <DramaticIntro onComplete={handleComplete} />;
}
