
import { run } from '@genkit-ai/flow';
import { onboardingFlow } from '@/ai/flows/ai-powered-onboarding';
import {NextRequest, NextResponse} from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { history } = await req.json();
        
        if (!history || !Array.isArray(history)) {
            return NextResponse.json({ error: 'Invalid history provided' }, { status: 400 });
        }
        
        const response = await run(onboardingFlow, { history });
        
        return NextResponse.json({ message: response });
        
    } catch (error: any) {
        console.error("Onboarding API Error:", error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}
