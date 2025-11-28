"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabaseClient";
import { LocalBatch, getLocalBatches, saveLocalBatches } from "@/lib/storage";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf, SendHorizonal, Warehouse } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

const DEFAULT_FORM = {
  cropType: "",
  storageType: "silo",
  weightKg: "",
  harvestDate: "",
};

export const BatchManager = () => {
  const { dictionary, language } = useLanguage();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [batches, setBatches] = useState<LocalBatch[]>([]);
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "done">(
    "idle",
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    setBatches(getLocalBatches());
  }, []);

  const updateForm = (
    field: keyof typeof DEFAULT_FORM,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextBatch: LocalBatch = {
      id: uuid(),
      cropType: form.cropType.trim(),
      storageType: form.storageType as LocalBatch["storageType"],
      weightKg: Number(form.weightKg),
      harvestDate: form.harvestDate || new Date().toISOString().split("T")[0],
      status: "active",
      synced: false,
    };
    const nextBatches = [nextBatch, ...batches];
    setBatches(nextBatches);
    saveLocalBatches(nextBatches);
    setForm(DEFAULT_FORM);
  };

  const handleSync = async () => {
    if (!batches.length) return;
    setSyncState("syncing");
    setMessage("");
    try {
      const unsynced = batches.filter((batch) => !batch.synced);
      if (!unsynced.length) {
        setMessage(dictionary.batch.syncAlready);
        setSyncState("done");
        return;
      }
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("batches").insert(
        unsynced.map((batch) => ({
          user_id: user.id,
          crop_type: batch.cropType,
          weight_kg: batch.weightKg,
          storage_method: batch.storageType,
          harvest_date: batch.harvestDate,
        })),
      );
      if (error) throw error;
      const updated = batches.map((batch) =>
        batch.synced ? batch : { ...batch, synced: true },
      );
      setBatches(updated);
      saveLocalBatches(updated);
      setMessage(dictionary.batch.syncSuccess);
      setSyncState("done");
    } catch (err) {
      console.error(err);
      setMessage(dictionary.batch.syncFailed);
      setSyncState("idle");
    }
  };

  return (
    <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#050505] p-6 text-white shadow-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Warehouse className="h-6 w-6 text-emerald-300" />
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/70">
            {dictionary.dashboard.batchTitle}
          </p>
          <p className="text-xs text-white/60">
            {dictionary.dashboard.subtitle}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4">
        <label className="flex flex-col text-sm text-white/70">
          {dictionary.batch.cropLabel}
          <input
            type="text"
            required
            placeholder={language === "bn" ? "যেমন: ধান, পাট, গম, ভুট্টা" : "e.g., Rice, Jute, Wheat, Corn"}
            className="mt-1 rounded-xl bg-white/10 px-3 py-2 text-white outline-none placeholder:text-white/40"
            value={form.cropType}
            onChange={(e) => updateForm("cropType", e.target.value)}
          />
        </label>
        <label className="flex flex-col text-sm text-white/70">
          {dictionary.batch.weightLabel}
          <input
            type="number"
            min="0"
            required
            className="mt-1 rounded-xl bg-white/10 px-3 py-2 text-white outline-none"
            value={form.weightKg}
            onChange={(e) => updateForm("weightKg", e.target.value)}
          />
        </label>
        <label className="flex flex-col text-sm text-white/70">
          {dictionary.batch.storageLabel}
          <select
            className="mt-1 rounded-xl bg-white/10 px-3 py-2 text-white outline-none"
            value={form.storageType}
            onChange={(e) => updateForm("storageType", e.target.value)}
          >
            <option value="silo">
              {dictionary.batch.storageOptions.silo}
            </option>
            <option value="bag">{dictionary.batch.storageOptions.bag}</option>
          </select>
        </label>
        <label className="flex flex-col text-sm text-white/70">
          {dictionary.batch.harvestDateLabel}
          <input
            type="date"
            required
            className="mt-1 rounded-xl bg-white/10 px-3 py-2 text-white outline-none"
            value={form.harvestDate}
            onChange={(e) => updateForm("harvestDate", e.target.value)}
          />
        </label>
        <div className="md:col-span-4 flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-black"
          >
            {dictionary.batch.addBatch}
          </button>
        </div>
      </form>

      <div className="mt-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm uppercase tracking-widest text-white/60">
            {dictionary.dashboard.batchTitle}
          </p>
          <button
            type="button"
            onClick={handleSync}
            disabled={syncState === "syncing"}
            className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-white/10 disabled:cursor-not-allowed"
          >
            <SendHorizonal className="h-4 w-4" />
            {dictionary.batch.syncBatches}
          </button>
        </div>
        {message && (
          <p className="text-xs uppercase tracking-widest text-emerald-300">
            {message}
          </p>
        )}
        <div className="space-y-3">
          <AnimatePresence>
            {batches.length === 0 && (
              <p className="text-sm text-white/50">{dictionary.batch.empty}</p>
            )}
            {batches.map((batch) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-wrap items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              >
                <div className="flex items-center gap-3">
                  <Leaf className="h-5 w-5 text-emerald-300" />
                  <div>
                    <p className="font-semibold uppercase tracking-wide">
                      {batch.cropType} • {batch.weightKg}kg
                    </p>
                    <p className="text-xs text-white/60">
                      {batch.storageType} • {batch.harvestDate}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    batch.synced
                      ? "bg-emerald-400/20 text-emerald-200"
                      : "bg-amber-400/20 text-amber-100"
                  }`}
                >
                  {batch.synced
                    ? dictionary.batch.synced
                    : dictionary.batch.pendingSync}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

