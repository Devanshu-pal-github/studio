// lib/activityTracker.ts - User activity and progress tracking
import { connectToDatabase } from './mongodb';
import { COLLECTIONS } from './database/schemas';

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
   * Log a user activity. Requires a MongoDB User object.
   */
  async logActivity(user: { _id: string } | null, activity: Omit<UserActivity, 'id' | 'timestamp' | 'userId'>) {
    if (!user || !user._id) throw new Error('User must be authenticated to log activity.');
    const activityId = `${user._id}_${Date.now()}`;
    const activityData: UserActivity = {
      ...activity,
      userId: user._id,
      id: activityId,
      timestamp: new Date(),
    };

    try {
      // Save activity to MongoDB
      const { db } = await connectToDatabase();
  await db.collection(COLLECTIONS.USER_ACTIVITIES).insertOne(activityData);

      // Update user progress
      await this.updateUserProgress(user, activityData);

      return activityData;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  /**
   * Update user progress. Requires a MongoDB User object.
   */
  async updateUserProgress(user: { _id: string } | null, activity: UserActivity) {
    if (!user || !user._id) throw new Error('User must be authenticated to update progress.');
    
    const { db } = await connectToDatabase();
    const userId = user._id;

    try {
  const existingProgress = await db.collection(COLLECTIONS.USER_PROGRESS).findOne({ userId });

      let currentProgress: Partial<UserProgress>;
      if (existingProgress) {
        currentProgress = (existingProgress as unknown) as UserProgress;
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

  await db.collection(COLLECTIONS.USER_PROGRESS).updateOne(
      { userId },
      { $set: updatedProgress },
      { upsert: true }
    );
    
    return updatedProgress;
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
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

  async getUserProgress(user: { _id: string } | null): Promise<UserProgress | null> {
    if (!user || !user._id) throw new Error('User must be authenticated to get progress.');
    
    const { db } = await connectToDatabase();
    
    try {
  const progress = await db.collection(COLLECTIONS.USER_PROGRESS).findOne({ userId: user._id });
      return (progress as unknown) as UserProgress || null;
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  }

  async getUserActivities(user: { _id: string } | null, limitCount: number = 50): Promise<UserActivity[]> {
    if (!user || !user._id) throw new Error('User must be authenticated to get activities.');
    
    const { db } = await connectToDatabase();
    
    try {
      const activities = await db
  .collection(COLLECTIONS.USER_ACTIVITIES)
        .find({ userId: user._id })
        .sort({ timestamp: -1 })
        .limit(limitCount)
        .toArray();
      
      return (activities as unknown) as UserActivity[];
    } catch (error) {
      console.error('Error getting user activities:', error);
      return [];
    }
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
