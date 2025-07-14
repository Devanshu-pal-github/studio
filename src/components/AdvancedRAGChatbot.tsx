'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Minimize2, 
  Maximize2, 
  Bot, 
  User, 
  Sparkles,
  Brain,
  Code,
  Lightbulb,
  Target,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { activityTracker } from '@/lib/activityTracker';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'resource' | 'feedback_request';
  metadata?: {
    projectId?: string;
    resourceUrl?: string;
    suggestions?: string[];
    confidence?: number;
  };
}

interface UserContext {
  currentProjects: string[];
  recentActivities: any[];
  userProfile: any;
  learningGoals: string[];
  skillLevel: string;
  strugglingAreas: string[];
}

export default function AdvancedRAGChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      loadUserContext();
      // Initialize with welcome message
      if (messages.length === 0) {
        addWelcomeMessage();
      }
    }
  }, [user, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadUserContext = async () => {
    if (!user) return;

    try {
      // Load user's current context for personalized responses
      const [userProgress, recentActivities] = await Promise.all([
        activityTracker.getUserProgress(user.uid),
        activityTracker.getUserActivities(user.uid, 10)
      ]);

      const context: UserContext = {
        currentProjects: userProgress?.currentProjects || [],
        recentActivities: recentActivities || [],
        userProfile: {}, // Would be loaded from user profile
        learningGoals: ['Full-stack development', 'React mastery'], // From user profile
        skillLevel: 'intermediate',
        strugglingAreas: [],
      };

      setUserContext(context);
    } catch (error) {
      console.error('Error loading user context:', error);
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: `welcome_${Date.now()}`,
      content: `Hey there! 👋 I'm your AI learning companion. I've been tracking your progress and I'm here to help you with personalized guidance, project recommendations, and learning support.

How can I assist you today? I can help with:
• Project guidance and debugging
• Personalized learning recommendations  
• Code review and best practices
• Career path planning
• Resource suggestions`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
      metadata: {
        suggestions: [
          "What should I work on next?",
          "Help me debug my current project",
          "Suggest learning resources",
          "Review my learning progress"
        ]
      }
    };

    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Log user interaction
    await activityTracker.logActivity({
      userId: user.uid,
      type: 'resource_viewed',
      description: `Asked AI assistant: ${inputValue.substring(0, 50)}...`,
      metadata: { interactionType: 'chatbot', query: inputValue }
    });

    // Simulate AI processing with context-aware response
    setTimeout(async () => {
      const aiResponse = await generateContextualResponse(inputValue, userContext);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateContextualResponse = async (query: string, context: UserContext | null): Promise<Message> => {
    // This would integrate with LangChain and vector database
    // For now, we'll simulate intelligent responses based on context

    if (!query || typeof query !== 'string') {
      return {
        id: `ai_${Date.now()}`,
        content: "I'm sorry, I didn't receive your message properly. Could you please try again?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };
    }

    const lowerQuery = query.toLowerCase();
    let response = '';
    let type: Message['type'] = 'text';
    let metadata: Message['metadata'] = {};

    if (lowerQuery.includes('project') || lowerQuery.includes('work on')) {
      if (context?.currentProjects.length) {
        response = `I see you're currently working on ${context.currentProjects.length} project(s). Based on your recent activities and learning goals, here are my recommendations:

🎯 **Next Steps for Your Current Projects:**
• Focus on implementing user authentication in your React app
• Add proper error handling and validation
• Consider adding unit tests for better code quality

🚀 **New Project Suggestions:**
• Build a personal portfolio with your completed projects
• Create a full-stack application using your preferred tech stack
• Try contributing to open-source projects to gain real-world experience`;

        metadata = {
          suggestions: [
            "Show me specific tasks for my current project",
            "Help me prioritize my project backlog",
            "Suggest debugging strategies"
          ]
        };
      } else {
        response = `I notice you don't have any active projects right now. Let's find the perfect project to match your current skill level and learning goals!

Based on your profile, I recommend starting with:
• **Interactive Dashboard Project** - Perfect for practicing data visualization
• **E-commerce Site** - Great for full-stack development practice
• **Personal Task Manager** - Excellent for learning state management

Would you like me to create a personalized learning path for any of these?`;
      }
    } else if (lowerQuery.includes('debug') || lowerQuery.includes('error') || lowerQuery.includes('stuck')) {
      response = `I'm here to help you debug! 🔍 

**Debugging Strategies I Recommend:**
1. **Break it down**: Isolate the specific component or function causing issues
2. **Check the console**: Look for error messages and warnings
3. **Add logging**: Use console.log to track variable values
4. **Rubber duck debugging**: Explain your code step-by-step

**Common Issues I've Noticed:**
• State management problems in React components
• Async/await handling in API calls
• CSS layout and positioning challenges

Can you share more details about what you're working on? I can provide more specific guidance.`;

      metadata = {
        suggestions: [
          "Share my error message",
          "Help with React state issues",
          "Debug API call problems"
        ]
      };
    } else if (lowerQuery.includes('learn') || lowerQuery.includes('resource') || lowerQuery.includes('study')) {
      response = `Great question! Based on your learning goals and current progress, here are personalized resources:

📚 **Recommended Learning Resources:**
• **React Advanced Patterns** - You're ready for higher-level concepts
• **TypeScript Deep Dive** - Strengthen your type safety skills
• **System Design Basics** - Start thinking about scalable architecture

🎯 **Learning Path Suggestions:**
1. Complete your current projects first (builds confidence)
2. Practice algorithm challenges (15-20 mins daily)
3. Build increasingly complex applications
4. Start contributing to open source

**Quick Study Tips:**
• Focus on building projects over tutorial consumption
• Join coding communities for peer learning
• Practice explaining concepts to solidify understanding`;

      type = 'resource';
      metadata = {
        suggestions: [
          "Create a weekly study plan",
          "Find coding challenges for my level",
          "Connect me with study groups"
        ]
      };
    } else if (lowerQuery.includes('progress') || lowerQuery.includes('review')) {
      const completedProjects = context?.recentActivities.filter(a => a.type === 'project_complete').length || 0;
      const totalActivities = context?.recentActivities.length || 0;

      response = `Let's review your awesome progress! 📈

**Your Learning Journey:**
• **Projects Completed**: ${completedProjects} projects finished
• **Recent Activity**: ${totalActivities} learning activities this week
• **Consistency**: You've been coding regularly - keep it up!

**Skills You've Developed:**
• React component architecture
• State management patterns  
• API integration and data fetching
• Responsive design principles

**Areas for Growth:**
• Advanced TypeScript patterns
• Testing and quality assurance
• Performance optimization
• Database design

**Next Milestones:**
🎯 Complete your current project
🚀 Start a full-stack application
💼 Build your professional portfolio`;

      metadata = {
        confidence: 0.95,
        suggestions: [
          "Set new learning goals",
          "Plan my next project",
          "Track my skill development"
        ]
      };
    } else {
      // General helpful response
      response = `I understand you're looking for assistance! I'm equipped with knowledge about your learning journey, current projects, and goals.

I can help you with:
• **Project Development**: Code reviews, architecture advice, debugging
• **Learning Guidance**: Personalized study plans and resources
• **Career Planning**: Skill development and portfolio building
• **Technical Support**: Best practices and problem-solving strategies

Feel free to ask me anything specific about your coding journey!`;

      metadata = {
        suggestions: [
          "What should I focus on this week?",
          "Help me plan my next project",
          "Review my coding skills",
          "Suggest career development steps"
        ]
      };
    }

    return {
      id: `ai_${Date.now()}`,
      content: response,
      sender: 'ai',
      timestamp: new Date(),
      type,
      metadata
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const getMessageIcon = (message: Message) => {
    if (message.sender === 'user') return <User className="h-4 w-4" />;
    
    switch (message.type) {
      case 'suggestion':
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'resource':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'feedback_request':
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default:
        return <Bot className="h-4 w-4 text-green-500" />;
    }
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className={`fixed bottom-6 right-6 z-50 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      } transition-all duration-300`}
    >
      <Card className="h-full shadow-2xl border-2 border-blue-200 dark:border-blue-800">
        
        {/* Header */}
        <CardHeader className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-white/20 rounded-full">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium">AI Learning Assistant</CardTitle>
                <p className="text-xs opacity-90">Personalized guidance</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-[420px] p-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                          <div className={`flex items-start space-x-2 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className={`p-2 rounded-full ${
                              message.sender === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}>
                              {getMessageIcon(message)}
                            </div>
                            <div className={`rounded-lg p-3 ${
                              message.sender === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              {message.type === 'resource' && (
                                <Badge variant="secondary" className="mt-2">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Resource
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Suggestions */}
                          {message.metadata?.suggestions && message.sender === 'ai' && (
                            <div className="mt-2 space-y-1">
                              {message.metadata.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs mr-1 mb-1"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                          <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex space-x-1">
                            <motion.div
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about your learning journey..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );
}
