import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/database/schemas';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

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

    const db = await connectToDatabase();

    // Check if user already exists
    const existingUser = await db.collection(COLLECTIONS.USERS).findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = {
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: false,
      completedOnboarding: false,
      experienceLevel: undefined,
      interests: [],
      goals: [],
      learningStyle: undefined,
      techStack: [],
    };

    const result = await db.collection(COLLECTIONS.USERS).insertOne(newUser);
    const userId = result.insertedId.toString();

    // Initialize user progress
    const initialProgress = {
      userId,
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

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId, 
        email: email.toLowerCase(), 
        name: name.trim() 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userResponse = {
      _id: userId,
      name: name.trim(),
      email: email.toLowerCase(),
      createdAt: newUser.createdAt,
      emailVerified: false,
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
