"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { getDistrictCoordinates, DistrictCoordinates } from "@/lib/districtCoordinates";
import {
  generateMockNeighborData,
  RiskLevel,
} from "@/lib/mockNeighborData";
import { supabase } from "@/lib/supabaseClient";
import { MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icons for different risk levels
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const FARMER_ICON = L.divIcon({
  className: "custom-marker",
  html: `<div style="background-color: #3b82f6; width: 32px; height: 32px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const LOW_RISK_ICON = createCustomIcon("#22c55e"); // Green
const MEDIUM_RISK_ICON = createCustomIcon("#f59e0b"); // Orange
const HIGH_RISK_ICON = createCustomIcon("#ef4444"); // Red

type LocationState = "idle" | "requesting" | "granted" | "denied" | "error";
type CenterInfo = DistrictCoordinates & {
  source: "gps" | "district" | "default";
};

// Component to handle map centering
function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 11);
  }, [map, center]);
  return null;
}

export const RiskMap = () => {
  const { language } = useLanguage();
  const [mapCenter, setMapCenter] = useState<CenterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [farmerLocation, setFarmerLocation] = useState<[number, number] | null>(null);
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [locationError, setLocationError] = useState<string | null>(null);

  const fallbackToDistrict = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let center = getDistrictCoordinates(null);
      let source: CenterInfo["source"] = "default";

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("district")
          .eq("id", user.id)
          .single();
        center = getDistrictCoordinates(profile?.district || null);
        source = profile?.district ? "district" : "default";
      }

      setMapCenter({
        ...center,
        source,
      });
      setFarmerLocation([
        center.latitude + (Math.random() - 0.5) * 0.05,
        center.longitude + (Math.random() - 0.5) * 0.05,
      ]);
    } catch (error) {
      console.error("Error fetching user district:", error);
      const fallback = getDistrictCoordinates(null);
      setMapCenter({
        ...fallback,
        source: "default",
      });
      setFarmerLocation([
        fallback.latitude + (Math.random() - 0.5) * 0.05,
        fallback.longitude + (Math.random() - 0.5) * 0.05,
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationState("error");
      setLocationError(
        language === "bn"
          ? "আপনার ব্রাউজার অবস্থানের অনুমতি সমর্থন করে না"
          : "Your browser doesn't support geolocation",
      );
      fallbackToDistrict();
      return;
    }

    setLocationState("requesting");
    setLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationState("granted");
        const { latitude, longitude } = position.coords;
        setMapCenter({
          latitude,
          longitude,
          name: "Live Location",
          source: "gps",
        });
        setFarmerLocation([latitude, longitude]);
        setLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationState(error.code === 1 ? "denied" : "error");
        setLocationError(
          error.code === 1
            ? language === "bn"
              ? "অবস্থানের অনুমতি দেওয়া হয়নি"
              : "Location permission denied"
            : language === "bn"
              ? "অবস্থান নির্ধারণ করতে ব্যর্থ"
              : "Failed to get location",
        );
        fallbackToDistrict();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [fallbackToDistrict, language]);

  // Request location on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Generate mock neighbor data
  const neighbors = useMemo(() => {
    if (!mapCenter) return [];
    return generateMockNeighborData(mapCenter, 12);
  }, [mapCenter]);

  // Format timestamp in Bangla
  const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours < 1) {
      return `${diffMinutes} মিনিট আগে`;
    } else if (diffHours < 24) {
      return `${diffHours} ঘন্টা আগে`;
    } else {
      return `${Math.floor(diffHours / 24)} দিন আগে`;
    }
  };

  // Get risk level label in Bangla
  const getRiskLabel = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case "low":
        return "নিম্ন";
      case "medium":
        return "মাঝারি";
      case "high":
        return "উচ্চ";
    }
  };

  // Get marker icon based on risk level
  const getMarkerIcon = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case "low":
        return LOW_RISK_ICON;
      case "medium":
        return MEDIUM_RISK_ICON;
      case "high":
        return HIGH_RISK_ICON;
    }
  };

  const descriptionText =
    mapCenter?.source === "gps"
      ? language === "bn"
        ? "আপনার বর্তমান অবস্থানের ঝুঁকি মানচিত্র"
        : "Risk map around your live location"
      : language === "bn"
        ? `${mapCenter?.name ?? "জেলা"} জেলার ঝুঁকির অবস্থা`
        : `Risk status in ${mapCenter?.name ?? "district"}`;

  if (loading || !mapCenter || !farmerLocation) {
    return (
      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0b1120] p-6 text-white shadow-2xl">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-blue-300" />
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              {language === "bn" ? "স্থানীয় ঝুঁকি মানচিত্র" : "Local Risk Map"}
            </p>
            <p className="text-xs text-slate-500 animate-pulse">
              {language === "bn" ? "মানচিত্র লোড হচ্ছে..." : "Loading map..."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const center: [number, number] = [mapCenter.latitude, mapCenter.longitude];
  const farmerPopupLabel =
    mapCenter.source === "gps"
      ? language === "bn"
        ? "আপনার বর্তমান অবস্থান"
        : "Your location"
      : mapCenter.name;

  return (
    <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0b1120] p-6 text-white shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-blue-300" />
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              {language === "bn" ? "স্থানীয় ঝুঁকি মানচিত্র" : "Local Risk Map"}
            </p>
            <p className="text-xs text-slate-500">{descriptionText}</p>
          </div>
        </div>
        {(locationState === "denied" || locationState === "error") && (
          <button
            onClick={requestLocation}
            className="rounded-full border border-white/20 px-4 py-1 text-xs text-slate-300 hover:bg-white/10 transition"
          >
            {language === "bn" ? "অবস্থান পুনরায় চাও" : "Retry location"}
          </button>
        )}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-400">{language === "bn" ? "আপনি" : "You"}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-slate-400">{language === "bn" ? "নিম্ন" : "Low"}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-orange-500"></div>
            <span className="text-slate-400">{language === "bn" ? "মাঝারি" : "Med"}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span className="text-slate-400">{language === "bn" ? "উচ্চ" : "High"}</span>
          </div>
        </div>
      </div>

      {locationError && (
        <div className="mb-4 rounded-2xl bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
          {locationError}
        </div>
      )}

      <div className="relative h-[500px] w-full overflow-hidden rounded-2xl">
        <MapContainer
          center={center}
          zoom={11}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
          className="rounded-2xl"
          scrollWheelZoom={true}
          touchZoom={true}
          doubleClickZoom={true}
        >
          <MapCenter center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Farmer's location marker */}
          <Marker position={farmerLocation} icon={FARMER_ICON}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-blue-600">
                  {farmerPopupLabel}
                </p>
                {mapCenter.source !== "gps" && (
                  <p className="text-xs text-gray-600">{mapCenter.name}</p>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Neighbor markers */}
          {neighbors.map((neighbor) => (
            <Marker
              key={neighbor.id}
              position={[neighbor.latitude, neighbor.longitude]}
              icon={getMarkerIcon(neighbor.riskLevel)}
            >
              <Popup>
                <div className="text-sm min-w-[180px]">
                  <p className="font-semibold text-gray-800 mb-1">ফসলের ধরন:</p>
                  <p className="text-gray-700 mb-2">{neighbor.cropType}</p>
                  
                  <p className="font-semibold text-gray-800 mb-1">ঝুঁকি কি:</p>
                  <p className="text-gray-700 mb-2">{getRiskLabel(neighbor.riskLevel)}</p>
                  
                  <p className="font-semibold text-gray-800 mb-1">সর্বশেষ আপডেট:</p>
                  <p className="text-xs text-gray-600">{formatTimestamp(neighbor.lastUpdate)}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <p className="mt-4 text-xs text-slate-500 text-center">
        {language === "bn"
          ? "সমস্ত তথ্য গোপনীয়তা রক্ষা করে প্রদর্শিত হয়েছে"
          : "All data is displayed anonymously to protect privacy"}
      </p>
    </section>
  );
};

