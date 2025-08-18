import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    // In a real app, this would update the user in the database
    // For demo, we'll just return success
    console.log('Completing onboarding for user:', userId);

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
