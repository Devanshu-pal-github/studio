import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            personalizedData: {
                profileSummary: 'You are steadily progressing. Focus on JavaScript fundamentals and project-based learning.',
                nextSteps: [
                    'Finish your first portfolio project',
                    'Practice DOM manipulation and fetch API',
                    'Set a weekly learning schedule (4-6h)'
                ],
                motivationalMessage: 'Consistency beats intensity. Small steps daily lead to big wins.'
            }
        });
    } catch (error) {
        console.error('Dashboard API error:', error);
        return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 });
    }
}
