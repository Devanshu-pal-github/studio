// lib/activityTracker.ts - User activity and progress tracking
import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export interface UserActivity {
  id: string;
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

export interface UserProgress {
  userId: string;
  totalPoints: number;
  level: number;
  streak: number;
  activeDays: number;
  completedProjects: string[];
  currentProjects: string[];
  achievements: string[];
  weeklyActivity: { [key: string]: number };
  monthlyActivity: { [key: string]: number };
  skillProgress: { [skill: string]: number };
  lastActivity: Date;
}

export class ActivityTracker {
  /**
   * Log a user activity. Requires a Firebase User object.
   */
  async logActivity(user: { uid: string } | null, activity: Omit<UserActivity, 'id' | 'timestamp' | 'userId'>) {
    if (!user || !user.uid) throw new Error('User must be authenticated to log activity.');
    const activityId = `${user.uid}_${Date.now()}`;
    const activityData: UserActivity = {
      ...activity,
      userId: user.uid,
      id: activityId,
      timestamp: new Date(),
    };

    // Save activity to Firestore
    await setDoc(doc(db, 'activities', activityId), activityData);

    // Update user progress
    await this.updateUserProgress(user, activityData);

    return activityData;
  }

  /**
   * Update user progress. Requires a Firebase User object.
   */
  async updateUserProgress(user: { uid: string } | null, activity: UserActivity) {
    if (!user || !user.uid) throw new Error('User must be authenticated to update progress.');
    const userId = user.uid;
    const progressRef = doc(db, 'userProgress', userId);
    const progressDoc = await getDoc(progressRef);

    let currentProgress: Partial<UserProgress>;
    if (progressDoc.exists()) {
      currentProgress = progressDoc.data() as UserProgress;
    } else {
      currentProgress = {
        userId,
        totalPoints: 0,
        level: 1,
        streak: 0,
        activeDays: 0,
        completedProjects: [],
        currentProjects: [],
        achievements: [],
        weeklyActivity: {},
        monthlyActivity: {},
        skillProgress: {},
        lastActivity: new Date(),
      };
    }

    // Calculate points based on activity type
    const points = this.calculatePoints(activity);
    const newTotalPoints = (currentProgress.totalPoints || 0) + points;
    const newLevel = Math.floor(newTotalPoints / 1000) + 1;

    // Update streak and active days
    const today = new Date().toDateString();
    const lastActivityDate = currentProgress.lastActivity ? new Date(currentProgress.lastActivity).toDateString() : '';
    const isNewDay = today !== lastActivityDate;

    let newStreak = currentProgress.streak || 0;
    let newActiveDays = currentProgress.activeDays || 0;

    if (isNewDay) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();

      if (lastActivityDate === yesterdayString) {
        newStreak += 1;
      } else if (lastActivityDate !== today) {
        newStreak = 1;
      }
      newActiveDays += 1;
    }

    // Update weekly and monthly activity
    const weekKey = this.getWeekKey(new Date());
    const monthKey = this.getMonthKey(new Date());

    const updatedProgress: Partial<UserProgress> = {
      ...currentProgress,
      totalPoints: newTotalPoints,
      level: newLevel,
      streak: newStreak,
      activeDays: newActiveDays,
      lastActivity: new Date(),
      weeklyActivity: {
        ...currentProgress.weeklyActivity,
        [weekKey]: (currentProgress.weeklyActivity?.[weekKey] || 0) + 1,
      },
      monthlyActivity: {
        ...currentProgress.monthlyActivity,
        [monthKey]: (currentProgress.monthlyActivity?.[monthKey] || 0) + 1,
      },
    };

    // Handle project-specific updates
    if (activity.type === 'project_start' && activity.metadata.projectId) {
      updatedProgress.currentProjects = [
        ...(currentProgress.currentProjects || []),
        activity.metadata.projectId,
      ];
    }

    if (activity.type === 'project_complete' && activity.metadata.projectId) {
      updatedProgress.completedProjects = [
        ...(currentProgress.completedProjects || []),
        activity.metadata.projectId,
      ];
      updatedProgress.currentProjects = (currentProgress.currentProjects || []).filter(
        id => id !== activity.metadata.projectId
      );
    }

    await setDoc(progressRef, updatedProgress, { merge: true });
    return updatedProgress;
  }

  private calculatePoints(activity: UserActivity): number {
    const basePoints = {
      'project_start': 50,
      'project_complete': 500,
      'lesson_complete': 100,
      'code_commit': 25,
      'feedback_given': 75,
      'resource_viewed': 10,
      'challenge_attempted': 150,
    };

    let points = basePoints[activity.type] || 10;

    // Bonus points based on difficulty
    if (activity.metadata.difficulty) {
      const difficultyMultiplier = {
        'easy': 1,
        'medium': 1.5,
        'hard': 2,
        'expert': 3,
      };
      points *= difficultyMultiplier[activity.metadata.difficulty as keyof typeof difficultyMultiplier] || 1;
    }

    return Math.floor(points);
  }

  async getUserProgress(user: { uid: string } | null): Promise<UserProgress | null> {
    if (!user || !user.uid) throw new Error('User must be authenticated to get progress.');
    const progressDoc = await getDoc(doc(db, 'userProgress', user.uid));
    return progressDoc.exists() ? progressDoc.data() as UserProgress : null;
  }

  async getUserActivities(user: { uid: string } | null, limitCount: number = 50): Promise<UserActivity[]> {
    if (!user || !user.uid) throw new Error('User must be authenticated to get activities.');
    const activitiesQuery = query(
      collection(db, 'activities'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const activitiesSnapshot = await getDocs(activitiesQuery);
    return activitiesSnapshot.docs.map(doc => doc.data() as UserActivity);
  }

  private getWeekKey(date: Date): string {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return start.toISOString().split('T')[0];
  }

  private getMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}

export const activityTracker = new ActivityTracker();
