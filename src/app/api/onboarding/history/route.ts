import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_jwt_secret_key_change_this_in_production_12345';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId as string;

    const db = await connectToDatabase();
    const conversations = await db.collection('onboarding_conversations')
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({ success: true, conversations });
  } catch (error: any) {
    console.error('Failed to fetch onboarding history:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
