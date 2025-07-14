'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot,
  Send,
  MessageCircle,
  X,
  Minimize2,
  Maximize2,
  Code,
  BookOpen,
  Youtube,
  Github,
  Users,
  Lightbulb,
  Zap,
  Heart,
  Sparkles,
  HelpCircle,
  Target,
  Rocket
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'text' | 'code' | 'suggestion';
  resources?: Resource[];
}

interface Resource {
  type: 'youtube' | 'github' | 'docs' | 'reddit';
  title: string;
  url: string;
  description: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  prompt: string;
  category: 'coding' | 'learning' | 'career' | 'debug';
}

export default function AIAssistantChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'debug-help',
      label: 'Debug My Code',
      icon: Code,
      prompt: 'I\'m having trouble with my code. Can you help me debug it?',
      category: 'debug'
    },
    {
      id: 'explain-concept',
      label: 'Explain Concept',
      icon: BookOpen,
      prompt: 'Can you explain a programming concept to me?',
      category: 'learning'
    },
    {
      id: 'project-ideas',
      label: 'Project Ideas',
      icon: Lightbulb,
      prompt: 'Can you suggest some project ideas based on my interests?',
      category: 'learning'
    },
    {
      id: 'career-advice',
      label: 'Career Guidance',
      icon: Target,
      prompt: 'I need some career advice and guidance.',
      category: 'career'
    },
    {
      id: 'learning-path',
      label: 'Learning Roadmap',
      icon: Rocket,
      prompt: 'Can you create a learning roadmap for me?',
      category: 'learning'
    },
    {
      id: 'code-review',
      label: 'Code Review',
      icon: Github,
      prompt: 'Can you review my code and suggest improvements?',
      category: 'coding'
    }
  ];

  const welcomeMessage: Message = {
    id: 'welcome',
    text: `Hey ${user?.displayName || 'there'}! 👋 I'm your personal AI mentor, and I'm here 24/7 to help you with absolutely anything!\n\n🚀 **I can help you with:**\n• Code debugging and optimization\n• Learning new technologies\n• Career guidance and roadmaps\n• Project planning and ideas\n• Technical explanations\n• Resource recommendations\n\nI know everything about your learning journey, preferences, and goals. What would you like to explore today?`,
    isBot: true,
    timestamp: new Date(),
    type: 'text'
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!currentInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentInput,
      isBot: false,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsTyping(true);

    // Simulate AI response with personalized context
    setTimeout(() => {
      const aiResponse = generateAIResponse(currentInput);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): Message => {
    // In a real implementation, this would call your RAG AI API
    // For now, we'll simulate intelligent responses based on input patterns

    const lowerInput = userInput.toLowerCase();
    
    let responseText = '';
    let resources: Resource[] = [];

    if (lowerInput.includes('debug') || lowerInput.includes('error') || lowerInput.includes('bug')) {
      responseText = `I'd be happy to help you debug! 🐛\n\nTo give you the best assistance, could you share:\n• The specific error message you're seeing\n• The code that's causing issues\n• What you expected to happen vs. what's actually happening\n\nI'll analyze it with your learning style in mind and provide step-by-step solutions!`;
      
      resources = [
        {
          type: 'docs',
          title: 'JavaScript Debugging Guide',
          url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
          description: 'Comprehensive debugging techniques'
        },
        {
          type: 'youtube',
          title: 'Debugging Like a Pro',
          url: 'https://youtube.com/watch?v=example',
          description: 'Video tutorial on debugging strategies'
        }
      ];
    } else if (lowerInput.includes('learn') || lowerInput.includes('tutorial') || lowerInput.includes('how to')) {
      responseText = `Perfect! I love that you're eager to learn! 📚\n\nBased on your profile, I know you prefer [visual/hands-on/reading] learning. Let me recommend the best resources for you:\n\n• **Interactive tutorials** that match your pace\n• **Video explanations** for complex concepts\n• **Hands-on projects** to practice immediately\n\nWhat specific topic would you like to dive into?`;
      
      resources = [
        {
          type: 'youtube',
          title: 'Learn React in 30 Minutes',
          url: 'https://youtube.com/watch?v=example',
          description: 'Perfect for visual learners'
        },
        {
          type: 'docs',
          title: 'Interactive React Tutorial',
          url: 'https://react.dev/learn',
          description: 'Hands-on coding exercises'
        }
      ];
    } else if (lowerInput.includes('career') || lowerInput.includes('job') || lowerInput.includes('advice')) {
      responseText = `Great question! Based on your goals and current progress, here's my personalized career advice: 💼\n\n🎯 **Your Current Stage**: You're doing amazing with your learning journey!\n\n📈 **Next Steps**:\n• Focus on building 2-3 strong portfolio projects\n• Practice technical interviews\n• Network with other developers\n• Consider contributing to open source\n\nRemember, your unique background gives you an edge. What specific aspect of your career would you like to focus on?`;
    } else if (lowerInput.includes('project') || lowerInput.includes('build') || lowerInput.includes('create')) {
      responseText = `Awesome! Let's build something amazing! 🚀\n\nBased on your interests in [your tech stack] and your goal to [your specific goal], here are some project ideas perfectly tailored for you:\n\n1. **Personal Portfolio Website** - Showcase your skills\n2. **Task Management App** - Practice CRUD operations\n3. **Weather Dashboard** - API integration practice\n4. **Chat Application** - Real-time features\n\nWhich type of project excites you most? I'll provide a detailed roadmap!`;
      
      resources = [
        {
          type: 'github',
          title: 'Project Starter Templates',
          url: 'https://github.com/topics/starter-template',
          description: 'Pre-configured project setups'
        }
      ];
    } else {
      responseText = `That's a great question! 🤔\n\nLet me think about this in the context of your learning journey. I understand you're working on [current project/goal] and prefer [learning style].\n\n${generateContextualResponse(userInput)}\n\nIs there a specific part you'd like me to dive deeper into? I'm here to help you understand everything thoroughly!`;
    }

    return {
      id: Date.now().toString(),
      text: responseText,
      isBot: true,
      timestamp: new Date(),
      type: 'text',
      resources: resources.length > 0 ? resources : undefined
    };
  };

  const generateContextualResponse = (input: string): string => {
    // Add more contextual intelligence here
    return "Based on your profile and learning preferences, here's what I think would help you most...";
  };

  const handleQuickAction = (action: QuickAction) => {
    setCurrentInput(action.prompt);
    setActiveTab('chat');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderChatContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex gap-3 ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              {message.isBot && (
                <Avatar className="w-8 h-8 border-2 border-blue-200">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`max-w-[85%] ${message.isBot ? 'order-2' : 'order-1'}`}>
                <Card className={`${
                  message.isBot 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' 
                    : 'bg-purple-500 border-none text-white'
                } shadow-sm`}>
                  <CardContent className="p-3">
                    <p className={`text-sm whitespace-pre-wrap ${
                      message.isBot ? 'text-gray-800 dark:text-gray-200' : 'text-white'
                    }`}>
                      {message.text}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Resources */}
                {message.resources && (
                  <div className="mt-2 space-y-2">
                    {message.resources.map((resource, index) => (
                      <Card key={index} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            {resource.type === 'youtube' && <Youtube className="h-4 w-4 text-red-500" />}
                            {resource.type === 'github' && <Github className="h-4 w-4 text-gray-700" />}
                            {resource.type === 'docs' && <BookOpen className="h-4 w-4 text-blue-500" />}
                            {resource.type === 'reddit' && <Users className="h-4 w-4 text-orange-500" />}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {resource.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {resource.description}
                              </p>
                            </div>
                            <Button size="sm" variant="outline" className="text-xs">
                              Open
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              
              {!message.isBot && (
                <Avatar className="w-8 h-8 border-2 border-purple-200">
                  <AvatarImage src={user?.photoURL || ''} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                    {user?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <Avatar className="w-8 h-8 border-2 border-blue-200">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <CardContent className="p-3">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 text-sm"
            disabled={isTyping}
          />
          <Button onClick={handleSend} disabled={!currentInput.trim() || isTyping} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderQuickActions = () => (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Quick Actions
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Not sure what to ask? Try these popular options!
        </p>
      </div>
      
      <div className="grid gap-3">
        {quickActions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            className="w-full justify-start gap-3 h-auto p-4"
            onClick={() => handleQuickAction(action)}
          >
            <action.icon className="h-5 w-5 flex-shrink-0" />
            <div className="text-left">
              <div className="font-medium">{action.label}</div>
              <div className="text-xs text-gray-500 mt-1">{action.prompt}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-2xl hover:shadow-3xl transition-all duration-300 group"
        >
          <div className="relative">
            <MessageCircle className="h-8 w-8 text-white" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"
            />
          </div>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        width: isMinimized ? 320 : 480,
        height: isMinimized ? 60 : 600
      }}
      className="fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Mentor</h3>
              <p className="text-xs opacity-90">Always here to help!</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="h-[520px]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Quick Help
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="flex-1 m-0">
              {renderChatContent()}
            </TabsContent>
            
            <TabsContent value="actions" className="flex-1 m-0">
              {renderQuickActions()}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </motion.div>
  );
}
