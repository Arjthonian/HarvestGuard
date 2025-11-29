"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useWeather } from "@/contexts/WeatherContext";
import {
  generateAlertsForBatches,
  SmartAlert as AlertType,
} from "@/lib/alertEngine";
import { getLocalBatches } from "@/lib/storage";
import { AlertTriangle, Bell, CheckCircle, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const SmartAlert = () => {
  const { weather } = useWeather();
  const { language } = useLanguage();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const hasShownSMSRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!weather) {
      setAlerts([]);
      return;
    }

    const batches = getLocalBatches();
    const newAlerts = generateAlertsForBatches(batches, weather);
    setAlerts(newAlerts);

    // Check for critical alerts and simulate SMS
    const criticalAlerts = newAlerts.filter(
      (alert) => alert.riskLevel === "critical",
    );

    criticalAlerts.forEach((alert) => {
      // Only show SMS once per alert (using timestamp as unique identifier)
      const alertId = `${alert.cropType}-${alert.timestamp}`;
      if (!hasShownSMSRef.current.has(alertId)) {
        simulateSMSNotification(alert);
        hasShownSMSRef.current.add(alertId);
      }
    });
  }, [weather]);

  const simulateSMSNotification = (alert: AlertType) => {
    // Format timestamp for SMS
    const now = new Date();
    const timeStr = now.toLocaleTimeString("bn-BD", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateStr = now.toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "short",
    });

    // Create SMS-like notification in console
    console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color: #4CAF50; font-weight: bold;");
    console.log("%c📱 SMS NOTIFICATION (Critical Risk Alert)", "color: #FF5722; font-weight: bold; font-size: 14px;");
    console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color: #4CAF50; font-weight: bold;");
    console.log(`%cFrom: HarvestGuard Alert System`, "color: #2196F3; font-weight: bold;");
    console.log(`%cTime: ${dateStr}, ${timeStr}`, "color: #757575;");
    console.log(`%c──────────────────────────────────────────`, "color: #BDBDBD;");
    console.log(`%c${alert.message}`, "color: #212121; font-size: 13px; line-height: 1.5; padding: 5px 0;");
    console.log(`%c──────────────────────────────────────────`, "color: #BDBDBD;");
    console.log(`%cRisk Level: CRITICAL`, "color: #FF5722; font-weight: bold;");
    console.log(`%cCrop: ${alert.cropType}`, "color: #757575;");
    console.log(`%cAction Required: ${alert.actionRequired ? "YES" : "NO"}`, "color: #F44336; font-weight: bold;");
    console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color: #4CAF50; font-weight: bold;");
    console.log("");
  };

  const getRiskColor = (riskLevel: AlertType["riskLevel"]) => {
    switch (riskLevel) {
      case "critical":
        return "text-red-400 border-red-500/50 bg-red-500/10";
      case "high":
        return "text-orange-400 border-orange-500/50 bg-orange-500/10";
      case "medium":
        return "text-yellow-400 border-yellow-500/50 bg-yellow-500/10";
      case "low":
        return "text-green-400 border-green-500/50 bg-green-500/10";
    }
  };

  const getRiskIcon = (riskLevel: AlertType["riskLevel"]) => {
    switch (riskLevel) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case "high":
        return <AlertTriangle className="h-5 w-5 text-orange-400" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case "low":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
    }
  };

  const getRiskLabel = (riskLevel: AlertType["riskLevel"]) => {
    switch (riskLevel) {
      case "critical":
        return language === "bn" ? "সমালোচনামূলক" : "Critical";
      case "high":
        return language === "bn" ? "উচ্চ" : "High";
      case "medium":
        return language === "bn" ? "মাঝারি" : "Medium";
      case "low":
        return language === "bn" ? "নিম্ন" : "Low";
    }
  };

  if (!weather) {
    return null;
  }

  if (alerts.length === 0) {
    return (
      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0b1120] p-6 text-white shadow-2xl">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-blue-300" />
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              {language === "bn" ? "স্মার্ট এলার্ট সিস্টেম" : "Smart Alert System"}
            </p>
            <p className="text-xs text-slate-500">
              {language === "bn"
                ? "সক্রিয় ব্যাচ নেই। ব্যাচ যোগ করুন আলার্ট দেখতে।"
                : "No active batches. Add a batch to see alerts."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const criticalCount = alerts.filter(
    (a) => a.riskLevel === "critical",
  ).length;

  return (
    <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0b1120] p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-blue-300" />
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              {language === "bn" ? "স্মার্ট এলার্ট সিস্টেম" : "Smart Alert System"}
            </p>
            <p className="text-xs text-slate-500">
              {language === "bn"
                ? "ফসল, আবহাওয়া এবং ঝুঁকির ভিত্তিতে পরামর্শ"
                : "Actionable advice based on crop, weather & risk"}
            </p>
          </div>
        </div>
        {criticalCount > 0 && (
          <div className="flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-2">
            <MessageSquare className="h-4 w-4 text-red-400" />
            <span className="text-xs font-semibold text-red-300">
              {criticalCount} {language === "bn" ? "সমালোচনামূলক" : "Critical"}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {alerts
          .sort((a, b) => {
            const order = { critical: 0, high: 1, medium: 2, low: 3 };
            return order[a.riskLevel] - order[b.riskLevel];
          })
          .map((alert, index) => (
            <div
              key={`${alert.cropType}-${alert.timestamp}-${index}`}
              className={`rounded-2xl border-2 p-4 transition-all ${getRiskColor(alert.riskLevel)}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {getRiskIcon(alert.riskLevel)}
                  <div>
                    <p className="font-semibold text-sm uppercase tracking-wide">
                      {alert.cropType}
                    </p>
                    <p className="text-xs opacity-75">
                      {getRiskLabel(alert.riskLevel)} {language === "bn" ? "ঝুঁকি" : "Risk"}
                    </p>
                  </div>
                </div>
                {alert.actionRequired && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    {language === "bn" ? "কার্যক্রম প্রয়োজন" : "Action Required"}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed mt-3">{alert.message}</p>
            </div>
          ))}
      </div>
    </section>
  );
};

