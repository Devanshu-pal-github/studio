import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp,
  DocumentData 
} from 'firebase/firestore';

// Database Collections Schema
export const COLLECTIONS = {
  USERS: 'users',
  USER_PROFILES: 'user_profiles',
  ONBOARDING_DATA: 'onboarding_data',
  LEARNING_PATHS: 'learning_paths',
  USER_ACTIVITIES: 'user_activities',
  PROJECTS: 'projects',
  AI_CONVERSATIONS: 'ai_conversations',
  PROGRESS_TRACKING: 'progress_tracking',
  RECOMMENDATIONS: 'recommendations',
  USER_PREFERENCES: 'user_preferences'
} as const;

// Type definitions for database documents
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  completedOnboarding: boolean;
  level: number;
  points: number;
  streak: number;
}

export interface OnboardingData {
  uid: string;
  responses: {
    question: string;
    answer: string;
    timestamp: Timestamp;
  }[];
  goals: string[];
  experience: string;
  learningStyle: string[];
  preferences: string[];
  challenges: string[];
  timeCommitment: string;
  completedAt: Timestamp;
  personalizedRoadmap?: string;
}

export interface LearningPath {
  id: string;
  uid: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  skills: string[];
  roadmap: {
    step: number;
    title: string;
    description: string;
    resources: string[];
    completed: boolean;
    completedAt?: Timestamp;
  }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface UserActivity {
  id: string;
  uid: string;
  type: 'login' | 'onboarding' | 'project_start' | 'project_complete' | 'lesson_complete' | 'ai_chat' | 'resource_view';
  description: string;
  metadata: Record<string, any>;
  timestamp: Timestamp;
  points: number;
}

export interface Project {
  id: string;
  uid: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  technologies: string[];
  estimatedTime: string;
  resources: {
    type: 'tutorial' | 'documentation' | 'video' | 'article';
    title: string;
    url: string;
    description?: string;
  }[];
  roadmap: {
    phase: number;
    title: string;
    tasks: {
      id: string;
      title: string;
      description: string;
      completed: boolean;
      completedAt?: Timestamp;
    }[];
  }[];
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  isRecommended: boolean;
  codeEnvironment?: {
    type: 'replit' | 'codesandbox' | 'stackblitz';
    url: string;
    template: string;
  };
}

export interface AIConversation {
  id: string;
  uid: string;
  type: 'onboarding' | 'mentor' | 'project_help' | 'general';
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Timestamp;
  }[];
  context: {
    currentProject?: string;
    learningGoals: string[];
    userLevel: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface ProgressTracking {
  uid: string;
  totalPoints: number;
  level: number;
  streak: number;
  lastActivityDate: Timestamp;
  completedProjects: number;
  totalLearningTime: number; // in minutes
  skillsAcquired: string[];
  badges: {
    id: string;
    name: string;
    description: string;
    earnedAt: Timestamp;
  }[];
  monthlyProgress: {
    month: string; // YYYY-MM
    pointsEarned: number;
    timeSpent: number;
    projectsCompleted: number;
  }[];
}

export interface UserPreferences {
  uid: string;
  notifications: {
    dailyReminders: boolean;
    weeklyProgress: boolean;
    projectDeadlines: boolean;
    aiMentorTips: boolean;
  };
  learning: {
    preferredTimeSlots: string[];
    difficultyPreference: 'easy' | 'balanced' | 'challenging';
    contentTypes: ('video' | 'text' | 'interactive' | 'project')[];
  };
  dashboard: {
    layout: 'compact' | 'detailed';
    showRecommendations: boolean;
    showProgress: boolean;
    showActivity: boolean;
  };
  updatedAt: Timestamp;
}

// Database service class
export class DatabaseService {
  
  // User Profile Management
  static async createUserProfile(uid: string, userData: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const profileData: UserProfile = {
      uid,
      displayName: userData.displayName || '',
      email: userData.email || '',
      photoURL: userData.photoURL,
      createdAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      completedOnboarding: false,
      level: 1,
      points: 0,
      streak: 0,
      ...userData
    };
    
    await setDoc(userRef, profileData);
  }

  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() as UserProfile : null;
  }

  static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(userRef, { ...updates, lastLoginAt: Timestamp.now() });
  }

  // Onboarding Data Management
  static async saveOnboardingData(uid: string, data: Omit<OnboardingData, 'uid'>): Promise<void> {
    const onboardingRef = doc(db, COLLECTIONS.ONBOARDING_DATA, uid);
    await setDoc(onboardingRef, { uid, ...data });
    
    // Mark onboarding as completed
    await this.updateUserProfile(uid, { completedOnboarding: true });
  }

  static async getOnboardingData(uid: string): Promise<OnboardingData | null> {
    const onboardingRef = doc(db, COLLECTIONS.ONBOARDING_DATA, uid);
    const onboardingSnap = await getDoc(onboardingRef);
    return onboardingSnap.exists() ? onboardingSnap.data() as OnboardingData : null;
  }

  // Learning Paths Management
  static async createLearningPath(uid: string, pathData: Omit<LearningPath, 'id' | 'uid' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const pathsRef = collection(db, COLLECTIONS.LEARNING_PATHS);
    const docRef = await addDoc(pathsRef, {
      uid,
      ...pathData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  static async getUserLearningPaths(uid: string): Promise<LearningPath[]> {
    const pathsRef = collection(db, COLLECTIONS.LEARNING_PATHS);
    const q = query(pathsRef, where('uid', '==', uid), where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LearningPath));
  }

  // Activity Tracking
  static async logActivity(uid: string, activityData: Omit<UserActivity, 'id' | 'uid' | 'timestamp'>): Promise<void> {
    const activitiesRef = collection(db, COLLECTIONS.USER_ACTIVITIES);
    await addDoc(activitiesRef, {
      uid,
      ...activityData,
      timestamp: Timestamp.now()
    });

    // Update user points
    const userProfile = await this.getUserProfile(uid);
    if (userProfile) {
      await this.updateUserProfile(uid, { 
        points: userProfile.points + activityData.points 
      });
    }
  }

  static async getUserActivities(uid: string, limitCount: number = 10): Promise<UserActivity[]> {
    const activitiesRef = collection(db, COLLECTIONS.USER_ACTIVITIES);
    const q = query(
      activitiesRef, 
      where('uid', '==', uid), 
      orderBy('timestamp', 'desc'), 
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserActivity));
  }

  // Project Management
  static async createProject(uid: string, projectData: Omit<Project, 'id' | 'uid' | 'createdAt'>): Promise<string> {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const docRef = await addDoc(projectsRef, {
      uid,
      ...projectData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }

  static async getUserProjects(uid: string): Promise<Project[]> {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const q = query(projectsRef, where('uid', '==', uid), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  }

  static async getProject(projectId: string): Promise<Project | null> {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    const projectSnap = await getDoc(projectRef);
    return projectSnap.exists() ? { id: projectSnap.id, ...projectSnap.data() } as Project : null;
  }

  static async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    await updateDoc(projectRef, updates);
  }

  // AI Conversation Management
  static async saveAIConversation(uid: string, conversationData: Omit<AIConversation, 'id' | 'uid' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const conversationsRef = collection(db, COLLECTIONS.AI_CONVERSATIONS);
    const docRef = await addDoc(conversationsRef, {
      uid,
      ...conversationData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  static async updateAIConversation(conversationId: string, updates: Partial<AIConversation>): Promise<void> {
    const conversationRef = doc(db, COLLECTIONS.AI_CONVERSATIONS, conversationId);
    await updateDoc(conversationRef, { ...updates, updatedAt: Timestamp.now() });
  }

  static async getUserConversations(uid: string): Promise<AIConversation[]> {
    const conversationsRef = collection(db, COLLECTIONS.AI_CONVERSATIONS);
    const q = query(
      conversationsRef, 
      where('uid', '==', uid), 
      where('isActive', '==', true),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AIConversation));
  }

  // Progress Tracking
  static async updateProgress(uid: string, progressData: Partial<ProgressTracking>): Promise<void> {
    const progressRef = doc(db, COLLECTIONS.PROGRESS_TRACKING, uid);
    const currentProgress = await getDoc(progressRef);
    
    if (currentProgress.exists()) {
      await updateDoc(progressRef, progressData);
    } else {
      await setDoc(progressRef, {
        uid,
        totalPoints: 0,
        level: 1,
        streak: 0,
        lastActivityDate: Timestamp.now(),
        completedProjects: 0,
        totalLearningTime: 0,
        skillsAcquired: [],
        badges: [],
        monthlyProgress: [],
        ...progressData
      });
    }
  }

  static async getProgress(uid: string): Promise<ProgressTracking | null> {
    const progressRef = doc(db, COLLECTIONS.PROGRESS_TRACKING, uid);
    const progressSnap = await getDoc(progressRef);
    return progressSnap.exists() ? progressSnap.data() as ProgressTracking : null;
  }

  // User Preferences
  static async saveUserPreferences(uid: string, preferences: Omit<UserPreferences, 'uid' | 'updatedAt'>): Promise<void> {
    const preferencesRef = doc(db, COLLECTIONS.USER_PREFERENCES, uid);
    await setDoc(preferencesRef, {
      uid,
      ...preferences,
      updatedAt: Timestamp.now()
    });
  }

  static async getUserPreferences(uid: string): Promise<UserPreferences | null> {
    const preferencesRef = doc(db, COLLECTIONS.USER_PREFERENCES, uid);
    const preferencesSnap = await getDoc(preferencesRef);
    return preferencesSnap.exists() ? preferencesSnap.data() as UserPreferences : null;
  }
}
