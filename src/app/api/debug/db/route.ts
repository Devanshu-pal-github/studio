import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/database/schemas';

export async function GET(_req: NextRequest) {
  try {
    const db = await connectToDatabase();
    const dbName = db.databaseName;
    const users = await db.collection(COLLECTIONS.USERS).countDocuments();
    const progress = await db.collection(COLLECTIONS.USER_PROGRESS).countDocuments().catch(() => 0);
    return NextResponse.json({ ok: true, dbName, counts: { users, userProgress: progress } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'unknown' }, { status: 500 });
  }
}
