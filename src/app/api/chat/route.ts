import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/database/schemas';
import { ObjectId } from 'mongodb';
import { aiChatbotService } from '@/lib/ai-chatbot-service';

export async function POST(request: NextRequest) {
  try {
    const { message, userId, conversationHistory = [] } = await request.json();

    if (!userId || !message) {
      return NextResponse.json({ error: 'User ID and message are required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    // Get user data and progress
    const user = await db.collection(COLLECTIONS.USERS).findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user progress
    const userProgress = await db.collection(COLLECTIONS.USER_PROGRESS).findOne(
      { userId: new ObjectId(userId) }
    );

    // Create learning context
    const learningContext = {
      userId,
      userProfile: user.onboardingProfile || {},
      currentProject: userProgress?.currentProjects?.[0] || null,
      currentSkill: userProgress?.learningPath?.milestones?.[0]?.title || null,
      learningProgress: userProgress || {}
    };

    // Generate AI response
    const aiResponse = await aiChatbotService.generateResponse(
      message,
      learningContext,
      conversationHistory
    );

    // Store conversation in database
    await db.collection('chat_conversations').insertOne({
      userId: new ObjectId(userId),
      message,
      response: aiResponse.response,
      resources: aiResponse.resources,
      suggestions: aiResponse.suggestions,
      timestamp: new Date(),
      context: learningContext
    });

    return NextResponse.json({
      success: true,
      response: aiResponse.response,
      resources: aiResponse.resources,
      suggestions: aiResponse.suggestions
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
