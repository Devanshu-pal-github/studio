
import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { vectorStore, LearningContext } from '@/lib/vectorStore';

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

        if (!userId || !history) {
            return NextResponse.json({ error: 'Missing userId or history' }, { status: 400 });
        }

        // 1. Extract structured data from the conversation history
        const learningContext = extractInfo(history);

        // 2. Add this context to the vector store for this user
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

        // 3. Save the structured data to Firestore for easy access in the profile
        await setDoc(doc(db, 'users', userId), {
            learningContext,
            completedOnboarding: true, // Ensure this is set
        }, { merge: true });
        
        return NextResponse.json({ success: true, message: "Onboarding data processed and saved." });

    } catch (error: any) {
        console.error("Error processing onboarding data:", error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}
