import { GoogleGenerativeAI } from '@google/generative-ai';

// Vector store for embeddings and RAG functionality
interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    type: 'roadmap' | 'tutorial' | 'project' | 'concept';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    userId?: string;
    createdAt: Date;
  };
}

interface LearningContext {
  goals: string[];
  experience: string;
  learningStyle: string;
  preferences: string[];
  currentProjects: string[];
  completedTasks: string[];
}

class VectorStore {
  private documents: VectorDocument[] = [];
  private genAI: GoogleGenerativeAI;

  constructor() {
    // Initialize Gemini AI
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.warn('Google AI API key not found. Vector store will work with limited functionality.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  // Generate embeddings using Gemini
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'embedding-001' });
      const result = await model.embedContent(text);
      return result.embedding.values || [];
    } catch (error) {
      console.error('Error generating embedding:', error);
      // Fallback: simple hash-based embedding for development
      return this.simpleEmbedding(text);
    }
  }

  // Simple fallback embedding for development
  private simpleEmbedding(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0);
    
    words.forEach((word, idx) => {
      const hash = this.hashString(word);
      embedding[hash % 384] += 1;
    });
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Calculate cosine similarity between vectors
  private cosineSimilarity(a: number[], b: number[]): number {
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

  // Add document to vector store
  async addDocument(document: Omit<VectorDocument, 'embedding'>): Promise<void> {
    const embedding = await this.generateEmbedding(document.content);
    this.documents.push({
      ...document,
      embedding
    });
  }

  // Search similar documents
  async search(query: string, limit: number = 5, filter?: Partial<VectorDocument['metadata']>): Promise<VectorDocument[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    
    let candidates = this.documents;
    
    // Apply filters
    if (filter) {
      candidates = candidates.filter(doc => {
        if (filter.type && doc.metadata.type !== filter.type) return false;
        if (filter.difficulty && doc.metadata.difficulty !== filter.difficulty) return false;
        if (filter.userId && doc.metadata.userId !== filter.userId) return false;
        if (filter.tags && !filter.tags.some(tag => doc.metadata.tags.includes(tag))) return false;
        return true;
      });
    }
    
    // Calculate similarities and sort
    const results = candidates
      .map(doc => ({
        ...doc,
        similarity: this.cosineSimilarity(queryEmbedding, doc.embedding)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    
    return results;
  }

  // Generate personalized recommendations
  async getPersonalizedRecommendations(
    userContext: LearningContext,
    limit: number = 10
  ): Promise<VectorDocument[]> {
    const contextText = `
      Goals: ${userContext.goals.join(', ')}
      Experience: ${userContext.experience}
      Learning Style: ${userContext.learningStyle}
      Preferences: ${userContext.preferences.join(', ')}
      Current Projects: ${userContext.currentProjects.join(', ')}
    `;
    
    return this.search(contextText, limit);
  }

  // Initialize with default learning content
  async initializeDefaultContent(): Promise<void> {
    const defaultContent = [
      {
        id: 'web-dev-basics',
        content: 'HTML CSS JavaScript fundamentals web development frontend basics responsive design',
        metadata: {
          type: 'roadmap' as const,
          difficulty: 'beginner' as const,
          tags: ['web', 'html', 'css', 'javascript', 'frontend'],
          createdAt: new Date()
        }
      },
      {
        id: 'react-basics',
        content: 'React components JSX state props hooks useState useEffect modern frontend library',
        metadata: {
          type: 'tutorial' as const,
          difficulty: 'intermediate' as const,
          tags: ['react', 'javascript', 'frontend', 'components'],
          createdAt: new Date()
        }
      },
      {
        id: 'nodejs-backend',
        content: 'Node.js backend development Express.js API REST endpoints server-side JavaScript',
        metadata: {
          type: 'project' as const,
          difficulty: 'intermediate' as const,
          tags: ['nodejs', 'backend', 'express', 'api'],
          createdAt: new Date()
        }
      },
      {
        id: 'python-basics',
        content: 'Python programming fundamentals variables functions loops data structures beginner friendly',
        metadata: {
          type: 'tutorial' as const,
          difficulty: 'beginner' as const,
          tags: ['python', 'programming', 'basics'],
          createdAt: new Date()
        }
      },
      {
        id: 'machine-learning',
        content: 'Machine learning artificial intelligence neural networks deep learning TensorFlow PyTorch',
        metadata: {
          type: 'roadmap' as const,
          difficulty: 'advanced' as const,
          tags: ['ml', 'ai', 'python', 'tensorflow'],
          createdAt: new Date()
        }
      }
    ];

    for (const content of defaultContent) {
      await this.addDocument(content);
    }
  }

  // Get all documents (for admin/debug purposes)
  getAllDocuments(): VectorDocument[] {
    return [...this.documents];
  }

  // Clear all documents
  clear(): void {
    this.documents = [];
  }
}

// Create singleton instance
export const vectorStore = new VectorStore();

// Initialize default content on first import
vectorStore.initializeDefaultContent().catch(console.error);

export type { VectorDocument, LearningContext };
