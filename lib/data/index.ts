/**
 * Centralized data service with fallback mechanisms
 * Prioritizes World Bank and NiMet data, falls back to NBS when necessary
 */

import * as WorldBank from './world-bank';
import * as NiMet from './nimet';
import * as NBS from './nbs';
import { databases } from '@/lib/appwrite';

/**
 * Gets economic indicators with fallback
 */
export async function getEconomicIndicators() {
  // Try World Bank first
  const worldBankData = await WorldBank.getEconomicData();
  
  // Check if we got valid data
  const hasValidData = Object.values(worldBankData).some(data => data && data.length > 0);
  
  if (hasValidData) {
    return {
      source: 'World Bank',
      data: worldBankData
    };
  }
  
  // Fall back to NBS
  console.log('Falling back to NBS for economic data');
  const inflationData = await NBS.getInflationData();
  
  return {
    source: 'NBS',
    data: {
      inflation: inflationData
    }
  };
}

/**
 * Gets weather data with fallback
 */
export async function getWeatherData(location: string) {
  // Try NiMet first
  const niMetData = await NiMet.getCurrentWeather(location);
  
  if (niMetData) {
    return {
      source: 'NiMet',
      data: niMetData
    };
  }
  
  // Fall back to cached weather data in Appwrite
  console.log('Falling back to cached weather data');
  try {
    const cachedData = await databases.listDocuments(
      'main',
      'weather_data',
      [
        Query.equal('location', location),
        Query.orderDesc('date'),
        Query.limit(1)
      ]
    );
    
    if (cachedData.total > 0) {
      return {
        source: 'Cache',
        data: cachedData.documents[0]
      };
    }
    
    return {
      source: 'None',
      data: null
    };
  } catch (error) {
    console.error(`Error fetching cached weather data for ${location}:`, error);
    return {
      source: 'None',
      data: null
    };
  }
}

/**
 * Gets agricultural data with fallback
 */
export async function getAgriculturalData() {
  // Try World Bank first
  const worldBankData = await WorldBank.getAgricultureData();
  
  // Check if we got valid data
  const hasValidData = Object.values(worldBankData).some(data => data && data.length > 0);
  
  if (hasValidData) {
    return {
      source: 'World Bank',
      data: worldBankData
    };
  }
  
  // Fall back to NBS
  console.log('Falling back to NBS for agricultural data');
  const foodPriceData = await NBS.getFoodPriceData();
  
  return {
    source: 'NBS',
    data: {
      foodPrices: foodPriceData
    }
  };
}

/**
 * Gets comprehensive data for loan risk assessment
 */
export async function getLoanRiskData(farmerLocation: string) {
  const [economicData, weatherData, agriculturalData] = await Promise.all([
    getEconomicIndicators(),
    getWeatherData(farmerLocation),
    getAgriculturalData()
  ]);
  
  return {
    economic: economicData,
    weather: weatherData,
    agricultural: agriculturalData,
    timestamp: new Date().toISOString()
  };
} 