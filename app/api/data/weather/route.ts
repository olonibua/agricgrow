import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import * as cheerio from 'cheerio';

// Define a type for weather data
interface WeatherData {
  location: string;
  rainfall: number;
  temperature: number;
  humidity: number;
  forecast: string;
  date: Date;
}

export async function GET() {
  try {
    // Fetch weather data from NiMet
    const response = await fetch('https://nimet.gov.ng/weather-forecast', {
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract weather data (implementation depends on website structure)
    const weatherData: WeatherData[] = [];
    
    $(".weather-location").each((i: number, el) => {
      const location = $(el).find(".location-name").text().trim();
      const rainfall = parseFloat($(el).find(".rainfall").text());
      const temperature = parseFloat($(el).find(".temperature").text());
      const humidity = parseFloat($(el).find(".humidity").text());
      const forecast = $(el).find(".forecast").text().trim();

      weatherData.push({
        location,
        rainfall,
        temperature,
        humidity,
        forecast,
        date: new Date(),
      });
    });
    
    // Store in Appwrite
    for (const data of weatherData) {
      await databases.createDocument(
        'main',
        'weather_data',
        'unique()',
        data
      );
    }
    
    return NextResponse.json({ success: true, count: weatherData.length });
  } catch  {
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
} 