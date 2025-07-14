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

    const db = await connectToDatabase();

    // Get user progress
    const progress = await db.collection(COLLECTIONS.USER_PROGRESS).findOne({ 
      userId: decoded.userId 
    });

    if (!progress) {
      // Create initial progress if it doesn't exist
      const initialProgress = {
        userId: decoded.userId,
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

      await db.collection(COLLECTIONS.USER_PROGRESS).insertOne(initialProgress);
      
      return NextResponse.json({
        success: true,
        progress: {
          ...initialProgress,
          _id: initialProgress._id?.toString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      progress: {
        ...progress,
        _id: progress._id?.toString(),
      },
    });

  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
