import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Debug: Testing environment variables...');
    
    // Check if any env vars are loaded
    const allEnvVars = Object.keys(process.env);
    console.log('🔍 Debug: Total environment variables:', allEnvVars.length);
    
    // Check for our specific key
    const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
    console.log('🔍 Debug: GOOGLE_GEMINI_API_KEY exists:', !!geminiKey);
    
    // Check for other common env vars
    const nodeEnv = process.env.NODE_ENV;
    const port = process.env.PORT;
    
    return NextResponse.json({
      success: true,
      message: 'Environment test',
      debug: {
        totalEnvVars: allEnvVars.length,
        hasGeminiKey: !!geminiKey,
        nodeEnv: nodeEnv,
        port: port,
        geminiKeyLength: geminiKey?.length || 0,
        geminiKeyStart: geminiKey?.substring(0, 10) || 'N/A'
      }
    });

  } catch (error: any) {
    console.error('Environment test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Environment test failed',
      error: error.message
    });
  }
} 