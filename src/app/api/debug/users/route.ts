import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { COLLECTIONS } from '@/lib/database/schemas';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded: any = verifyToken(token);
    if (!decoded?.email) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const db = await connectToDatabase();
    const dbName = db.databaseName;
    const users = await db
      .collection(COLLECTIONS.USERS)
      .find({}, { projection: { password: 0 } })
      .limit(50)
      .toArray();
    const counts = {
      users: await db.collection(COLLECTIONS.USERS).countDocuments(),
      progress: await db.collection(COLLECTIONS.USER_PROGRESS).countDocuments(),
      activities: await db.collection(COLLECTIONS.USER_ACTIVITIES).countDocuments(),
      onboardingHistory: await db.collection(COLLECTIONS.ONBOARDING_HISTORY).countDocuments().catch(() => 0),
      onboardingConversations: await db.collection(COLLECTIONS.ONBOARDING_CONVERSATIONS).countDocuments().catch(() => 0),
    };

    return NextResponse.json({ ok: true, dbName, users, counts });
  } catch (e: any) {
    console.error('Debug users error:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'unknown' }, { status: 500 });
  }
}
