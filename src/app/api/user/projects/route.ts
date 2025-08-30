import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { COLLECTIONS } from '@/lib/database/schemas';

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
        
        // Get user's learning context and onboarding data
    const user = await db.collection(COLLECTIONS.USERS).findOne({ _id: userObjectId });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.completedOnboarding || !user.learningContext) {
            return NextResponse.json({ error: 'Please complete onboarding first to get personalized projects' }, { status: 400 });
        }

        // Check if we already have generated projects for this user
    const existingProjects = await db.collection(COLLECTIONS.USER_PROJECTS).find({ userId: decoded.userId }).toArray();

        if (existingProjects.length > 0) {
            return NextResponse.json({
                success: true,
                projects: existingProjects.map(project => ({
                    ...project,
                    _id: project._id.toString()
                }))
            });
        }

        try {
            // Generate personalized projects using AI based on learning context
            const projectsData = await generatePersonalizedProjects(user.learningContext, user.onboardingHistory);
            
            // Save generated projects to database
            const projectsWithMetadata = projectsData.map((project: any) => ({
                ...project,
                userId: decoded.userId,
                status: 'not_started',
                progress: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            }));

            const insertResult = await db.collection(COLLECTIONS.USER_PROJECTS).insertMany(projectsWithMetadata);
            
            return NextResponse.json({
                success: true,
                projects: projectsWithMetadata.map((project, index) => ({
                    ...project,
                    _id: insertResult.insertedIds[index].toString()
                }))
            });

        } catch (aiError) {
            console.error('AI project generation failed, using fallback:', aiError);
            
            // Fallback projects based on user's experience level
            const fallbackProjects = generateFallbackProjects(user.learningContext);
            
            const projectsWithMetadata = fallbackProjects.map((project: any) => ({
                ...project,
                userId: decoded.userId,
                status: 'not_started',
                progress: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            }));

            const insertResult = await db.collection(COLLECTIONS.USER_PROJECTS).insertMany(projectsWithMetadata);
            
            return NextResponse.json({
                success: true,
                projects: projectsWithMetadata.map((project, index) => ({
                    ...project,
                    _id: insertResult.insertedIds[index].toString()
                }))
            });
        }

    } catch (error: any) {
        console.error("Projects API Error:", error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}

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

        const { projectId, estimatedHours, status } = await req.json();

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const db = await connectToDatabase();
        
        // Convert userId to ObjectId if it's a string
        const userObjectId = typeof decoded.userId === 'string' ? new ObjectId(decoded.userId) : decoded.userId;
        
        // Check if project already exists for user
    const existingProject = await db.collection(COLLECTIONS.USER_PROJECTS).findOne({ 
            userId: decoded.userId, 
            _id: new ObjectId(projectId) 
        });

        if (existingProject) {
            // Update existing project status
            const updateResult = await db.collection(COLLECTIONS.USER_PROJECTS).updateOne(
                { _id: new ObjectId(projectId), userId: decoded.userId },
                { 
                    $set: { 
                        status: status || 'in_progress',
                        startedAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            );

            if (updateResult.matchedCount === 0) {
                return NextResponse.json({ error: 'Project not found' }, { status: 404 });
            }
        } else {
            // Get project details from recommendations or create new project
            const projectData = {
                _id: new ObjectId(projectId),
                userId: decoded.userId,
                title: `Project ${projectId}`,
                description: 'Started from recommendations',
                status: status || 'in_progress',
                progress: 0,
                estimatedHours: estimatedHours || 20,
                actualHours: 0,
                technologies: [],
                learningGoals: [],
                milestones: [],
                challenges: [],
                learnings: [],
                createdAt: new Date(),
                startedAt: new Date(),
                updatedAt: new Date()
            };

            await db.collection(COLLECTIONS.USER_PROJECTS).insertOne(projectData);
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Project started successfully',
            projectId 
        });

    } catch (error) {
        console.error('Error starting project:', error);
        return NextResponse.json({ 
            error: 'Failed to start project',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

async function generatePersonalizedProjects(learningContext: any, onboardingHistory: any) {
    // This would use AI to generate projects - for now using fallback
    return generateFallbackProjects(learningContext);
}

function generateFallbackProjects(learningContext: any) {
    const experience = learningContext?.experience?.toLowerCase() || 'beginner';
    const goals = learningContext?.goals || [];
    
    const baseProjects = [
        {
            title: "Personal Portfolio Website",
            description: "Build a responsive portfolio website to showcase your skills and projects.",
            difficulty: "beginner",
            estimatedHours: 15,
            technologies: ["HTML", "CSS", "JavaScript"],
            learningGoals: ["Responsive Design", "Git/GitHub", "Web Deployment"],
            milestones: [
                "Set up project structure",
                "Create HTML content",
                "Style with CSS",
                "Add JavaScript interactions",
                "Deploy to web"
            ]
        },
        {
            title: "Task Management App",
            description: "Create a dynamic to-do list application with local storage.",
            difficulty: "intermediate",
            estimatedHours: 25,
            technologies: ["JavaScript", "Local Storage", "CSS"],
            learningGoals: ["DOM Manipulation", "Event Handling", "Data Persistence"],
            milestones: [
                "Design UI mockups",
                "Build basic HTML structure",
                "Implement add/remove tasks",
                "Add local storage",
                "Style and polish"
            ]
        },
        {
            title: "Weather Dashboard",
            description: "Build a weather app that fetches data from an API and displays forecasts.",
            difficulty: "intermediate",
            estimatedHours: 20,
            technologies: ["JavaScript", "APIs", "JSON"],
            learningGoals: ["API Integration", "Async Programming", "Data Visualization"],
            milestones: [
                "Get API key and understand documentation",
                "Create basic UI",
                "Implement API calls",
                "Display weather data",
                "Add location search"
            ]
        }
    ];

    // Filter and customize based on learning context
    let selectedProjects = baseProjects;
    
    if (experience.includes('beginner')) {
        selectedProjects = baseProjects.filter(p => p.difficulty === 'beginner' || p.difficulty === 'intermediate').slice(0, 3);
    } else if (experience.includes('advanced')) {
        selectedProjects = baseProjects.filter(p => p.difficulty === 'intermediate' || p.difficulty === 'advanced');
    }

    return selectedProjects;
}
