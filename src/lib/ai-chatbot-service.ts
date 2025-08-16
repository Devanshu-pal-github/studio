import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const model = new ChatGoogleGenerativeAI({
  modelName: 'gemini-1.5-flash',
  maxOutputTokens: 4096,
  temperature: 0.7,
});

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface LearningContext {
  userId: string;
  userProfile: any;
  currentProject?: string;
  currentSkill?: string;
  learningProgress: any;
}

class AIChatbotService {
  private static instance: AIChatbotService;

  private constructor() {}

  static getInstance(): AIChatbotService {
    if (!AIChatbotService.instance) {
      AIChatbotService.instance = new AIChatbotService();
    }
    return AIChatbotService.instance;
  }

  // Main chatbot response generation
  async generateResponse(
    userMessage: string,
    context: LearningContext,
    conversationHistory: ChatMessage[]
  ): Promise<{
    response: string;
    resources: any;
    suggestions: string[];
  }> {
    try {
      // Analyze user intent
      const intent = this.analyzeIntent(userMessage);
      
      // Generate contextual response
      const response = this.generateContextualResponse(
        userMessage,
        context,
        conversationHistory,
        intent
      );

      // Get relevant resources
      const resources = this.getRelevantResources(userMessage, context, intent);

      // Generate follow-up suggestions
      const suggestions = this.generateSuggestions(context, intent);

      return {
        response,
        resources,
        suggestions
      };
    } catch (error) {
      console.error('AI Chatbot error:', error);
      return {
        response: "I'm having trouble processing your request right now. Could you please try rephrasing your question?",
        resources: {},
        suggestions: ["Try asking a specific question about your current project", "Ask about a particular technology you're learning"]
      };
    }
  }

  // Analyze user intent
  private analyzeIntent(message: string): string {
    const content = message.toLowerCase();
    
    if (content.includes('error') || content.includes('bug') || content.includes('fix') || content.includes('debug')) {
      return 'code_help';
    }
    if (content.includes('explain') || content.includes('what is') || content.includes('how does') || content.includes('concept')) {
      return 'concept_explanation';
    }
    if (content.includes('project') || content.includes('build') || content.includes('create')) {
      return 'project_guidance';
    }
    if (content.includes('resource') || content.includes('learn') || content.includes('tutorial') || content.includes('course')) {
      return 'resource_request';
    }
    if (content.includes('motivate') || content.includes('stuck') || content.includes('difficult') || content.includes('help')) {
      return 'motivation';
    }
    if (content.includes('progress') || content.includes('level') || content.includes('achievement')) {
      return 'progress_check';
    }
    
    return 'general_question';
  }

  // Generate contextual response
  private generateContextualResponse(
    userMessage: string,
    context: LearningContext,
    conversationHistory: ChatMessage[],
    intent: string
  ): string {
    const userName = context.userProfile?.name || 'there';
    const experienceLevel = context.userProfile?.experienceLevel || 'beginner';
    const interests = context.userProfile?.interests || [];
    const currentProject = context.currentProject || 'your current project';

    switch (intent) {
      case 'code_help':
        return `I'd be happy to help you with that code issue! 🔧

Could you share more details about the error you're encountering? It would be helpful to know:
• What programming language/framework you're using
• The specific error message you're seeing
• What you were trying to accomplish

This will help me provide the most accurate solution for your situation! 💡`;

      case 'concept_explanation':
        return `Great question! I'd love to explain that concept to you. 📚

To give you the best explanation possible, could you tell me:
• What's your current experience level with this topic?
• Are you looking for a high-level overview or detailed technical explanation?
• Do you prefer examples and practical applications?

This will help me tailor the explanation to your learning style and experience level! 🎯`;

      case 'project_guidance':
        return `Exciting! I love helping with projects! 🚀

To provide the best guidance for your ${currentProject}, I'd like to know:
• What stage are you at in your project?
• What specific challenges are you facing?
• What technologies are you using?

Based on your interests in ${interests.join(', ')}, I can suggest some great approaches and resources! 💪`;

      case 'resource_request':
        return `Perfect! I'd be happy to recommend some great learning resources! 📖

To find the best resources for you, could you tell me:
• What specific topic or technology you want to learn?
• Do you prefer videos, articles, courses, or hands-on practice?
• What's your current experience level with this topic?

I'll curate a personalized list of resources that match your learning style and goals! 🎯`;

      case 'motivation':
        return `I understand how challenging learning programming can be! 💪

Remember, every expert was once a beginner. Here are some tips to stay motivated:
• Break down your goals into smaller, achievable milestones
• Celebrate your progress, no matter how small
• Connect with other learners in our community
• Focus on building projects you're passionate about

What specific aspect of your learning journey is challenging you right now? I'm here to help! 🌟`;

      case 'progress_check':
        return `Great question! Let's check your learning progress! 📊

Based on your profile, you're at the ${experienceLevel} level and interested in ${interests.join(', ')}. 

To give you a more detailed progress assessment, could you tell me:
• What have you been working on recently?
• What skills do you feel most confident about?
• What areas do you want to improve?

I can then provide personalized recommendations for your next steps! 🎯`;

      default:
        return `Thanks for your question! I'm here to help with your learning journey. 🤖

To provide the most helpful response, could you give me a bit more context about what you're working on or what you'd like to learn?

I'm excited to help you grow your programming skills! 🚀`;
    }
  }

  // Get relevant learning resources
  private getRelevantResources(
    userMessage: string,
    context: LearningContext,
    intent: string
  ): any {
    const resources: any = {
      youtubeVideos: [],
      documentation: [],
      articles: [],
      practiceExercises: []
    };

    const interests = context.userProfile?.interests || [];
    const experienceLevel = context.userProfile?.experienceLevel || 'beginner';

    // Generate resource recommendations based on context
    if (interests.includes('web_development')) {
      resources.youtubeVideos.push({
        title: "React Tutorial for Beginners",
        url: "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
        description: "Complete React tutorial for beginners",
        duration: "2 hours"
      });
      resources.documentation.push({
        title: "React Documentation",
        url: "https://react.dev/",
        description: "Official React documentation and tutorials"
      });
    }

    if (interests.includes('mobile_development')) {
      resources.youtubeVideos.push({
        title: "React Native Tutorial",
        url: "https://www.youtube.com/watch?v=0-S5a0eXPoc",
        description: "Learn React Native from scratch",
        duration: "3 hours"
      });
    }

    if (interests.includes('ai_ml')) {
      resources.youtubeVideos.push({
        title: "Machine Learning for Beginners",
        url: "https://www.youtube.com/watch?v=KNAWp2S3w94",
        description: "Introduction to machine learning concepts",
        duration: "1.5 hours"
      });
    }

    // Add general resources
    resources.practiceExercises.push({
      title: "JavaScript Fundamentals",
      description: "Practice basic JavaScript concepts",
      difficulty: experienceLevel,
      estimatedTime: "30 minutes"
    });

    return resources;
  }

  // Generate follow-up suggestions
  private generateSuggestions(
    context: LearningContext,
    intent: string
  ): string[] {
    const suggestions = [];
    const interests = context.userProfile?.interests || [];
    const experienceLevel = context.userProfile?.experienceLevel || 'beginner';

    switch (intent) {
      case 'code_help':
        suggestions.push(
          "Try breaking down your code into smaller parts to isolate the issue",
          "Check the browser console for specific error messages",
          "Use console.log() to debug your code step by step"
        );
        break;
      case 'concept_explanation':
        suggestions.push(
          "Try building a small project to practice this concept",
          "Look for real-world examples of this concept in action",
          "Join a study group to discuss this topic with others"
        );
        break;
      case 'project_guidance':
        suggestions.push(
          "Start with a simple MVP (Minimum Viable Product)",
          "Break your project into smaller, manageable tasks",
          "Set up a GitHub repository to track your progress"
        );
        break;
      default:
        suggestions.push(
          "Try working on a small project to practice your skills",
          "Join our community forum to connect with other learners",
          "Set up a daily coding routine to build consistency"
        );
    }

    return suggestions.slice(0, 3);
  }

  // YouTube API integration for video recommendations (placeholder)
  async getYouTubeRecommendations(query: string, maxResults: number = 5): Promise<any[]> {
    // Placeholder implementation - would need actual YouTube API key
    return [
      {
        title: "Programming Tutorial",
        url: "https://www.youtube.com/watch?v=example",
        description: "Great tutorial for learning programming",
        channelTitle: "Programming Channel",
        publishedAt: new Date().toISOString(),
        thumbnail: "https://example.com/thumbnail.jpg"
      }
    ];
  }

  // Reddit API integration for community discussions (placeholder)
  async getRedditDiscussions(query: string, subreddit: string = 'learnprogramming'): Promise<any[]> {
    // Placeholder implementation - would need actual Reddit API
    return [
      {
        title: "Learning Programming Discussion",
        url: "https://reddit.com/r/learnprogramming/example",
        author: "reddit_user",
        score: 100,
        numComments: 50,
        created: Date.now() / 1000,
        selftext: "Great discussion about learning programming"
      }
    ];
  }

  // Perplexity-style research (simulated)
  async getResearchInsights(query: string): Promise<any> {
    return {
      analysis: `Here's a comprehensive analysis of "${query}":

**Key Concepts:**
• Fundamental principles and core ideas
• Important terminology and definitions
• Key concepts to understand

**Best Practices:**
• Recommended approaches and methodologies
• Industry standards and conventions
• Proven techniques and strategies

**Common Pitfalls:**
• Mistakes to avoid
• Common misconceptions
• Potential challenges and solutions

**Learning Path:**
• Suggested learning sequence
• Prerequisites and dependencies
• Progressive skill building approach

**Resources:**
• Recommended materials and tools
• Learning platforms and courses
• Community and support resources`
    };
  }

  // Generate personalized learning recommendations
  async generateLearningRecommendations(
    userProfile: any,
    currentProgress: any,
    skillGap: string[]
  ): Promise<any> {
    const experienceLevel = userProfile?.experienceLevel || 'beginner';
    const interests = userProfile?.interests || ['web_development'];

    return {
      nextSteps: [
        {
          action: "Complete a small project to practice your skills",
          priority: "high",
          estimatedTime: "1-2 weeks",
          resources: ["GitHub", "Documentation", "Tutorials"]
        },
        {
          action: "Join a coding community for support and networking",
          priority: "medium",
          estimatedTime: "Ongoing",
          resources: ["Discord", "Reddit", "Stack Overflow"]
        }
      ],
      skillFocus: [
        {
          skill: "Problem Solving",
          importance: "Essential for all programming tasks",
          learningPath: "Practice with coding challenges and real projects"
        }
      ],
      projectSuggestions: [
        {
          title: "Personal Portfolio",
          description: "Showcase your skills and projects",
          skills: ["HTML", "CSS", "JavaScript"],
          difficulty: experienceLevel,
          estimatedTime: "2-3 weeks"
        }
      ]
    };
  }
}

export const aiChatbotService = AIChatbotService.getInstance(); 