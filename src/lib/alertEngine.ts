import { LocalBatch } from "./storage";
import { WeatherReport } from "./weather";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type SmartAlert = {
  riskLevel: RiskLevel;
  message: string;
  cropType: string;
  actionRequired: boolean;
  timestamp: string;
};

// Crop-specific thresholds and recommendations
type CropConfig = {
  humidityThreshold: number; // Critical humidity level
  temperatureRange: { min: number; max: number }; // Optimal temp range
  rainSensitivity: "high" | "medium" | "low";
  storageActions: {
    silo: string[];
    bag: string[];
  };
};

const CROP_CONFIGS: Record<string, CropConfig> = {
  আলু: {
    humidityThreshold: 75,
    temperatureRange: { min: 4, max: 12 },
    rainSensitivity: "high",
    storageActions: {
      silo: ["ফ্যান চালু করুন", "হাওয়া চলাচল বাড়ান", "আর্দ্রতা নিয়ন্ত্রণ করুন"],
      bag: ["বস্তা শুকনো স্থানে সরান", "হাওয়া চলাচল নিশ্চিত করুন", "ফ্যান চালু করুন"],
    },
  },
  ধান: {
    humidityThreshold: 70,
    temperatureRange: { min: 10, max: 15 },
    rainSensitivity: "high",
    storageActions: {
      silo: ["নিয়মিত ফ্যান চালান", "আর্দ্রতা পরীক্ষা করুন", "বায়ুচলাচল বজায় রাখুন"],
      bag: ["বস্তা উঁচু স্থানে রাখুন", "বৃষ্টি থেকে সুরক্ষিত রাখুন", "নিয়মিত পরীক্ষা করুন"],
    },
  },
  পাট: {
    humidityThreshold: 65,
    temperatureRange: { min: 15, max: 25 },
    rainSensitivity: "medium",
    storageActions: {
      silo: ["হাওয়া চলাচল নিশ্চিত করুন", "আর্দ্রতা পরীক্ষা করুন"],
      bag: ["বস্তা শুকনো রাখুন", "বৃষ্টি থেকে দূরে রাখুন"],
    },
  },
  গম: {
    humidityThreshold: 70,
    temperatureRange: { min: 8, max: 18 },
    rainSensitivity: "high",
    storageActions: {
      silo: ["ফ্যান চালু করুন", "তাপমাত্রা নিয়ন্ত্রণ করুন"],
      bag: ["বস্তা শুকনো স্থানে রাখুন", "হাওয়া চলাচল নিশ্চিত করুন"],
    },
  },
  ভুট্টা: {
    humidityThreshold: 72,
    temperatureRange: { min: 10, max: 15 },
    rainSensitivity: "high",
    storageActions: {
      silo: ["আর্দ্রতা নিয়ন্ত্রণ করুন", "ফ্যান চালু করুন"],
      bag: ["বস্তা উঁচু স্থানে রাখুন", "বৃষ্টি থেকে সুরক্ষিত রাখুন"],
    },
  },
};

// Get crop config with fallback
function getCropConfig(cropType: string): CropConfig {
  const normalized = cropType.trim();
  return (
    CROP_CONFIGS[normalized] ||
    CROP_CONFIGS["ধান"] // Default to rice config
  );
}

// Calculate risk score based on multiple factors
function calculateRiskScore(
  weather: WeatherReport,
  cropConfig: CropConfig,
  batch: LocalBatch,
): { score: number; riskLevel: RiskLevel; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  // Humidity risk
  if (weather.humidity > cropConfig.humidityThreshold) {
    score += 40;
    factors.push(
      `আর্দ্রতা ${weather.humidity}% (সীমা: ${cropConfig.humidityThreshold}%)`,
    );
  } else if (weather.humidity > cropConfig.humidityThreshold - 10) {
    score += 20;
    factors.push(`আর্দ্রতা উচ্চ: ${weather.humidity}%`);
  }

  // Rain probability risk
  const rainMultiplier =
    cropConfig.rainSensitivity === "high" ? 1.5 : cropConfig.rainSensitivity === "medium" ? 1.0 : 0.5;
  const rainRisk = weather.rainProbability * rainMultiplier;
  
  if (weather.rainProbability >= 70) {
    score += 50;
    factors.push(`বৃষ্টির সম্ভাবনা ${weather.rainProbability}%`);
  } else if (weather.rainProbability >= 50) {
    score += 30;
    factors.push(`বৃষ্টির সম্ভাবনা ${weather.rainProbability}%`);
  } else if (weather.rainProbability >= 30) {
    score += 15;
  }

  // Temperature risk
  const { min, max } = cropConfig.temperatureRange;
  if (weather.temperature < min - 5 || weather.temperature > max + 5) {
    score += 30;
    factors.push(
      `তাপমাত্রা ${weather.temperature}°C (সুপারিশ: ${min}-${max}°C)`,
    );
  } else if (
    weather.temperature < min - 2 ||
    weather.temperature > max + 2
  ) {
    score += 15;
  }

  // Storage type risk (bags are more vulnerable)
  if (batch.storageType === "bag") {
    score += 10;
    factors.push("বস্তা সংরক্ষণ (বৃষ্টির জন্য ঝুঁকিপূর্ণ)");
  }

  // Determine risk level
  let riskLevel: RiskLevel;
  if (score >= 80) {
    riskLevel = "critical";
  } else if (score >= 60) {
    riskLevel = "high";
  } else if (score >= 40) {
    riskLevel = "medium";
  } else {
    riskLevel = "low";
  }

  return { score, riskLevel, factors };
}

// Generate contextual alert message in Bangla
function generateAlertMessage(
  weather: WeatherReport,
  cropConfig: CropConfig,
  batch: LocalBatch,
  riskLevel: RiskLevel,
  factors: string[],
): string {
  const cropType = batch.cropType;
  const storageType = batch.storageType === "silo" ? "সাইলো" : "গুদাম";
  const actions = cropConfig.storageActions[batch.storageType];

  // Build time reference
  let timeRef = "আগামীকাল";
  if (weather.rainProbability >= 70) {
    timeRef = "আগামীকাল";
  } else if (weather.rainProbability >= 50) {
    timeRef = "পরশু দিন";
  }

  // Critical alerts - very specific and actionable
  if (riskLevel === "critical") {
    const messages: string[] = [];

    // Rain + High Humidity combination
    if (weather.rainProbability >= 70 && weather.humidity > cropConfig.humidityThreshold) {
      messages.push(
        `${timeRef} বৃষ্টি হবে এবং আপনার ${cropType} ${storageType}${batch.storageType === "silo" ? "ে" : ""} আর্দ্রতা ${weather.humidity}% (সীমার উপরে)।`,
      );
      messages.push(actions[0] || "অবিলম্বে পদক্ষেপ নিন।");
      return messages.join(" ");
    }

    // High humidity in storage
    if (weather.humidity > cropConfig.humidityThreshold) {
      messages.push(
        `আপনার ${cropType} ${storageType}${batch.storageType === "silo" ? "ে" : ""} আর্দ্রতা ${weather.humidity}% (ঝুঁকিপূর্ণ স্তর)।`,
      );
      messages.push(actions[0] || "হাওয়া চলাচল বাড়ান।");
      return messages.join(" ");
    }

    // Rain risk
    if (weather.rainProbability >= 70) {
      messages.push(
        `${timeRef} বৃষ্টির সম্ভাবনা ${weather.rainProbability}%। ${cropType} ${storageType}${batch.storageType === "silo" ? "ে" : ""} রক্ষা করুন।`,
      );
      if (batch.storageType === "bag") {
        messages.push("বস্তাগুলো উঁচু স্থানে সরান বা ঢেকে রাখুন।");
      } else {
        messages.push("দরজা-জানালা বন্ধ রাখুন এবং ফ্যান চালু করুন।");
      }
      return messages.join(" ");
    }

    // Temperature extreme
    if (
      weather.temperature < cropConfig.temperatureRange.min - 5 ||
      weather.temperature > cropConfig.temperatureRange.max + 5
    ) {
      messages.push(
        `তাপমাত্রা ${weather.temperature}°C (${cropType} এর জন্য ${cropConfig.temperatureRange.min}-${cropConfig.temperatureRange.max}°C সুপারিশ করা হয়)।`,
      );
      messages.push("তাপমাত্রা নিয়ন্ত্রণের ব্যবস্থা নিন।");
      return messages.join(" ");
    }
  }

  // High risk alerts
  if (riskLevel === "high") {
    if (weather.rainProbability >= 50) {
      return `${timeRef} বৃষ্টির সম্ভাবনা ${weather.rainProbability}%। ${cropType} ${storageType}${batch.storageType === "silo" ? "ে" : ""} প্রস্তুত রাখুন এবং ${actions[0] || "নিয়মিত পরীক্ষা করুন"}।`;
    }
    if (weather.humidity > cropConfig.humidityThreshold - 10) {
      return `আর্দ্রতা ${weather.humidity}% (উচ্চ স্তর)। ${cropType} ${storageType}${batch.storageType === "silo" ? "ে" : ""} ${actions[1] || "হাওয়া চলাচল নিশ্চিত করুন"}।`;
    }
  }

  // Medium risk alerts
  if (riskLevel === "medium") {
    return `${cropType} ${storageType}${batch.storageType === "silo" ? "ে" : ""} পরিস্থিতি নিয়মিত পর্যবেক্ষণ করুন। ${weather.rainProbability > 30 ? `বৃষ্টির সম্ভাবনা ${weather.rainProbability}%।` : ""}`;
  }

  // Low risk - all good
  return `${cropType} ${storageType}${batch.storageType === "silo" ? "ে" : ""} পরিস্থিতি অনুকূল রয়েছে। নিয়মিত পরীক্ষা চালিয়ে যান।`;
}

// Main function to generate smart alerts
export function generateSmartAlert(
  batch: LocalBatch,
  weather: WeatherReport,
): SmartAlert {
  const cropConfig = getCropConfig(batch.cropType);
  const { riskLevel, factors } = calculateRiskScore(
    weather,
    cropConfig,
    batch,
  );
  const message = generateAlertMessage(
    weather,
    cropConfig,
    batch,
    riskLevel,
    factors,
  );

  return {
    riskLevel,
    message,
    cropType: batch.cropType,
    actionRequired: riskLevel === "critical" || riskLevel === "high",
    timestamp: new Date().toISOString(),
  };
}

// Generate alerts for all active batches
export function generateAlertsForBatches(
  batches: LocalBatch[],
  weather: WeatherReport,
): SmartAlert[] {
  const activeBatches = batches.filter(
    (batch) => batch.status === "active",
  );
  
  return activeBatches.map((batch) =>
    generateSmartAlert(batch, weather),
  );
}

// Check if any alert is critical
export function hasCriticalAlert(alerts: SmartAlert[]): boolean {
  return alerts.some((alert) => alert.riskLevel === "critical");
}

