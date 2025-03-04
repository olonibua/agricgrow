/**
 * Nigerian Meteorological Agency (NiMet) API Service
 * Handles fetching weather data for Nigeria
 */

const BASE_URL = "https://weatherapi.nimet.gov.ng";
const API_KEY = process.env.NIMET_API_KEY;

// Common locations in Nigeria for weather data
export const LOCATIONS = [
  "LAGOS", "ABUJA", "KANO", "IBADAN", "PORT HARCOURT", 
  "BENIN CITY", "MAIDUGURI", "KADUNA", "ZARIA", "JOS",
  "ILORIN", "ENUGU", "ABEOKUTA", "ONITSHA", "WARRI"
];

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  condition: string;
  date: string;
  rainfall?: number;
}

/**
 * Fetches current weather data for a specific location
 */
export async function getCurrentWeather(location: string): Promise<WeatherData | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/current?location=${encodeURIComponent(location)}&apikey=${API_KEY}`,
      { 
        method: "GET",
        headers: { accept: "application/json" },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );
    
    if (!response.ok) {
      throw new Error(`NiMet API error: ${response.status}`);
    }
    
    return await response.json();
  } catch {
    console.error(`Error fetching current weather for ${location}:`);
    return null;
  }
}

/**
 * Alias for getCurrentWeather to maintain compatibility with existing code
 */
export const getWeatherData = getCurrentWeather;

/**
 * Fetches weather forecast for a specific location
 */
export async function getWeatherForecast(location: string, days = 3) {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?location=${encodeURIComponent(location)}&days=${days}&apikey=${API_KEY}`,
      { 
        method: "GET",
        headers: { accept: "application/json" },
        next: { revalidate: 10800 } // Cache for 3 hours
      }
    );
    
    if (!response.ok) {
      throw new Error(`NiMet API error: ${response.status}`);
    }
    
    return await response.json();
  } catch  {
    console.error(`Error fetching weather forecast for ${location}:`);
    return null;
  }
}

/**
 * Gets weather data for multiple locations
 */
export async function getMultiLocationWeather(locations = LOCATIONS) {
  const results: Record<string, WeatherData | null> = {};
  
  for (const location of locations) {
    results[location] = await getCurrentWeather(location);
  }
  
  return results;
} 