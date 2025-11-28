"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const { dictionary } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage(error.message);
      setLoading(false);
    } else {
      setMessage(dictionary.auth.loginSuccess);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-16 text-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-rose-400" />
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-white/50">
              HarvestGuard
            </p>
            <h1 className="text-2xl font-semibold">
              {dictionary.auth.loginTitle}
            </h1>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-white/70">
            {dictionary.auth.emailLabel}
            <input
              type="email"
              required
              className="mt-1 w-full rounded-2xl bg-white/10 px-4 py-3 text-white outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-sm text-white/70">
            {dictionary.auth.passwordLabel}
            <input
              type="password"
              required
              className="mt-1 w-full rounded-2xl bg-white/10 px-4 py-3 text-white outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-rose-500/90 py-3 text-sm font-semibold uppercase tracking-wide text-white disabled:cursor-not-allowed"
          >
            {loading ? "..." : dictionary.auth.loginButton}
          </button>
          {message && (
            <p className="text-center text-xs uppercase tracking-[0.4em] text-emerald-300">
              {message}
            </p>
          )}
        </form>
        
        <div className="text-center">
          <p className="text-xs text-white/50">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="text-rose-400 underline hover:text-rose-300"
            >
              Register
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

