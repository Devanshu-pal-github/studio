import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { langChainService } from '@/lib/langchain-service';
import { ObjectId } from 'mongodb';

interface Message {
  role: 'user' | 'assistant';
    content: string;
}

interface OnboardingContext {
  userId: string;
  conversationHistory: Message[];
  userProfile: {
    name?: string;
    experienceLevel?: string;
    goals?: string[];
    interests?: string[];
    learningStyle?: string;
    timeAvailability?: string;
    challenges?: string[];
  };
  currentQuestionIndex: number;
  totalQuestions: number;
}

export async function POST(req: NextRequest) {
    try {
    // Verify authentication
    const authResult = await verifyToken(req);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { history, userId } = await req.json();
        
        if (!history || !Array.isArray(history)) {
            return NextResponse.json({ error: 'Invalid history provided' }, { status: 400 });
        }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Extract user profile from conversation history
    const userProfile = await extractUserProfile(history);
    
    // Create onboarding context
    const context: OnboardingContext = {
      userId,
      conversationHistory: history,
      userProfile,
      currentQuestionIndex: history.filter(msg => msg.role === 'user').length,
      totalQuestions: 6 // Dynamic total based on user needs
    };

    // Store vector embeddings for each user response
    await storeVectorEmbeddings(userId, history);

    // Generate dynamic response based on context
    const response = await generateDynamicResponse(context);
        
        return NextResponse.json({ message: response });
        
    } catch (error: any) {
        console.error("Enhanced Onboarding API Error:", error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}

/**
 * Extract user profile from conversation history
 */
async function extractUserProfile(history: Message[]): Promise<any> {
        const userMessages = history.filter(msg => msg.role === 'user');
  
  if (userMessages.length === 0) {
    return {};
  }

  // Analyze the most recent user response
  const latestResponse = userMessages[userMessages.length - 1].content;
  
  try {
    const analysis = await langChainService.analyzeUserResponse(latestResponse, {
      userId: 'temp',
      conversationHistory: history,
      userProfile: {},
      currentQuestionIndex: userMessages.length,
      totalQuestions: 6
    });

    return {
      name: extractName(userMessages),
      experienceLevel: analysis.experienceLevel,
      goals: analysis.goals || [],
      interests: analysis.interests || [],
      learningStyle: analysis.learningStyle,
      timeAvailability: analysis.timeAvailability,
      challenges: analysis.challenges || [],
      sentiment: analysis.sentiment,
      motivation: analysis.motivation,
      communicationStyle: analysis.communicationStyle
    };
    } catch (error) {
    console.error('Error analyzing user response:', error);
    return {
      name: extractName(userMessages),
      experienceLevel: 'beginner',
      goals: [],
      interests: [],
      learningStyle: 'mixed',
      timeAvailability: 'moderate',
      challenges: []
    };
    }
}

/**
 * Generate dynamic response based on context
 */
async function generateDynamicResponse(context: OnboardingContext): Promise<string> {
  const userResponseCount = context.conversationHistory.filter(msg => msg.role === 'user').length;
  
  // Check if onboarding is complete
  if (userResponseCount >= context.totalQuestions) {
    return await generateCompletionMessage(context);
  }

  // Generate next dynamic question
  try {
    const nextQuestion = await langChainService.generateDynamicQuestion(context);
    return nextQuestion;
  } catch (error) {
    console.error('Error generating dynamic question:', error);
    return generateFallbackQuestion(context);
  }
}

/**
 * Generate completion message with personalized recommendations
 */
async function generateCompletionMessage(context: OnboardingContext): Promise<string> {
  try {
    const recommendations = await langChainService.generatePersonalizedRecommendations(
      context.userId,
      {
        userProfile: context.userProfile,
        analysis: await analyzeFullConversation(context.conversationHistory)
      }
    );

    // Store recommendations in database
    await storeRecommendations(context.userId, recommendations);

    return `🎉 **Congratulations! Your personalized learning journey is ready!** 🎉

Based on our conversation, I've created a custom learning plan just for you:

**🎯 Your Learning Path:**
• Primary Path: ${recommendations.learningPath.primaryPath}
• Duration: ${recommendations.learningPath.estimatedDuration}
• Progression: ${recommendations.learningPath.difficultyProgression}

**🚀 Recommended Projects:**
${recommendations.projectRecommendations.slice(0, 3).map(project => 
  `• ${project.name} (${project.difficulty}) - ${project.estimatedTime}`
).join('\n')}

**📚 Resources:**
• Courses: ${recommendations.resourceRecommendations.courses.slice(0, 2).join(', ')}
• Tools: ${recommendations.resourceRecommendations.tools.slice(0, 2).join(', ')}

Your AI mentor will adapt to your learning style and provide personalized guidance throughout your journey!

[DONE]`;
  } catch (error) {
    console.error('Error generating completion message:', error);
    return `🎉 **Great job completing the onboarding!** 🎉

Your personalized learning environment is now ready. I'll be your AI mentor throughout your learning journey, providing guidance, resources, and motivation tailored specifically to you.

Let's start building something amazing together! 🚀

[DONE]`;
  }
}

/**
 * Store vector embeddings for user responses
 */
async function storeVectorEmbeddings(userId: string, history: Message[]): Promise<void> {
  try {
    const db = await connectToDatabase();
        const userMessages = history.filter(msg => msg.role === 'user');
    
    for (let i = 0; i < userMessages.length; i++) {
      const message = userMessages[i];
      const embedding = await langChainService.createVectorEmbedding(message.content, {
        userId,
        questionIndex: i,
        category: getQuestionCategory(i),
        importance: calculateImportance(message.content, i),
        context: {
          previousResponses: userMessages.slice(0, i).map(m => m.content),
          totalResponses: userMessages.length
        }
      });

      // Store in database
      await db.collection('user_embeddings').insertOne({
        userId,
        content: message.content,
        embedding: embedding.metadata.embedding,
        metadata: embedding.metadata,
        createdAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error storing vector embeddings:', error);
    }
}

/**
 * Store personalized recommendations
 */
async function storeRecommendations(userId: string, recommendations: any): Promise<void> {
    try {
        const db = await connectToDatabase();
    await db.collection('user_recommendations').updateOne(
      { userId },
            {
                $set: {
          recommendations,
                    updatedAt: new Date()
                }
      },
      { upsert: true }
    );
    } catch (error) {
    console.error('Error storing recommendations:', error);
    }
}

/**
 * Analyze full conversation for comprehensive insights
 */
async function analyzeFullConversation(history: Message[]): Promise<any> {
    const userMessages = history.filter(msg => msg.role === 'user');
  const allText = userMessages.map(m => m.content).join(' ');
  
  try {
    return await langChainService.analyzeUserResponse(allText, {
      userId: 'temp',
      conversationHistory: history,
      userProfile: {},
      currentQuestionIndex: userMessages.length,
      totalQuestions: 6
    });
  } catch (error) {
    console.error('Error analyzing full conversation:', error);
    return {
      sentiment: 'positive',
      confidence: 0.7,
      enthusiasm: 0.8,
      experienceLevel: 'beginner',
      goals: ['learn programming'],
      interests: ['web development'],
      learningStyle: 'mixed',
      timeAvailability: 'moderate',
      challenges: [],
      motivation: 'high',
      communicationStyle: 'enthusiastic'
    };
  }
}

// Helper functions
function extractName(userMessages: Message[]): string {
  if (userMessages.length === 0) return '';
  
  const firstMessage = userMessages[0].content.toLowerCase();
  const namePatterns = [
    /(?:i'm|i am|my name is|call me|name's)\s+([a-zA-Z]+)/i,
    /^([a-zA-Z]+)(?:\s|,|!|\.|$)/,
    /hi.*?([a-zA-Z]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = firstMessage.match(pattern);
    if (match && match[1] && match[1].length > 1) {
      return match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    }
  }
  
  return '';
}

function getQuestionCategory(index: number): string {
    const categories = ['introduction', 'goals', 'experience', 'schedule', 'interests', 'completion'];
    return categories[index] || 'additional';
}

function calculateImportance(response: string, questionIndex: number): number {
    let importance = 0.5;
    
    // Question-based importance
    if (questionIndex === 0) importance += 0.2; // Introduction
    if (questionIndex === 1) importance += 0.3; // Goals
    if (questionIndex === 2) importance += 0.2; // Experience
    
    // Content-based importance
    if (response.length > 100) importance += 0.1;
    if (response.includes('goal') || response.includes('want') || response.includes('build')) importance += 0.1;
    if (response.includes('challenge') || response.includes('struggle') || response.includes('difficult')) importance += 0.1;
    
    return Math.min(importance, 1.0);
}

function generateFallbackQuestion(context: OnboardingContext): string {
  const questions = [
    "👋 Welcome! I'm your AI learning mentor. What's your name and what inspired you to start learning today?",
    "🎯 What specific goal do you want to achieve in the next 3-6 months?",
    "💻 What's your current experience level with programming?",
    "⏰ How much time can you dedicate to learning each week?",
    "🔥 Which areas of technology interest you most?",
    "🎉 Is there anything else about your learning preferences I should know?"
  ];
  
  const questionIndex = Math.min(context.currentQuestionIndex, questions.length - 1);
  return questions[questionIndex];
}
