import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/database/schemas';

export async function GET(_req: NextRequest) {
  try {
    const db = await connectToDatabase();
    const dbName = db.databaseName;
    const users = await db
      .collection(COLLECTIONS.USERS)
      .find({}, { projection: { password: 0 } })
      .limit(20)
      .toArray();
    return NextResponse.json({ ok: true, dbName, count: users.length, users });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'unknown' }, { status: 500 });
  }
}
