import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';
import { vectorStore } from '@/lib/vectorStore';
import { DatabaseService } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's onboarding data to build learning context
    const onboardingData = await DatabaseService.getOnboardingData(userId);
    const userProfile = await DatabaseService.getUserProfile(userId);
    const userProjects = await DatabaseService.getUserProjects(userId);

    if (!onboardingData) {
      return NextResponse.json({ error: 'User onboarding data not found' }, { status: 404 });
    }

    // Build learning context from user data
    const learningContext = {
      goals: onboardingData.goals,
      experience: onboardingData.experience,
      learningStyle: onboardingData.learningStyle.join(', '),
      preferences: onboardingData.preferences,
      currentProjects: userProjects.filter(p => p.status === 'in_progress').map(p => p.title),
      completedTasks: userProjects.filter(p => p.status === 'completed').map(p => p.title)
    };

    // Generate personalized recommendations using AI
    const recommendations = await aiService.generatePersonalizedRecommendations(userId, learningContext);

    // Get content from vector store based on user preferences
    const relevantContent = await vectorStore.getPersonalizedRecommendations(learningContext, 8);

    // Log this activity
    await DatabaseService.logActivity(userId, {
      type: 'resource_view',
      description: 'Viewed personalized recommendations',
      metadata: {
        recommendationCount: recommendations.projects.length + recommendations.resources.length,
        context: 'dashboard'
      },
      points: 1
    });

    return NextResponse.json({
      recommendations,
      relevantContent: relevantContent.map(doc => ({
        id: doc.id,
        title: doc.content.split(' ').slice(0, 8).join(' ') + '...',
        content: doc.content,
        type: doc.metadata.type,
        difficulty: doc.metadata.difficulty,
        tags: doc.metadata.tags
      })),
      userContext: {
        level: userProfile?.level || 1,
        points: userProfile?.points || 0,
        completedProjects: userProjects.filter(p => p.status === 'completed').length,
        inProgressProjects: userProjects.filter(p => p.status === 'in_progress').length
      }
    });

  } catch (error) {
    console.error('Recommendations API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate recommendations',
      recommendations: {
        projects: [],
        resources: [],
        nextSteps: []
      },
      relevantContent: []
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const body = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { action, itemId, itemType } = body;

    if (action === 'start_project') {
      // Create a new project for the user
      const projectData = body.projectData;
      const projectId = await DatabaseService.createProject(userId, {
        title: projectData.title,
        description: projectData.description,
        difficulty: projectData.difficulty,
        technologies: projectData.technologies,
        estimatedTime: projectData.estimatedTime,
        resources: [],
        roadmap: [],
        status: 'not_started',
        isRecommended: true
      });

      // Log activity
      await DatabaseService.logActivity(userId, {
        type: 'project_start',
        description: `Started recommended project: ${projectData.title}`,
        metadata: {
          projectId,
          difficulty: projectData.difficulty,
          technologies: projectData.technologies
        },
        points: 5
      });

      return NextResponse.json({ 
        success: true, 
        projectId,
        message: 'Project added to your dashboard!' 
      });
    }

    if (action === 'bookmark_resource') {
      // Add resource to user's bookmarks (could be a separate collection)
      const resourceData = body.resourceData;
      
      // Log activity
      await DatabaseService.logActivity(userId, {
        type: 'resource_view',
        description: `Bookmarked resource: ${resourceData.title}`,
        metadata: {
          resourceUrl: resourceData.url,
          resourceType: resourceData.type
        },
        points: 1
      });

      return NextResponse.json({ 
        success: true,
        message: 'Resource bookmarked!' 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Recommendations Action API Error:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}
