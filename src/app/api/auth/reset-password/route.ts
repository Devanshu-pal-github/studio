import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/database/schemas';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/config';

const JWT_SECRET = getJWTSecret();

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Find user by reset token
    const user = await db.collection(COLLECTIONS.USERS).findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }, // Token not expired
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user password and clear reset token
    await db.collection(COLLECTIONS.USERS).updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
        $unset: {
          resetPasswordToken: '',
          resetPasswordExpires: '',
        },
      }
    );

    // Generate new JWT token
    const jwtToken = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email, 
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userResponse = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
      completedOnboarding: user.completedOnboarding,
    };

    return NextResponse.json({
      success: true,
      message: 'Password reset successful',
      user: userResponse,
      token: jwtToken,
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
