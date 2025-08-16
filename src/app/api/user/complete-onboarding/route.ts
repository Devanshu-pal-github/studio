import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/database/schemas';
import { ObjectId } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

try {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (apiKey && apiKey.length > 20) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('✅ Gemini AI initialized successfully for recommendations');
  } else {
    throw new Error('No valid Gemini API key found');
  }
} catch (error) {
  console.error('❌ Gemini AI initialization failed for recommendations:', error);
  throw new Error('Gemini AI is required for recommendations');
}

export async function POST(request: NextRequest) {
  try {
    const { userId, onboardingHistory } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!model) {
      return NextResponse.json({ error: 'AI model not available' }, { status: 500 });
    }

    const db = await connectToDatabase();
    
    // Get user data
    const user = await db.collection(COLLECTIONS.USERS).findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get onboarding profile
    const onboardingProfile = user.onboardingProfile || {};
    
    console.log('🔄 Generating personalized recommendations...');
    
    // Generate personalized recommendations using pure AI
    const recommendations = await generatePersonalizedRecommendationsWithAI(onboardingProfile, onboardingHistory);
    
    // Update user with completed onboarding and recommendations
    await db.collection(COLLECTIONS.USERS).updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          completedOnboarding: true,
          onboardingHistory: onboardingHistory || [],
          onboardingCompletedAt: new Date(),
          personalizedRecommendations: recommendations,
          updatedAt: new Date()
        }
      }
    );

    // Create initial user progress
    await createInitialProgress(userId, recommendations);

    // Get updated user data
    const updatedUser = await db.collection(COLLECTIONS.USERS).findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    console.log('✅ Onboarding completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: updatedUser,
      recommendations,
      usingGemini: true
    });

  } catch (error: any) {
    console.error('❌ Complete onboarding error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to complete onboarding',
        details: error.message,
        usingGemini: false
      },
      { status: 500 }
    );
  }
}

// Generate personalized recommendations using pure AI
async function generatePersonalizedRecommendationsWithAI(onboardingProfile: any, onboardingHistory: any[]) {
  const prompt = `
You are an AI learning advisor for StudoAI. Based on the user's onboarding profile, generate personalized recommendations.

User Profile:
${JSON.stringify(onboardingProfile, null, 2)}

Onboarding History:
${JSON.stringify(onboardingHistory, null, 2)}

Generate a comprehensive JSON response with the following structure:
{
  "learningPath": {
    "title": "Personalized Learning Path",
    "description": "A detailed description of their learning journey",
    "duration": "estimated time",
    "difficulty": "beginner/intermediate/advanced",
    "milestones": [
      {
        "title": "Milestone title",
        "description": "What they'll learn",
        "estimatedTime": "2-3 weeks",
        "skills": ["skill1", "skill2"]
      }
    ]
  },
  "recommendedProjects": [
    {
      "title": "Project title",
      "description": "Project description",
      "difficulty": "beginner/intermediate/advanced",
      "estimatedTime": "1-2 weeks",
      "technologies": ["tech1", "tech2"],
      "learningOutcomes": ["outcome1", "outcome2"],
      "githubUrl": "optional github template url"
    }
  ],
  "learningResources": {
    "youtubeChannels": [
      {
        "name": "Channel name",
        "url": "channel url",
        "description": "Why this channel is recommended"
      }
    ],
    "documentation": [
      {
        "title": "Resource title",
        "url": "resource url",
        "description": "Why this resource is useful"
      }
    ],
    "courses": [
      {
        "title": "Course title",
        "platform": "platform name",
        "url": "course url",
        "description": "Course description"
      }
    ]
  },
  "skillGap": {
    "currentSkills": ["skill1", "skill2"],
    "targetSkills": ["skill3", "skill4"],
    "gapAnalysis": "Analysis of what they need to learn"
  },
  "weeklySchedule": {
    "recommendedHours": "5-10 hours per week",
    "schedule": [
      {
        "day": "Monday",
        "activities": ["activity1", "activity2"],
        "duration": "2 hours"
      }
    ]
  }
}

Make sure the recommendations are:
1. Personalized to their experience level, interests, and goals
2. Realistic and achievable
3. Include specific, actionable projects
4. Provide diverse learning resources
5. Consider their time availability
6. Focus on practical, hands-on learning

Response (JSON only):`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('✅ Generated recommendations using pure AI');
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('❌ Failed to generate recommendations with AI:', error);
    throw new Error('Recommendation generation failed');
  }
}

// Create initial user progress
async function createInitialProgress(userId: string, recommendations: any) {
  try {
    const db = await connectToDatabase();
    
    const initialProgress = {
      userId: new ObjectId(userId),
      totalPoints: 0,
      level: 1,
      streak: 0,
      activeDays: 0,
      completedProjects: [],
      currentProjects: [],
      achievements: [],
      learningPath: recommendations.learningPath,
      recommendedProjects: recommendations.recommendedProjects,
      weeklyGoals: {
        targetProjects: 1,
        targetPoints: 500,
        currentProjects: 0,
        currentPoints: 0,
      },
      lastActiveDate: new Date(),
      skillsProgress: {},
      weeklyActivity: {},
      monthlyActivity: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection(COLLECTIONS.USER_PROGRESS).insertOne(initialProgress);
    console.log('✅ Created initial user progress');
    
  } catch (error) {
    console.error('❌ Failed to create initial progress:', error);
    throw error;
  }
}
