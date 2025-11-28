export type WeatherReport = {
  location: string;
  temperature: number;
  humidity: number;
  rainProbability: number;
  narrative: string;
};

const FALLBACK_REPORT: WeatherReport = {
  location: "Dhaka, BD",
  temperature: 31,
  humidity: 78,
  rainProbability: 40,
  narrative:
    "আবহাওয়া শান্ত থাকলেও আর্দ্রতা বেশি। ফসল ঢেকে রাখুন এবং স্টোরেজ খোলা রাখুন।",
};

type ForecastEntry = {
  pop?: number;
  main: {
    temp: number;
    humidity: number;
  };
};

type ForecastPayload = {
  list: ForecastEntry[];
  city: {
    name: string;
    country: string;
  };
};

export type LocationCoords = {
  latitude: number;
  longitude: number;
};

// Reverse geocoding to get city name from coordinates
type ReverseGeoResponse = {
  name: string;
  country: string;
  state?: string;
};

async function getCityFromCoords(
  coords: LocationCoords,
  apiKey: string,
): Promise<{ city: string; country: string }> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${coords.latitude}&lon=${coords.longitude}&limit=1&appid=${apiKey}`,
    );
    
    if (response.ok) {
      const data = (await response.json()) as ReverseGeoResponse[];
      if (data && data.length > 0) {
        return {
          city: data[0].name || "Unknown",
          country: data[0].country || "",
        };
      }
    }
  } catch (error) {
    console.warn("Reverse geocoding failed, will use coordinates:", error);
  }
  
  // Fallback: return coordinates as location
  return {
    city: `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`,
    country: "",
  };
}

export async function fetchWeatherByLocation(
  coords: LocationCoords,
): Promise<WeatherReport> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY?.trim();
  
  if (!apiKey || apiKey === "your_openweathermap_api_key" || apiKey.length < 10) {
    console.warn("Missing or invalid OPENWEATHER_API_KEY, using fallback weather data");
    console.warn("Please set NEXT_PUBLIC_OPENWEATHER_API_KEY in .env.local");
    return FALLBACK_REPORT;
  }

  try {
    // First, get the nearest city name using reverse geocoding
    const { city, country } = await getCityFromCoords(coords, apiKey);
    
    // Then fetch weather data using coordinates (more accurate than city name)
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&appid=${apiKey}`,
    );
    
    if (!response.ok) {
      // Try to get error details from the response
      let errorMessage = "Weather request failed";
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.cod) {
          // OpenWeatherMap error codes
          switch (errorData.cod) {
            case "401":
              errorMessage = "Invalid API key. Please check your OpenWeatherMap API key.";
              break;
            case "429":
              errorMessage = "API rate limit exceeded. Please try again later.";
              break;
            case "404":
              errorMessage = "Weather data not found for this location.";
              break;
            default:
              errorMessage = errorData.message || `API error: ${errorData.cod}`;
          }
        }
      } catch {
        // If we can't parse the error, use status text
        errorMessage = `Weather API error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    const payload = (await response.json()) as ForecastPayload;
    const first = payload.list?.[0];
    if (!first) {
      return FALLBACK_REPORT;
    }
    const rainProbability = Math.round(
      (payload.list
        ?.slice(0, 8)
        ?.map((entry) => entry.pop ?? 0)
        ?.reduce((sum, value) => sum + value, 0) /
        8) *
        100,
    );

    // Use the city name from reverse geocoding or fallback to payload city
    const locationName = city && city !== `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`
      ? `${city}${country ? `, ${country}` : ""}`
      : `${payload.city.name}, ${payload.city.country}`;

    return {
      location: locationName,
      temperature: Math.round(first.main.temp),
      humidity: first.main.humidity,
      rainProbability,
      narrative:
        rainProbability > 70
          ? "আসন্ন বৃষ্টির ঝুঁকি খুব বেশি। ফসল দ্রুত উঠিয়ে ফেলুন অথবা ঢেকে রাখুন।"
          : "আবহাওয়া তুলনামূলক অনুকূলে রয়েছে। পর্যবেক্ষণ চালিয়ে যান।",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Weather fetch failed:", errorMessage, error);
    
    // Return fallback with error info in narrative
    return {
      ...FALLBACK_REPORT,
      narrative: errorMessage,
    };
  }
}

// Legacy function for backward compatibility
export async function fetchWeather(city = "Dhaka"): Promise<WeatherReport> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY?.trim();
  
  if (!apiKey || apiKey === "your_openweathermap_api_key" || apiKey.length < 10) {
    console.warn("Missing or invalid OPENWEATHER_API_KEY, using fallback weather data");
    console.warn("Please set NEXT_PUBLIC_OPENWEATHER_API_KEY in .env.local");
    return FALLBACK_REPORT;
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`,
    );
    
    if (!response.ok) {
      // Try to get error details from the response
      let errorMessage = "Weather request failed";
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.cod) {
          // OpenWeatherMap error codes
          switch (errorData.cod) {
            case "401":
              errorMessage = "Invalid API key. Please check your OpenWeatherMap API key.";
              break;
            case "429":
              errorMessage = "API rate limit exceeded. Please try again later.";
              break;
            case "404":
              errorMessage = "Weather data not found for this location.";
              break;
            default:
              errorMessage = errorData.message || `API error: ${errorData.cod}`;
          }
        }
      } catch {
        // If we can't parse the error, use status text
        errorMessage = `Weather API error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    const payload = (await response.json()) as ForecastPayload;
    const first = payload.list?.[0];
    if (!first) {
      return FALLBACK_REPORT;
    }
    const rainProbability = Math.round(
      (payload.list
        ?.slice(0, 8)
        ?.map((entry) => entry.pop ?? 0)
        ?.reduce((sum, value) => sum + value, 0) /
        8) *
        100,
    );

    return {
      location: `${payload.city.name}, ${payload.city.country}`,
      temperature: Math.round(first.main.temp),
      humidity: first.main.humidity,
      rainProbability,
      narrative:
        rainProbability > 70
          ? "আসন্ন বৃষ্টির ঝুঁকি খুব বেশি। ফসল দ্রুত উঠিয়ে ফেলুন অথবা ঢেকে রাখুন।"
          : "আবহাওয়া তুলনামূলক অনুকূলে রয়েছে। পর্যবেক্ষণ চালিয়ে যান।",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Weather fetch failed:", errorMessage, error);
    
    // Return fallback with error info in narrative
    return {
      ...FALLBACK_REPORT,
      narrative: errorMessage,
    };
  }
}

