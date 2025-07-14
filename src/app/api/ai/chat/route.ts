import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';
import { DatabaseService } from '@/lib/database';
import { Timestamp } from 'firebase/firestore';

interface ChatRequest {
  message: string;
  conversationHistory: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }[];
  context?: {
    currentProject?: string;
    learningGoals?: string[];
    userLevel?: string;
    projectId?: string;
  };
  conversationId?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Get user from session (you'll need to implement auth middleware)
    // For now, we'll extract from headers or implement basic auth
    const userId = req.headers.get('x-user-id') || 'anonymous';
    
    const body: ChatRequest = await req.json();
    const { message, conversationHistory, context, conversationId } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Convert conversation history to proper format
    const chatHistory = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp)
    }));

    // Get AI response using the AI service
    const aiResponse = await aiService.chat(
      userId,
      message,
      chatHistory,
      context
    );

    // Save conversation to database if user is authenticated
    if (userId !== 'anonymous') {
      try {
        let currentConversationId = conversationId;
        
        if (!currentConversationId) {
          // Create new conversation
          const chatHistoryForDB = chatHistory.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: Timestamp.fromDate(msg.timestamp)
          }));

          currentConversationId = await DatabaseService.saveAIConversation(userId, {
            type: context?.projectId ? 'project_help' : 'general',
            messages: [
              ...chatHistoryForDB,
              { role: 'user' as const, content: message, timestamp: Timestamp.now() },
              { role: 'assistant' as const, content: aiResponse.message, timestamp: Timestamp.now() }
            ],
            context: {
              currentProject: context?.currentProject,
              learningGoals: context?.learningGoals || [],
              userLevel: context?.userLevel || 'beginner'
            },
            isActive: true
          });
        } else {
          // Update existing conversation
          const existingConversation = await DatabaseService.getUserConversations(userId);
          const conversation = existingConversation.find(c => c.id === currentConversationId);
          
          if (conversation) {
            const updatedMessages = [
              ...conversation.messages,
              { role: 'user' as const, content: message, timestamp: Timestamp.now() },
              { role: 'assistant' as const, content: aiResponse.message, timestamp: Timestamp.now() }
            ];
            
            await DatabaseService.updateAIConversation(currentConversationId, {
              messages: updatedMessages
            });
          }
        }

        // Log user activity
        await DatabaseService.logActivity(userId, {
          type: 'ai_chat',
          description: `Asked AI: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
          metadata: {
            conversationId: currentConversationId,
            messageLength: message.length,
            context: context?.currentProject || 'general'
          },
          points: 1
        });

        return NextResponse.json({
          message: aiResponse.message,
          suggestions: aiResponse.suggestions,
          resources: aiResponse.resources,
          followUpQuestions: aiResponse.followUpQuestions,
          conversationId: currentConversationId
        });

      } catch (dbError) {
        console.error('Database error:', dbError);
        // Still return AI response even if DB save fails
        return NextResponse.json({
          message: aiResponse.message,
          suggestions: aiResponse.suggestions,
          resources: aiResponse.resources,
          followUpQuestions: aiResponse.followUpQuestions
        });
      }
    }

    // Return response for anonymous users
    return NextResponse.json({
      message: aiResponse.message,
      suggestions: aiResponse.suggestions,
      resources: aiResponse.resources,
      followUpQuestions: aiResponse.followUpQuestions
    });

  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process chat message',
      message: "I'm having trouble processing your request right now. Please try again in a moment!"
    }, { status: 500 });
  }
}
