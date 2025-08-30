import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/config';
import { COLLECTIONS } from '@/lib/database/schemas';

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

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Store token in blacklist (optional - for immediate invalidation)
    const db = await connectToDatabase();
  await db.collection(COLLECTIONS.TOKEN_BLACKLIST ?? 'token_blacklist').insertOne({
      token,
      userId: decoded.userId,
      blacklistedAt: new Date(),
      expiresAt: new Date(decoded.exp * 1000) // JWT expiration time
    });

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    // Clear auth cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return response;

  } catch (error: any) {
    console.error('Logout error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 