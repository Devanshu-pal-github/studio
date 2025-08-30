// Database schemas and types for MongoDB collections
// import { ObjectId } from 'mongodb';

// User Collection Schema
export interface User {
  _id?: string;
  email: string;
  name: string;
  password: string; // hashed
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  completedOnboarding: boolean;
  onboardingCompletedAt?: Date;
  
  // Complete profile data from onboarding
  profile?: {
    // Personal Information
    name: string;
    currentRole: string;
    experience: string;
    
    // Technical Information
    techStack: string[];
    programmingExperience: string;
    familiarTechnologies: string[];
    
    // Learning Preferences
    learningStyle: string[];
    preferredResources: string[];
    timeAvailability: string;
    
    // Goals and Motivation
    shortTermGoals: string[];
    longTermGoals: string[];
    motivation: string;
    careerDirection: string;
    
    // Project Preferences
    projectTypes: string[];
    difficultyPreference: string;
    interestAreas: string[];
    
    // Progress Tracking
    completedOnboarding: boolean;
    onboardingCompletedAt?: Date;
    profileVersion: number;
  };
  profileUpdatedAt?: Date;
  
  // Legacy fields for backward compatibility
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  interests?: string[];
  goals?: string[];
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  techStack?: string[];
  
  // Onboarding data
  onboardingHistory?: Array<{
    role: 'user' | 'model';
    content: string;
    timestamp: Date;
  }>;
  learningContext?: {
    goals: string[];
    experienceLevel: string;
    currentProjects: string[];
    completedTasks: string[];
    interests: string[];
    challenges: string[];
  };
  
  // Password reset
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

// User Progress Collection Schema
export interface UserProgress {
  _id?: string;
  userId: string;
  totalPoints: number;
  level: number;
  streak: number;
  activeDays: number;
  completedProjects: string[];
  currentProjects: string[];
  achievements: string[];
  weeklyGoals: {
    targetProjects: number;
    targetPoints: number;
    currentProjects: number;
    currentPoints: number;
  };
  lastActiveDate: Date;
  skillsProgress: { [skill: string]: number };
  weeklyActivity: { [key: string]: number };
  monthlyActivity: { [key: string]: number };
  createdAt: Date;
  updatedAt: Date;
}

// User Activity Collection Schema
export interface UserActivity {
  _id?: string;
  id: string; // custom ID for backwards compatibility
  userId: string;
  type: 'project_start' | 'project_complete' | 'lesson_complete' | 'code_commit' | 'feedback_given' | 'resource_viewed' | 'challenge_attempted';
  timestamp: Date;
  description: string;
  metadata: {
    projectId?: string;
    difficulty?: string;
    duration?: number;
    points?: number;
    githubCommitSha?: string;
    resourceUrl?: string;
    [key: string]: any;
  };
}

// Project Progress Collection Schema
export interface ProjectProgress {
  _id?: string;
  id: string; // custom ID
  userId: string;
  projectId: string;
  status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
  estimatedHours: number;
  actualHours: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
    completedAt?: Date;
    points: number;
  }>;
  currentMilestone: number;
  notes: string;
  tags: string[];
  githubRepo?: string;
  demoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Feedback Collection Schema
export interface UserFeedback {
  _id?: string;
  id: string; // custom ID
  userId: string;
  projectId: string;
  type: 'completion' | 'difficulty' | 'suggestion' | 'bug_report';
  rating: number; // 1-5
  feedback: string;
  tags: string[];
  helpful: boolean;
  timestamp: Date;
  status: 'pending' | 'reviewed' | 'resolved';
}

// AI Recommendations Collection Schema
export interface AIRecommendation {
  _id?: string;
  userId: string;
  type: 'project' | 'learning_path' | 'resource' | 'skill_gap';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  estimatedHours: number;
  skills: string[];
  prerequisites: string[];
  reasons: string[];
  confidence: number; // 0-1
  priority: number; // 1-10
  status: 'active' | 'completed' | 'dismissed';
  createdAt: Date;
  expiresAt?: Date;
}

// Chat History Collection Schema
export interface ChatHistory {
  _id?: string;
  userId: string;
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: {
      context?: string;
      recommendations?: string[];
      codeSnippets?: string[];
    };
  }>;
  context: string; // 'onboarding' | 'general_help' | 'project_guidance' | 'debugging'
  createdAt: Date;
  updatedAt: Date;
}

// Learning Resources Collection Schema
export interface LearningResource {
  _id?: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'tutorial' | 'documentation' | 'course';
  url: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills: string[];
  estimatedTime: number; // in minutes
  rating: number;
  tags: string[];
  createdAt: Date;
  isActive: boolean;
}

// Vector Store Documents Collection Schema
export interface VectorDocument {
  _id?: string;
  userId: string;
  content: string;
  embedding: number[];
  metadata: {
    type: 'profile' | 'chat' | 'project' | 'learning';
    source: string;
    context?: any;
  };
  createdAt: Date;
}

// Collection names constants
export const COLLECTIONS = {
  USERS: 'users',
  USER_PROGRESS: 'userProgress',
  USER_ACTIVITIES: 'activities',
  PROJECT_PROGRESS: 'projectProgress',
  USER_FEEDBACK: 'userFeedback',
  AI_RECOMMENDATIONS: 'aiRecommendations',
  CHAT_HISTORY: 'chatHistory',
  CHAT_CONVERSATIONS: 'chat_conversations',
  LEARNING_RESOURCES: 'learningResources',
  VECTOR_DOCUMENTS: 'vectorDocuments',
  ONBOARDING_HISTORY: 'onboardingHistory',
  ONBOARDING_CONVERSATIONS: 'onboarding_conversations',
  USER_PROJECTS: 'user_projects',
  USER_CONTEXT_VECTORS: 'user_context_vectors',
  USER_AGGREGATED_CONTEXT: 'user_aggregated_context',
  TOKEN_BLACKLIST: 'token_blacklist'
} as const;

// Database indexes to create for optimal performance
export const DATABASE_INDEXES = {
  // Use [spec, options] tuples where options are required
  [COLLECTIONS.USERS]: [
    [{ email: 1 }, { name: 'email_unique', unique: true }],
    [{ resetPasswordToken: 1 }, { name: 'reset_token_idx' }],
    [{ createdAt: -1 }, { name: 'createdAt_desc' }]
  ],
  [COLLECTIONS.USER_PROGRESS]: [
    [{ userId: 1 }, { name: 'user_progress_unique', unique: true }],
    [{ totalPoints: -1 }, { name: 'totalPoints_desc' }],
    [{ level: -1 }, { name: 'level_desc' }]
  ],
  [COLLECTIONS.USER_ACTIVITIES]: [
    [{ userId: 1, timestamp: -1 }, { name: 'user_timestamp_desc' }],
    [{ type: 1 }, { name: 'type_idx' }],
    [{ 'metadata.projectId': 1 }, { name: 'metadata_project_idx' }]
  ],
  [COLLECTIONS.PROJECT_PROGRESS]: [
    [{ userId: 1 }, { name: 'pp_user_idx' }],
    [{ projectId: 1 }, { name: 'pp_project_idx' }],
    [{ status: 1 }, { name: 'pp_status_idx' }],
    [{ startedAt: -1 }, { name: 'pp_startedAt_desc' }]
  ],
  [COLLECTIONS.CHAT_HISTORY]: [
    [{ userId: 1, createdAt: -1 }, { name: 'chat_user_created_desc' }],
    [{ sessionId: 1 }, { name: 'chat_session_idx' }]
  ],
  [COLLECTIONS.CHAT_CONVERSATIONS]: [
    [{ userId: 1, timestamp: -1 }, { name: 'chatconv_user_timestamp_desc' }]
  ],
  [COLLECTIONS.AI_RECOMMENDATIONS]: [
    [{ userId: 1, status: 1 }, { name: 'ai_user_status_idx' }],
    [{ type: 1 }, { name: 'ai_type_idx' }],
    [{ priority: -1 }, { name: 'ai_priority_desc' }]
  ],
  [COLLECTIONS.ONBOARDING_HISTORY]: [
    [{ userId: 1, createdAt: -1 }, { name: 'obh_user_created_desc' }],
    [{ sessionId: 1, index: 1 }, { name: 'obh_session_index' }],
    [{ stage: 1 }, { name: 'obh_stage_idx' }]
  ],
  [COLLECTIONS.ONBOARDING_CONVERSATIONS]: [
    [{ userId: 1, createdAt: -1 }, { name: 'obc_user_created_desc' }],
    [{ 'userProfile.currentStage': 1 }, { name: 'obc_stage_idx' }]
  ]
} as const;

export type CollectionName = keyof typeof COLLECTIONS;
