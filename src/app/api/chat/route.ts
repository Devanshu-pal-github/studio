import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { advancedPromptingEngine, UserContext } from '@/lib/advanced-prompting';

export async function POST(req: NextRequest) {
    try {
        // Verify authentication
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { message, context } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const db = await connectToDatabase();
        
        // Get comprehensive user context
        const userObjectId = typeof decoded.userId === 'string' ? new ObjectId(decoded.userId) : decoded.userId;
        
        const [user, userActivities, userProjects, onboardingHistory] = await Promise.all([
            db.collection('users').findOne({ _id: userObjectId }),
            db.collection('user_activities').find({ userId: decoded.userId }).sort({ timestamp: -1 }).limit(50).toArray(),
            db.collection('user_projects').find({ userId: decoded.userId }).toArray(),
            db.collection('onboarding_conversations').find({ userId: decoded.userId }).sort({ timestamp: -1 }).toArray()
        ]);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Build comprehensive user context for RAG
        const userContext: UserContext = {
            onboardingResponses: user.onboardingHistory?.reduce((acc: any, entry: any) => {
                if (entry.question && entry.response) {
                    const key = entry.question.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    acc[key] = entry.response;
                }
                return acc;
            }, {}) || {},
            activities: userActivities,
            projectHistory: userProjects,
            learningProgress: user.learningProgress || [],
            interactions: onboardingHistory,
            timestamp: new Date()
        };

        // Generate contextual response using advanced prompting
        const chatPrompt = `
CONTEXTUAL CHAT ASSISTANCE TASK:

You are the user's personal AI learning companion with deep knowledge of their learning journey.

USER MESSAGE: "${message}"

COMPREHENSIVE USER CONTEXT:
=== ONBOARDING RESPONSES (USER'S EXACT WORDS) ===
${Object.entries(userContext.onboardingResponses).map(([key, value]) => 
    `${key.toUpperCase()}: "${value}"`
).join('\\n')}

=== RECENT ACTIVITIES ===
${userActivities.slice(0, 10).map(activity => 
    `${activity.type}: ${activity.description} (${new Date(activity.timestamp).toLocaleDateString()})`
).join('\\n')}

=== CURRENT PROJECTS ===
${userProjects.map(project => 
    `${project.title} - Status: ${project.status}, Progress: ${project.progress}%`
).join('\\n')}

=== ADDITIONAL CONTEXT ===
Current Focus: ${context?.currentProject || 'General learning'}
Learning Goals: ${context?.learningGoals?.join(', ') || 'Not specified'}
User Level: ${context?.userLevel || 'Beginner'}

RESPONSE REQUIREMENTS:
1. Address the user's specific question/concern directly
2. Reference their exact onboarding responses when relevant
3. Consider their current projects and progress
4. Provide personalized guidance based on their learning style
5. Use encouraging, supportive tone that matches their communication style
6. Offer specific, actionable advice
7. Connect suggestions to their stated goals and interests

RESPONSE TYPES TO CONSIDER:
- Technical explanations tailored to their level
- Project suggestions based on their interests
- Learning path guidance aligned with their goals
- Troubleshooting help for their current challenges
- Motivation and encouragement based on their journey
- Resource recommendations matching their learning style

Generate a helpful, personalized response that feels like it comes from someone who truly understands their learning journey.`;

        // Get response from advanced prompting engine
        const aiResponse = await advancedPromptingEngine.generatePersonalizedContent(
            userContext,
            'guidance'
        );

        // Log the conversation for future context
        await db.collection('chat_conversations').insertOne({
            userId: decoded.userId,
            userMessage: message,
            aiResponse: typeof aiResponse === 'string' ? aiResponse : aiResponse.content,
            context: context,
            timestamp: new Date(),
            userContextHash: generateContextHash(userContext)
        });

        // Track activity
        await db.collection('user_activities').insertOne({
            userId: decoded.userId,
            type: 'chat_interaction',
            description: `Asked: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
            timestamp: new Date(),
            metadata: {
                messageLength: message.length,
                contextProvided: !!context,
                hasOnboardingData: Object.keys(userContext.onboardingResponses).length > 0
            }
        });

        return NextResponse.json({
            success: true,
            response: typeof aiResponse === 'string' ? aiResponse : aiResponse.content,
            suggestions: extractSuggestions(aiResponse),
            confidence: calculateConfidence(userContext, message),
            contextUsed: {
                onboardingData: Object.keys(userContext.onboardingResponses).length,
                activitiesCount: userActivities.length,
                projectsCount: userProjects.length
            }
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({ 
            error: 'Failed to process chat message',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// Helper function to generate context hash for tracking
function generateContextHash(userContext: UserContext): string {
    const contextString = JSON.stringify({
        responses: userContext.onboardingResponses,
        activitiesCount: userContext.activities.length,
        projectsCount: userContext.projectHistory.length
    });
    
    let hash = 0;
    for (let i = 0; i < contextString.length; i++) {
        const char = contextString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

// Helper function to extract actionable suggestions from AI response
function extractSuggestions(aiResponse: any): string[] {
    if (typeof aiResponse === 'string') {
        // Extract suggestions from text using patterns
        const suggestions: string[] = [];
        const lines = aiResponse.split('\\n');
        
        for (const line of lines) {
            if (line.includes('suggest') || line.includes('recommend') || line.includes('try')) {
                suggestions.push(line.trim());
            }
        }
        
        return suggestions.slice(0, 3); // Limit to 3 suggestions
    }
    
    return aiResponse.suggestions || [];
}

// Helper function to calculate confidence based on available context
function calculateConfidence(userContext: UserContext, message: string): number {
    let confidence = 0.3; // Base confidence
    
    // Increase confidence based on available context
    if (Object.keys(userContext.onboardingResponses).length > 0) confidence += 0.3;
    if (userContext.activities.length > 0) confidence += 0.2;
    if (userContext.projectHistory.length > 0) confidence += 0.1;
    if (userContext.learningProgress.length > 0) confidence += 0.1;
    
    // Adjust based on message complexity
    if (message.length > 50) confidence += 0.05;
    if (message.includes('?')) confidence += 0.05; // Question format
    
    return Math.min(confidence, 1.0);
}
