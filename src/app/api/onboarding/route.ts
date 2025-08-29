import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { enhancedVectorStore } from '@/lib/enhanced-vector-store';
import { advancedPromptingEngine } from '@/lib/advanced-prompting';
import { ObjectId } from 'mongodb';

interface Message {
    role: 'user' | 'model';
    content: string;
}

interface OnboardingQuestion {
    question: string;
    followUp: string;
    category: string;
    importance: number;
}

export async function POST(req: NextRequest) {
    try {
        // Require Authorization header
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        const body = await req.text();
        if (!body) {
            return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
        }

        const { history, userId } = JSON.parse(body);
        if (!userId || decoded.userId !== userId) {
            return NextResponse.json({ error: 'Token does not match userId' }, { status: 403 });
        }
        
        if (!history || !Array.isArray(history)) {
            return NextResponse.json({ error: 'Invalid history provided' }, { status: 400 });
        }

        // Store every user response in the enhanced vector store for context
    if (userId) {
            await storeOnboardingContext(userId, history);
        }
        
        const response = await generatePersonalizedResponse(history, userId);
        
        return NextResponse.json({ message: response });
        
    } catch (error: any) {
        console.error("Enhanced Onboarding API Error:", error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}

/**
 * Store comprehensive onboarding context in vector store for semantic retrieval
 */
async function storeOnboardingContext(userId: string, history: Message[]) {
    try {
        const userMessages = history.filter(msg => msg.role === 'user');
        const modelMessages = history.filter(msg => msg.role === 'model');
        
        // Store each user response with deep semantic analysis
        for (let i = 0; i < userMessages.length; i++) {
            const userMessage = userMessages[i];
            const correspondingQuestion = modelMessages[i]?.content || 'Initial question';
            
            // Perform comprehensive semantic analysis
            const semanticAnalysis = await analyzeUserResponse(userMessage.content);
            
            // Store in enhanced vector store for future retrieval
            await enhancedVectorStore.storeOnboardingContext(
                userId,
                correspondingQuestion,
                userMessage.content,
                {
                    questionIndex: i,
                    conversationLength: history.length,
                    timestamp: new Date(),
                    semanticAnalysis,
                    rawContext: {
                        previousContext: userMessages.slice(0, i).map(m => m.content),
                        questionCategory: getQuestionCategory(i),
                        importance: calculateResponseImportance(userMessage.content, i)
                    }
                }
            );
        }

        // Store complete conversation flow in database
        const db = await connectToDatabase();
        await db.collection('onboarding_conversations').updateOne(
            { userId },
            {
                $set: {
                    history,
                    lastUpdated: new Date(),
                    totalQuestions: userMessages.length,
                    isComplete: userMessages.length >= 6,
                    completionPercentage: Math.min((userMessages.length / 6) * 100, 100)
                }
            },
            { upsert: true }
        );

        console.log(`Enhanced context stored for user ${userId}: ${userMessages.length} responses`);

    } catch (error) {
        console.error('Error storing enhanced onboarding context:', error);
    }
}

/**
 * Deep semantic analysis of user responses to extract maximum context
 */
async function analyzeUserResponse(response: string): Promise<any> {
    return {
        // Emotional analysis
        sentiment: analyzeSentiment(response),
        emotionalTone: analyzeEmotionalTone(response),
        enthusiasm: analyzeEnthusiasm(response),
        confidence: analyzeConfidence(response),
        
        // Technical analysis
        skillLevel: inferSkillLevel(response),
        technicalBackground: extractTechnologies(response),
        experienceIndicators: extractExperienceIndicators(response),
        
        // Learning analysis
        learningStyle: inferLearningStyle(response),
        learningMotivation: extractMotivation(response),
        preferredPace: inferLearningPace(response),
        
        // Goal analysis
        careerGoals: extractCareerGoals(response),
        projectInterests: extractProjectInterests(response),
        timeframe: extractTimeframe(response),
        
        // Constraint analysis
        timeAvailability: extractTimeConstraints(response),
        challenges: extractChallenges(response),
        concerns: extractConcerns(response),
        
        // Communication analysis
        communicationStyle: analyzeCommunicationStyle(response),
        keyPhrases: extractKeyPhrases(response),
        intentions: extractIntentions(response),
        
        // Context preservation
        rawText: response,
        wordCount: response.split(' ').length,
        analysisTimestamp: new Date()
    };
}

/**
 * Generate dynamic, personalized onboarding questions based on user context
 */
async function generatePersonalizedResponse(history: Message[], userId?: string): Promise<string> {
    const userMessages = history.filter(msg => msg.role === 'user');
    const questionCount = userMessages.length;
    
    // Base onboarding questions (can be dynamically adjusted)
    const onboardingQuestions: OnboardingQuestion[] = [
        {
            question: "👋 Welcome to your AI-powered learning journey! I'm your personal mentor, and I'm thrilled to help you succeed.\n\n**Let's start with you - what's your name, and what inspired you to begin learning today?** \n\nI want to understand your story and what sparked this exciting decision!",
            followUp: "Every learner has a unique story - I'd love to hear yours!",
            category: "introduction",
            importance: 1.0
        },
        {
            question: "🎯 **Now let's dive into your dreams and aspirations!**\n\n**What specific goal do you want to achieve in the next 3-6 months?** Be as detailed as possible:\n\n• Building a personal project (describe it!)\n• Career transition or advancement\n• Learning specific technologies\n• Starting a business or side hustle\n• Academic or certification goals\n\n**The more specific you are, the better I can tailor everything to YOU!**",
            followUp: "Dream big! What's that vision that gets you excited to learn?",
            category: "goals",
            importance: 1.0
        },
        {
            question: "💻 **Let's understand your technical background!**\n\n**Where are you on your learning journey?**\n\n🟢 **Complete Beginner** - New to programming/tech\n🟡 **Explorer** - Tried tutorials, know some basics\n🟠 **Builder** - Created projects, familiar with tools\n🔴 **Professional** - Work experience, advanced skills\n\n**Also tell me:**\n• What technologies have you touched before?\n• What did you like/dislike about previous learning experiences?\n• Any specific areas where you feel confident or uncertain?",
            followUp: "Your current level is perfect for where you are - we'll build from there!",
            category: "experience",
            importance: 0.9
        },
        {
            question: "⏰ **Time to talk about your learning rhythm!**\n\n**How much time can you realistically dedicate to learning each week?**\n• 🕒 **1-3 hours** (Busy lifestyle, mainly weekends)\n• 🕕 **4-8 hours** (Regular evenings + weekends)\n• 🕘 **9-15 hours** (Substantial commitment)\n• 🕛 **16+ hours** (Full focus mode)\n\n**Also share:**\n• When do you feel most focused? (mornings, evenings, weekends)\n• How do you learn best? (hands-on, videos, reading, structured courses)\n• Any specific scheduling constraints I should know about?",
            followUp: "I'll create a plan that works with YOUR life, not against it!",
            category: "schedule_preferences",
            importance: 0.8
        },
        {
            question: "🔥 **Let's explore what excites you most in technology!**\n\n**Which areas make your eyes light up?**\n• 🌐 **Web Development** - Websites, web applications\n• 📱 **Mobile Development** - iOS, Android apps\n• 🤖 **AI & Machine Learning** - Smart applications\n• 🎮 **Game Development** - Interactive experiences\n• 💎 **Blockchain & Web3** - Decentralized tech\n• 📊 **Data Science** - Analytics and insights\n• ☁️ **Cloud & DevOps** - Infrastructure and deployment\n• 🔐 **Cybersecurity** - Protection and privacy\n• 🎨 **UI/UX Design** - User experience\n• **Something else?**\n\n**What draws you to these areas?** Share what fascinates you!",
            followUp: "Your passion is the fuel for your learning journey!",
            category: "interests",
            importance: 0.9
        },
        {
            question: "🎉 **Perfect! I have a deep understanding of your learning profile now.**\n\nBased on our conversation, I'm creating:\n\n✨ **Hyper-personalized project roadmap** tailored to your exact goals\n🧠 **AI-powered learning companion** that adapts to your progress\n🎯 **Custom challenges** that match your interests and skill level\n📊 **Dynamic progress tracking** with smart recommendations\n🤝 **Community connections** with learners on similar journeys\n\n**One final question: Is there anything else about yourself, your goals, learning style, or concerns that would help me create the perfect experience for you?**\n\nAfter this, your personalized dashboard will be ready! 🚀",
            followUp: "This is your chance to add anything that will make your learning journey even better!",
            category: "completion",
            importance: 0.7
        }
    ];

    // Dynamic question generation based on previous responses
    if (questionCount === 0) {
        return onboardingQuestions[0].question;
    }

    // Completion logic
    if (questionCount >= onboardingQuestions.length) {
        const userName = extractUserName(history);
        
        if (userId) {
            await completeOnboarding(userId, history);
        }
        
        return `🎊 **Incredible work, ${userName}!** 🎊\n\nYour AI-powered learning environment is now live! Based on everything you've shared, I've created:\n\n🎯 **Your Personal Learning DNA** - Deep understanding of your style, goals, and preferences\n📚 **Curated Resource Library** - Content specifically chosen for YOUR interests\n🚀 **Smart Project Pipeline** - Real-world applications that excite YOU\n📊 **Adaptive Progress System** - Celebrates your wins and guides your growth\n🤖 **24/7 AI Mentor** - I'll be here for every question, challenge, and breakthrough\n🔮 **Predictive Recommendations** - I'll suggest next steps before you even realize you need them\n\nYour journey to mastery starts NOW! Let's build something amazing together! 🌟\n\n[DONE]`;
    }

    // Generate next question with personalization
    const baseQuestion = onboardingQuestions[questionCount];
    return await personalizeQuestion(baseQuestion, history, questionCount, userId);
}

/**
 * Personalize questions based on user's previous responses using AI
 */
async function personalizeQuestion(baseQuestion: OnboardingQuestion, history: Message[], questionIndex: number, userId?: string): Promise<string> {
    if (!userId) {
        return baseQuestion.question;
    }

    try {
        // Build context for AI personalization
        const userContext = {
            onboardingResponses: {} as Record<string, string>,
            activities: [],
            projectHistory: [],
            learningProgress: [],
            interactions: history,
            timestamp: new Date()
        };

        // Populate responses so far
        const userMessages = history.filter(msg => msg.role === 'user');
        userMessages.forEach((msg, index) => {
            userContext.onboardingResponses[`response_${index}`] = msg.content;
        });

        // Use advanced prompting for personalization
        const personalizedContent = await advancedPromptingEngine.generatePersonalizedContent(
            userContext,
            'guidance'
        );

        if (personalizedContent && typeof personalizedContent === 'object' && personalizedContent.content) {
            return personalizedContent.content;
        }
        
        // Fallback to contextual personalization
        return contextualizeQuestion(baseQuestion, userMessages);
        
    } catch (error) {
        console.error('Error personalizing question:', error);
        return baseQuestion.question;
    }
}

/**
 * Complete onboarding and set up user's learning profile
 */
async function completeOnboarding(userId: string, history: Message[]) {
    try {
        const db = await connectToDatabase();
        const userObjectId = new ObjectId(userId);
        
        // Extract comprehensive learning context
        const learningContext = await extractComprehensiveLearningContext(history);
        
        // Update user profile
        await db.collection('users').updateOne(
            { _id: userObjectId },
            {
                $set: {
                    completedOnboarding: true,
                    onboardingHistory: history,
                    learningContext: learningContext,
                    onboardingCompletedAt: new Date(),
                    personalizedProfile: await generatePersonalizedProfile(learningContext),
                    updatedAt: new Date()
                }
            }
        );

        // Store final context in vector store
        await enhancedVectorStore.storeOnboardingContext(
            userId,
            'Complete Onboarding Session',
            JSON.stringify(learningContext),
            {
                sessionComplete: true,
                totalQuestions: history.filter(m => m.role === 'user').length,
                completionDate: new Date(),
                contextRichness: calculateContextRichness(learningContext)
            }
        );

        console.log(`Enhanced onboarding completed for user ${userId}`);
        
    } catch (error) {
        console.error('Error completing enhanced onboarding:', error);
    }
}

/**
 * Extract comprehensive learning context with deep analysis
 */
async function extractComprehensiveLearningContext(history: Message[]): Promise<any> {
    const userMessages = history.filter(msg => msg.role === 'user');
    const allUserText = userMessages.map(m => m.content).join(' ');
    
    return {
        // Basic information
        personalInfo: {
            name: extractUserName(history),
            communicationStyle: analyzeCommunicationStyle(allUserText),
            personality: inferPersonalityTraits(allUserText)
        },
        
        // Goals and aspirations
        objectives: {
            primaryGoals: extractGoals(userMessages),
            timeframe: extractTimeframe(allUserText),
            careerAspiration: extractCareerGoals(allUserText),
            projectInterests: extractProjectInterests(allUserText),
            motivationLevel: analyzeMotivationLevel(allUserText)
        },
        
        // Technical profile
        technicalProfile: {
            experienceLevel: extractExperienceLevel(userMessages),
            technologies: extractTechnologies(allUserText),
            learningGaps: identifyLearningGaps(allUserText),
            preferredStack: inferPreferredTechStack(allUserText)
        },
        
        // Learning preferences
        learningPreferences: {
            style: inferLearningStyle(allUserText),
            pace: inferLearningPace(allUserText),
            timeAvailability: extractTimeAvailability(userMessages),
            preferredFormat: inferPreferredFormat(allUserText),
            supportNeeds: identifySupportNeeds(allUserText)
        },
        
        // Constraints and challenges
        constraints: {
            timeConstraints: extractTimeConstraints(allUserText),
            challenges: extractChallenges(allUserText),
            concerns: extractConcerns(allUserText),
            resources: assessAvailableResources(allUserText)
        },
        
        // Context metadata
        metadata: {
            completionDate: new Date(),
            responseCount: userMessages.length,
            totalWordCount: allUserText.split(' ').length,
            sentimentProfile: analyzeSentimentTrend(userMessages),
            engagementLevel: calculateEngagementLevel(userMessages)
        }
    };
}

// Comprehensive helper functions for deep context extraction

function getQuestionCategory(index: number): string {
    const categories = ['introduction', 'goals', 'experience', 'schedule', 'interests', 'completion'];
    return categories[index] || 'additional';
}

function calculateResponseImportance(response: string, questionIndex: number): number {
    let importance = 0.5;
    
    // Question-based importance
    if (questionIndex === 0) importance += 0.2; // Introduction
    if (questionIndex === 1) importance += 0.3; // Goals
    if (questionIndex === 2) importance += 0.2; // Experience
    
    // Content-based importance
    if (response.length > 100) importance += 0.1;
    if (response.includes('goal') || response.includes('want') || response.includes('build')) importance += 0.1;
    if (response.includes('challenge') || response.includes('struggle') || response.includes('difficult')) importance += 0.1;
    
    return Math.min(importance, 1.0);
}

function contextualizeQuestion(baseQuestion: OnboardingQuestion, previousResponses: Message[]): string {
    // Add simple personalization based on previous responses
    let question = baseQuestion.question;
    
    if (previousResponses.length > 0) {
        const firstName = extractUserName(previousResponses);
        if (firstName !== 'there') {
            question = question.replace(/Let's/, `${firstName}, let's`);
        }
    }
    
    return question;
}

function generatePersonalizedProfile(learningContext: any): any {
    return {
        learnerType: inferLearnerType(learningContext),
        recommendedPath: suggestLearningPath(learningContext),
        personalizedMotivation: createMotivationalProfile(learningContext),
        adaptiveSettings: configureAdaptiveSettings(learningContext),
        contextualPrompts: generateContextualPrompts(learningContext)
    };
}

function calculateContextRichness(context: any): number {
    let richness = 0;
    
    if (context.personalInfo?.name) richness += 0.1;
    if (context.objectives?.primaryGoals?.length > 0) richness += 0.2;
    if (context.technicalProfile?.experienceLevel) richness += 0.15;
    if (context.learningPreferences?.style?.length > 0) richness += 0.15;
    if (context.constraints?.timeConstraints?.length > 0) richness += 0.1;
    if (context.metadata?.totalWordCount > 200) richness += 0.1;
    if (context.metadata?.responseCount >= 6) richness += 0.2;
    
    return Math.min(richness, 1.0);
}

// Enhanced semantic analysis functions
function extractUserName(history: Message[]): string {
    const firstUserMessage = history.find(msg => msg.role === 'user')?.content || '';
    const source = firstUserMessage.toLowerCase();
    const patterns: RegExp[] = [
        /(?:i'm|i am|my name is|call me|name's)\s+([a-z]{2,})/,
        /^([a-z]{2,})(?:\s|,|!|\.|$)/,
        /\bhi\b.*?([a-z]{2,})/
    ];
    
    for (const pattern of patterns) {
        const match = pattern.exec(source);
    if (match?.[1] && match[1].length > 1) {
            return match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
        }
    }
    return 'there';
}

function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['love', 'like', 'enjoy', 'excited', 'passionate', 'great', 'amazing', 'good', 'awesome', 'fantastic'];
    const negativeWords = ['hate', 'dislike', 'difficult', 'struggle', 'hard', 'frustrated', 'confused', 'worried', 'nervous'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
}

function analyzeEmotionalTone(text: string): string[] {
    const tones: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('excited') || lowerText.includes('thrilled') || lowerText.includes('pumped')) tones.push('enthusiastic');
    if (lowerText.includes('nervous') || lowerText.includes('worried') || lowerText.includes('anxious')) tones.push('anxious');
    if (lowerText.includes('confident') || lowerText.includes('ready') || lowerText.includes('determined')) tones.push('confident');
    if (lowerText.includes('confused') || lowerText.includes('uncertain') || lowerText.includes('not sure')) tones.push('uncertain');
    if (lowerText.includes('motivated') || lowerText.includes('driven') || lowerText.includes('ambitious')) tones.push('motivated');
    if (lowerText.includes('curious') || lowerText.includes('interested') || lowerText.includes('fascinated')) tones.push('curious');
    
    return tones;
}

function analyzeEnthusiasm(text: string): number {
    const enthusiasmIndicators = ['!', 'excited', 'love', 'passionate', 'amazing', 'awesome', 'can\'t wait'];
    const lowerText = text.toLowerCase();
    
    let score = 0;
    enthusiasmIndicators.forEach(indicator => {
        if (indicator === '!') {
            score += (text.match(/!/g) || []).length * 0.1;
        } else if (lowerText.includes(indicator)) {
            score += 0.2;
        }
    });
    
    return Math.min(score, 1.0);
}

function analyzeConfidence(text: string): number {
    const confidenceIndicators = ['confident', 'ready', 'can do', 'experienced', 'comfortable', 'familiar'];
    const uncertaintyIndicators = ['not sure', 'maybe', 'confused', 'uncertain', 'worried', 'nervous'];
    
    const lowerText = text.toLowerCase();
    let confidence = 0.5; // Baseline
    
    confidenceIndicators.forEach(indicator => {
        if (lowerText.includes(indicator)) confidence += 0.1;
    });
    
    uncertaintyIndicators.forEach(indicator => {
        if (lowerText.includes(indicator)) confidence -= 0.1;
    });
    
    return Math.max(0, Math.min(1, confidence));
}

function inferSkillLevel(text: string): string {
    const beginnerIndicators = ['new', 'beginner', 'start', 'basic', 'first time', 'never', 'learning', 'just started'];
    const intermediateIndicators = ['some experience', 'familiar', 'know basics', 'intermediate', 'tried', 'built'];
    const advancedIndicators = ['experienced', 'advanced', 'expert', 'proficient', 'years of', 'professional', 'work with'];
    
    const lowerText = text.toLowerCase();
    
    if (advancedIndicators.some(indicator => lowerText.includes(indicator))) return 'advanced';
    if (intermediateIndicators.some(indicator => lowerText.includes(indicator))) return 'intermediate';
    if (beginnerIndicators.some(indicator => lowerText.includes(indicator))) return 'beginner';
    
    return 'unknown';
}

function extractTechnologies(text: string): string[] {
    const techKeywords = [
        'javascript', 'js', 'python', 'react', 'vue', 'angular', 'node', 'nodejs', 'django', 'flask', 
        'html', 'css', 'sql', 'mongodb', 'mysql', 'postgresql', 'aws', 'azure', 'docker', 'git', 
        'typescript', 'ts', 'java', 'c++', 'c#', 'go', 'rust', 'swift', 'kotlin', 'php', 'ruby',
        'bootstrap', 'tailwind', 'sass', 'webpack', 'next.js', 'nuxt', 'svelte', 'firebase'
    ];
    
    const lowerText = text.toLowerCase();
    return techKeywords.filter(tech => lowerText.includes(tech));
}

function extractExperienceIndicators(text: string): string[] {
    const indicators: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('tutorial') || lowerText.includes('course')) indicators.push('self_taught');
    if (lowerText.includes('bootcamp') || lowerText.includes('certification')) indicators.push('formal_training');
    if (lowerText.includes('project') || lowerText.includes('built') || lowerText.includes('created')) indicators.push('hands_on_experience');
    if (lowerText.includes('job') || lowerText.includes('work') || lowerText.includes('professional')) indicators.push('professional_experience');
    if (lowerText.includes('degree') || lowerText.includes('university') || lowerText.includes('college')) indicators.push('academic_background');
    
    return indicators;
}

// Continue with more helper functions...
function inferLearningStyle(text: string): string[] {
    const styles: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('hands-on') || lowerText.includes('practice') || lowerText.includes('doing')) styles.push('practical');
    if (lowerText.includes('video') || lowerText.includes('watch') || lowerText.includes('visual')) styles.push('visual');
    if (lowerText.includes('reading') || lowerText.includes('documentation') || lowerText.includes('books')) styles.push('reading');
    if (lowerText.includes('tutorial') || lowerText.includes('step') || lowerText.includes('guide')) styles.push('structured');
    if (lowerText.includes('project') || lowerText.includes('build') || lowerText.includes('create')) styles.push('project_based');
    if (lowerText.includes('interactive') || lowerText.includes('experiment') || lowerText.includes('try')) styles.push('experimental');
    
    return styles.length > 0 ? styles : ['mixed'];
}

function extractMotivation(text: string): string[] {
    const motivations: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('career') || lowerText.includes('job') || lowerText.includes('work')) motivations.push('career_growth');
    if (lowerText.includes('passion') || lowerText.includes('love') || lowerText.includes('interest')) motivations.push('personal_interest');
    if (lowerText.includes('money') || lowerText.includes('income') || lowerText.includes('salary')) motivations.push('financial');
    if (lowerText.includes('challenge') || lowerText.includes('learn') || lowerText.includes('grow')) motivations.push('personal_growth');
    if (lowerText.includes('business') || lowerText.includes('startup') || lowerText.includes('entrepreneur')) motivations.push('entrepreneurship');
    if (lowerText.includes('creative') || lowerText.includes('build') || lowerText.includes('create')) motivations.push('creativity');
    if (lowerText.includes('help') || lowerText.includes('solve') || lowerText.includes('impact')) motivations.push('social_impact');
    
    return motivations;
}

function inferLearningPace(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('fast') || lowerText.includes('quick') || lowerText.includes('intensive')) return 'fast';
    if (lowerText.includes('slow') || lowerText.includes('steady') || lowerText.includes('gradual')) return 'slow';
    if (lowerText.includes('flexible') || lowerText.includes('adapt') || lowerText.includes('varies')) return 'flexible';
    
    return 'moderate';
}

// Add all other helper functions following similar patterns...
// (extractGoals, extractCareerGoals, extractProjectInterests, etc.)

function extractGoals(userMessages: Message[]): string[] {
    if (userMessages.length < 2) return [];
    
    const goalsText = userMessages[1]?.content.toLowerCase() || '';
    const goals: string[] = [];
    
    if (goalsText.includes('website') || goalsText.includes('portfolio') || goalsText.includes('web')) goals.push('web_development');
    if (goalsText.includes('app') || goalsText.includes('mobile')) goals.push('mobile_development');
    if (goalsText.includes('career') || goalsText.includes('job') || goalsText.includes('switch')) goals.push('career_change');
    if (goalsText.includes('business') || goalsText.includes('startup') || goalsText.includes('entrepreneur')) goals.push('entrepreneurship');
    if (goalsText.includes('skill') || goalsText.includes('improve') || goalsText.includes('learn')) goals.push('skill_improvement');
    if (goalsText.includes('game') || goalsText.includes('gaming')) goals.push('game_development');
    if (goalsText.includes('data') || goalsText.includes('analytics') || goalsText.includes('ai')) goals.push('data_science');
    
    return goals;
}

function extractExperienceLevel(userMessages: Message[]): string {
    if (userMessages.length < 3) return 'beginner';
    
    const experienceText = userMessages[2]?.content.toLowerCase() || '';
    
    if (experienceText.includes('advanced') || experienceText.includes('professional') || experienceText.includes('years')) return 'advanced';
    if (experienceText.includes('intermediate') || experienceText.includes('some projects') || experienceText.includes('built')) return 'intermediate';
    if (experienceText.includes('some experience') || experienceText.includes('tutorials') || experienceText.includes('tried')) return 'some_experience';
    if (experienceText.includes('beginner') || experienceText.includes('new') || experienceText.includes('never')) return 'beginner';
    
    return 'beginner';
}

function extractTimeAvailability(userMessages: Message[]): string {
    if (userMessages.length < 4) return 'unknown';
    
    const timeText = userMessages[3]?.content.toLowerCase() || '';
    
    if (timeText.includes('1') || timeText.includes('2') || timeText.includes('3') || timeText.includes('busy')) return 'limited';
    if (timeText.includes('4') || timeText.includes('5') || timeText.includes('6') || timeText.includes('7') || timeText.includes('8')) return 'moderate';
    if (timeText.includes('9') || timeText.includes('10') || timeText.includes('15') || timeText.includes('part')) return 'substantial';
    if (timeText.includes('16') || timeText.includes('full') || timeText.includes('20') || timeText.includes('dedicated')) return 'full_time';
    
    return 'moderate';
}

// Additional helper functions
function extractTimeframe(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('month') || lowerText.includes('weeks')) return 'short_term';
    if (lowerText.includes('3-6 months') || lowerText.includes('semester')) return 'medium_term';
    if (lowerText.includes('year') || lowerText.includes('long term')) return 'long_term';
    
    return 'flexible';
}

function extractCareerGoals(text: string): string[] {
    const goals: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('developer') || lowerText.includes('programmer') || lowerText.includes('engineer')) goals.push('software_developer');
    if (lowerText.includes('data scientist') || lowerText.includes('data analyst') || lowerText.includes('machine learning')) goals.push('data_scientist');
    if (lowerText.includes('designer') || lowerText.includes('ui') || lowerText.includes('ux')) goals.push('designer');
    if (lowerText.includes('manager') || lowerText.includes('lead') || lowerText.includes('director')) goals.push('management');
    if (lowerText.includes('freelance') || lowerText.includes('consultant') || lowerText.includes('independent')) goals.push('freelancer');
    if (lowerText.includes('startup') || lowerText.includes('entrepreneur') || lowerText.includes('founder')) goals.push('entrepreneur');
    if (lowerText.includes('product') || lowerText.includes('pm')) goals.push('product_manager');
    
    return goals;
}

function extractProjectInterests(text: string): string[] {
    const interests: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('portfolio') || lowerText.includes('personal website')) interests.push('portfolio_website');
    if (lowerText.includes('e-commerce') || lowerText.includes('shop') || lowerText.includes('store')) interests.push('ecommerce_platform');
    if (lowerText.includes('social') || lowerText.includes('community') || lowerText.includes('network')) interests.push('social_platform');
    if (lowerText.includes('tool') || lowerText.includes('utility') || lowerText.includes('productivity')) interests.push('productivity_tool');
    if (lowerText.includes('game') || lowerText.includes('interactive')) interests.push('game_project');
    if (lowerText.includes('api') || lowerText.includes('backend') || lowerText.includes('service')) interests.push('api_development');
    if (lowerText.includes('dashboard') || lowerText.includes('analytics') || lowerText.includes('visualization')) interests.push('data_dashboard');
    if (lowerText.includes('automation') || lowerText.includes('script') || lowerText.includes('bot')) interests.push('automation_project');
    
    return interests;
}

function extractTimeConstraints(text: string): string[] {
    const constraints: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('limited time') || lowerText.includes('busy') || lowerText.includes('1-3 hours')) constraints.push('very_limited');
    if (lowerText.includes('weekend') || lowerText.includes('part time') || lowerText.includes('evening')) constraints.push('part_time');
    if (lowerText.includes('flexible') || lowerText.includes('varies') || lowerText.includes('depends')) constraints.push('flexible');
    if (lowerText.includes('deadline') || lowerText.includes('urgent') || lowerText.includes('quickly')) constraints.push('urgent');
    if (lowerText.includes('full time') || lowerText.includes('dedicated') || lowerText.includes('available')) constraints.push('full_availability');
    
    return constraints;
}

function extractChallenges(text: string): string[] {
    const challenges: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('time') || lowerText.includes('busy') || lowerText.includes('schedule')) challenges.push('time_management');
    if (lowerText.includes('difficult') || lowerText.includes('hard') || lowerText.includes('complex')) challenges.push('complexity');
    if (lowerText.includes('motivation') || lowerText.includes('procrastination') || lowerText.includes('stuck')) challenges.push('motivation');
    if (lowerText.includes('money') || lowerText.includes('expensive') || lowerText.includes('cost')) challenges.push('financial');
    if (lowerText.includes('confused') || lowerText.includes('overwhelmed') || lowerText.includes('lost')) challenges.push('information_overload');
    if (lowerText.includes('confidence') || lowerText.includes('imposter') || lowerText.includes('doubt')) challenges.push('confidence');
    if (lowerText.includes('math') || lowerText.includes('algorithm') || lowerText.includes('logic')) challenges.push('technical_concepts');
    
    return challenges;
}

function extractConcerns(text: string): string[] {
    const concerns: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('too old') || lowerText.includes('age') || lowerText.includes('late')) concerns.push('age_concern');
    if (lowerText.includes('no experience') || lowerText.includes('background') || lowerText.includes('qualify')) concerns.push('experience_concern');
    if (lowerText.includes('job market') || lowerText.includes('competition') || lowerText.includes('oversaturated')) concerns.push('market_concern');
    if (lowerText.includes('keep up') || lowerText.includes('fast pace') || lowerText.includes('changing')) concerns.push('pace_concern');
    if (lowerText.includes('balance') || lowerText.includes('family') || lowerText.includes('life')) concerns.push('work_life_balance');
    
    return concerns;
}

function analyzeCommunicationStyle(text: string): string {
    const lowerText = text.toLowerCase();
    const formalMatches = text.match(/\b[A-Z][a-z]+\b/g);
    
    if (lowerText.includes('professional') || lowerText.includes('formal') || (formalMatches && formalMatches.length > 5)) return 'formal';
    if (lowerText.includes('awesome') || lowerText.includes('cool') || text.includes('!')) return 'enthusiastic';
    if (lowerText.includes('technical') || lowerText.includes('specific') || lowerText.includes('algorithm')) return 'technical';
    if (lowerText.includes('simple') || lowerText.includes('basic') || lowerText.includes('explain')) return 'casual';
    
    return 'balanced';
}

function extractKeyPhrases(text: string): string[] {
    const phrases: string[] = [];
    const words = text.toLowerCase().split(/\s+/);
    
    // Extract meaningful 2-3 word phrases
    for (let i = 0; i < words.length - 1; i++) {
        const twoWord = `${words[i]} ${words[i + 1]}`;
        const threeWord = i < words.length - 2 ? `${words[i]} ${words[i + 1]} ${words[i + 2]}` : '';
        
        // Common meaningful phrases
        const meaningfulPhrases = [
            'career change', 'full time', 'part time', 'web development', 'machine learning',
            'data science', 'mobile app', 'personal project', 'side hustle', 'startup idea',
            'portfolio website', 'learning style', 'time management', 'hands on'
        ];
        
        if (meaningfulPhrases.includes(twoWord)) phrases.push(twoWord);
        if (meaningfulPhrases.includes(threeWord)) phrases.push(threeWord);
    }
    
    return phrases.slice(0, 5);
}

function extractIntentions(text: string): string[] {
    const intentions: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('learn') || lowerText.includes('understand') || lowerText.includes('study')) intentions.push('learning');
    if (lowerText.includes('build') || lowerText.includes('create') || lowerText.includes('develop')) intentions.push('building');
    if (lowerText.includes('switch') || lowerText.includes('transition') || lowerText.includes('change')) intentions.push('career_transition');
    if (lowerText.includes('improve') || lowerText.includes('better') || lowerText.includes('enhance')) intentions.push('skill_improvement');
    if (lowerText.includes('start') || lowerText.includes('begin') || lowerText.includes('launch')) intentions.push('starting_journey');
    if (lowerText.includes('master') || lowerText.includes('expert') || lowerText.includes('advanced')) intentions.push('mastery');
    
    return intentions;
}

// Additional analysis functions
function inferPersonalityTraits(text: string): string[] {
    const traits: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('detail') || lowerText.includes('thorough') || lowerText.includes('careful')) traits.push('detail_oriented');
    if (lowerText.includes('quick') || lowerText.includes('fast') || lowerText.includes('efficient')) traits.push('fast_paced');
    if (lowerText.includes('creative') || lowerText.includes('innovative') || lowerText.includes('artistic')) traits.push('creative');
    if (lowerText.includes('logical') || lowerText.includes('systematic') || lowerText.includes('analytical')) traits.push('analytical');
    if (lowerText.includes('social') || lowerText.includes('team') || lowerText.includes('collaborate')) traits.push('collaborative');
    if (lowerText.includes('independent') || lowerText.includes('self') || lowerText.includes('own')) traits.push('independent');
    
    return traits;
}

function analyzeMotivationLevel(text: string): number {
    const motivationIndicators = ['excited', 'passionate', 'determined', 'committed', 'dedicated', 'goal'];
    const lowerText = text.toLowerCase();
    
    let motivation = 0.5;
    motivationIndicators.forEach(indicator => {
        if (lowerText.includes(indicator)) motivation += 0.1;
    });
    
    return Math.min(motivation, 1.0);
}

function identifyLearningGaps(text: string): string[] {
    const gaps: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('never') || lowerText.includes('no experience') || lowerText.includes('new to')) gaps.push('foundational_knowledge');
    if (lowerText.includes('struggle') || lowerText.includes('difficult') || lowerText.includes('confused')) gaps.push('conceptual_understanding');
    if (lowerText.includes('practice') || lowerText.includes('hands-on') || lowerText.includes('real world')) gaps.push('practical_experience');
    if (lowerText.includes('advanced') || lowerText.includes('complex') || lowerText.includes('deep')) gaps.push('advanced_concepts');
    
    return gaps;
}

function inferPreferredTechStack(text: string): string[] {
    const stacks: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('web') && (lowerText.includes('react') || lowerText.includes('javascript'))) stacks.push('react_stack');
    if (lowerText.includes('python') && lowerText.includes('data')) stacks.push('python_data_stack');
    if (lowerText.includes('mobile') && lowerText.includes('react')) stacks.push('react_native_stack');
    if (lowerText.includes('full stack') || (lowerText.includes('frontend') && lowerText.includes('backend'))) stacks.push('full_stack');
    if (lowerText.includes('ai') || lowerText.includes('machine learning')) stacks.push('ml_stack');
    
    return stacks;
}

function inferPreferredFormat(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('video') || lowerText.includes('watch') || lowerText.includes('youtube')) return 'video';
    if (lowerText.includes('interactive') || lowerText.includes('coding') || lowerText.includes('practice')) return 'interactive';
    if (lowerText.includes('reading') || lowerText.includes('documentation') || lowerText.includes('article')) return 'text';
    if (lowerText.includes('project') || lowerText.includes('build') || lowerText.includes('hands-on')) return 'project_based';
    
    return 'mixed';
}

function identifySupportNeeds(text: string): string[] {
    const needs: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('mentor') || lowerText.includes('guidance') || lowerText.includes('help')) needs.push('mentorship');
    if (lowerText.includes('community') || lowerText.includes('peers') || lowerText.includes('others')) needs.push('peer_support');
    if (lowerText.includes('feedback') || lowerText.includes('review') || lowerText.includes('check')) needs.push('feedback');
    if (lowerText.includes('structure') || lowerText.includes('plan') || lowerText.includes('roadmap')) needs.push('structured_path');
    if (lowerText.includes('motivation') || lowerText.includes('accountability') || lowerText.includes('push')) needs.push('accountability');
    
    return needs;
}

function assessAvailableResources(text: string): string[] {
    const resources: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('computer') || lowerText.includes('laptop') || lowerText.includes('setup')) resources.push('computing_equipment');
    if (lowerText.includes('time') || lowerText.includes('hours') || lowerText.includes('available')) resources.push('time_availability');
    if (lowerText.includes('budget') || lowerText.includes('invest') || lowerText.includes('money')) resources.push('financial_resources');
    if (lowerText.includes('support') || lowerText.includes('family') || lowerText.includes('understanding')) resources.push('family_support');
    if (lowerText.includes('internet') || lowerText.includes('connection') || lowerText.includes('online')) resources.push('internet_access');
    
    return resources;
}

function analyzeSentimentTrend(messages: Message[]): string {
    const sentiments = messages.map(msg => analyzeSentiment(msg.content));
    const positiveCount = sentiments.filter(s => s === 'positive').length;
    const negativeCount = sentiments.filter(s => s === 'negative').length;
    
    if (positiveCount > negativeCount) return 'increasingly_positive';
    if (negativeCount > positiveCount) return 'cautious';
    return 'balanced';
}

function calculateEngagementLevel(messages: Message[]): number {
    let engagement = 0;
    
    messages.forEach(msg => {
        engagement += msg.content.length / 100; // Word count factor
        if (msg.content.includes('!')) engagement += 0.1; // Enthusiasm
        if (msg.content.length > 50) engagement += 0.1; // Detailed response
    });
    
    return Math.min(engagement / messages.length, 1.0);
}

// Additional inferencing functions
function inferLearnerType(context: any): string {
    const { technicalProfile, learningPreferences, objectives } = context;
    
    if (technicalProfile.experienceLevel === 'beginner' && learningPreferences.style.includes('structured')) {
        return 'guided_beginner';
    }
    if (technicalProfile.experienceLevel === 'intermediate' && learningPreferences.style.includes('project_based')) {
        return 'project_driven';
    }
    if (objectives.motivationLevel > 0.8 && learningPreferences.pace === 'fast') {
        return 'accelerated_learner';
    }
    if (learningPreferences.style.includes('experimental') && technicalProfile.experienceLevel !== 'beginner') {
        return 'explorer';
    }
    
    return 'balanced_learner';
}

function suggestLearningPath(context: any): string {
    const { objectives, technicalProfile } = context;
    
    if (objectives.primaryGoals.includes('web_development')) {
        return technicalProfile.experienceLevel === 'beginner' ? 'web_development_fundamentals' : 'advanced_web_development';
    }
    if (objectives.primaryGoals.includes('mobile_development')) {
        return 'mobile_development_path';
    }
    if (objectives.primaryGoals.includes('data_science')) {
        return 'data_science_path';
    }
    if (objectives.careerAspiration.includes('career_change')) {
        return 'career_transition_path';
    }
    
    return 'general_programming_path';
}

function createMotivationalProfile(context: any): any {
    return {
        primaryMotivators: context.objectives.motivationLevel > 0.7 ? ['achievement', 'progress'] : ['support', 'encouragement'],
        communicationTone: context.personalInfo.communicationStyle === 'enthusiastic' ? 'energetic' : 'supportive',
        celebrationStyle: context.personalInfo.personality.includes('social') ? 'public_recognition' : 'personal_milestone',
        challengeLevel: context.technicalProfile.experienceLevel === 'advanced' ? 'high' : 'moderate'
    };
}

function configureAdaptiveSettings(context: any): any {
    return {
        difficultyProgression: context.learningPreferences.pace === 'fast' ? 'accelerated' : 'gradual',
        contentFormat: context.learningPreferences.preferredFormat,
        supportLevel: context.learningPreferences.supportNeeds.length > 2 ? 'high' : 'moderate',
        personalizedReminders: context.constraints.timeConstraints.includes('very_limited') ? 'frequent_short' : 'weekly_summary'
    };
}

function generateContextualPrompts(context: any): string[] {
    const prompts: string[] = [];
    
    if (context.objectives.primaryGoals.includes('career_change')) {
        prompts.push("How does this learning session move you closer to your career transition goal?");
    }
    if (context.constraints.challenges.includes('time_management')) {
        prompts.push("What's one small step you can take today, even with your busy schedule?");
    }
    if (context.learningPreferences.style.includes('project_based')) {
        prompts.push("How can you apply what you're learning to a real project?");
    }
    
    return prompts;
}
