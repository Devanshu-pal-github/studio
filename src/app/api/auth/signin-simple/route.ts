import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/config';
import { demoUsers } from '@/lib/demo-users';

// Use shared demoUsers store

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

    // Find user
  const user = demoUsers.get(email.toLowerCase());
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password (in production, use bcrypt.compare)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token to align with middleware verification
  const JWT_SECRET = getJWTSecret();
  const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userResponse = {
      _id: user._id,
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
