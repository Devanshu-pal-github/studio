// lib/projectTracker.ts - Project progress and feedback tracking
import { connectToDatabase } from './mongodb';
import { activityTracker } from './activityTracker';

export interface ProjectProgress {
  id: string;
  userId: string;
  projectId: string;
  status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'abandoned';
  startDate: Date;
  completionDate?: Date;
  estimatedHours: number;
  actualHours: number;
  progressPercentage: number;
  milestones: ProjectMilestone[];
  challenges: ProjectChallenge[];
  learnings: string[];
  codeRepository?: string;
  demoUrl?: string;
  notes: string;
  aiRecommendations: string[];
  nextSteps: string[];
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
  estimatedHours: number;
  actualHours: number;
  difficulty: 'easy' | 'medium' | 'hard';
  skills: string[];
}

export interface ProjectChallenge {
  id: string;
  description: string;
  solution?: string;
  timeSpentHours: number;
  helpSource: 'self' | 'documentation' | 'ai_assistant' | 'community' | 'mentor';
  resolvedAt?: Date;
  learningOutcome: string;
}

export interface UserFeedback {
  id: string;
  userId: string;
  projectId: string;
  type: 'progress_update' | 'difficulty_rating' | 'engagement_rating' | 'completion_feedback' | 'suggestion';
  rating?: number; // 1-5 scale
  feedback: string;
  timestamp: Date;
  context: {
    currentMilestone?: string;
    timeSpent?: number;
    strugglingArea?: string;
    preferredNextTopic?: string;
  };
}

export class ProjectTracker {  async startProject(user: { _id: string } | null, projectId: string, estimatedHours: number): Promise<ProjectProgress> {
    if (!user || !user._id) throw new Error('User must be authenticated to start a project.');

    const userId = user._id;
    const progressId = `${userId}_${projectId}`;
    
    const projectProgress: ProjectProgress = {
      id: progressId,
      userId,
      projectId,
      status: 'in_progress',
      startDate: new Date(),
      estimatedHours,
      actualHours: 0,
      progressPercentage: 0,
      milestones: [],
      challenges: [],
      learnings: [],
      notes: '',
      aiRecommendations: [
        'Start with the core functionality first',
        'Set up your development environment properly',
        'Break down the project into smaller tasks',
        'Don\'t forget to commit your code regularly'
      ],
      nextSteps: [
        'Set up project structure',
        'Install necessary dependencies',
        'Create basic components/files',
        'Implement core functionality'
      ]
    };

    await setDoc(doc(db, 'projectProgress', progressId), projectProgress);
    
    // Log activity
    await activityTracker.logActivity(user, {
      type: 'project_start',
      description: `Started project: ${projectId}`,
      metadata: { projectId, estimatedHours }
    });

    return projectProgress;
  }

  async updateProgress(progressId: string, updates: Partial<ProjectProgress>): Promise<void> {
    const progressRef = doc(db, 'projectProgress', progressId);
    await updateDoc(progressRef, {
      ...updates,
      lastUpdated: new Date()
    });
  }

  async addMilestone(progressId: string, milestone: Omit<ProjectMilestone, 'id'>): Promise<void> {
    const milestoneWithId: ProjectMilestone = {
      ...milestone,
      id: `milestone_${Date.now()}`
    };

    const progressRef = doc(db, 'projectProgress', progressId);
    await updateDoc(progressRef, {
      milestones: arrayUnion(milestoneWithId)
    });
  }

  async completeMilestone(progressId: string, milestoneId: string, actualHours: number): Promise<void> {
    const progressDoc = await getDoc(doc(db, 'projectProgress', progressId));
    if (!progressDoc.exists()) return;

    const progress = progressDoc.data() as ProjectProgress;
    const updatedMilestones = progress.milestones.map(milestone => 
      milestone.id === milestoneId 
        ? { ...milestone, completed: true, completedAt: new Date(), actualHours }
        : milestone
    );

    const completedMilestones = updatedMilestones.filter(m => m.completed).length;
    const progressPercentage = (completedMilestones / updatedMilestones.length) * 100;
    const totalActualHours = progress.actualHours + actualHours;

    await updateDoc(doc(db, 'projectProgress', progressId), {
      milestones: updatedMilestones,
      progressPercentage,
      actualHours: totalActualHours
    });

    // Log milestone completion
    await activityTracker.logActivity({ _id: progress.userId }, {
      type: 'lesson_complete',
      description: `Completed milestone: ${milestoneId}`,
      metadata: { 
        projectId: progress.projectId, 
        milestoneId,
        hoursSpent: actualHours
      }
    });
  }

  async addChallenge(progressId: string, challenge: Omit<ProjectChallenge, 'id'>): Promise<void> {
    const challengeWithId: ProjectChallenge = {
      ...challenge,
      id: `challenge_${Date.now()}`
    };

    const progressRef = doc(db, 'projectProgress', progressId);
    await updateDoc(progressRef, {
      challenges: arrayUnion(challengeWithId)
    });
  }

  async resolveChallenge(progressId: string, challengeId: string, solution: string, learningOutcome: string): Promise<void> {
    const progressDoc = await getDoc(doc(db, 'projectProgress', progressId));
    if (!progressDoc.exists()) return;

    const progress = progressDoc.data() as ProjectProgress;
    const updatedChallenges = progress.challenges.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, solution, learningOutcome, resolvedAt: new Date() }
        : challenge
    );

    await updateDoc(doc(db, 'projectProgress', progressId), {
      challenges: updatedChallenges,
      learnings: arrayUnion(learningOutcome)
    });
  }

  async completeProject(progressId: string, feedback: string): Promise<void> {
    const progressRef = doc(db, 'projectProgress', progressId);
    const progressDoc = await getDoc(progressRef);
    
    if (!progressDoc.exists()) return;
    
    const progress = progressDoc.data() as ProjectProgress;
    
    await updateDoc(progressRef, {
      status: 'completed',
      completionDate: new Date(),
      progressPercentage: 100,
      notes: feedback
    });

    // Log project completion
    await activityTracker.logActivity({ _id: progress.userId }, {
      type: 'project_complete',
      description: `Completed project: ${progress.projectId}`,
      metadata: { 
        projectId: progress.projectId,
        totalHours: progress.actualHours,
        milestonesCompleted: progress.milestones.filter(m => m.completed).length
      }
    });
  }

  async submitFeedback(feedback: Omit<UserFeedback, 'id' | 'timestamp'>): Promise<void> {
    const feedbackId = `feedback_${Date.now()}`;
    const feedbackData: UserFeedback = {
      ...feedback,
      id: feedbackId,
      timestamp: new Date()
    };

    await setDoc(doc(db, 'userFeedback', feedbackId), feedbackData);

    // Log feedback activity
    await activityTracker.logActivity({ _id: feedback.userId }, {
      type: 'feedback_given',
      description: `Provided ${feedback.type} feedback`,
      metadata: { 
        projectId: feedback.projectId,
        feedbackType: feedback.type,
        rating: feedback.rating
      }
    });
  }

  async getProjectProgress(userId: string, projectId: string): Promise<ProjectProgress | null> {
    const progressId = `${userId}_${projectId}`;
    const progressDoc = await getDoc(doc(db, 'projectProgress', progressId));
    
    return progressDoc.exists() ? progressDoc.data() as ProjectProgress : null;
  }

  async getUserProjects(userId: string): Promise<ProjectProgress[]> {
    const projectsQuery = query(
      collection(db, 'projectProgress'),
      where('userId', '==', userId),
      orderBy('startDate', 'desc')
    );

    const projectsSnapshot = await getDocs(projectsQuery);
    return projectsSnapshot.docs.map(doc => doc.data() as ProjectProgress);
  }

  async getUserFeedback(userId: string, projectId?: string): Promise<UserFeedback[]> {
    let feedbackQuery = query(
      collection(db, 'userFeedback'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    if (projectId) {
      feedbackQuery = query(
        collection(db, 'userFeedback'),
        where('userId', '==', userId),
        where('projectId', '==', projectId),
        orderBy('timestamp', 'desc')
      );
    }

    const feedbackSnapshot = await getDocs(feedbackQuery);
    return feedbackSnapshot.docs.map(doc => doc.data() as UserFeedback);
  }

  async generateAIRecommendations(userId: string, projectId: string): Promise<string[]> {
    // This would integrate with the AI recommendation engine
    // For now, we'll return context-aware suggestions
    
    const progress = await this.getProjectProgress(userId, projectId);
    if (!progress) return [];

    const recommendations = [];

    // Based on progress percentage
    if (progress.progressPercentage < 25) {
      recommendations.push('Focus on setting up the project foundation properly');
      recommendations.push('Break down large tasks into smaller, manageable pieces');
    } else if (progress.progressPercentage < 50) {
      recommendations.push('Consider implementing core features before adding extras');
      recommendations.push('Start thinking about error handling and edge cases');
    } else if (progress.progressPercentage < 75) {
      recommendations.push('Add proper testing to ensure code quality');
      recommendations.push('Begin planning for deployment and documentation');
    } else {
      recommendations.push('Polish the user interface and user experience');
      recommendations.push('Prepare for deployment and sharing your project');
    }

    // Based on challenges
    if (progress.challenges.length > 0) {
      const unresolvedChallenges = progress.challenges.filter(c => !c.resolvedAt);
      if (unresolvedChallenges.length > 0) {
        recommendations.push('Consider seeking help for persistent challenges');
        recommendations.push('Try a different approach if you\'re stuck for too long');
      }
    }

    // Based on time spent
    if (progress.actualHours > progress.estimatedHours * 1.5) {
      recommendations.push('Consider simplifying the scope to meet your timeline');
      recommendations.push('Focus on MVP (Minimum Viable Product) features first');
    }

    return recommendations;
  }

  async generateNextSteps(userId: string, projectId: string): Promise<string[]> {
    const progress = await this.getProjectProgress(userId, projectId);
    if (!progress) return [];

    const nextSteps = [];
    const incompleteMilestones = progress.milestones.filter(m => !m.completed);
    
    if (incompleteMilestones.length > 0) {
      const nextMilestone = incompleteMilestones[0];
      nextSteps.push(`Complete milestone: ${nextMilestone.title}`);
      nextSteps.push(`Estimated time: ${nextMilestone.estimatedHours} hours`);
    }

    if (progress.challenges.some(c => !c.resolvedAt)) {
      nextSteps.push('Resolve pending challenges or ask for help');
    }

    if (progress.progressPercentage > 80) {
      nextSteps.push('Prepare project documentation');
      nextSteps.push('Test all functionality thoroughly');
      nextSteps.push('Consider deployment options');
    }

    return nextSteps;
  }
}

export const projectTracker = new ProjectTracker();
