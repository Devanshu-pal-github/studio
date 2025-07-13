

import { run } from '@genkit-ai/flow';
import { dashboardPersonalizationFlow } from '@/ai/flows/dashboard-personalization';
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Helper to get the current user
const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      }, reject);
    });
};

export async function GET(req: NextRequest) {
    try {
        const user: any = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = getFirestore();
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists() || !userDoc.data()?.onboardingHistory) {
            return NextResponse.json({ error: 'Onboarding data not found.' }, { status: 404 });
        }

        const onboardingHistory = userDoc.data()?.onboardingHistory;

        const personalizedData = await run(dashboardPersonalizationFlow, { onboardingHistory });

        return NextResponse.json(personalizedData);

    } catch (error: any) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}
