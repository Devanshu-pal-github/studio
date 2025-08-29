import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { userId, onboardingHistory } = await request.json();

    console.log('Completing onboarding for user:', userId);

    // Try to persist onboarding completion and history
    try {
      if (userId) {
        const db = await connectToDatabase();
  const _id = ObjectId.createFromHexString(userId as string);
        const updateDoc: any = {
          $set: { completedOnboarding: true, onboardingCompletedAt: new Date() }
        };
        if (onboardingHistory && Array.isArray(onboardingHistory) && onboardingHistory.length) {
          updateDoc.$push = {
            onboardingHistory: { $each: onboardingHistory.map((m: any) => ({ ...m, timestamp: new Date() })) }
          };
        }
        await db.collection('users').updateOne({ _id }, updateDoc);

        // Also store full conversation in a separate collection
        if (onboardingHistory && Array.isArray(onboardingHistory)) {
          await db.collection('onboarding_conversations').updateOne(
            { userId },
            { $set: { history: onboardingHistory, lastUpdated: new Date(), isComplete: true } },
            { upsert: true }
          );
        }
      }
    } catch (dbErr) {
      console.warn('Onboarding DB persistence skipped:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        completedOnboarding: true
      }
    });

  } catch (error) {
    console.error('Onboarding completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
