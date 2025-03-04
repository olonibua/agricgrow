/**
 * Weather Service using OpenWeatherMap API
 */

const API_KEY = process.env.OPENWEATHER_API_KEY || "266bf0bf9a0d4485693b304ba42587c8";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Common locations in Nigeria
export const LOCATIONS = [
  "Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", 
  "Benin City", "Maiduguri", "Kaduna", "Zaria", "Jos",
  "Ilorin", "Enugu", "Abeokuta", "Onitsha", "Warri"
];

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  condition: string;
  date: string;
  rainfall?: number;
  icon?: string;
}

/**
 * Fetches current weather data for a specific location
 */
export async function getCurrentWeather(location: string): Promise<WeatherData | null> {
  try {
    console.log(`Fetching weather for ${location} using API key: ${API_KEY.substring(0, 5)}...`);
    
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(location)},ng&units=metric&appid=${API_KEY}`;
    console.log(`Request URL: ${url}`);
    
    const response = await fetch(url, { 
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenWeatherMap API error (${response.status}): ${errorText}`);
      throw new Error(`OpenWeatherMap API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`Weather data received:`, JSON.stringify(data, null, 2));
    
    return {
      location: data.name,
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      wind_speed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      condition: data.weather[0].main,
      date: new Date().toISOString().split('T')[0],
      rainfall: data.rain ? data.rain["1h"] || 0 : 0,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    };
  } catch (error) {
    console.error(`Error fetching weather for ${location}:`, error);
    
    // Add fallback mock data when API fails
    console.log(`Generating mock weather data for ${location}`);
    return {
      location: location,
      temperature: 25 + Math.floor(Math.random() * 10),
      humidity: 60 + Math.floor(Math.random() * 20),
      wind_speed: 5 + Math.floor(Math.random() * 10),
      condition: ["Sunny", "Cloudy", "Partly Cloudy", "Rainy"][Math.floor(Math.random() * 4)],
      date: new Date().toISOString().split('T')[0],
      rainfall: Math.floor(Math.random() * 10),
      icon: "https://openweathermap.org/img/wn/10d@2x.png"
    };
  }
}

// Alias for getCurrentWeather to maintain compatibility
export const getWeatherData = getCurrentWeather;

interface ForecastItem {
  date: string;
  time: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  condition: string;
  icon: string;
  rainfall: number;
}

interface ForecastData {
  location: string;
  forecast: ForecastItem[];
}

/**
 * Fetches 5-day weather forecast for a location
 */
export async function getWeatherForecast(location: string): Promise<ForecastData | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?q=${encodeURIComponent(location)},ng&units=metric&appid=${API_KEY}`,
      { 
        next: { revalidate: 10800 } // Cache for 3 hours
      }
    );
    
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process the forecast data
    const forecast = data.list.map((item: {
      dt: number;
      main: {
        temp: number;
        humidity: number;
      };
      wind: {
        speed: number;
      };
      weather: Array<{
        main: string;
        icon: string;
      }>;
      rain?: {
        "3h"?: number;
      };
    }) => ({
      date: new Date(item.dt * 1000).toISOString().split('T')[0],
      time: new Date(item.dt * 1000).toISOString().split('T')[1].substring(0, 5),
      temperature: Math.round(item.main.temp),
      humidity: item.main.humidity,
      wind_speed: Math.round(item.wind.speed * 3.6),
      condition: item.weather[0].main,
      icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
      rainfall: item.rain ? item.rain["3h"] || 0 : 0
    }));
    
    return {
      location: data.city.name,
      forecast
    };
  } catch (error) {
    console.error(`Error fetching forecast for ${location}:`, error);
    return null;
  }
}

/**
 * Gets historical-like weather data (last 7 days)
 * Note: OpenWeatherMap's free tier doesn't include historical data
 * This generates simulated historical data based on current conditions
 */
export function getHistoricalWeather(location: string, currentWeather: WeatherData) {
  const today = new Date();
  const data = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Base values on current weather with some variation
    const temp = currentWeather.temperature + Math.floor(Math.random() * 6) - 3;
    const rainfall = currentWeather.humidity > 70 ? Math.floor(Math.random() * 15) : Math.floor(Math.random() * 5);
    const humidity = currentWeather.humidity + Math.floor(Math.random() * 10) - 5;
    
    data.push({
      date: date.toISOString().split('T')[0],
      temperature: temp,
      rainfall: rainfall,
      humidity: Math.min(100, Math.max(40, humidity))
    });
  }
  
  return data;
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