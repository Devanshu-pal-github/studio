/**
 * Enhanced Vector Store with Deep User Context Integration
 * Captures every user interaction, onboarding response, and activity for semantic retrieval
 */

import { connectToDatabase } from './mongodb';

export interface UserContextVector {
  id: string;
  userId: string;
  content: string;
  embedding?: number[];
  metadata: {
    type: 'onboarding_response' | 'activity' | 'project_interaction' | 'chat_message' | 'learning_event';
    timestamp: Date;
    source: string;
    context: any;
    sentiment?: string;
    importance?: number;
    keywords?: string[];
  };
}

export class EnhancedVectorStore {
  private readonly EMBEDDING_DIMENSION = 1536; // OpenAI embedding dimension
  
  /**
   * Store user onboarding responses with semantic embeddings
   */
  async storeOnboardingContext(userId: string, question: string, response: string, additionalContext?: any) {
    try {
      const db = await connectToDatabase();
      
      // Create rich context document
      const contextDocument: UserContextVector = {
        id: `onboarding_${userId}_${Date.now()}`,
        userId,
        content: `Question: ${question}\nUser Response: ${response}`,
        metadata: {
          type: 'onboarding_response',
          timestamp: new Date(),
          source: 'onboarding_flow',
          context: {
            question,
            response,
            rawResponse: response,
            processedResponse: this.extractSemanticElements(response),
            ...additionalContext
          },
          importance: this.calculateImportance(response, 'onboarding'),
          keywords: this.extractKeywords(response)
        }
      };

      // Generate embedding if API is available
      if (process.env.GOOGLE_AI_API_KEY) {
        contextDocument.embedding = await this.generateEmbedding(contextDocument.content);
      }

      // Store in vector collection
      await db.collection('user_context_vectors').insertOne(contextDocument);
      
      // Also update user's aggregated context
      await this.updateUserAggregatedContext(userId, 'onboarding', {
        question,
        response,
        semanticElements: this.extractSemanticElements(response)
      });

      console.log(`Stored onboarding context for user ${userId}: ${question}`);
      
    } catch (error) {
      console.error('Error storing onboarding context:', error);
    }
  }

  /**
   * Store user activity with contextual information
   */
  async storeActivityContext(userId: string, activityType: string, description: string, metadata: any) {
    try {
      const db = await connectToDatabase();
      
      const contextDocument: UserContextVector = {
        id: `activity_${userId}_${Date.now()}`,
        userId,
        content: `Activity: ${activityType}\nDescription: ${description}\nContext: ${JSON.stringify(metadata)}`,
        metadata: {
          type: 'activity',
          timestamp: new Date(),
          source: 'activity_tracker',
          context: {
            activityType,
            description,
            ...metadata
          },
          importance: this.calculateImportance(description, 'activity'),
          keywords: this.extractKeywords(description)
        }
      };

      if (process.env.GOOGLE_AI_API_KEY) {
        contextDocument.embedding = await this.generateEmbedding(contextDocument.content);
      }

      await db.collection('user_context_vectors').insertOne(contextDocument);
      
      // Update aggregated context
      await this.updateUserAggregatedContext(userId, 'activity', {
        type: activityType,
        description,
        timestamp: new Date(),
        metadata
      });

    } catch (error) {
      console.error('Error storing activity context:', error);
    }
  }

  /**
   * Store project interaction context
   */
  async storeProjectContext(userId: string, projectId: string, interaction: string, details: any) {
    try {
      const db = await connectToDatabase();
      
      const contextDocument: UserContextVector = {
        id: `project_${userId}_${projectId}_${Date.now()}`,
        userId,
        content: `Project Interaction: ${interaction}\nProject: ${projectId}\nDetails: ${JSON.stringify(details)}`,
        metadata: {
          type: 'project_interaction',
          timestamp: new Date(),
          source: 'project_tracker',
          context: {
            projectId,
            interaction,
            details
          },
          importance: this.calculateImportance(interaction, 'project'),
          keywords: this.extractKeywords(interaction)
        }
      };

      if (process.env.GOOGLE_AI_API_KEY) {
        contextDocument.embedding = await this.generateEmbedding(contextDocument.content);
      }

      await db.collection('user_context_vectors').insertOne(contextDocument);

    } catch (error) {
      console.error('Error storing project context:', error);
    }
  }

  /**
   * Store chat conversation context
   */
  async storeChatContext(userId: string, userMessage: string, aiResponse: string, context: any) {
    try {
      const db = await connectToDatabase();
      
      const contextDocument: UserContextVector = {
        id: `chat_${userId}_${Date.now()}`,
        userId,
        content: `User: ${userMessage}\nAI: ${aiResponse}`,
        metadata: {
          type: 'chat_message',
          timestamp: new Date(),
          source: 'chat_system',
          context: {
            userMessage,
            aiResponse,
            conversationContext: context
          },
          importance: this.calculateImportance(userMessage, 'chat'),
          keywords: this.extractKeywords(userMessage)
        }
      };

      if (process.env.GOOGLE_AI_API_KEY) {
        contextDocument.embedding = await this.generateEmbedding(contextDocument.content);
      }

      await db.collection('user_context_vectors').insertOne(contextDocument);

    } catch (error) {
      console.error('Error storing chat context:', error);
    }
  }

  /**
   * Retrieve relevant context for user queries using semantic search
   */
  async retrieveRelevantContext(userId: string, query: string, limit: number = 10): Promise<UserContextVector[]> {
    try {
      const db = await connectToDatabase();
      
      if (process.env.GOOGLE_AI_API_KEY) {
        // Use semantic similarity search with embeddings
        const queryEmbedding = await this.generateEmbedding(query);
        
        // MongoDB vector search (if supported) or similarity calculation
        const results = await db.collection('user_context_vectors')
          .find({ 
            userId,
            embedding: { $exists: true }
          })
          .toArray();

        // Calculate cosine similarity and sort
        const scoredResults = results.map(doc => ({
          ...doc,
          similarity: this.calculateCosineSimilarity(queryEmbedding, doc.embedding)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

        return scoredResults;
      } else {
        // Fallback to keyword-based search
        const keywords = this.extractKeywords(query);
        const keywordRegex = new RegExp(keywords.join('|'), 'i');
        
        const results = await db.collection('user_context_vectors')
          .find({
            userId,
            $or: [
              { content: keywordRegex },
              { 'metadata.keywords': { $in: keywords } }
            ]
          })
          .sort({ 'metadata.importance': -1, 'metadata.timestamp': -1 })
          .limit(limit)
          .toArray();

        return results;
      }
    } catch (error) {
      console.error('Error retrieving context:', error);
      return [];
    }
  }

  /**
   * Get comprehensive user context summary
   */
  async getUserContextSummary(userId: string): Promise<any> {
    try {
      const db = await connectToDatabase();
      
      const [onboardingContext, activityContext, projectContext, chatContext] = await Promise.all([
        db.collection('user_context_vectors').find({ 
          userId, 
          'metadata.type': 'onboarding_response' 
        }).toArray(),
        db.collection('user_context_vectors').find({ 
          userId, 
          'metadata.type': 'activity' 
        }).sort({ 'metadata.timestamp': -1 }).limit(20).toArray(),
        db.collection('user_context_vectors').find({ 
          userId, 
          'metadata.type': 'project_interaction' 
        }).sort({ 'metadata.timestamp': -1 }).limit(10).toArray(),
        db.collection('user_context_vectors').find({ 
          userId, 
          'metadata.type': 'chat_message' 
        }).sort({ 'metadata.timestamp': -1 }).limit(5).toArray()
      ]);

      return {
        onboarding: this.summarizeContext(onboardingContext),
        recentActivities: this.summarizeContext(activityContext),
        projectInteractions: this.summarizeContext(projectContext),
        recentChats: this.summarizeContext(chatContext),
        contextStats: {
          totalOnboardingResponses: onboardingContext.length,
          recentActivitiesCount: activityContext.length,
          projectInteractionsCount: projectContext.length,
          chatMessagesCount: chatContext.length
        }
      };
    } catch (error) {
      console.error('Error getting user context summary:', error);
      return null;
    }
  }

  /**
   * Extract semantic elements from user responses
   */
  private extractSemanticElements(text: string): any {
    const elements = {
      sentiment: this.analyzeSentiment(text),
      intentions: this.extractIntentions(text),
      skillLevel: this.inferSkillLevel(text),
      technologies: this.extractTechnologies(text),
      timeConstraints: this.extractTimeConstraints(text),
      learningStyle: this.inferLearningStyle(text),
      emotionalTone: this.analyzeEmotionalTone(text)
    };

    return elements;
  }

  /**
   * Generate embedding using Google AI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
      
      // Use text embedding model
      const model = genAI.getGenerativeModel({ model: 'embedding-001' });
      const result = await model.embedContent(text);
      
      return result.embedding.values || [];
    } catch (error) {
      console.error('Error generating embedding:', error);
      return [];
    }
  }

  /**
   * Calculate cosine similarity between embeddings
   */
  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    const commonWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'with', 'for', 'have', 'has', 'had', 'i', 'you', 'we', 'they', 'me', 'my', 'your', 'our', 'their']);
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
      .slice(0, 10);
  }

  /**
   * Calculate importance score for content
   */
  private calculateImportance(content: string, type: string): number {
    let importance = 0.5; // Base importance
    
    // Increase importance based on content type
    if (type === 'onboarding') importance += 0.3;
    if (type === 'project') importance += 0.2;
    if (type === 'activity') importance += 0.1;
    
    // Increase importance based on content characteristics
    if (content.includes('goal') || content.includes('want') || content.includes('need')) importance += 0.1;
    if (content.includes('challenge') || content.includes('difficulty') || content.includes('struggle')) importance += 0.1;
    if (content.includes('love') || content.includes('passionate') || content.includes('excited')) importance += 0.1;
    
    return Math.min(importance, 1.0);
  }

  // Semantic analysis helper methods
  private analyzeSentiment(text: string): string {
    const positiveWords = ['love', 'like', 'enjoy', 'excited', 'passionate', 'great', 'amazing', 'good'];
    const negativeWords = ['hate', 'dislike', 'difficult', 'struggle', 'hard', 'frustrated', 'confused'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private extractIntentions(text: string): string[] {
    const intentions: string[] = [];
    
    if (text.includes('learn') || text.includes('understand')) intentions.push('learning');
    if (text.includes('build') || text.includes('create') || text.includes('develop')) intentions.push('building');
    if (text.includes('career') || text.includes('job') || text.includes('work')) intentions.push('career');
    if (text.includes('improve') || text.includes('better') || text.includes('enhance')) intentions.push('improvement');
    
    return intentions;
  }

  private inferSkillLevel(text: string): string {
    const beginnerIndicators = ['new', 'beginner', 'start', 'basic', 'first time', 'never'];
    const intermediateIndicators = ['some experience', 'familiar', 'know basics', 'intermediate'];
    const advancedIndicators = ['experienced', 'advanced', 'expert', 'proficient', 'years of'];
    
    const lowerText = text.toLowerCase();
    
    if (advancedIndicators.some(indicator => lowerText.includes(indicator))) return 'advanced';
    if (intermediateIndicators.some(indicator => lowerText.includes(indicator))) return 'intermediate';
    if (beginnerIndicators.some(indicator => lowerText.includes(indicator))) return 'beginner';
    
    return 'unknown';
  }

  private extractTechnologies(text: string): string[] {
    const techKeywords = ['javascript', 'python', 'react', 'vue', 'angular', 'node', 'django', 'flask', 'html', 'css', 'sql', 'mongodb', 'aws', 'docker', 'git', 'typescript', 'java', 'c++', 'go', 'rust'];
    
    return techKeywords.filter(tech => 
      text.toLowerCase().includes(tech)
    );
  }

  private extractTimeConstraints(text: string): string[] {
    const constraints: string[] = [];
    
    if (text.includes('limited time') || text.includes('busy') || text.includes('weekends only')) constraints.push('limited_time');
    if (text.includes('full time') || text.includes('dedicated') || text.includes('available')) constraints.push('flexible_time');
    if (text.includes('part time') || text.includes('evenings') || text.includes('after work')) constraints.push('part_time');
    
    return constraints;
  }

  private inferLearningStyle(text: string): string {
    if (text.includes('hands-on') || text.includes('practice') || text.includes('doing')) return 'practical';
    if (text.includes('reading') || text.includes('theory') || text.includes('understand concepts')) return 'theoretical';
    if (text.includes('visual') || text.includes('videos') || text.includes('diagrams')) return 'visual';
    if (text.includes('step by step') || text.includes('structured') || text.includes('guide')) return 'structured';
    
    return 'mixed';
  }

  private analyzeEmotionalTone(text: string): string[] {
    const tones: string[] = [];
    
    if (text.includes('excited') || text.includes('enthusiastic')) tones.push('enthusiastic');
    if (text.includes('nervous') || text.includes('worried') || text.includes('anxious')) tones.push('anxious');
    if (text.includes('confident') || text.includes('ready') || text.includes('determined')) tones.push('confident');
    if (text.includes('confused') || text.includes('uncertain') || text.includes('not sure')) tones.push('uncertain');
    
    return tones;
  }

  private summarizeContext(contexts: UserContextVector[]): any {
    if (contexts.length === 0) return null;
    
    return {
      count: contexts.length,
      mostRecent: contexts[0]?.metadata.timestamp,
      keyTopics: this.extractTopKeywords(contexts),
      sentimentTrend: this.analyzeSentimentTrend(contexts)
    };
  }

  private extractTopKeywords(contexts: UserContextVector[]): string[] {
    const keywordCounts = new Map<string, number>();
    
    contexts.forEach(context => {
      context.metadata.keywords?.forEach(keyword => {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
      });
    });
    
    return Array.from(keywordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword]) => keyword);
  }

  private analyzeSentimentTrend(contexts: UserContextVector[]): string {
    if (contexts.length === 0) return 'neutral';
    
    const recentContexts = contexts.slice(0, 5);
    const sentiments = recentContexts
      .map(context => context.metadata.context?.semanticElements?.sentiment)
      .filter(Boolean);
    
    const positiveCount = sentiments.filter(s => s === 'positive').length;
    const negativeCount = sentiments.filter(s => s === 'negative').length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private async updateUserAggregatedContext(userId: string, type: string, data: any) {
    try {
      const db = await connectToDatabase();
      
      await db.collection('user_aggregated_context').updateOne(
        { userId },
        { 
          $push: { [`${type}_history`]: data },
          $set: { 
            [`last_${type}_update`]: new Date(),
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error updating aggregated context:', error);
    }
  }
}

// Export singleton instance
export const enhancedVectorStore = new EnhancedVectorStore();
