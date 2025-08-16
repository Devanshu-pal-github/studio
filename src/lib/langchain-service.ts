import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const model = new ChatGoogleGenerativeAI({
  modelName: 'gemini-pro',
  maxOutputTokens: 2048,
  temperature: 0.7,
});

interface OnboardingContext {
  userId: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  userProfile: {
    name?: string;
    experienceLevel?: string;
    goals?: string[];
    interests?: string[];
    learningStyle?: string;
    timeAvailability?: string;
    challenges?: string[];
  };
  currentQuestionIndex: number;
  totalQuestions: number;
}

interface VectorEmbedding {
  userId: string;
  content: string;
  metadata: {
    questionIndex: number;
    category: string;
    timestamp: Date;
    importance: number;
    context: any;
  };
}

class LangChainService {
  private static instance: LangChainService;

  private constructor() {}

  static getInstance(): LangChainService {
    if (!LangChainService.instance) {
      LangChainService.instance = new LangChainService();
    }
    return LangChainService.instance;
  }

  /**
   * Generate dynamic onboarding questions based on user context
   */
  async generateDynamicQuestion(context: OnboardingContext): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context);
    
    const prompt = PromptTemplate.fromTemplate(`
{systemPrompt}

Based on the user's previous responses and current context, generate the next personalized question.

Previous conversation:
{conversationHistory}

User profile so far:
{userProfile}

Current question index: {currentQuestionIndex} of {totalQuestions}

Generate a natural, conversational question that:
1. Builds upon previous responses
2. Feels personalized to the user's situation
3. Gathers specific information needed for the next step
4. Maintains an encouraging and supportive tone

Question: `);

    const chain = RunnableSequence.from([
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({
      systemPrompt,
      conversationHistory: context.conversationHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n'),
      userProfile: JSON.stringify(context.userProfile, null, 2),
      currentQuestionIndex: context.currentQuestionIndex,
      totalQuestions: context.totalQuestions,
    });

    return result;
  }

  /**
   * Analyze user response and extract insights
   */
  async analyzeUserResponse(response: string, context: OnboardingContext): Promise<any> {
    const analysisPrompt = PromptTemplate.fromTemplate(`
You are an AI learning mentor analyzing a user's response during onboarding.

User's response: {response}

Previous context: {context}

Analyze this response and extract the following information in JSON format:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0-1,
  "enthusiasm": 0-1,
  "experienceLevel": "beginner|intermediate|advanced",
  "goals": ["array", "of", "specific", "goals"],
  "interests": ["array", "of", "technical", "interests"],
  "learningStyle": "visual|auditory|kinesthetic|mixed",
  "timeAvailability": "limited|moderate|substantial",
  "challenges": ["array", "of", "challenges"],
  "motivation": "high|medium|low",
  "communicationStyle": "formal|casual|technical|enthusiastic",
  "keyPhrases": ["important", "phrases", "extracted"],
  "nextQuestionFocus": "what aspect to focus on next"
}

Analysis: `);

    const chain = RunnableSequence.from([
      analysisPrompt,
      model,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({
      response,
      context: JSON.stringify(context, null, 2),
    });

    try {
      return JSON.parse(result);
    } catch (error) {
      console.error('Failed to parse analysis result:', error);
      return this.fallbackAnalysis(response);
    }
  }

  /**
   * Generate personalized recommendations based on onboarding data
   */
  async generatePersonalizedRecommendations(userId: string, onboardingData: any): Promise<any> {
    const recommendationPrompt = PromptTemplate.fromTemplate(`
You are an AI learning mentor creating personalized recommendations for a user.

User Profile:
{userProfile}

Onboarding Analysis:
{onboardingAnalysis}

Generate comprehensive recommendations in JSON format:
{
  "learningPath": {
    "primaryPath": "recommended learning path",
    "alternativePaths": ["alternative", "options"],
    "estimatedDuration": "time estimate",
    "difficultyProgression": "how to progress"
  },
  "projectRecommendations": [
    {
      "name": "project name",
      "description": "project description",
      "difficulty": "beginner|intermediate|advanced",
      "technologies": ["tech", "stack"],
      "estimatedTime": "time estimate",
      "learningOutcomes": ["what they'll learn"]
    }
  ],
  "resourceRecommendations": {
    "courses": ["course", "recommendations"],
    "documentation": ["docs", "to read"],
    "tools": ["tools", "to use"],
    "communities": ["communities", "to join"]
  },
  "personalizedMotivation": {
    "communicationStyle": "how to communicate with this user",
    "celebrationStyle": "how to celebrate achievements",
    "challengeLevel": "appropriate challenge level"
  },
  "adaptiveSettings": {
    "contentFormat": "preferred content format",
    "supportLevel": "needed support level",
    "reminderFrequency": "reminder preferences"
  }
}

Recommendations: `);

    const chain = RunnableSequence.from([
      recommendationPrompt,
      model,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({
      userProfile: JSON.stringify(onboardingData.userProfile, null, 2),
      onboardingAnalysis: JSON.stringify(onboardingData.analysis, null, 2),
    });

    try {
      return JSON.parse(result);
    } catch (error) {
      console.error('Failed to parse recommendations:', error);
      return this.fallbackRecommendations(onboardingData);
    }
  }

  /**
   * Create vector embeddings for user responses
   */
  async createVectorEmbedding(content: string, metadata: any): Promise<VectorEmbedding> {
    // For now, we'll use a simple hash-based embedding
    // In production, you'd use a proper embedding service
    const embedding = this.simpleHashEmbedding(content);
    
    return {
      userId: metadata.userId,
      content,
      metadata: {
        ...metadata,
        embedding,
        timestamp: new Date(),
      },
    };
  }

  /**
   * Search similar responses for context
   */
  async searchSimilarResponses(query: string, userId: string): Promise<VectorEmbedding[]> {
    // This would integrate with a vector database like Pinecone
    // For now, return empty array
    return [];
  }

  /**
   * Build system prompt for dynamic question generation
   */
  private buildSystemPrompt(context: OnboardingContext): string {
    return `You are an AI learning mentor conducting a personalized onboarding session. Your goal is to understand the user's learning needs and create a customized learning experience.

Key principles:
1. Be conversational and encouraging
2. Ask follow-up questions based on previous responses
3. Gather specific, actionable information
4. Adapt your communication style to the user's responses
5. Focus on one aspect at a time
6. Build upon previous answers to create continuity

Current session context:
- User ID: ${context.userId}
- Question ${context.currentQuestionIndex} of ${context.totalQuestions}
- User has provided: ${Object.keys(context.userProfile).length} pieces of information

Generate questions that feel natural and build upon what the user has already shared.`;
  }

  /**
   * Fallback analysis when AI parsing fails
   */
  private fallbackAnalysis(response: string): any {
    const lowerResponse = response.toLowerCase();
    
    return {
      sentiment: lowerResponse.includes('excited') || lowerResponse.includes('love') ? 'positive' : 'neutral',
      confidence: 0.5,
      enthusiasm: lowerResponse.includes('!') ? 0.8 : 0.5,
      experienceLevel: lowerResponse.includes('beginner') ? 'beginner' : 'intermediate',
      goals: [],
      interests: [],
      learningStyle: 'mixed',
      timeAvailability: 'moderate',
      challenges: [],
      motivation: 'medium',
      communicationStyle: 'casual',
      keyPhrases: [],
      nextQuestionFocus: 'general'
    };
  }

  /**
   * Fallback recommendations when AI parsing fails
   */
  private fallbackRecommendations(onboardingData: any): any {
    return {
      learningPath: {
        primaryPath: 'Web Development Fundamentals',
        alternativePaths: ['Mobile Development', 'Data Science'],
        estimatedDuration: '6-8 months',
        difficultyProgression: 'gradual'
      },
      projectRecommendations: [
        {
          name: 'Personal Portfolio Website',
          description: 'Build a responsive portfolio website',
          difficulty: 'beginner',
          technologies: ['HTML', 'CSS', 'JavaScript'],
          estimatedTime: '2-3 weeks',
          learningOutcomes: ['HTML/CSS fundamentals', 'Responsive design', 'Basic JavaScript']
        }
      ],
      resourceRecommendations: {
        courses: ['Web Development Bootcamp'],
        documentation: ['MDN Web Docs'],
        tools: ['VS Code', 'GitHub'],
        communities: ['Stack Overflow', 'Reddit r/webdev']
      },
      personalizedMotivation: {
        communicationStyle: 'supportive',
        celebrationStyle: 'milestone-based',
        challengeLevel: 'moderate'
      },
      adaptiveSettings: {
        contentFormat: 'mixed',
        supportLevel: 'moderate',
        reminderFrequency: 'weekly'
      }
    };
  }

  /**
   * Simple hash-based embedding (replace with proper embedding service)
   */
  private simpleHashEmbedding(content: string): number[] {
    const hash = content.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Generate a simple 128-dimensional vector
    const embedding = new Array(128).fill(0);
    for (let i = 0; i < 128; i++) {
      embedding[i] = Math.sin(hash + i) * 0.5 + 0.5;
    }
    
    return embedding;
  }
}

export const langChainService = LangChainService.getInstance(); 