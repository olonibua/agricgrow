/**
 * National Bureau of Statistics (NBS) Nigeria Data Service
 * Fallback data source when World Bank or NiMet data is unavailable
 */

import * as cheerio from 'cheerio';
import { databases } from '@/lib/appwrite';

const NBS_URL = "https://nigerianstat.gov.ng";

// NBS data categories relevant for AgriGrow Finance
export const DATA_CATEGORIES = {
  INFLATION: "inflation-data",
  FOOD_PRICES: "food-price-watch",
  TRANSPORT_COSTS: "transport-fare-watch",
  ENERGY_PRICES: "energy-price-watch",
  LABOR_FORCE: "labor-force-statistics"
};

/**
 * Scrapes the latest PDF reports from NBS website
 */
export async function getLatestReports() {
  try {
    const response = await fetch(NBS_URL, { next: { revalidate: 86400 } });
    
    if (!response.ok) {
      throw new Error(`NBS website error: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const reports = [];
    
    // Find the latest reports (implementation depends on website structure)
    $('.report-item').each((i, el) => {
      const title = $(el).find('.report-title').text().trim();
      const date = $(el).find('.report-date').text().trim();
      const url = $(el).find('.report-link').attr('href');
      
      reports.push({
        title,
        date,
        url: url ? `${NBS_URL}${url}` : null
      });
    });
    
    return reports;
  } catch (error) {
    console.error("Error scraping NBS website:", error);
    return [];
  }
}

/**
 * Gets cached NBS data from Appwrite database
 * This is used as a fallback when direct scraping fails
 */
export async function getCachedNBSData(category: string) {
  try {
    const documents = await databases.listDocuments(
      'main',
      'nbs_data',
      [
        Query.equal('category', category),
        Query.orderDesc('date'),
        Query.limit(1)
      ]
    );
    
    if (documents.total > 0) {
      return documents.documents[0];
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching cached NBS data for ${category}:`, error);
    return null;
  }
}

/**
 * Gets inflation data (fallback for World Bank)
 */
export async function getInflationData() {
  // Try to get from NBS website first
  const reports = await getLatestReports();
  const inflationReport = reports.find(r => r.title.toLowerCase().includes('inflation') || r.title.toLowerCase().includes('cpi'));
  
  if (inflationReport && inflationReport.url) {
    // Process the PDF (implementation would depend on PDF structure)
    // This would typically be done in a separate function
    
    // For now, return the report metadata
    return inflationReport;
  }
  
  // Fall back to cached data
  return getCachedNBSData(DATA_CATEGORIES.INFLATION);
}

/**
 * Gets food price data (important for agricultural loan risk assessment)
 */
export async function getFoodPriceData() {
  const reports = await getLatestReports();
  const foodPriceReport = reports.find(r => r.title.toLowerCase().includes('food price') || r.title.toLowerCase().includes('selected food'));
  
  if (foodPriceReport && foodPriceReport.url) {
    return foodPriceReport;
  }
  
  return getCachedNBSData(DATA_CATEGORIES.FOOD_PRICES);
} 