import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    console.log('🔍 Debug: Testing Gemini API directly...');
    
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    
    console.log('🔍 Debug: API Key length:', apiKey?.length);
    console.log('🔍 Debug: API Key starts with:', apiKey?.substring(0, 10));
    
    if (!apiKey || apiKey.length <= 20) {
      console.log('❌ API Key validation failed');
      return NextResponse.json({
        success: false,
        message: 'No valid Gemini API key found',
        usingFallback: true
      });
    }

    console.log('✅ API Key validation passed, initializing Gemini...');

    // Initialize Gemini AI directly
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ GoogleGenerativeAI initialized');
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('✅ Model initialized');
    
    // Test the model
    const result = await model.generateContent("Hello! Please respond with a simple greeting to confirm you're working.");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini response received:', text.substring(0, 50) + '...');

    return NextResponse.json({
      success: true,
      message: 'Gemini AI is working!',
      response: text,
      usingFallback: false
    });

  } catch (error: any) {
    console.error('❌ Gemini test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Gemini AI test failed',
      error: error.message,
      usingFallback: true
    });
  }
} 