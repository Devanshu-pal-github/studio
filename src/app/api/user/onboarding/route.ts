import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/database/schemas';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Helper function to verify JWT token
function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// GET - Get user onboarding data
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
  const db = await connectToDatabase();
  const userObjectId = new ObjectId(decoded.userId);
  const user = await db.collection(COLLECTIONS.USERS).findOne({ _id: userObjectId });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user profile data
    return NextResponse.json({
      success: true,
      profile: user.profile || {},
      completedOnboarding: user.completedOnboarding || false
    });

  } catch (error) {
    console.error('Get onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to get onboarding data' },
      { status: 500 }
    );
  }
}

// POST - Save user onboarding data
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    const body = await request.json();
    const { profile, completedOnboarding = false } = body;

    if (!profile) {
      return NextResponse.json({ error: 'Profile data is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    const updateData = {
      profile,
      completedOnboarding,
      profileUpdatedAt: new Date(),
      ...(completedOnboarding && { onboardingCompletedAt: new Date() })
    };

    const result = await db.collection(COLLECTIONS.USERS).updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $set: updateData },
      { upsert: false }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: completedOnboarding ? 'Onboarding completed successfully' : 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Save onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 }
    );
  }
}
