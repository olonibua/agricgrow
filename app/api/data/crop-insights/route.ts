import { NextResponse } from 'next/server';
import { getCurrentWeather, getHistoricalWeather } from '@/lib/data/weather';
import { getAgricultureData, getEconomicData } from '@/lib/data/world-bank';
import { OpenAI } from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Mock data for price trends (in a real app, this would come from NBS)
const generateMockPriceData = (crop: string, location: string) => {
  const today = new Date();
  const data = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Base price varies by crop
    let basePrice = 0;
    switch (crop) {
      case 'rice': basePrice = 1200; break;
      case 'maize': basePrice = 800; break;
      case 'cassava': basePrice = 500; break;
      case 'yam': basePrice = 1500; break;
      case 'tomato': basePrice = 700; break;
      default: basePrice = 1000;
    }
    
    // Add some random variation
    const price = basePrice + Math.floor(Math.random() * 200) - 100;
    
    data.push({
      date: date.toISOString().split('T')[0],
      price
    });
  }
  
  return data;
};

// Mock data for historical weather
const generateMockHistoricalWeather = (location: string) => {
  const today = new Date();
  const data = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      temperature: 25 + Math.floor(Math.random() * 10),
      rainfall: Math.floor(Math.random() * 20),
      humidity: 60 + Math.floor(Math.random() * 20)
    });
  }
  
  return data;
};

// Generate insights using OpenAI
async function generateInsights(crop: string, weatherData: any, priceData: any) {
  try {
    // Check if OPENAI_API_KEY is set
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }
    
    const prompt = `
      Analyze the following data about ${crop} cultivation in Nigeria:
      
      Weather data: ${JSON.stringify(weatherData)}
      Price trends: ${JSON.stringify(priceData)}
      
      Please provide three insights:
      1. How these weather conditions affect the growth of ${crop}
      2. How weather might impact the price of ${crop}
      3. Recommendations for farmers growing ${crop} under these conditions
      
      Format your response as JSON with these keys: growthConditions, priceImpact, recommendations
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an agricultural expert in Nigeria." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content || '{}');
  } catch  {
    console.error('Error generating insights:', );
    
    // Always use fallback insights if OpenAI fails for any reason
    return {
      growthConditions: `${crop} generally grows well in warm conditions with moderate rainfall.`,
      priceImpact: `Weather conditions can significantly affect ${crop} prices, with drought typically causing price increases.`,
      recommendations: `Farmers should monitor weather forecasts and adjust irrigation accordingly.`
    };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const crop = searchParams.get('crop') || 'rice';
  const location = searchParams.get('location') || 'lagos';
  
  try {
    // Get weather data - don't convert to uppercase for OpenWeatherMap
    const weatherData = await getCurrentWeather(location);
    
    // Get economic and agricultural data
    const economicData = await getEconomicData();
    const agriculturalData = await getAgricultureData();
    
    // Get price data (using mock data for now)
    const priceData = {
      source: 'NBS (simulated)',
      data: generateMockPriceData(crop, location)
    };
    
    // Generate historical weather data using the new function
    const historicalWeather = weatherData 
      ? getHistoricalWeather(location, weatherData)
      : [];
    
    // Generate insights using OpenAI
    const insights = await generateInsights(crop, weatherData, priceData);
    
    // Process economic data for easier access in the UI
    const processedEconomicData = {
      gdp: economicData.NY?.GDP?.MKTP?.CD || [],
      cpi: economicData.FP?.CPI?.TOTL || []
    };

    // Process agricultural data for easier access in the UI
    const processedAgriculturalData = {
      landUse: agriculturalData.AG?.LND?.AGRI?.ZS || [],
      cropProduction: agriculturalData.AG?.PRD?.CROP?.XD || [],
      valueAdded: agriculturalData.NV?.AGR?.TOTL?.ZS || []
    };

    return NextResponse.json({
      success: true,
      data: {
        crop,
        location,
        weather: {
          source: weatherData ? 'OpenWeatherMap' : 'Not available',
          data: weatherData || null
        },
        prices: priceData,
        economic: {
          source: 'World Bank',
          data: processedEconomicData
        },
        agricultural: {
          source: 'World Bank',
          data: processedAgriculturalData
        },
        historicalWeather,
        insights
      }
    });
  } catch {
    // console.error('Detailed error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch crop insights', 
        message: 'Failed to fetch crop insights'
      },
      { status: 500 }
    );
  }
} 