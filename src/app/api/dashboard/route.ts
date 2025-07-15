import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { advancedPromptingEngine, UserContext } from '@/lib/advanced-prompting';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(req: NextRequest) {
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

        const db = await connectToDatabase();
        
        // Convert userId to ObjectId if it's a string
        const userObjectId = typeof decoded.userId === 'string' ? new ObjectId(decoded.userId) : decoded.userId;
        
        // Get user data including onboarding history
        const user = await db.collection('users').findOne({ _id: userObjectId });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Load user's activities and projects for context
        const [userActivities, userProjects] = await Promise.all([
            db.collection('user_activities').find({ userId: decoded.userId }).toArray(),
            db.collection('user_projects').find({ userId: decoded.userId }).toArray()
        ]);

        if (!user.completedOnboarding || !user.onboardingHistory) {
            return NextResponse.json({ error: 'Onboarding not completed. Please complete onboarding first.' }, { status: 400 });
        }

        try {
            // Generate truly personalized dashboard content using AI based on onboarding data
            const personalizedData = await generatePersonalizedDashboard(
                user.onboardingHistory, 
                user.name, 
                userActivities, 
                userProjects
            );

            return NextResponse.json({
                success: true,
                user: {
                    _id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    completedOnboarding: user.completedOnboarding,
                    learningContext: user.learningContext
                },
                personalizedData
            });
        } catch (aiError) {
            console.error('Dashboard generation error, using enhanced fallback:', aiError);
            
            // Fallback response if AI fails
            return NextResponse.json({
                success: true,
                user: {
                    _id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    completedOnboarding: user.completedOnboarding,
                    learningContext: user.learningContext
                },
                personalizedData: {
                    welcomeMessage: `Welcome back, ${user.name}! Let's continue your learning journey.`,
                    recommendedProjects: [],
                    learningPath: null,
                    nextSteps: ['Complete your profile', 'Start your first project', 'Join the community']
                }
            });
        }

    } catch (error: any) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}

// AI-powered personalized dashboard generation
async function generatePersonalizedDashboard(
    onboardingHistory: any[], 
    userName: string, 
    userActivities: any[], 
    userProjects: any[]
) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey || apiKey === 'your_google_ai_api_key_here') {
        return generateFallbackDashboard(onboardingHistory, userName, userActivities, userProjects);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Create conversation context from onboarding history
        const userMessages = onboardingHistory?.filter((msg: any) => msg.role === 'user') || [];
        const conversationContext = onboardingHistory?.map((msg: any) => 
            `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`
        ).join('\n') || '';

        // Use the advanced prompting engine for deep semantic analysis
        const userContext: UserContext = {
            onboardingResponses: onboardingHistory.reduce((acc, entry) => {
                if (entry.question && entry.response) {
                    const key = entry.question.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    acc[key] = entry.response;
                }
                return acc;
            }, {} as any),
            activities: userActivities || [],
            projectHistory: userProjects || [],
            learningProgress: [],
            interactions: onboardingHistory,
            timestamp: new Date()
        };

        // Generate truly personalized dashboard using advanced prompting
        const dashboardData = await advancedPromptingEngine.generatePersonalizedContent(
            userContext,
            'dashboard'
        );

        return dashboardData;

    } catch (error) {
        console.error('Advanced AI dashboard generation failed:', error);
        return generateFallbackDashboard(onboardingHistory, userName, userActivities, userProjects);
    }
}

// Enhanced fallback dashboard based on onboarding data
function generateFallbackDashboard(
    onboardingHistory: any[], 
    userName: string, 
    userActivities: any[], 
    userProjects: any[]
) {
    const userMessages = onboardingHistory?.filter((msg: any) => msg.role === 'user') || [];
    
    // Analyze user responses to create personalized content
    const allUserText = userMessages.map(msg => msg.content.toLowerCase()).join(' ');
    
    // Extract interests and experience level
    const isBeginnerLevel = allUserText.includes('beginner') || allUserText.includes('new') || allUserText.includes('never');
    const isWebDev = allUserText.includes('website') || allUserText.includes('web') || allUserText.includes('html');
    const isMobileDev = allUserText.includes('app') || allUserText.includes('mobile');
    const isDataScience = allUserText.includes('data') || allUserText.includes('analysis');
    const likesProjects = allUserText.includes('project') || allUserText.includes('build');
    const mentionedCareer = allUserText.includes('career') || allUserText.includes('job');
    
    // Generate personalized projects based on analysis
    const projects = [];
    
    if (isWebDev || (!isMobileDev && !isDataScience)) {
        projects.push({
            title: "Personal Portfolio Website",
            description: "Build a responsive portfolio to showcase your skills and projects",
            difficulty: isBeginnerLevel ? "beginner" : "intermediate",
            estimatedHours: isBeginnerLevel ? 12 : 20,
            skills: ["HTML", "CSS", "JavaScript", "Responsive Design"],
            personalizedReason: `Perfect for ${mentionedCareer ? 'advancing your career' : 'showcasing your work'}`,
            matchScore: 90
        });
    }
    
    if (isMobileDev) {
        projects.push({
            title: "Mobile-First Todo App",
            description: "Create a feature-rich task management app with modern mobile UI",
            difficulty: isBeginnerLevel ? "intermediate" : "advanced", 
            estimatedHours: 25,
            skills: ["React Native", "JavaScript", "Mobile UI", "Local Storage"],
            personalizedReason: "Matches your interest in mobile app development",
            matchScore: 95
        });
    }
    
    if (isDataScience) {
        projects.push({
            title: "Personal Data Dashboard",
            description: "Build a data visualization dashboard for personal analytics",
            difficulty: "intermediate",
            estimatedHours: 30,
            skills: ["Python", "Data Visualization", "API Integration"],
            personalizedReason: "Perfect for exploring data science concepts",
            matchScore: 88
        });
    }
    
    if (likesProjects) {
        projects.push({
            title: "Interactive Learning Game",
            description: "Create an educational game that teaches programming concepts",
            difficulty: isBeginnerLevel ? "intermediate" : "advanced",
            estimatedHours: 35,
            skills: ["JavaScript", "Game Logic", "UI/UX", "Animation"],
            personalizedReason: "Combines learning with building something fun",
            matchScore: 82
        });
    }
    
    // Ensure we have at least 3 projects
    if (projects.length < 3) {
        projects.push({
            title: "API Integration Project",
            description: "Build a weather app using external APIs and modern frameworks",
            difficulty: "intermediate",
            estimatedHours: 18,
            skills: ["API", "JavaScript", "CSS", "Data Handling"],
            personalizedReason: "Great for learning API integration skills",
            matchScore: 85
        });
    }
    
    return {
        profileSummary: `Welcome back, ${userName}! Based on your onboarding responses, you're ${isBeginnerLevel ? 'starting your coding journey' : 'building on existing skills'} with interests in ${isWebDev ? 'web development' : isMobileDev ? 'mobile apps' : isDataScience ? 'data science' : 'technology'}. Let's create something amazing together!`,
        projectRecommendations: projects.slice(0, 4),
        nextSteps: [
            isBeginnerLevel ? "Set up your development environment" : "Review advanced concepts in your area of interest",
            "Start with your most interesting project",
            mentionedCareer ? "Build projects that showcase employable skills" : "Focus on projects that match your personal interests",
            "Join our community for support and feedback"
        ],
        motivationalMessage: `${userName}, your learning journey is unique and exciting! ${mentionedCareer ? 'These projects will help advance your career goals.' : 'These projects align perfectly with your interests.'} Remember, every expert was once a beginner. You've got this! 🚀`
    };
}
