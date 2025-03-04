/**
 * World Bank API Service
 * Handles fetching economic and agricultural data from World Bank Open Data
 */

const BASE_URL = "https://api.worldbank.org/v2";

// Common indicators needed for AgriGrow Finance
export const INDICATORS = {
  GDP: "NY.GDP.MKTP.CD",
  AGRICULTURAL_LAND: "AG.LND.AGRI.ZS",
  CROP_PRODUCTION: "AG.PRD.CROP.XD",
  ACCESS_TO_CREDIT: "FI.ACC.TOTL",
  INFLATION: "FP.CPI.TOTL",
  AGRICULTURAL_VALUE: "NV.AGR.TOTL.ZS",
  RURAL_POPULATION: "SP.RUR.TOTL"
};

/**
 * Fetches data for a specific indicator from World Bank API
 */
export async function fetchIndicator(indicatorCode: string, countryCode = "NGA") {
  try {
    const response = await fetch(
      `${BASE_URL}/country/${countryCode}/indicator/${indicatorCode}?format=json&per_page=5`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );
    
    if (!response.ok) {
      throw new Error(`World Bank API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data[1]; // World Bank returns metadata in [0] and actual data in [1]
  } catch (error) {
    console.error(`Error fetching World Bank indicator ${indicatorCode}:`, error);
    return null;
  }
}

/**
 * Fetches multiple indicators at once
 */
export async function fetchMultipleIndicators(indicatorCodes: string[], countryCode = "NGA") {
  const results: Record<string, any> = {};
  
  for (const code of indicatorCodes) {
    results[code] = await fetchIndicator(code, countryCode);
  }
  
  return results;
}

/**
 * Gets agricultural data relevant for loan risk assessment
 */
export async function getAgricultureData() {
  const agricultureIndicators = [
    INDICATORS.AGRICULTURAL_LAND,
    INDICATORS.CROP_PRODUCTION,
    INDICATORS.AGRICULTURAL_VALUE
  ];
  
  return fetchMultipleIndicators(agricultureIndicators);
}

/**
 * Gets economic data relevant for loan risk assessment
 */
export async function getEconomicData() {
  const economicIndicators = [
    INDICATORS.GDP,
    INDICATORS.INFLATION,
    INDICATORS.ACCESS_TO_CREDIT
  ];
  
  return fetchMultipleIndicators(economicIndicators);
} 