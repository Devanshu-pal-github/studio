import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory user store for demo purposes
// This should match the store in signup-simple
const users = new Map();

// Add a demo user for testing
users.set('demo@test.com', {
  _id: 'demo123',
  name: 'Demo User',
  email: 'demo@test.com',
  password: 'demo123', // In production, this would be hashed
  createdAt: new Date(),
  emailVerified: true,
  completedOnboarding: false,
  experienceLevel: undefined,
  interests: [],
  goals: [],
  learningStyle: undefined,
  techStack: [],
});

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
    const user = users.get(email.toLowerCase());
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

    // Generate simple token (in production, use proper JWT)
    const token = Buffer.from(JSON.stringify({ 
      userId: user._id, 
      email: user.email, 
      name: user.name 
    })).toString('base64');

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

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login. Please try again.' },
      { status: 500 }
    );
  }
}
