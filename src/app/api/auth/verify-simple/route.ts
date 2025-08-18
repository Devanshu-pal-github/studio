import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Decode simple token (in production, use proper JWT verification)
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (!decoded.userId) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }

      // In a real app, you'd look up the user in the database
      // For demo, just return mock user data
      const user = {
        _id: decoded.userId,
        name: decoded.name,
        email: decoded.email,
        photoURL: null,
        createdAt: new Date(),
        emailVerified: true,
        completedOnboarding: false, // Always false for demo to show onboarding
        experienceLevel: undefined,
        interests: [],
        goals: [],
        learningStyle: undefined,
        techStack: [],
      };

      return NextResponse.json({
        success: true,
        user
      });

    } catch (decodeError) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
