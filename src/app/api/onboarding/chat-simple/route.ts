import { NextRequest, NextResponse } from 'next/server';

// Simple demo onboarding questions
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
    const { history } = await request.json();
    
    // Count user messages to determine which question to ask next
    const userMessages = history.filter((msg: any) => msg.role === 'user').length;
    
    if (userMessages >= ONBOARDING_QUESTIONS.length - 1) {
      // Onboarding complete
      return NextResponse.json({
        response: ONBOARDING_QUESTIONS[ONBOARDING_QUESTIONS.length - 1] + " [DONE]",
        completed: true
      });
    }
    
    // Return next question
    const nextQuestion = ONBOARDING_QUESTIONS[userMessages] || ONBOARDING_QUESTIONS[0];
    
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
