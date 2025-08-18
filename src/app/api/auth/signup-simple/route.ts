import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory user store for demo purposes
// In production, this would be replaced with a proper database
const users = new Map();

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
    if (users.has(email.toLowerCase())) {
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

    users.set(email.toLowerCase(), newUser);

    // Generate simple token (in production, use proper JWT)
    const token = Buffer.from(JSON.stringify({ userId, email: email.toLowerCase(), name: name.trim() })).toString('base64');

    // Return user data (without password)
    const userResponse = {
      _id: userId,
      name: name.trim(),
      email: email.toLowerCase(),
      createdAt: newUser.createdAt,
      emailVerified: true,
      completedOnboarding: false,
    };

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: userResponse,
      token,
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
