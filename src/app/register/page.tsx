"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Sprout } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const { dictionary, language } = useLanguage();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    district: "",
    upazila: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { preferred_lang: language },
        },
      });
      
      if (error) {
        setMessageType("error");
        setMessage(error.message);
        setLoading(false);
        return;
      }
      
      if (data.user) {
        // Wait a bit for the trigger to potentially create the profile
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // First, check if profile already exists (created by trigger)
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .single();
        
        // Use insert or update based on whether profile exists
        let profileError;
        if (existingProfile) {
          // Update existing profile
          const { error } = await supabase
            .from("profiles")
            .update({
              name: form.name,
              phone: form.phone || null,
              district: form.district || null,
              upazila: form.upazila || null,
              preferred_lang: language,
            })
            .eq("id", data.user.id);
          profileError = error;
        } else {
          // Insert new profile
          const { error } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              name: form.name,
              phone: form.phone || null,
              district: form.district || null,
              upazila: form.upazila || null,
              preferred_lang: language,
            });
          profileError = error;
        }
        
        if (profileError) {
          setMessageType("error");
          const errorMsg = profileError.message || "Unknown database error";
          setMessage(`Database error: ${errorMsg}. Please ensure the profiles table exists. See DATABASE_TROUBLESHOOTING.md for help.`);
          console.error("Profile creation error details:", {
            error: profileError,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint,
          });
          setLoading(false);
          return;
        }
      }
      
      setMessageType("success");
      setMessage(dictionary.auth.registerSuccess);
      
      // Redirect to login after successful registration
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setMessageType("error");
      setMessage(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black to-[#0c0c0c] px-4 py-16 text-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-8 rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <Sprout className="h-8 w-8 text-emerald-400" />
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-white/50">
              HarvestGuard
            </p>
            <h1 className="text-3xl font-semibold">
              {dictionary.auth.registerTitle}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-white/70">
            {dictionary.auth.nameLabel}
            <input
              required
              className="mt-1 w-full rounded-2xl bg-white/10 px-4 py-3 text-white outline-none"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </label>
          <label className="text-sm text-white/70">
            {dictionary.auth.emailLabel}
            <input
              type="email"
              required
              className="mt-1 w-full rounded-2xl bg-white/10 px-4 py-3 text-white outline-none"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </label>
          <label className="text-sm text-white/70">
            {dictionary.auth.passwordLabel}
            <input
              type="password"
              required
              className="mt-1 w-full rounded-2xl bg-white/10 px-4 py-3 text-white outline-none"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
            />
          </label>
          <label className="text-sm text-white/70">
            {dictionary.auth.phoneLabel}
            <input
              required
              className="mt-1 w-full rounded-2xl bg-white/10 px-4 py-3 text-white outline-none"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </label>
          <label className="text-sm text-white/70">
            {dictionary.auth.districtLabel}
            <input
              required
              className="mt-1 w-full rounded-2xl bg-white/10 px-4 py-3 text-white outline-none"
              value={form.district}
              onChange={(e) => updateField("district", e.target.value)}
            />
          </label>
          <label className="text-sm text-white/70">
            {dictionary.auth.upazilaLabel}
            <input
              required
              className="mt-1 w-full rounded-2xl bg-white/10 px-4 py-3 text-white outline-none"
              value={form.upazila}
              onChange={(e) => updateField("upazila", e.target.value)}
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-emerald-500/90 py-3 text-sm font-semibold uppercase tracking-wide text-black disabled:cursor-not-allowed"
            >
              {loading ? "..." : dictionary.auth.registerButton}
            </button>
          </div>
        </form>

        {message && (
          <p className={`text-center text-xs uppercase tracking-[0.4em] ${
            messageType === "success" ? "text-emerald-300" : "text-red-400"
          }`}>
            {message}
          </p>
        )}
        
        <div className="text-center">
          <p className="text-xs text-white/50">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-rose-400 underline hover:text-rose-300"
            >
              Login
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

