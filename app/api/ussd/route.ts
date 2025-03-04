import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { sendSMS } from '@/lib/africas-talking';

export async function POST(req: NextRequest) {
  const data = await req.formData();
  
  // const sessionId = data.get('sessionId') as string;
  // const serviceCode = data.get('serviceCode') as string;
  const phoneNumber = data.get('phoneNumber') as string;
  const text = data.get('text') as string;
  
  // Parse USSD text to determine menu level and user input
  const textArray = text.split('*');
  const level = textArray.length;
  
  let response = '';
  
  // New session
  if (text === '') {
    response = `CON Welcome to AgriGrow Finance
    1. Apply for a loan
    2. Check loan status
    3. Make repayment
    4. Register as a farmer`;
  } 
  // Apply for loan flow
  else if (textArray[0] === '1') {
    if (level === 1) {
      response = 'CON Enter your farmer ID:';
    } else if (level === 2) {
      response = 'CON Enter loan amount (in Naira):';
    } else if (level === 3) {
      response = `CON Select crop type:
      1. Maize
      2. Rice
      3. Cassava
      4. Yam
      5. Other`;
    } else if (level === 4) {
      response = 'CON Enter farm size (in hectares):';
    } else if (level === 5) {
      // Process loan application
      const farmerId = textArray[1];
      const amount = parseInt(textArray[2]);
      const cropTypeMap: Record<string, string> = {
        '1': 'Maize',
        '2': 'Rice',
        '3': 'Cassava',
        '4': 'Yam',
        '5': 'Other'
      };
      const cropType = cropTypeMap[textArray[3]];
      const farmSize = parseFloat(textArray[4]);
      
      try {
        // Create loan application in Appwrite
        await databases.createDocument(
          'main',
          'loans',
          'unique()',
          {
            farmerId,
            amount,
            cropType,
            farmSize,
            applicationDate: new Date(),
            status: 'pending',
            riskScore: 0 // Will be calculated by AI
          }
        );
        
        // Send confirmation SMS
        await sendSMS(
          phoneNumber,
          `Your loan application for ${amount} Naira has been received. You will be notified once it's processed.`
        );
        
        response = 'END Your loan application has been submitted successfully. You will receive an SMS with details.';
      } catch {
        response = 'END An error occurred. Please try again later.';
      }
    }
  }
  // Other menu options implementation...
  
  return NextResponse.json({ response });
} 