import { GoogleGenerativeAI } from '@google/generative-ai';
import { vectorStore, LearningContext } from './vectorStore';
import { DatabaseService } from './database';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '');

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  resources?: {
    title: string;
    url: string;
    type: string;
  }[];
  followUpQuestions?: string[];
}

export class AIService {
  private model: any;
  
  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  // Generate personalized learning recommendations using RAG
  async generatePersonalizedRecommendations(
    userId: string,
    userContext: LearningContext
  ): Promise<{
    projects: any[];
    resources: any[];
    nextSteps: string[];
  }> {
    try {
      // Search vector store for relevant content
      const relevantContent = await vectorStore.getPersonalizedRecommendations(userContext, 5);
      
      const contextPrompt = `
        Based on the user's learning context and relevant educational content, generate personalized recommendations.
        
        User Context:
        - Goals: ${userContext.goals.join(', ')}
        - Experience Level: ${userContext.experience}
        - Learning Style: ${userContext.learningStyle}
        - Preferences: ${userContext.preferences.join(', ')}
        - Current Projects: ${userContext.currentProjects.join(', ')}
        
        Relevant Educational Content:
        ${relevantContent.map(doc => `- ${doc.content} (${doc.metadata.type}, ${doc.metadata.difficulty})`).join('\n')}
        
        Please provide:
        1. 3-5 specific project recommendations with difficulty levels
        2. 5-7 learning resources (tutorials, articles, videos)
        3. 3-4 immediate next steps for the user
        
        Format as JSON with structure:
        {
          "projects": [{"title": "", "description": "", "difficulty": "", "estimatedTime": "", "technologies": []}],
          "resources": [{"title": "", "url": "", "type": "", "description": ""}],
          "nextSteps": ["step1", "step2", "step3"]
        }
      `;

      const result = await this.model.generateContent(contextPrompt);
      const response = result.response.text();
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return this.getFallbackRecommendations(userContext);
      }
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getFallbackRecommendations(userContext);
    }
  }

  // AI-powered chat for learning assistance
  async chat(
    userId: string,
    message: string,
    conversationHistory: ChatMessage[] = [],
    context?: {
      currentProject?: string;
      learningGoals?: string[];
      userLevel?: string;
    }
  ): Promise<AIResponse> {
    try {
      // Get user's learning context for better responses
      const userProfile = await DatabaseService.getUserProfile(userId);
      const onboardingData = await DatabaseService.getOnboardingData(userId);
      
      // Search for relevant information using RAG
      const relevantDocs = await vectorStore.search(message, 3);
      
      const systemPrompt = `
        You are StudoAI, an expert AI learning mentor. You help users learn programming and technology skills.
        
        User Profile:
        - Level: ${userProfile?.level || 1}
        - Points: ${userProfile?.points || 0}
        - Goals: ${onboardingData?.goals.join(', ') || 'General learning'}
        - Experience: ${onboardingData?.experience || 'Beginner'}
        - Learning Style: ${onboardingData?.learningStyle.join(', ') || 'Mixed'}
        
        Current Context:
        ${context?.currentProject ? `- Working on: ${context.currentProject}` : ''}
        ${context?.learningGoals ? `- Learning Goals: ${context.learningGoals.join(', ')}` : ''}
        ${context?.userLevel ? `- User Level: ${context.userLevel}` : ''}
        
        Relevant Knowledge Base:
        ${relevantDocs.map(doc => `- ${doc.content}`).join('\n')}
        
        Previous Conversation:
        ${conversationHistory.slice(-6).map(msg => `${msg.role}: ${msg.content}`).join('\n')}
        
        User Message: ${message}
        
        Guidelines:
        1. Be encouraging and supportive
        2. Provide practical, actionable advice
        3. Include code examples when relevant
        4. Suggest resources when helpful
        5. Ask follow-up questions to better understand needs
        6. Keep responses concise but comprehensive
        
        Respond with helpful advice, examples, and guidance. If appropriate, suggest specific next steps or resources.
      `;

      const result = await this.model.generateContent(systemPrompt);
      const response = result.response.text();
      
      // Generate follow-up suggestions
      const suggestions = await this.generateFollowUpSuggestions(message, response, context);
      
      return {
        message: response,
        suggestions: suggestions.slice(0, 3),
        followUpQuestions: this.generateFollowUpQuestions(message, context)
      };
      
    } catch (error) {
      console.error('Error in AI chat:', error);
      return {
        message: "I'm having trouble processing your request right now. Could you try rephrasing your question? I'm here to help with your learning journey!",
        suggestions: [
          "What should I work on next?",
          "Help me debug my current project",
          "Suggest learning resources"
        ]
      };
    }
  }

  // Generate project roadmap with detailed steps
  async generateProjectRoadmap(
    projectTitle: string,
    userSkillLevel: string,
    technologies: string[],
    timeCommitment: string
  ): Promise<{
    overview: string;
    phases: {
      title: string;
      description: string;
      estimatedTime: string;
      tasks: {
        title: string;
        description: string;
        resources: string[];
        difficulty: string;
      }[];
    }[];
    finalOutcome: string;
  }> {
    try {
      const prompt = `
        Create a detailed project roadmap for: "${projectTitle}"
        
        User Details:
        - Skill Level: ${userSkillLevel}
        - Technologies: ${technologies.join(', ')}
        - Time Commitment: ${timeCommitment}
        
        Create a comprehensive roadmap with:
        1. Project overview (what they'll build and learn)
        2. 3-5 development phases with clear milestones
        3. Specific tasks for each phase with resources
        4. Estimated time for each phase
        5. Final outcome description
        
        Make it practical, achievable, and educational. Include specific learning objectives for each phase.
        
        Format as JSON with the specified structure.
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        return this.getFallbackRoadmap(projectTitle, technologies);
      }
      
    } catch (error) {
      console.error('Error generating roadmap:', error);
      return this.getFallbackRoadmap(projectTitle, technologies);
    }
  }

  // Generate learning path based on career goals
  async generateLearningPath(
    careerGoal: string,
    currentSkills: string[],
    timeframe: string,
    learningStyle: string
  ): Promise<{
    title: string;
    description: string;
    duration: string;
    milestones: {
      month: number;
      title: string;
      skills: string[];
      projects: string[];
      resources: string[];
    }[];
  }> {
    try {
      const prompt = `
        Create a comprehensive learning path for someone who wants to become: "${careerGoal}"
        
        Current Situation:
        - Existing Skills: ${currentSkills.join(', ')}
        - Timeframe: ${timeframe}
        - Learning Style: ${learningStyle}
        
        Create a month-by-month learning path that includes:
        1. Clear learning objectives for each month
        2. Skills to focus on
        3. Practical projects to build
        4. Recommended resources
        5. Realistic milestones
        
        Make it progressive, building from basics to advanced concepts.
        Format as JSON with the specified structure.
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        return this.getFallbackLearningPath(careerGoal);
      }
      
    } catch (error) {
      console.error('Error generating learning path:', error);
      return this.getFallbackLearningPath(careerGoal);
    }
  }

  // Private helper methods
  private async generateFollowUpSuggestions(
    userMessage: string,
    aiResponse: string,
    context?: any
  ): Promise<string[]> {
    try {
      const prompt = `
        Based on this conversation:
        User: ${userMessage}
        AI: ${aiResponse}
        
        Generate 3 helpful follow-up suggestions that the user might want to ask next.
        Make them specific and actionable.
        Return as a JSON array of strings.
      `;

      const result = await this.model.generateContent(prompt);
      const suggestions = JSON.parse(result.response.text());
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (error) {
      return [
        "Can you explain that in more detail?",
        "What should I do next?",
        "Do you have any examples?"
      ];
    }
  }

  private generateFollowUpQuestions(message: string, context?: any): string[] {
    // Simple rule-based follow-up questions
    const questions = [];
    
    if (message.toLowerCase().includes('project')) {
      questions.push("What's the main challenge you're facing with this project?");
    }
    
    if (message.toLowerCase().includes('learn')) {
      questions.push("What's your preferred way to learn new concepts?");
    }
    
    if (message.toLowerCase().includes('error') || message.toLowerCase().includes('bug')) {
      questions.push("Can you share the specific error message you're seeing?");
    }
    
    questions.push("Would you like me to suggest some resources for this topic?");
    
    return questions.slice(0, 2);
  }

  private getFallbackRecommendations(userContext: LearningContext) {
    return {
      projects: [
        {
          title: "Personal Portfolio Website",
          description: "Build a responsive portfolio to showcase your skills",
          difficulty: "beginner",
          estimatedTime: "2-3 weeks",
          technologies: ["HTML", "CSS", "JavaScript"]
        }
      ],
      resources: [
        {
          title: "MDN Web Docs",
          url: "https://developer.mozilla.org",
          type: "documentation",
          description: "Comprehensive web development documentation"
        }
      ],
      nextSteps: [
        "Start with HTML fundamentals",
        "Practice CSS layouts",
        "Learn JavaScript basics"
      ]
    };
  }

  private getFallbackRoadmap(projectTitle: string, technologies: string[]) {
    return {
      overview: `Learn to build ${projectTitle} using ${technologies.join(', ')}`,
      phases: [
        {
          title: "Planning & Setup",
          description: "Project planning and environment setup",
          estimatedTime: "1 week",
          tasks: [
            {
              title: "Project Planning",
              description: "Define requirements and create wireframes",
              resources: ["Figma", "Notion"],
              difficulty: "easy"
            }
          ]
        }
      ],
      finalOutcome: `A fully functional ${projectTitle} that demonstrates your skills`
    };
  }

  private getFallbackLearningPath(careerGoal: string) {
    return {
      title: `Path to ${careerGoal}`,
      description: `Structured learning plan to become a ${careerGoal}`,
      duration: "6-12 months",
      milestones: [
        {
          month: 1,
          title: "Fundamentals",
          skills: ["Basic programming", "Problem solving"],
          projects: ["Simple calculator", "To-do list"],
          resources: ["Online tutorials", "Practice problems"]
        }
      ]
    };
  }
}

// Create singleton instance
export const aiService = new AIService();
