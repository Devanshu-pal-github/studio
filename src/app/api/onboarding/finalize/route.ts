
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { vectorStore, LearningContext } from '@/lib/vectorStore';
import { ObjectId } from 'mongodb';

interface Message {
  role: 'user' | 'model';
  content: string;
}

// This is a simplified parser. In a real application, you'd use a more robust NLP-based approach.
const extractInfo = (history: Message[]): Partial<LearningContext> => {
    const userMessages = history.filter(msg => msg.role === 'user').map(msg => msg.content);
    const context: Partial<LearningContext> = {};

    if (userMessages.length > 0) {
        // Question 1: Name and motivation
        context.goals = [userMessages[1]];
    }
    if (userMessages.length > 1) {
        // Question 2: Experience level
        context.experience = userMessages[2];
    }
    if (userMessages.length > 2) {
        // Question 3: Learning style and time commitment
        context.learningStyle = userMessages[3];
    }
     if (userMessages.length > 3) {
        // Question 4: Challenges and resources
        context.preferences = [userMessages[4]];
    }
    if (userMessages.length > 4) {
        // Question 5: Current projects
        context.currentProjects = [userMessages[5]];
    }
    if (userMessages.length > 5) {
        // Question 6: Success definition and support
       context.completedTasks = [userMessages[6]];
    }
    
    return context;
};


export async function POST(req: NextRequest) {
    try {
        const { userId, history } = await req.json();

        // Verify the JWT token
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        if (!decoded || decoded.userId !== userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        if (!userId || !history) {
            return NextResponse.json({ error: 'Missing userId or history' }, { status: 400 });
        }

        // 1. Extract structured data from the conversation history (legacy fallback)
        const learningContext = extractInfo(history);

        // Try to read latest enhanced onboarding userProfile if available
        let enhancedProfile: any = null;
        try {
            const db = await connectToDatabase();
            const latest = await db.collection('onboarding_conversations')
              .find({ userId: new ObjectId(userId) })
              .sort({ createdAt: -1 })
              .limit(1)
              .toArray();
            if (latest && latest.length > 0) {
                enhancedProfile = latest[0].userProfile || null;
            }
        } catch (e) {
            // Non-fatal
            console.warn('Could not load enhanced onboarding profile:', e);
        }

        // 2. Add this context to the vector store for this user (with error handling)
        try {
            const userContextDocument = {
                id: `user-context-${userId}`,
                content: JSON.stringify(learningContext),
                metadata: {
                    type: 'concept' as const,
                    difficulty: 'beginner' as const,
                    tags: ['user-profile', 'onboarding'],
                    userId: userId,
                    createdAt: new Date(),
                },
            };
            await vectorStore.addDocument(userContextDocument);
        } catch (vectorError) {
            console.error('Vector store error (continuing without it):', vectorError);
            // Continue execution even if vector store fails
        }

    // 3. Save the structured data to MongoDB for easy access in the profile
    const db = await connectToDatabase();
        
        // Convert userId to ObjectId if it's a string
        const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
        
        const userFieldUpdates: Record<string, any> = {
            learningContext,
            completedOnboarding: true,
            updatedAt: new Date(),
        };

        if (enhancedProfile) {
            // Map enhanced profile fields to user document for quick access
            if (enhancedProfile.experienceLevel) userFieldUpdates.experienceLevel = enhancedProfile.experienceLevel;
            if (Array.isArray(enhancedProfile.goals)) userFieldUpdates.goals = enhancedProfile.goals;
            if (Array.isArray(enhancedProfile.interests)) userFieldUpdates.interests = enhancedProfile.interests;
            if (enhancedProfile.learningStyle) userFieldUpdates.learningStyle = enhancedProfile.learningStyle;
            if (Array.isArray(enhancedProfile.techStack)) userFieldUpdates.techStack = enhancedProfile.techStack;
        }

        const result = await db.collection('users').updateOne(
            { _id: userObjectId },
            { $set: userFieldUpdates }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        // Log activity: onboarding completed
        try {
            await db.collection('activities').insertOne({
                id: `activity-${userId}-${Date.now()}`,
                userId: userId,
                type: 'project_complete',
                timestamp: new Date(),
                description: 'Onboarding completed',
                metadata: { stages: enhancedProfile?.completedStages || [] }
            });
        } catch {}
        
        return NextResponse.json({ success: true, message: "Onboarding data processed and saved." });

    } catch (error: any) {
        console.error("Error processing onboarding data:", error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}
