
import {NextRequest, NextResponse} from 'next/server';

interface Message {
    role: 'user' | 'model';
    content: string;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        if (!body) {
            return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
        }

        const { history } = JSON.parse(body);
        
        if (!history || !Array.isArray(history)) {
            return NextResponse.json({ error: 'Invalid history provided' }, { status: 400 });
        }
        
        const response = await generatePersonalizedResponse(history);
        
        return NextResponse.json({ message: response });
        
    } catch (error: any) {
        console.error("Onboarding API Error:", error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}

async function generatePersonalizedResponse(history: Message[]): Promise<string> {
    const userMessages = history.filter(msg => msg.role === 'user');
    const questionCount = userMessages.length;
    
    // Define the tunnel vision onboarding flow - exactly 7 personalized questions
    const onboardingQuestions = [
        {
            question: "👋 Welcome to your personalized learning journey! I'm your AI mentor, and I'm excited to help you succeed.\n\nTo create the perfect learning path for you, let's start simple: **What's your name, and what made you decide to start learning today?**",
            followUp: "Tell me a bit about yourself and what sparked your interest in learning new skills!"
        },
        {
            question: "🎯 Thanks for sharing! Now, let's get specific about your goals.\n\n**What do you want to build or achieve in the next 3-6 months?** \n\nFor example:\n• A personal website or portfolio\n• A mobile app idea you have\n• Career change to tech\n• Improve existing skills\n• Start a side project\n\nBe as specific as possible - the more details, the better I can help!",
            followUp: "Dream big! What's that one project or goal that excites you the most?"
        },
        {
            question: "💼 Perfect! Now let's understand your background.\n\n**What's your current experience level with technology and programming?**\n\nChoose the option that best describes you:\n\n🟢 **Complete beginner** - Never written code before\n🟡 **Some experience** - Tried tutorials, basic HTML/CSS\n🟠 **Intermediate** - Built some projects, know 1-2 languages\n🔴 **Advanced** - Professional experience, multiple technologies\n\nAlso, **what technologies have you worked with before** (if any)?",
            followUp: "Don't worry about your level - everyone starts somewhere! What matters is your willingness to learn."
        },
        {
            question: "🧠 Excellent! Now let's discover your learning style so I can customize everything perfectly.\n\n**How do you learn best?** (You can choose multiple)\n\n📹 **Video tutorials** - Watch and follow along\n📚 **Reading documentation** - Deep dive into written guides\n🛠️ **Hands-on projects** - Learn by building real things\n👥 **Interactive discussions** - Ask questions and get feedback\n🎮 **Gamified challenges** - Solve problems and earn points\n\nAlso, **how much time can you realistically dedicate to learning each week?**",
            followUp: "The more I know about how you prefer to learn, the better I can tailor your experience!"
        },
        {
            question: "⚡ Great insights! Let's talk about your current situation and constraints.\n\n**What are your biggest challenges or concerns about learning?**\n\nFor example:\n• Limited time due to work/family\n• Not sure where to start\n• Fear of getting stuck\n• Imposter syndrome\n• Keeping motivation\n• Technical setup issues\n\nAnd **what resources do you have available?** (computer specs, budget for tools, etc.)",
            followUp: "Understanding your challenges helps me create a realistic and supportive learning plan for you."
        },
        {
            question: "🚀 Almost done! Let's set you up for success.\n\n**What does success look like to you?** Be specific about:\n\n📈 **Short-term wins** (next 2-4 weeks)\n🎯 **Medium-term goals** (2-3 months) \n🏆 **Long-term vision** (6-12 months)\n\nAnd **how would you like me to support you?** \n• Daily check-ins and motivation\n• Code reviews and feedback\n• Career guidance\n• Project suggestions\n• Technical troubleshooting",
            followUp: "Your success is my success! Let's make sure we're aligned on what winning looks like for you."
        },
        {
            question: "🎉 **Perfect! I have everything I need to create your personalized learning journey.**\n\nBased on our conversation, I'm designing:\n\n✨ **Custom project roadmap** tailored to your goals\n🎯 **Personalized learning resources** matching your style\n🤖 **AI mentor support** available 24/7\n📊 **Progress tracking** with gamification\n🔧 **Real-world projects** you'll actually use\n\n**Final question: Is there anything else you'd like me to know about you, your goals, or how you'd like to learn?**\n\nAfter this, I'll create your dashboard and we'll start building! 🚀",
            followUp: "Any final thoughts, concerns, or things you're excited about? This is your chance to add anything!"
        }
    ];

    // If this is the start of conversation, return the first question
    if (questionCount === 0) {
        return onboardingQuestions[0].question;
    }

    // If we've completed all questions, return completion message
    if (questionCount >= onboardingQuestions.length) {
        const userName = extractUserName(history);
        return `🎊 **Congratulations ${userName}!** 🎊\n\nYour personalized learning environment is ready! I've analyzed everything you've shared and created a custom dashboard with:\n\n🎯 **Your Personal Roadmap** - Step-by-step path to your goals\n📚 **Curated Resources** - Handpicked content matching your learning style\n🚀 **Smart Projects** - Real-world applications you'll actually use\n📊 **Progress Tracking** - Gamified system to keep you motivated\n🤖 **24/7 AI Mentor** - I'll be here whenever you need help\n\nGet ready to transform your skills and achieve your goals! Let's start building amazing things together! 🌟\n\n[DONE]`;
    }

    // Return the next question with some personalization based on previous answers
    const nextQuestion = onboardingQuestions[questionCount];
    return personalizeQuestion(nextQuestion.question, history, questionCount);
}

function extractUserName(history: Message[]): string {
    // Try to extract name from the first user message
    const firstMessage = history.find(msg => msg.role === 'user')?.content || '';
    const words = firstMessage.split(' ');
    
    // Look for common name patterns
    for (let i = 0; i < words.length; i++) {
        const word = words[i].toLowerCase();
        if (word === 'name' || word === 'i\'m' || word === 'im' || word === 'call') {
            if (words[i + 1]) {
                return words[i + 1].replace(/[^a-zA-Z]/g, '');
            }
        }
    }
    
    // If no clear name pattern, return first word that looks like a name
    const possibleName = words.find(word => 
        word.length > 2 && 
        /^[A-Z][a-z]+$/.test(word) &&
        !['The', 'My', 'I', 'We', 'You', 'Hello', 'Hi'].includes(word)
    );
    
    return possibleName || 'there';
}

function personalizeQuestion(question: string, history: Message[], questionNumber: number): string {
    const userMessages = history.filter(msg => msg.role === 'user');
    const userName = extractUserName(history);
    
    // Add personal touches based on previous answers
    let personalizedQuestion = question;
    
    if (questionNumber > 0 && userName !== 'there') {
        // Add name to some questions
        if (questionNumber === 1) {
            personalizedQuestion = personalizedQuestion.replace('🎯 Thanks for sharing!', `🎯 Thanks for sharing, ${userName}!`);
        } else if (questionNumber === 3) {
            personalizedQuestion = personalizedQuestion.replace('🧠 Excellent!', `🧠 Excellent, ${userName}!`);
        }
    }
    
    // Add contextual references based on previous answers
    if (questionNumber === 2 && userMessages.length > 1) {
        const previousAnswer = userMessages[1].content.toLowerCase();
        if (previousAnswer.includes('website') || previousAnswer.includes('portfolio')) {
            personalizedQuestion += '\n\n💡 *I noticed you mentioned building a website - that\'s a fantastic goal! I have some amazing project ideas for you.*';
        } else if (previousAnswer.includes('app') || previousAnswer.includes('mobile')) {
            personalizedQuestion += '\n\n💡 *Building an app is exciting! I\'ll make sure to include mobile development in your personalized roadmap.*';
        } else if (previousAnswer.includes('career') || previousAnswer.includes('job')) {
            personalizedQuestion += '\n\n💡 *Career transition is a big step - I\'ll focus on practical skills that employers are looking for.*';
        }
    }
    
    return personalizedQuestion;
}
