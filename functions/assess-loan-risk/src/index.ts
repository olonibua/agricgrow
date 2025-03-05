import { Databases, Client, Query } from 'appwrite';
import { OpenAI } from 'openai';
// import { Request, Response } from 'express';

// For Appwrite Functions

// Or for a generic serverless function approach
type Request = {
  body: any;
  params: any;
  query: any;
};

type Response = {
  json: (data: any) => void;
  status: (code: number) => Response;
};

// Initialize Appwrite
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)

const databases = new Databases(client);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function assessLoanRisk(req: Request, res: Response) {
  try {
    const loanId = req.body.loanId;
    
    // Get loan details
    const loan = await databases.getDocument('main', 'loans', loanId);
    
    // Get farmer details
    const farmer = await databases.getDocument('main', 'farmers', loan.farmerId);
    
    // Get weather data for farmer's location
    const weatherData = await databases.listDocuments(
      'main',
      'weather_data',
      [
        Query.equal('location', farmer.location),
        Query.orderDesc('date'),
        Query.limit(1)
      ]
    );
    
    // Get crop price data
    const cropPrices = await databases.listDocuments(
      'main',
      'crop_prices',
      [
        Query.equal('cropType', loan.cropType),
        Query.orderDesc('date'),
        Query.limit(1)
      ]
    );
    
    // Prepare data for OpenAI
    const promptData = {
      loan: {
        amount: loan.amount,
        cropType: loan.cropType,
        farmSize: loan.farmSize,
        purpose: loan.purpose
      },
      farmer: {
        location: farmer.location,
        farmSize: farmer.farmSize,
        cropTypes: farmer.cropTypes,
        // Exclude sensitive data
      },
      weather: weatherData.documents[0] || null,
      cropPrice: cropPrices.documents[0] || null,
      // Add historical repayment data if available
    };
    
    // Call OpenAI for risk assessment
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a risk assessment expert for agricultural loans in Nigeria. Analyze the provided data and generate a risk score from 0-100 (where 0 is lowest risk and 100 is highest risk) and provide a brief explanation."
        },
        {
          role: "user",
          content: JSON.stringify(promptData)
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const content = completion.choices[0].message.content;
    
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }
    
    const riskAssessment = JSON.parse(content);
    
    // Update loan with risk assessment
    await databases.updateDocument(
      'main',
      'loans',
      loanId,
      {
        riskScore: riskAssessment.riskScore,
        riskExplanation: riskAssessment.explanation
      }
    );
    
    return res.json({
      success: true,
      riskAssessment
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error assessing loan risk';
    console.error('Error assessing loan risk:', errorMessage);
    return res.status(400).json({
      success: false,
      error: errorMessage
    });
  }
} 