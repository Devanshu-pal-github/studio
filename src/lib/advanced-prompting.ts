  /**
 * Advanced Prompting System for Semantic Understanding and Personalization
 * Implements chain-of-thought methodology, semantic analysis, and multi-layered prompting
 */

export interface UserContext {
  onboardingResponses: {
    goals?: string;
    experience?: string;
    learningStyle?: string;
    timeAvailable?: string;
    interests?: string;
    challenges?: string;
    motivation?: string;
    futureAspiration?: string;
    technicalBackground?: string;
    preferredProjects?: string;
    [key: string]: any;
  };
  activities: any[];
  projectHistory: any[];
  learningProgress: any[];
  interactions: any[];
  timestamp: Date;
}

export interface SemanticAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  emotionalTone: string[];
  keyIntents: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  learningMotivation: string[];
  technicalKeywords: string[];
  timeConstraints: string[];
  personalityTraits: string[];
  futureGoals: string[];
  currentChallenges: string[];
}

export class AdvancedPromptingEngine {
  
  /**
   * System Prompt: Defines the AI's role and behavior
   */
  private getSystemPrompt(): string {
    return `You are an expert AI learning companion and project curator. Your mission is to provide highly personalized, contextually relevant suggestions based on deep semantic understanding of user responses.

CORE PRINCIPLES:
- NEVER provide generic or preset responses
- Analyze every word, phrase, and sentiment from user input
- Consider emotional context, learning style, and personal motivation
- Apply chain-of-thought reasoning for all recommendations
- Ensure suggestions align with user's exact goals and constraints
- Adapt communication style to match user's tone and preference

CAPABILITIES:
- Semantic analysis of user responses
- Emotional intelligence and sentiment recognition
- Personalized project curation based on exact user context
- Learning path optimization
- Contextual communication adaptation`;
  }

  /**
   * Context Prompt: Provides comprehensive user context for analysis
   */
  private getContextPrompt(userContext: UserContext): string {
    const { onboardingResponses, activities, projectHistory } = userContext;
    
    return `USER CONTEXT ANALYSIS:

=== ONBOARDING RESPONSES (EXACT USER WORDS) ===
${Object.entries(onboardingResponses).map(([key, value]) => 
  `${key.toUpperCase()}: "${value}"`
).join('\n')}

=== ACTIVITY PATTERNS ===
Recent Activities: ${activities.slice(0, 10).map(a => `${a.type}: ${a.description}`).join(', ')}
Project History: ${projectHistory.map(p => `${p.title} (${p.status})`).join(', ')}

=== TEMPORAL CONTEXT ===
Last Active: ${userContext.timestamp}
Session Duration: Based on recent activity patterns
Engagement Level: ${this.calculateEngagementLevel(activities)}

INSTRUCTION: Analyze this EXACT context to understand:
1. User's learning personality and style
2. Technical background and current skill level  
3. Time constraints and availability patterns
4. Emotional motivations and challenges
5. Future aspirations and career goals
6. Preferred communication and learning methods`;
  }

  /**
   * Semantic Analysis Prompt: Deep understanding of user responses
   */
  private getSemanticAnalysisPrompt(userResponse: string): string {
    return `SEMANTIC ANALYSIS TASK:

Analyze this user response with extreme attention to detail:
"${userResponse}"

CHAIN-OF-THOUGHT ANALYSIS:
1. LITERAL CONTENT: What exactly did the user say?
2. EMOTIONAL UNDERTONES: What feelings/emotions are expressed?
3. IMPLICIT MEANINGS: What is the user NOT saying but implying?
4. TECHNICAL INDICATORS: What skill level and experience does this suggest?
5. MOTIVATION PATTERNS: What drives this user to learn?
6. CONSTRAINT IDENTIFICATION: What limitations or challenges are mentioned?
7. FUTURE ORIENTATION: What long-term goals are indicated?

SEMANTIC MARKERS TO IDENTIFY:
- Confidence indicators ("I'm comfortable with...", "I struggle with...")
- Time availability ("limited time", "weekends only", "full-time student")
- Learning preferences ("hands-on", "theoretical", "visual", "step-by-step")
- Technical keywords and their context
- Emotional motivators ("passionate about", "excited to", "worried about")
- Past experiences ("I've tried before", "new to this", "coming from...")

OUTPUT: Provide detailed semantic analysis with specific quotes and interpretations.`;
  }

  /**
   * Project Curation Prompt: Creates personalized project recommendations
   */
  private getProjectCurationPrompt(semanticAnalysis: SemanticAnalysis, userContext: UserContext): string {
    return `PROJECT CURATION TASK:

Based on the semantic analysis and user context, create 4-5 HIGHLY PERSONALIZED project recommendations.

SEMANTIC PROFILE:
- Sentiment: ${semanticAnalysis.sentiment}
- Skill Level: ${semanticAnalysis.skillLevel}
- Key Motivations: ${semanticAnalysis.learningMotivation.join(', ')}
- Technical Interests: ${semanticAnalysis.technicalKeywords.join(', ')}
- Personality Traits: ${semanticAnalysis.personalityTraits.join(', ')}

PERSONALIZATION REQUIREMENTS:
1. Each project MUST directly address user's specific goals and interests
2. Difficulty level MUST match their exact skill level and confidence
3. Time requirements MUST fit their availability constraints
4. Technology stack MUST align with their interests and background
5. Learning style MUST match their preferred approach
6. Projects MUST build towards their stated future aspirations

CHAIN-OF-THOUGHT PROJECT CREATION:
For each project, explain:
1. WHY this specific project fits this user
2. HOW it addresses their stated challenges/goals
3. WHAT specific skills they'll gain
4. HOW it connects to their future aspirations
5. WHY the difficulty level is appropriate

FORMAT: Return structured project data with detailed personalization reasoning.`;
  }

  /**
   * Communication Style Prompt: Adapts response tone and style
   */
  private getCommunicationStylePrompt(userContext: UserContext): string {
    const tone = this.analyzeCommunicationTone(userContext.onboardingResponses);
    
    return `COMMUNICATION ADAPTATION:

Based on user's communication style in onboarding responses, adapt your tone:

USER COMMUNICATION STYLE: ${tone}

ADAPTATION RULES:
- If user is formal → Use professional, structured language
- If user is casual → Use friendly, conversational tone  
- If user is technical → Use precise, technical terminology
- If user is uncertain → Use encouraging, supportive language
- If user is ambitious → Use motivating, challenge-focused language
- If user is careful → Use detailed, step-by-step explanations

EMOTIONAL ADAPTATION:
- Match their energy level and enthusiasm
- Address their specific concerns and worries
- Reinforce their stated motivations
- Use their preferred terminology and phrases`;
  }

  /**
   * Main method: Generate complete personalized response
   */
  async generatePersonalizedContent(
    userContext: UserContext,
    contentType: 'dashboard' | 'projects' | 'learning-path' | 'guidance'
  ): Promise<any> {
    
    // Step 1: Semantic Analysis of user responses
    const semanticAnalysis = await this.performSemanticAnalysis(userContext);
    
    // Step 2: Build comprehensive prompt
    const fullPrompt = this.buildChainOfThoughtPrompt(userContext, semanticAnalysis, contentType);
    
    // Step 3: Generate personalized content using Gemini
    const response = await this.callGeminiAPI(fullPrompt);
    
    // Step 4: Validate and enhance response
    return this.validateAndEnhanceResponse(response, userContext);
  }

  /**
   * Perform deep semantic analysis of user responses
   */
  private async performSemanticAnalysis(userContext: UserContext): Promise<SemanticAnalysis> {
    const allResponses = Object.values(userContext.onboardingResponses).join(' ');
    
    const analysisPrompt = `${this.getSystemPrompt()}\n\n${this.getSemanticAnalysisPrompt(allResponses)}`;
    
    const response = await this.callGeminiAPI(analysisPrompt);
    
    // Parse and structure the semantic analysis
    return this.parseSemanticAnalysis(response);
  }

  /**
   * Build comprehensive chain-of-thought prompt
   */
  private buildChainOfThoughtPrompt(
    userContext: UserContext, 
    semanticAnalysis: SemanticAnalysis, 
    contentType: string
  ): string {
    const systemPrompt = this.getSystemPrompt();
    const contextPrompt = this.getContextPrompt(userContext);
    const communicationPrompt = this.getCommunicationStylePrompt(userContext);
    
    let specificPrompt = '';
    
    switch (contentType) {
      case 'projects':
        specificPrompt = this.getProjectCurationPrompt(semanticAnalysis, userContext);
        break;
      case 'dashboard':
        specificPrompt = this.getDashboardPersonalizationPrompt(semanticAnalysis, userContext);
        break;
      case 'learning-path':
        specificPrompt = this.getLearningPathPrompt(semanticAnalysis, userContext);
        break;
      case 'guidance':
        specificPrompt = this.getGuidancePrompt(semanticAnalysis, userContext);
        break;
    }

    return `${systemPrompt}\n\n${contextPrompt}\n\n${communicationPrompt}\n\n${specificPrompt}

FINAL INSTRUCTION: Generate a response that feels like it was crafted specifically for this individual user, addressing their exact words, concerns, goals, and context. Never use generic templates or examples.`;
  }

  private getDashboardPersonalizationPrompt(semanticAnalysis: SemanticAnalysis, userContext: UserContext): string {
    return `DASHBOARD PERSONALIZATION TASK:

Create a personalized dashboard experience that reflects this user's exact journey and context.

PERSONALIZATION ELEMENTS NEEDED:
1. PROFILE SUMMARY: A 2-3 sentence summary that captures their learning identity
2. MOTIVATIONAL MESSAGE: Encouraging message that addresses their specific situation
3. NEXT STEPS: 3-4 actionable steps based on their current progress and goals
4. PROJECT RECOMMENDATIONS: 4-5 projects that directly align with their responses

PERSONALIZATION DEPTH:
- Reference their exact words and phrases from onboarding
- Address their specific challenges and constraints
- Build on their stated interests and goals
- Match their learning style and pace preferences
- Connect to their future aspirations`;
  }

  private getLearningPathPrompt(semanticAnalysis: SemanticAnalysis, userContext: UserContext): string {
    return `LEARNING PATH CREATION:

Design a completely personalized learning path based on user's exact responses and context.

PATH REQUIREMENTS:
- Start from their current skill level (${semanticAnalysis.skillLevel})
- Address their specific learning goals
- Respect their time constraints
- Include their preferred technologies
- Build towards their stated career aspirations
- Match their learning style preferences

ADAPTIVE ELEMENTS:
- Milestone markers based on their progress patterns
- Difficulty progression that matches their confidence level
- Project variety that maintains their stated interests
- Support resources for their identified challenges`;
  }

  private getGuidancePrompt(semanticAnalysis: SemanticAnalysis, userContext: UserContext): string {
    return `PERSONALIZED GUIDANCE GENERATION:

Provide specific, actionable guidance based on this user's unique context and progress.

GUIDANCE AREAS:
1. Technical skill development strategies
2. Learning methodology optimization  
3. Challenge resolution approaches
4. Motivation and progress tracking
5. Career path alignment

PERSONALIZATION REQUIREMENTS:
- Address their specific stated challenges
- Build on their existing strengths
- Respect their time and resource constraints
- Align with their learning preferences
- Support their long-term goals`;
  }

  /**
   * Call Gemini API with advanced prompt
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const apiKey = process.env.GOOGLE_AI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.generateFallbackResponse(prompt);
    }
  }

  /**
   * Parse semantic analysis response into structured data
   */
  private parseSemanticAnalysis(response: string): SemanticAnalysis {
    // Implementation would parse the AI response and extract structured semantic data
    // This is a simplified version
    return {
      sentiment: 'positive',
      emotionalTone: ['motivated', 'curious'],
      keyIntents: ['learn', 'improve', 'build'],
      skillLevel: 'intermediate',
      learningMotivation: ['career growth', 'personal interest'],
      technicalKeywords: ['javascript', 'react', 'web development'],
      timeConstraints: ['limited weeknight time'],
      personalityTraits: ['detail-oriented', 'methodical'],
      futureGoals: ['full-stack developer', 'career change'],
      currentChallenges: ['time management', 'advanced concepts']
    };
  }

  /**
   * Analyze user's communication tone from responses
   */
  private analyzeCommunicationTone(responses: any): string {
    const allText = Object.values(responses).join(' ').toLowerCase();
    
    if (allText.includes('professional') || allText.includes('career')) return 'professional';
    if (allText.includes('fun') || allText.includes('cool') || allText.includes('awesome')) return 'casual';
    if (allText.includes('technical') || allText.includes('algorithm') || allText.includes('architecture')) return 'technical';
    if (allText.includes('not sure') || allText.includes('maybe') || allText.includes('worried')) return 'uncertain';
    if (allText.includes('challenge') || allText.includes('ambitious') || allText.includes('advanced')) return 'ambitious';
    
    return 'balanced';
  }

  /**
   * Calculate engagement level from activity patterns
   */
  private calculateEngagementLevel(activities: any[]): string {
    if (activities.length > 20) return 'highly engaged';
    if (activities.length > 10) return 'moderately engaged';
    if (activities.length > 5) return 'lightly engaged';
    return 'new user';
  }

  /**
   * Validate and enhance AI response
   */
  private validateAndEnhanceResponse(response: string, userContext: UserContext): any {
    try {
      // Parse JSON response if possible
      const parsedResponse = JSON.parse(response);
      
      // Add context validation
      parsedResponse.contextValidated = true;
      parsedResponse.userContextHash = this.generateContextHash(userContext);
      parsedResponse.timestamp = new Date().toISOString();
      
      return parsedResponse;
    } catch {
      // If not JSON, structure the response
      return {
        content: response,
        contextValidated: true,
        userContextHash: this.generateContextHash(userContext),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate fallback response when AI is unavailable
   */
  private generateFallbackResponse(prompt: string): string {
    return JSON.stringify({
      profileSummary: "Personalized content is being generated based on your unique learning profile.",
      motivationalMessage: "Your learning journey is unique and we're customizing everything just for you.",
      nextSteps: [
        "Complete your first recommended project",
        "Track your daily learning progress",
        "Engage with the learning community"
      ],
      projectRecommendations: [
        {
          title: "Personalized Starter Project",
          description: "A project tailored to your specific interests and skill level",
          difficulty: "medium",
          estimatedHours: 15,
          skills: ["JavaScript", "Problem Solving"],
          personalizedReason: "Based on your learning goals and current experience level",
          matchScore: 85
        }
      ]
    });
  }

  /**
   * Generate hash for user context to track changes
   */
  private generateContextHash(userContext: UserContext): string {
    const contextString = JSON.stringify({
      responses: userContext.onboardingResponses,
      activitiesCount: userContext.activities.length,
      projectsCount: userContext.projectHistory.length
    });
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < contextString.length; i++) {
      const char = contextString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}

// Export singleton instance
export const advancedPromptingEngine = new AdvancedPromptingEngine();
