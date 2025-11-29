import { DistrictCoordinates } from "./districtCoordinates";

export type RiskLevel = "low" | "medium" | "high";

export type NeighborData = {
  id: string;
  latitude: number;
  longitude: number;
  riskLevel: RiskLevel;
  cropType: string;
  lastUpdate: string; // ISO timestamp
};

const CROP_TYPES = ["ধান", "আলু", "পাট", "গম", "ভুট্টা", "টমেটো", "বেগুন", "মরিচ"];

// Generate random coordinate within district bounds (±0.3 degrees)
function generateRandomCoordinate(
  center: DistrictCoordinates,
  radius: number = 0.15
): { latitude: number; longitude: number } {
  const latOffset = (Math.random() - 0.5) * radius * 2;
  const lonOffset = (Math.random() - 0.5) * radius * 2;
  
  return {
    latitude: center.latitude + latOffset,
    longitude: center.longitude + lonOffset,
  };
}

// Generate random risk level weighted towards low/medium
function generateRandomRiskLevel(): RiskLevel {
  const rand = Math.random();
  if (rand < 0.5) return "low";
  if (rand < 0.85) return "medium";
  return "high";
}

// Generate random timestamp within last 24 hours
function generateLastUpdate(): string {
  const now = new Date();
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  const updateTime = new Date(now);
  updateTime.setHours(now.getHours() - hoursAgo);
  updateTime.setMinutes(now.getMinutes() - minutesAgo);
  return updateTime.toISOString();
}

// Generate mock neighbor data points
export function generateMockNeighborData(
  districtCenter: DistrictCoordinates,
  count: number = 12
): NeighborData[] {
  const neighbors: NeighborData[] = [];
  
  for (let i = 0; i < count; i++) {
    const coord = generateRandomCoordinate(districtCenter, 0.2);
    neighbors.push({
      id: `neighbor-${i + 1}`,
      latitude: coord.latitude,
      longitude: coord.longitude,
      riskLevel: generateRandomRiskLevel(),
      cropType: CROP_TYPES[Math.floor(Math.random() * CROP_TYPES.length)],
      lastUpdate: generateLastUpdate(),
    });
  }
  
  return neighbors;
}

