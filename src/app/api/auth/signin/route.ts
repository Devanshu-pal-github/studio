import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/database/schemas';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/config';

const JWT_SECRET = getJWTSecret();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Find user by email
    const user = await db.collection(COLLECTIONS.USERS).findOne({ 
      email: email.toLowerCase() 
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email, 
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    await db.collection(COLLECTIONS.USERS).updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLoginAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    // Log activity: signin
    try {
      await db.collection(COLLECTIONS.USER_ACTIVITIES).insertOne({
        id: `activity-${user._id.toString()}-${Date.now()}`,
        userId: user._id.toString(),
        type: 'resource_viewed',
        timestamp: new Date(),
        description: 'User signed in',
        metadata: { source: 'api/auth/signin' }
      });
    } catch {}

    // Return user data (without password)
    const userResponse = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
      completedOnboarding: user.completedOnboarding,
      experienceLevel: user.experienceLevel,
      interests: user.interests,
      goals: user.goals,
      learningStyle: user.learningStyle,
      techStack: user.techStack,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token,
    });

    // Set httpOnly cookie for middleware
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login. Please try again.' },
      { status: 500 }
    );
  }
}
