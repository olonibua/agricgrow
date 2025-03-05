import { WeatherData } from "@/lib/data/weather";

export interface AgriculturalData {
  landUse: Array<{date: string; value: number}>;
  cropProduction: Array<{date: string; value: number}>;
  valueAdded: Array<{date: string; value: number}>;
}

export interface PriceData {
  date: string;
  price: number;
  currency: string;
  market: string;
}

export interface EconomicData {
  gdp: Array<{date: string; value: number}>;
  inflation: Array<{date: string; value: number}>;
  interestRate: Array<{date: string; value: number}>;
}

export interface Insights {
  recommendations: string[];
  risks: string[];
  marketTrends: string[];
  seasonalFactors: string[];
}

export interface CropData {
  weather: {
    source: string;
    data: WeatherData | null;
  };
  prices: {
    source: string;
    data: PriceData[];
  };
  economic: {
    source: string;
    data: EconomicData;
  };
  agricultural: {
    source: string;
    data: AgriculturalData;
  };
  historicalWeather: Array<{date: string; temperature: number; rainfall: number}>;
  insights: Insights;
} 