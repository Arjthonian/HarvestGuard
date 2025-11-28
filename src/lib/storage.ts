export const HAS_VISITED_KEY = "harvestguard-has-visited";
export const BATCHES_KEY = "harvestguard-batches";

export type LocalBatch = {
  id: string;
  cropType: string; // Allow any crop type
  weightKg: number;
  storageType: "silo" | "bag";
  status: "active" | "sold" | "lost";
  harvestDate: string; // ISO string
  synced?: boolean;
};

export const readLocalFlag = (key: string) => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
};

export const writeLocalFlag = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
};

export const getLocalBatches = (): LocalBatch[] => {
  if (typeof window === "undefined") return [];
  const data = window.localStorage.getItem(BATCHES_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as LocalBatch[];
  } catch (error) {
    console.error("Failed to parse stored batches", error);
    return [];
  }
};

export const saveLocalBatches = (batches: LocalBatch[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BATCHES_KEY, JSON.stringify(batches));
};

