import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/config';
import { demoUsers } from '@/lib/demo-users';

const JWT_SECRET = getJWTSecret();

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if user already exists
  if (demoUsers.has(email.toLowerCase())) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user (in production, hash the password)
    const userId = Date.now().toString();
    const newUser = {
      _id: userId,
      name: name.trim(),
      email: email.toLowerCase(),
      password, // In production, hash this
      createdAt: new Date(),
      emailVerified: true, // Auto-verify for demo
      completedOnboarding: false,
      experienceLevel: undefined,
      interests: [],
      goals: [],
      learningStyle: undefined,
      techStack: [],
    };

  demoUsers.set(email.toLowerCase(), newUser);

  // Generate JWT token and set cookie
  const token = jwt.sign({ userId, email: email.toLowerCase(), name: name.trim() }, JWT_SECRET, { expiresIn: '7d' });

    // Return user data (without password)
    const userResponse = {
      _id: userId,
      name: name.trim(),
      email: email.toLowerCase(),
      createdAt: newUser.createdAt,
      emailVerified: true,
      completedOnboarding: false,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: userResponse,
      token,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
