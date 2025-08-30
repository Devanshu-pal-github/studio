import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/config';
const JWT_SECRET = getJWTSecret();

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (!(authHeader?.startsWith('Bearer '))) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Verify JWT token (demo version doesn't hit DB)
  const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Return mock user data
    const user = {
      _id: decoded.userId,
  name: decoded.name,
  email: decoded.email,
      photoURL: null,
      createdAt: new Date(),
      emailVerified: true,
      completedOnboarding: false,
      experienceLevel: undefined,
      interests: [],
      goals: [],
      learningStyle: undefined,
      techStack: [],
    };

    return NextResponse.json({ success: true, user });

  } catch (error: any) {
    console.error('Token verification error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
