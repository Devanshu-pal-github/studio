import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/database/schemas';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = await connectToDatabase();

    // Get user activities
    const activities = await db
      .collection(COLLECTIONS.USER_ACTIVITIES)
      .find({ userId: decoded.userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      activities: activities.map(activity => ({
        ...activity,
        _id: activity._id?.toString(),
      })),
    });

  } catch (error) {
    console.error('Get activities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const activityData = await request.json();
    const { type, description, metadata = {} } = activityData;

    if (!type || !description) {
      return NextResponse.json(
        { error: 'Type and description are required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Create activity
    const activity = {
      id: `${decoded.userId}_${Date.now()}`,
      userId: decoded.userId,
      type,
      description,
      metadata,
      timestamp: new Date(),
    };

    await db.collection(COLLECTIONS.USER_ACTIVITIES).insertOne(activity);

    // Update user progress
    await updateUserProgress(db, decoded.userId, activity);

    return NextResponse.json({
      success: true,
      message: 'Activity logged successfully',
      activity: {
        ...activity,
        _id: activity._id?.toString(),
      },
    });

  } catch (error) {
    console.error('Log activity error:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}

async function updateUserProgress(db: any, userId: string, activity: any) {
  try {
    const existingProgress = await db.collection(COLLECTIONS.USER_PROGRESS).findOne({ userId });

    let currentProgress = existingProgress || {
      userId,
      totalPoints: 0,
      level: 1,
      streak: 0,
      activeDays: 0,
      completedProjects: [],
      currentProjects: [],
      achievements: [],
      weeklyGoals: {
        targetProjects: 2,
        targetPoints: 500,
        currentProjects: 0,
        currentPoints: 0,
      },
      lastActiveDate: new Date(),
      skillsProgress: {},
      weeklyActivity: {},
      monthlyActivity: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Calculate points based on activity type
    const points = calculatePoints(activity);
    const newTotalPoints = (currentProgress.totalPoints || 0) + points;
    const newLevel = Math.floor(newTotalPoints / 1000) + 1;

    // Update streak and active days
    const today = new Date().toDateString();
    const lastActivityDate = currentProgress.lastActiveDate ? new Date(currentProgress.lastActiveDate).toDateString() : '';
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
    const weekKey = getWeekKey(new Date());
    const monthKey = getMonthKey(new Date());

    const updatedProgress = {
      ...currentProgress,
      totalPoints: newTotalPoints,
      level: newLevel,
      streak: newStreak,
      activeDays: newActiveDays,
      lastActiveDate: new Date(),
      updatedAt: new Date(),
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

      if (updatedProgress.weeklyGoals) {
        updatedProgress.weeklyGoals.currentProjects += 1;
      }
    }

    // Update weekly goals points
    if (updatedProgress.weeklyGoals) {
      updatedProgress.weeklyGoals.currentPoints += points;
    }

    // Update skill progress
    if (activity.type === 'code_commit') {
      updatedProgress.skillsProgress = {
        ...updatedProgress.skillsProgress,
        coding: (updatedProgress.skillsProgress?.coding || 0) + 1
      };
    }
    if (activity.type === 'lesson_complete') {
      updatedProgress.skillsProgress = {
        ...updatedProgress.skillsProgress,
        learning: (updatedProgress.skillsProgress?.learning || 0) + 1
      };
    }

    // Add achievements
    if (newStreak === 7 && !currentProgress.achievements?.includes('week_streak')) {
      updatedProgress.achievements = [...(updatedProgress.achievements || []), 'week_streak'];
    }
    if ((updatedProgress.completedProjects?.length || 0) === 5 && !currentProgress.achievements?.includes('project_master')) {
      updatedProgress.achievements = [...(updatedProgress.achievements || []), 'project_master'];
    }

    await db.collection(COLLECTIONS.USER_PROGRESS).updateOne(
      { userId },
      { $set: updatedProgress },
      { upsert: true }
    );

  } catch (error) {
    console.error('Error updating user progress:', error);
  }
}

function calculatePoints(activity: any): number {
  const basePoints = {
    'project_start': 50,
    'project_complete': 500,
    'lesson_complete': 100,
    'code_commit': 25,
    'feedback_given': 75,
    'resource_viewed': 10,
    'challenge_attempted': 150,
  };

  let points = basePoints[activity.type as keyof typeof basePoints] || 10;

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

function getWeekKey(date: Date): string {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return start.toISOString().split('T')[0];
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
