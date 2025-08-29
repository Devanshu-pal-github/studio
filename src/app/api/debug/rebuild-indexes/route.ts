import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { DATABASE_INDEXES } from '@/lib/database/schemas';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded: any = verifyToken(token);
    // naive admin check: email includes '@' and ends with your domain if needed; keep open for now
    if (!decoded?.email) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const db = await connectToDatabase();
    const results: any[] = [];
    for (const [collectionName, indexes] of Object.entries(DATABASE_INDEXES as any)) {
      const collection = db.collection(collectionName);
      try {
        await collection.dropIndexes().catch(() => {});
      } catch {}
      for (const idx of indexes as any[]) {
        if (Array.isArray(idx)) {
          const [spec, options] = idx;
          const name = await collection.createIndex(spec, options);
          results.push({ collectionName, name, spec, options });
        } else {
          const name = await collection.createIndex(idx);
          results.push({ collectionName, name, spec: idx });
        }
      }
    }
    return NextResponse.json({ ok: true, results });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'unknown' }, { status: 500 });
  }
}
