import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/database/schemas';
import { ObjectId } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_jwt_secret_key_change_this_in_production_12345';

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;
let isRateLimited = false;

try {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (apiKey && apiKey.length > 20) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('✅ Gemini AI initialized successfully');
  } else {
    throw new Error('No valid Gemini API key found');
  }
} catch (error) {
  console.error('❌ Gemini AI initialization failed:', error);
  throw new Error('Gemini AI is required for onboarding');
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface UserProfile {
  name?: string;
  experienceLevel?: string;
  interests?: string[];
  goals?: string[];
  learningStyle?: string;
  techStack?: string[];
  timeAvailability?: string;
  motivation?: string;
  background?: string;
  challenges?: string[];
  strengths?: string[];
  currentStage?: string;
  completedStages?: string[];
}

// Simple vector embedding function (hash-based for now)
function createEmbedding(text: string): string {
  return crypto.createHash('sha256').update(text.toLowerCase()).digest('hex');
}

// Intelligent fallback profile extraction
function extractUserProfileFallback(history: Message[]): UserProfile {
  const profile: UserProfile = {
    name: undefined,
    experienceLevel: undefined,
    interests: [],
    goals: [],
    learningStyle: undefined,
    techStack: [],
    timeAvailability: undefined,
    motivation: undefined,
    background: undefined,
    challenges: [],
    strengths: [],
    currentStage: 'introduction',
    completedStages: []
  };

  for (const message of history) {
    if (message.role === 'user') {
      const content = message.content.toLowerCase();
      
      // Extract name
      if (content.includes('name') || content.includes('call me') || content.includes('i\'m')) {
    const nameMatch = /(?:name|call me|i'm)\s+(?:is\s+)?([a-zA-Z]+)/.exec(content);
    if (nameMatch && nameMatch[1]) profile.name = nameMatch[1];
      }

      // Extract experience level
      if (content.includes('beginner') || content.includes('new') || content.includes('no experience')) {
        profile.experienceLevel = 'beginner';
      } else if (content.includes('intermediate') || content.includes('some experience') || content.includes('basic')) {
        profile.experienceLevel = 'intermediate';
      } else if (content.includes('advanced') || content.includes('expert') || content.includes('experienced')) {
        profile.experienceLevel = 'advanced';
      }

      // Extract goals
      if (content.includes('job') || content.includes('career') || content.includes('employment')) {
  (profile.goals ||= []).push('career_change');
      }
      if (content.includes('project') || content.includes('build') || content.includes('create')) {
  (profile.goals ||= []).push('personal_projects');
      }
      if (content.includes('learn') || content.includes('skill') || content.includes('improve')) {
  (profile.goals ||= []).push('skill_development');
      }
      if (content.includes('hobby') || content.includes('fun') || content.includes('interest')) {
  (profile.goals ||= []).push('hobby');
      }

      // Extract interests
      if (content.includes('web') || content.includes('frontend') || content.includes('react') || content.includes('website')) {
  (profile.interests ||= []).push('web_development');
      }
      if (content.includes('mobile') || content.includes('app') || content.includes('ios') || content.includes('android')) {
  (profile.interests ||= []).push('mobile_development');
      }
      if (content.includes('ai') || content.includes('machine learning') || content.includes('ml')) {
  (profile.interests ||= []).push('ai_ml');
      }
      if (content.includes('data') || content.includes('analytics') || content.includes('statistics')) {
  (profile.interests ||= []).push('data_science');
      }
      if (content.includes('backend') || content.includes('server') || content.includes('api')) {
  (profile.interests ||= []).push('backend_development');
      }
      if (content.includes('game') || content.includes('gaming') || content.includes('unity')) {
  (profile.interests ||= []).push('game_development');
      }

      // Extract learning style
      if (content.includes('visual') || content.includes('video') || content.includes('watch')) {
        profile.learningStyle = 'visual';
      } else if (content.includes('hands') || content.includes('practice') || content.includes('code')) {
        profile.learningStyle = 'hands_on';
      } else if (content.includes('read') || content.includes('documentation') || content.includes('book')) {
        profile.learningStyle = 'reading';
      } else if (content.includes('interactive') || content.includes('quiz') || content.includes('challenge')) {
        profile.learningStyle = 'interactive';
      } else if (content.includes('social') || content.includes('community') || content.includes('group')) {
        profile.learningStyle = 'social';
      }

      // Extract motivation
      if (content.includes('money') || content.includes('salary') || content.includes('income')) {
        profile.motivation = 'financial';
      } else if (content.includes('passion') || content.includes('love') || content.includes('enjoy')) {
        profile.motivation = 'passion';
      } else if (content.includes('challenge') || content.includes('problem') || content.includes('solve')) {
        profile.motivation = 'challenge';
      } else if (content.includes('future') || content.includes('career') || content.includes('growth')) {
        profile.motivation = 'career_growth';
      }

      // Extract background
      if (content.includes('student') || content.includes('college') || content.includes('university')) {
        profile.background = 'student';
      } else if (content.includes('work') || content.includes('job') || content.includes('employed')) {
        profile.background = 'working_professional';
      } else if (content.includes('freelance') || content.includes('self-employed')) {
        profile.background = 'freelancer';
      } else if (content.includes('entrepreneur') || content.includes('business')) {
        profile.background = 'entrepreneur';
      }

      // Extract tech stack
      const techKeywords = [
        'html', 'css', 'javascript', 'react', 'next.js', 'node.js', 'python', 'java', 'c++', 'c#',
        'mongodb', 'mysql', 'postgresql', 'firebase', 'aws', 'docker', 'kubernetes', 'git',
        'tailwind', 'bootstrap', 'typescript', 'angular', 'vue', 'django', 'flask', 'fastapi',
        'solidity', 'ethereum', 'rust', 'solana', 'flutter', 'react native', 'swift', 'kotlin'
      ];
      
      for (const tech of techKeywords) {
        if (content.includes(tech)) {
          (profile.techStack ||= []).push(tech);
        }
      }
    }
  }

  // Determine current stage based on collected information
  const messageCount = history.length;
  if (messageCount <= 2) profile.currentStage = 'introduction';
  else if (!profile.experienceLevel) profile.currentStage = 'experience';
  else if ((profile.goals || []).length === 0) profile.currentStage = 'goals';
  else if ((profile.interests || []).length === 0) profile.currentStage = 'interests';
  else if (!profile.learningStyle) profile.currentStage = 'learning_style';
  else if (!profile.motivation) profile.currentStage = 'motivation';
  else if (!profile.background) profile.currentStage = 'background';
  else if ((profile.techStack || []).length === 0) profile.currentStage = 'tech_stack';
  else if (!profile.timeAvailability) profile.currentStage = 'availability';
  else profile.currentStage = 'completion';

  return profile;
}

// Extract user profile from conversation using AI or fallback
async function extractUserProfileWithAI(history: Message[]): Promise<UserProfile> {
  // If rate limited, use fallback
  if (isRateLimited) {
    console.log('🔄 Using fallback profile extraction (rate limited)');
    return extractUserProfileFallback(history);
  }

  const conversationText = history.map(m => `${m.role}: ${m.content}`).join('\n');
  
  const prompt = `
Analyze this onboarding conversation and extract user profile information. Return ONLY a valid JSON object with the following structure:

{
  "name": "extracted name or null",
  "experienceLevel": "beginner/intermediate/advanced or null",
  "interests": ["array of interests like web_development, mobile_development, ai_ml, data_science, backend_development, game_development"],
  "goals": ["array of goals like career_change, personal_projects, skill_development, hobby"],
  "learningStyle": "visual/hands_on/reading/interactive/social or null",
  "techStack": ["array of specific technologies mentioned"],
  "timeAvailability": "extracted time info or null",
  "motivation": "financial/passion/challenge/career_growth or null",
  "background": "student/working_professional/freelancer/entrepreneur or null",
  "challenges": ["array of challenges mentioned"],
  "strengths": ["array of strengths mentioned"],
  "currentStage": "introduction/experience/goals/interests/learning_style/tech_stack/availability/motivation/background/completion",
  "completedStages": ["array of completed stages"]
}

Conversation:
${conversationText}

JSON Response:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const profile = JSON.parse(jsonMatch[0]);
      console.log('✅ Extracted user profile with AI:', profile);
      return profile;
    }
    throw new Error('Failed to parse AI response');
  } catch (error: any) {
    console.error('❌ Failed to extract profile with AI:', error);
    
    // Check if it's a rate limit error
    if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
      console.log('⚠️ Rate limit detected, switching to fallback mode');
      isRateLimited = true;
      return extractUserProfileFallback(history);
    }
    
    // For other errors, use fallback
    console.log('🔄 Using fallback profile extraction');
    return extractUserProfileFallback(history);
  }
}

// Intelligent fallback question generation
function generateFallbackQuestion(stage: string, userProfile: UserProfile, history: Message[]): string {
  const lastUserMessage = history.length > 0 ? history[history.length - 1].content : '';
  const userName = userProfile.name || 'there';

  switch (stage) {
    case 'introduction':
      return `Hi ${userName}! 👋 Welcome to StudoAI - your AI-powered learning companion!

I'm excited to help you create a personalized learning journey that's perfect for you. To get started, could you tell me a bit about what motivated you to start learning programming today?

Whether it's building cool projects, advancing your career, or just exploring something new - I'm here to guide you every step of the way! 🚀`;

    case 'experience':
      return `Thanks for sharing that! Now, let's figure out the best starting point for your journey.

What's your current experience level with programming and technology?

• **Beginner** - New to programming, maybe some basic computer skills
• **Intermediate** - Some coding experience, maybe a course or two under your belt
• **Advanced** - Experienced programmer looking to expand skills

This will help me create the perfect learning path for you! 💡`;

    case 'goals':
      return `Great! Now I want to understand what you're hoping to achieve. What are your main learning goals?

• **Career Change** - Looking to switch to a tech career
• **Personal Projects** - Want to build cool apps and websites
• **Skill Development** - Improve existing programming skills
• **Hobby & Fun** - Learning for personal interest and enjoyment

What resonates most with you? This will help me recommend the most relevant projects and resources! 🎯`;

    case 'interests':
      return `Perfect! Now let's dive into what excites you most in the tech world. What areas interest you?

• **Web Development** - Building websites and web apps (React, Next.js, etc.)
• **Mobile Development** - Creating iOS/Android apps
• **AI & Machine Learning** - Building intelligent systems
• **Data Science** - Working with data and analytics
• **Backend Development** - Server-side programming and APIs
• **Game Development** - Creating games and interactive experiences

What sounds most exciting to you? 🚀`;

    case 'learning_style':
      return `Awesome choice! Now, how do you prefer to learn? Everyone has their own style:

• **Visual Learner** - Love videos, diagrams, and visual explanations
• **Hands-on Coder** - Learn by doing, building projects, writing code
• **Reader** - Prefer documentation, articles, and written tutorials
• **Interactive** - Enjoy quizzes, challenges, and interactive exercises
• **Social Learner** - Like learning with others, communities, pair programming

What's your preferred way to absorb new information? 📚`;

    case 'motivation':
      return `Great insight! Now, what's your main motivation for learning programming?

• **Financial Goals** - Better salary, job opportunities, career advancement
• **Personal Passion** - Love for technology and creating things
• **Problem Solving** - Enjoy tackling challenges and building solutions
• **Future Growth** - Investing in long-term career development

Understanding your motivation helps me keep you engaged and focused! 💪`;

    case 'background':
      return `Thanks for sharing! Now, tell me a bit about your current situation:

• **Student** - Currently studying (high school, college, university)
• **Working Professional** - Employed in another field, looking to transition
• **Freelancer** - Self-employed, looking to expand skills
• **Entrepreneur** - Running a business, want to add tech skills
• **Career Changer** - Looking for a complete career switch

This helps me understand your unique circumstances and challenges! 🎯`;

    case 'tech_stack':
      return `Excellent! Now let's get specific about technologies. What are you most interested in learning?

**Programming Languages:**
• JavaScript, Python, Java, C++, etc.

**Frameworks & Tools:**
• React, Vue, Angular, Node.js, Django, etc.

**Platforms:**
• Web, Mobile, Desktop, Cloud, etc.

What technologies excite you most? This will help me create a focused, practical learning path! ⚡`;

    case 'availability':
      return `Perfect! Last question - let's talk about your time commitment. How much time can you dedicate to learning?

• **Hours per week** - How many hours can you realistically spend?
• **Schedule preference** - Weekdays, weekends, or flexible?
• **Time constraints** - Any deadlines or specific goals?

This helps me create a realistic, achievable learning timeline that fits your life! ⏰`;

    case 'completion':
      return `🎉 Amazing! I've learned so much about you and I'm excited to create your personalized learning experience!

**What I've discovered:**
• Experience Level: ${userProfile.experienceLevel || 'To be determined'}
• Goals: ${userProfile.goals?.join(', ') || 'To be determined'}
• Interests: ${userProfile.interests?.join(', ') || 'To be determined'}
• Learning Style: ${userProfile.learningStyle || 'To be determined'}

**What's next:**
I'll use this information to create:
• A personalized learning roadmap
• Curated project recommendations
• Custom resource suggestions
• Progress tracking system

Ready to start your learning journey? Let's get you set up with your personalized dashboard! 🚀`;

    default:
      return `Thanks for sharing that! Let's continue building your personalized learning profile. What else should I know about your learning goals and preferences?`;
  }
}

// Determine next question based on current context
async function determineNextQuestion(history: Message[], userProfile: UserProfile): Promise<string> {
  // If rate limited, use fallback
  if (isRateLimited) {
    console.log('🔄 Using fallback question generation (rate limited)');
    return generateFallbackQuestion(userProfile.currentStage || 'introduction', userProfile, history);
  }

  const conversationText = history.map(m => `${m.role}: ${m.content}`).join('\n');
  
  const prompt = `
You are an AI mentor for StudoAI. Based on the conversation history and user profile, determine what the next question should be.

Current User Profile:
${JSON.stringify(userProfile, null, 2)}

Conversation History:
${conversationText}

Available stages (in order):
1. introduction - Welcome and motivation
2. experience - Current experience level
3. goals - Learning goals and objectives
4. interests - Areas of interest in technology
5. learning_style - Preferred learning method
6. motivation - What drives them to learn
7. background - Current situation/background
8. tech_stack - Specific technologies to learn
9. availability - Time commitment and schedule
10. completion - Summarize and next steps

Rules:
- If this is the first message (history length <= 1), ask for name and motivation
- If experience level is missing, ask about experience
- If goals are missing, ask about goals
- If interests are missing, ask about interests
- If learning style is missing, ask about learning style
- If motivation is missing, ask about motivation
- If background is missing, ask about background
- If tech stack is missing, ask about specific technologies
- If availability is missing, ask about time commitment
- If all information is collected, provide completion summary

Generate a natural, conversational question that:
1. Acknowledges their previous response
2. Asks the next logical question
3. Explains why this information is important
4. Keeps the tone friendly and encouraging
5. Uses their name if they've provided it

Question:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Generated next question with AI');
    return text.trim();
  } catch (error: any) {
    console.error('❌ Failed to generate next question:', error);
    
    // Check if it's a rate limit error
    if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
      console.log('⚠️ Rate limit detected, switching to fallback mode');
      isRateLimited = true;
      return generateFallbackQuestion(userProfile.currentStage || 'introduction', userProfile, history);
    }
    
    // For other errors, use fallback
    console.log('🔄 Using fallback question generation');
    return generateFallbackQuestion(userProfile.currentStage || 'introduction', userProfile, history);
  }
}

// Store conversation with vector embeddings
async function storeConversationWithEmbeddings(userId: string, history: Message[], response: string, userProfile: UserProfile) {
  try {
    const db = await connectToDatabase();
    
    // Create embeddings for the conversation
    const conversationText = [...history, { role: 'assistant', content: response }]
      .map(m => `${m.role}: ${m.content}`).join('\n');
    const embedding = createEmbedding(conversationText);
    
    // Store the conversation with embeddings
    await db.collection('onboarding_conversations').insertOne({
      userId: new ObjectId(userId),
      conversation: [...history, { role: 'assistant', content: response }],
      userProfile,
      embedding,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Update user profile in users collection
    await db.collection(COLLECTIONS.USERS).updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          onboardingProfile: userProfile,
          updatedAt: new Date()
        }
      }
    );
    
    console.log('✅ Stored conversation with embeddings');
  } catch (error) {
    console.error('❌ Failed to store conversation:', error);
    throw error;
  }
}

// Enhanced onboarding with pure AI and vector embeddings
export async function POST(req: NextRequest) {
  try {
    const { history, userId } = await req.json();

    // Require Bearer token and ensure it matches provided userId
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    if (!decoded?.userId || decoded.userId !== userId) {
      return NextResponse.json({ error: 'Token/user mismatch' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

  const db = await connectToDatabase();
    
  // Get user data
    const user = await db.collection(COLLECTIONS.USERS).findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('🔄 Processing onboarding request...');
    console.log('📊 History length:', history.length);
    console.log('👤 User ID:', userId);
    console.log('🔍 Rate limited:', isRateLimited);

    // Extract user profile using AI or fallback
    const userProfile = await extractUserProfileWithAI(history);
    
    // Determine next question using AI or fallback
    const nextQuestion = await determineNextQuestion(history, userProfile);
    
    // Store conversation with embeddings
  await storeConversationWithEmbeddings(userId, history, nextQuestion, userProfile);

    // Log activity: onboarding interaction
    try {
      await db.collection(COLLECTIONS.USER_ACTIVITIES).insertOne({
        id: `activity-${userId}-${Date.now()}`,
        userId,
        type: 'ai_chat',
        timestamp: new Date(),
        description: 'Onboarding interaction',
        metadata: { stage: userProfile.currentStage, length: history.length }
      });
    } catch {}

    console.log('✅ Onboarding processed successfully');
    console.log('📝 Next question generated');
    console.log('🔍 Current stage:', userProfile.currentStage);
    console.log('🔄 Using fallback:', isRateLimited);

    // If the currentStage is completion and enough user data is present, append a DONE marker
    const isComplete = (userProfile.currentStage === 'completion');

    return NextResponse.json({ 
      message: isComplete ? `${nextQuestion}\n\n[DONE]` : nextQuestion,
      userProfile,
      currentStage: userProfile.currentStage,
      completedStages: userProfile.completedStages || [],
      usingGemini: !isRateLimited,
      rateLimited: isRateLimited
    });

  } catch (error: any) {
    console.error('❌ Enhanced onboarding error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process onboarding request',
        details: error.message,
        usingGemini: false,
        rateLimited: isRateLimited
      },
      { status: 500 }
    );
  }
} 