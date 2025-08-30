import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Simple demo onboarding questions (will cap at MAX_QUESTIONS)
const MAX_QUESTIONS = 10;
const ONBOARDING_QUESTIONS = [
  "Hi! I'm your AI learning mentor. What's your name and what brings you to Project Compass today?",
  "Great to meet you! What's your current experience level with programming and technology?",
  "What are your main learning goals? Are you looking to start a new career, advance in your current role, or explore new technologies?",
  "How do you prefer to learn? Do you like hands-on projects, video tutorials, reading documentation, or a mix of everything?",
  "What technologies or programming languages are you most interested in learning about?",
  "Perfect! Based on what you've told me, I'll create a personalized learning path for you. Let's get started on your journey!"
];

export async function POST(request: NextRequest) {
  try {
    // Require auth via Bearer token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

  const { history } = await request.json();
    
    // Count user messages to determine which question to ask next
    const userMessages = history.filter((msg: any) => msg.role === 'user').length;
    if (userMessages >= MAX_QUESTIONS) {
      return NextResponse.json({
        response: 'Thanks! I have enough to personalize your journey. [DONE]',
        completed: true
      });
    }
    
  if (userMessages >= ONBOARDING_QUESTIONS.length - 1 || userMessages >= MAX_QUESTIONS - 1) {
      // Onboarding complete
      return NextResponse.json({
        response: ONBOARDING_QUESTIONS[ONBOARDING_QUESTIONS.length - 1] + " [DONE]",
        completed: true
      });
    }
    
  // Return next question with gentle guidance if answer too short
  const nextBase = ONBOARDING_QUESTIONS[userMessages] || ONBOARDING_QUESTIONS[ONBOARDING_QUESTIONS.length - 1];
  const lastUser = [...history].reverse().find((m: any) => m.role === 'user');
  const wc = (lastUser?.content || '').trim().split(/\s+/).filter(Boolean).length;
  const hint = wc < 5 ? '\n\nTip: Add 1-2 sentences so I can tailor this better.' : '';
  const nextQuestion = `${nextBase}${hint}`;
    
    return NextResponse.json({
      response: nextQuestion,
      completed: false
    });

  } catch (error) {
    console.error('Onboarding chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process onboarding message' },
      { status: 500 }
    );
  }
}
