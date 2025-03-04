import { NextResponse } from 'next/server';
import { getLoanRiskData } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location') || 'LAGOS';
  
  try {
    const riskData = await getLoanRiskData(location);
    
    return NextResponse.json({
      success: true,
      data: riskData
    });
  } catch  {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch risk factors',
        message: 'Failed to fetch risk factors'
      }, 
      { status: 500 }
    );
  }
} 