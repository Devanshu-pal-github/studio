// lib/aiRecommendationEngine.ts - Dynamic AI-powered recommendations
import { connectToDatabase } from './mongodb';
import { UserProgress, UserActivity } from './activityTracker';

export interface ProjectRecommendation {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  estimatedHours: number;
  skills: string[];
  technologies: string[];
  personalizedReason: string;
  matchScore: number;
  prerequisites: string[];
  learningOutcomes: string[];
  githubRepo?: string;
  demoUrl?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  totalProjects: number;
  estimatedWeeks: number;
  projects: ProjectRecommendation[];
  adaptiveNotes: string[];
}

export interface UserFeedback {
  userId: string;
  projectId: string;
  rating: number; // 1-5
  difficulty: 'too_easy' | 'just_right' | 'too_hard';
  engagement: 'boring' | 'okay' | 'engaging' | 'very_engaging';
  timeSpent: number; // in minutes
  completionStatus: 'completed' | 'abandoned' | 'paused';
  comments: string;
  timestamp: Date;
}

export class AIRecommendationEngine {
  private userProfile: any;
  private userProgress: UserProgress | null = null;
  private userActivities: UserActivity[] = [];
  private feedbackHistory: UserFeedback[] = [];

  async initializeForUser(userId: string) {
    // Load user profile
    const profileDoc = await getDoc(doc(db, 'users', userId));
    this.userProfile = profileDoc.exists() ? profileDoc.data() : null;

    // Load user progress
    const progressDoc = await getDoc(doc(db, 'userProgress', userId));
    this.userProgress = progressDoc.exists() ? progressDoc.data() as UserProgress : null;

    // Load recent activities
    const activitiesQuery = query(
      collection(db, 'activities'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    const activitiesSnapshot = await getDocs(activitiesQuery);
    this.userActivities = activitiesSnapshot.docs.map(doc => doc.data() as UserActivity);

    // Load feedback history
    const feedbackQuery = query(
      collection(db, 'userFeedback'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const feedbackSnapshot = await getDocs(feedbackQuery);
    this.feedbackHistory = feedbackSnapshot.docs.map(doc => doc.data() as UserFeedback);
  }

  async generateProjectRecommendations(count: number = 5): Promise<ProjectRecommendation[]> {
    // Analyze user patterns and preferences (works with or without profile)
    const userContext = this.analyzeUserContext();
    
    // Get base project pool
    const projectPool = await this.getProjectPool();
    
    // Score and rank projects
    const scoredProjects = projectPool.map(project => ({
      ...project,
      matchScore: this.calculateMatchScore(project, userContext),
      personalizedReason: this.generatePersonalizedReason(project, userContext),
    }));

    // Sort by match score and return top recommendations
    return scoredProjects
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, count);
  }

  async generateLearningPath(): Promise<LearningPath> {
    const recommendations = await this.generateProjectRecommendations(10);
    const userContext = this.analyzeUserContext();

    // Group projects into a coherent learning path
    const pathProjects = this.organizeLearningPath(recommendations, userContext);
    
    return {
      id: `path_${Date.now()}`,
      title: this.generatePathTitle(userContext),
      description: this.generatePathDescription(userContext),
      totalProjects: pathProjects.length,
      estimatedWeeks: Math.ceil(pathProjects.reduce((sum, p) => sum + p.estimatedHours, 0) / (userContext.weeklyHours || 10)),
      projects: pathProjects,
      adaptiveNotes: this.generateAdaptiveNotes(userContext),
    };
  }

  async processFeedback(feedback: UserFeedback) {
    // Store feedback
    await doc(db, 'userFeedback', `${feedback.userId}_${feedback.projectId}_${Date.now()}`);
    
    // Update internal feedback history
    this.feedbackHistory.unshift(feedback);
    
    // Adjust future recommendations based on feedback
    this.adaptToFeedback(feedback);
  }

  private analyzeUserContext() {
    const context = {
      experienceLevel: this.userProfile?.experienceLevel || 'beginner',
      interests: this.userProfile?.interests || [],
      goals: this.userProfile?.goals || [],
      learningStyle: this.userProfile?.learningStyle || 'balanced',
      techStack: this.userProfile?.techStack || [],
      weeklyHours: this.userProgress?.weeklyActivity ? 
        Object.values(this.userProgress.weeklyActivity).reduce((sum: number, val: any) => sum + val, 0) : 10,
      preferredDifficulty: this.inferPreferredDifficulty(),
      recentFocus: this.inferRecentFocus(),
      skillGaps: this.identifySkillGaps(),
      engagementPatterns: this.analyzeEngagementPatterns(),
    };

    return context;
  }

  private calculateMatchScore(project: ProjectRecommendation, context: any): number {
    let score = 0;

    // Interest alignment (30%)
    const interestMatch = project.skills.filter(skill => 
      context.interests.some((interest: string) => 
        interest.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(interest.toLowerCase())
      )
    ).length / project.skills.length;
    score += interestMatch * 30;

    // Skill level alignment (25%)
    const difficultyMap = { easy: 1, medium: 2, hard: 3, expert: 4 };
    const userLevel = this.mapExperienceToLevel(context.experienceLevel);
    const projectLevel = difficultyMap[project.difficulty];
    const levelDiff = Math.abs(userLevel - projectLevel);
    const levelScore = Math.max(0, 1 - (levelDiff * 0.3));
    score += levelScore * 25;

    // Technology stack alignment (20%)
    const techMatch = project.technologies.filter(tech => 
      context.techStack.includes(tech)
    ).length / project.technologies.length;
    score += techMatch * 20;

    // Goal alignment (15%)
    const goalMatch = context.goals.filter((goal: string) => 
      project.learningOutcomes.some(outcome => 
        outcome.toLowerCase().includes(goal.toLowerCase())
      )
    ).length / Math.max(context.goals.length, 1);
    score += goalMatch * 15;

    // Recent feedback influence (10%)
    const feedbackAdjustment = this.calculateFeedbackAdjustment(project);
    score += feedbackAdjustment * 10;

    return Math.min(100, Math.max(0, score));
  }

  private inferPreferredDifficulty(): string {
    if (this.feedbackHistory.length === 0) return 'medium';
    
    const recentFeedback = this.feedbackHistory.slice(0, 10);
    const difficultyRatings = recentFeedback.map(f => f.difficulty);
    
    const justRightCount = difficultyRatings.filter(d => d === 'just_right').length;
    const tooEasyCount = difficultyRatings.filter(d => d === 'too_easy').length;
    const tooHardCount = difficultyRatings.filter(d => d === 'too_hard').length;
    
    if (tooEasyCount > justRightCount && tooEasyCount > tooHardCount) {
      return 'increase';
    } else if (tooHardCount > justRightCount && tooHardCount > tooEasyCount) {
      return 'decrease';
    }
    return 'maintain';
  }

  private inferRecentFocus(): string[] {
    const recentActivities = this.userActivities.slice(0, 20);
    const projectTypes = recentActivities
      .filter(a => a.metadata.projectId)
      .map(a => a.metadata.projectType || 'general');
    
    // Count frequency and return top 3
    const frequency: { [key: string]: number } = {};
    projectTypes.forEach(type => {
      frequency[type] = (frequency[type] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);
  }

  private identifySkillGaps(): string[] {
    // This would analyze user's stated goals vs completed projects
    // and identify missing skills needed for their career path
    const targetSkills = this.userProfile?.goals || [];
    const currentSkills = this.userProfile?.techStack || [];
    
    return targetSkills.filter((skill: string) => !currentSkills.includes(skill));
  }

  private analyzeEngagementPatterns() {
    if (this.feedbackHistory.length === 0) return { avgRating: 3, preferredLength: 'medium' };
    
    const avgRating = this.feedbackHistory.reduce((sum, f) => sum + f.rating, 0) / this.feedbackHistory.length;
    const avgTimeSpent = this.feedbackHistory.reduce((sum, f) => sum + f.timeSpent, 0) / this.feedbackHistory.length;
    
    return {
      avgRating,
      preferredLength: avgTimeSpent > 180 ? 'long' : avgTimeSpent < 60 ? 'short' : 'medium',
    };
  }

  private mapExperienceToLevel(experience: string): number {
    const levelMap: { [key: string]: number } = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3,
      'expert': 4,
    };
    return levelMap[experience] || 2;
  }

  private calculateFeedbackAdjustment(project: ProjectRecommendation): number {
    // Analyze feedback for similar projects and adjust score
    const similarFeedback = this.feedbackHistory.filter(f => 
      f.rating >= 4 && // High-rated projects
      project.skills.some(skill => 
        f.comments.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    return similarFeedback.length > 0 ? 1 : 0;
  }

  private generatePersonalizedReason(project: ProjectRecommendation, context: any): string {
    const reasons = [];
    
    if (project.skills.some(skill => context.interests.includes(skill))) {
      reasons.push("matches your interests");
    }
    
    if (context.skillGaps.some((gap: string) => project.skills.includes(gap))) {
      reasons.push("helps bridge your skill gaps");
    }
    
    if (project.difficulty === 'medium' && context.preferredDifficulty === 'maintain') {
      reasons.push("perfect difficulty level for you");
    }
    
    return reasons.length > 0 ? 
      `Recommended because it ${reasons.join(", ")}.` :
      "A great fit for your current learning path.";
  }

  private organizeLearningPath(projects: ProjectRecommendation[], context: any): ProjectRecommendation[] {
    // Sort projects by difficulty and dependencies
    return projects.sort((a, b) => {
      const difficultyOrder = { easy: 1, medium: 2, hard: 3, expert: 4 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });
  }

  private generatePathTitle(context: any): string {
    const focus = context.recentFocus[0] || 'full-stack';
    const level = context.experienceLevel;
    return `${level.charAt(0).toUpperCase() + level.slice(1)} ${focus} Mastery Path`;
  }

  private generatePathDescription(context: any): string {
    return `A personalized learning journey crafted based on your ${context.experienceLevel} level, focusing on ${context.interests.slice(0, 2).join(' and ')} to help you achieve your goals.`;
  }

  private generateAdaptiveNotes(context: any): string[] {
    const notes = [];
    
    if (context.weeklyHours < 5) {
      notes.push("💡 Consider increasing study time to 5-10 hours per week for optimal progress");
    }
    
    if (context.preferredDifficulty === 'increase') {
      notes.push("🚀 You're ready for more challenging projects - we've adjusted the difficulty accordingly");
    }
    
    if (context.skillGaps.length > 0) {
      notes.push(`🎯 Focus areas: ${context.skillGaps.slice(0, 3).join(', ')}`);
    }
    
    return notes;
  }

  private adaptToFeedback(feedback: UserFeedback) {
    // This method would update internal algorithms based on user feedback
    // For now, it's a placeholder for the adaptive learning logic
    console.log('Adapting to feedback:', feedback);
  }

  private async getProjectPool(): Promise<ProjectRecommendation[]> {
    // This would typically fetch from a database of projects
    // For now, return sample projects
    return [
      {
        id: 'react-todo',
        title: 'Dynamic Todo Application',
        description: 'Build a feature-rich todo app with real-time updates',
        difficulty: 'medium',
        estimatedHours: 15,
        skills: ['React', 'State Management', 'UI/UX'],
        technologies: ['React', 'TypeScript', 'CSS'],
        personalizedReason: '',
        matchScore: 0,
        prerequisites: ['Basic JavaScript', 'HTML/CSS'],
        learningOutcomes: ['Component Architecture', 'State Management', 'Event Handling'],
        githubRepo: 'https://github.com/example/react-todo',
      },
      {
        id: 'node-api',
        title: 'RESTful API with Authentication',
        description: 'Create a secure API with JWT authentication',
        difficulty: 'hard',
        estimatedHours: 25,
        skills: ['Node.js', 'Express', 'Authentication'],
        technologies: ['Node.js', 'Express', 'MongoDB', 'JWT'],
        personalizedReason: '',
        matchScore: 0,
        prerequisites: ['JavaScript', 'HTTP basics'],
        learningOutcomes: ['API Design', 'Security', 'Database Integration'],
      },
      {
        id: 'portfolio-website',
        title: 'Interactive Portfolio Website',
        description: 'Create a stunning personal portfolio with animations and responsive design',
        difficulty: 'easy',
        estimatedHours: 12,
        skills: ['HTML', 'CSS', 'JavaScript', 'Design'],
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'GSAP'],
        personalizedReason: '',
        matchScore: 0,
        prerequisites: ['Basic HTML/CSS'],
        learningOutcomes: ['Responsive Design', 'Animations', 'Portfolio Building'],
        githubRepo: 'https://github.com/example/portfolio',
      },
      {
        id: 'expense-tracker',
        title: 'Personal Expense Tracker',
        description: 'Build a financial management app with charts and budgeting features',
        difficulty: 'medium',
        estimatedHours: 20,
        skills: ['React', 'Data Visualization', 'LocalStorage'],
        technologies: ['React', 'Chart.js', 'CSS'],
        personalizedReason: '',
        matchScore: 0,
        prerequisites: ['JavaScript', 'React basics'],
        learningOutcomes: ['Data Management', 'Charts & Graphs', 'User Interface Design'],
        githubRepo: 'https://github.com/example/expense-tracker',
      },
      {
        id: 'chat-app',
        title: 'Real-time Chat Application',
        description: 'Develop a messaging app with real-time communication and user presence',
        difficulty: 'hard',
        estimatedHours: 30,
        skills: ['WebSockets', 'Real-time', 'Full-stack'],
        technologies: ['Socket.io', 'React', 'Node.js', 'MongoDB'],
        personalizedReason: '',
        matchScore: 0,
        prerequisites: ['React', 'Node.js', 'Database basics'],
        learningOutcomes: ['Real-time Communication', 'WebSockets', 'System Architecture'],
        githubRepo: 'https://github.com/example/chat-app',
      },
      {
        id: 'weather-dashboard',
        title: 'Weather Analytics Dashboard',
        description: 'Create a comprehensive weather app with forecasts and historical data',
        difficulty: 'easy',
        estimatedHours: 10,
        skills: ['API Integration', 'Data Display', 'JavaScript'],
        technologies: ['JavaScript', 'Weather API', 'CSS Grid'],
        personalizedReason: '',
        matchScore: 0,
        prerequisites: ['Basic JavaScript'],
        learningOutcomes: ['API Integration', 'Async Programming', 'Data Presentation'],
        githubRepo: 'https://github.com/example/weather-dashboard',
      },
      {
        id: 'e-commerce-cart',
        title: 'E-commerce Shopping Cart',
        description: 'Build a complete shopping cart system with payment integration',
        difficulty: 'hard',
        estimatedHours: 35,
        skills: ['E-commerce', 'Payment Processing', 'State Management'],
        technologies: ['React', 'Stripe API', 'Redux', 'Node.js'],
        personalizedReason: '',
        matchScore: 0,
        prerequisites: ['React', 'State Management'],
        learningOutcomes: ['E-commerce Logic', 'Payment Integration', 'Complex State Management'],
        githubRepo: 'https://github.com/example/ecommerce-cart',
      }
    ];
  }
}

export const aiRecommendationEngine = new AIRecommendationEngine();
