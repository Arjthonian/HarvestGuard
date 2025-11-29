// District coordinates for Bangladesh (approximate center points)
export type DistrictCoordinates = {
  latitude: number;
  longitude: number;
  name: string;
};

export const DISTRICT_COORDINATES: Record<string, DistrictCoordinates> = {
  // Dhaka Division
  "Dhaka": { latitude: 23.8103, longitude: 90.4125, name: "Dhaka" },
  "Gazipur": { latitude: 23.9999, longitude: 90.4203, name: "Gazipur" },
  "Narayanganj": { latitude: 23.6238, longitude: 90.4964, name: "Narayanganj" },
  "Tangail": { latitude: 24.2513, longitude: 89.9167, name: "Tangail" },
  "Munshiganj": { latitude: 23.5434, longitude: 90.5354, name: "Munshiganj" },
  
  // Chittagong Division
  "Chittagong": { latitude: 22.3569, longitude: 91.7832, name: "Chittagong" },
  "Cox's Bazar": { latitude: 21.4437, longitude: 91.9702, name: "Cox's Bazar" },
  "Comilla": { latitude: 23.4607, longitude: 91.1819, name: "Comilla" },
  "Feni": { latitude: 23.0159, longitude: 91.3976, name: "Feni" },
  "Noakhali": { latitude: 22.8696, longitude: 91.0968, name: "Noakhali" },
  
  // Rajshahi Division
  "Rajshahi": { latitude: 24.3745, longitude: 88.6042, name: "Rajshahi" },
  "Bogra": { latitude: 24.8510, longitude: 89.3711, name: "Bogra" },
  "Pabna": { latitude: 24.0044, longitude: 89.2379, name: "Pabna" },
  "Sirajganj": { latitude: 24.4577, longitude: 89.7080, name: "Sirajganj" },
  
  // Khulna Division
  "Khulna": { latitude: 22.8098, longitude: 89.5644, name: "Khulna" },
  "Jessore": { latitude: 23.1697, longitude: 89.2137, name: "Jessore" },
  "Satkhira": { latitude: 22.7161, longitude: 89.0680, name: "Satkhira" },
  "Bagerhat": { latitude: 22.6516, longitude: 89.7853, name: "Bagerhat" },
  
  // Sylhet Division
  "Sylhet": { latitude: 24.8949, longitude: 91.8687, name: "Sylhet" },
  "Moulvibazar": { latitude: 24.4829, longitude: 91.7774, name: "Moulvibazar" },
  "Habiganj": { latitude: 24.3750, longitude: 91.4167, name: "Habiganj" },
  
  // Barisal Division
  "Barisal": { latitude: 22.7010, longitude: 90.3535, name: "Barisal" },
  "Patuakhali": { latitude: 22.3567, longitude: 90.3195, name: "Patuakhali" },
  "Bhola": { latitude: 22.6875, longitude: 90.6446, name: "Bhola" },
  
  // Rangpur Division
  "Rangpur": { latitude: 25.7466, longitude: 89.2517, name: "Rangpur" },
  "Dinajpur": { latitude: 25.6274, longitude: 88.6339, name: "Dinajpur" },
  "Gaibandha": { latitude: 25.3287, longitude: 89.5281, name: "Gaibandha" },
  
  // Mymensingh Division
  "Mymensingh": { latitude: 24.7471, longitude: 90.4203, name: "Mymensingh" },
  "Netrokona": { latitude: 24.8709, longitude: 90.7274, name: "Netrokona" },
  "Kishoreganj": { latitude: 24.4333, longitude: 90.7833, name: "Kishoreganj" },
};

// Default to Dhaka if district not found
export const DEFAULT_DISTRICT: DistrictCoordinates = DISTRICT_COORDINATES["Dhaka"];

export function getDistrictCoordinates(districtName: string | null | undefined): DistrictCoordinates {
  if (!districtName) return DEFAULT_DISTRICT;
  
  // Try exact match first
  const exactMatch = DISTRICT_COORDINATES[districtName];
  if (exactMatch) return exactMatch;
  
  // Try case-insensitive match
  const normalizedName = districtName.trim();
  const caseInsensitiveMatch = Object.entries(DISTRICT_COORDINATES).find(
    ([key]) => key.toLowerCase() === normalizedName.toLowerCase()
  );
  
  if (caseInsensitiveMatch) {
    return caseInsensitiveMatch[1];
  }
  
  // Fallback to default
  return DEFAULT_DISTRICT;
}

