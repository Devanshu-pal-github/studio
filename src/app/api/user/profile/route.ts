import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/database/schemas';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = await connectToDatabase();
    const user = await db.collection(COLLECTIONS.USERS).findOne({ _id: new ObjectId(decoded.userId) });
    const progress = await db.collection(COLLECTIONS.USER_PROGRESS).findOne({ userId: decoded.userId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        name: user.name,
        email: user.email,
        experience: user.experienceLevel || user.profile?.experience || 'Unknown',
        goals: user.goals || user.profile?.shortTermGoals || [],
        interests: user.interests || user.profile?.interestAreas || [],
        completedOnboarding: !!user.completedOnboarding,
        streak: progress?.streak || 0,
        level: progress?.level || 1,
        points: progress?.totalPoints || 0,
      }
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}
