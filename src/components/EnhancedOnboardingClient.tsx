'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bot,
  Send,
  Sparkles,
  Code,
  Target,
  Brain,
  Heart,
  Clock,
  BookOpen,
  Rocket,
  User,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
  isTyping?: boolean;
}

interface UserProfile {
  currentSkills: string[];
  experience: string;
  goals: string[];
  learningStyle: string;
  availability: string;
  interests: string[];
  preferredTech: string[];
  careerStage: string;
  motivation: string;
  completionStatus: number;
}

export default function EnhancedOnboardingClient() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationStage, setConversationStage] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    currentSkills: [],
    experience: '',
    goals: [],
    learningStyle: '',
    availability: '',
    interests: [],
    preferredTech: [],
    careerStage: '',
    motivation: '',
    completionStatus: 0
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const conversationFlow = [
    {
      botMessage: `Hey ${user?.displayName || 'there'}! 👋 I'm your AI learning mentor, and I'm genuinely excited to get to know you! Think of this as a coffee chat with a friend who's super interested in helping you grow. What should I call you?`,
      stage: 'introduction',
      suggestions: [user?.displayName || 'Use my real name', 'I prefer a nickname', 'Just call me by my first name']
    },
    {
      botMessage: "Perfect! Now, I'm curious - what brings you here today? Are you looking to level up in your current role, pivot to something new, or maybe just exploring what's possible? No pressure - just tell me what's on your mind! 🤔",
      stage: 'motivation',
      suggestions: ['Career advancement', 'Skill building', 'Career change', 'Personal interest', 'Academic purposes']
    },
    {
      botMessage: "I love that motivation! Now, let's talk about where you are right now. What's your current experience with programming or tech? Don't worry if you're just starting - everyone begins somewhere, and I'm here to meet you exactly where you are! 💪",
      stage: 'experience',
      suggestions: ['Complete beginner', 'Some coding experience', 'Professional developer', 'Student/learning', 'Experienced in other fields']
    },
    {
      botMessage: "Got it! That helps me understand your starting point. Now for the fun part - what technologies or areas are you most excited about? Maybe you've heard about React, Python, AI, mobile apps, or something completely different? Share what sparks your curiosity! ✨",
      stage: 'interests',
      suggestions: ['Web Development', 'Mobile Apps', 'Data Science', 'AI/Machine Learning', 'Game Development', 'DevOps', 'Cybersecurity']
    },
    {
      botMessage: "Awesome choices! I can already see some great project ideas forming. Now, everyone learns differently - some people love diving into documentation, others prefer video tutorials, and some learn best by jumping straight into coding. What feels most natural to you? 🎯",
      stage: 'learningStyle',
      suggestions: ['Visual (videos, diagrams)', 'Reading (docs, articles)', 'Hands-on (coding, experimenting)', 'Discussion (forums, communities)', 'Mixed approach']
    },
    {
      botMessage: "Perfect! Understanding your learning style helps me recommend the best resources for you. Now, let's be realistic about time - we all have busy lives! How much time can you typically dedicate to learning each week? Remember, even 30 minutes consistently can lead to amazing progress! ⏰",
      stage: 'availability',
      suggestions: ['1-2 hours per week', '3-5 hours per week', '6-10 hours per week', '10+ hours per week', 'It varies week to week']
    },
    {
      botMessage: "Excellent! That gives me a good sense of how to pace your learning journey. Finally, let's dream a bit - where do you see yourself in 6-12 months? What would make you feel like this learning journey was a huge success? 🚀",
      stage: 'goals',
      suggestions: ['Land my first tech job', 'Get promoted at current job', 'Build my own project/startup', 'Switch to a tech career', 'Become more confident with coding']
    }
  ];

  useEffect(() => {
    // Start the conversation
    if (messages.length === 0) {
      addBotMessage(conversationFlow[0].botMessage, conversationFlow[0].suggestions);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (text: string, suggestions: string[] = [], delay: number = 1000) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text,
        isBot: true,
        timestamp: new Date(),
        suggestions,
        isTyping: false
      };
      
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
    }, delay);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const processUserResponse = (response: string) => {
    addUserMessage(response);
    
    // Update user profile based on current stage
    const currentStage = conversationFlow[conversationStage];
    const updatedProfile = { ...userProfile };
    
    switch (currentStage.stage) {
      case 'motivation':
        updatedProfile.motivation = response;
        break;
      case 'experience':
        updatedProfile.experience = response;
        break;
      case 'interests':
        updatedProfile.interests = [...updatedProfile.interests, response];
        break;
      case 'learningStyle':
        updatedProfile.learningStyle = response;
        break;
      case 'availability':
        updatedProfile.availability = response;
        break;
      case 'goals':
        updatedProfile.goals = [...updatedProfile.goals, response];
        break;
    }
    
    updatedProfile.completionStatus = ((conversationStage + 1) / conversationFlow.length) * 100;
    setUserProfile(updatedProfile);
    
    // Move to next stage
    const nextStage = conversationStage + 1;
    if (nextStage < conversationFlow.length) {
      setConversationStage(nextStage);
      
      // Generate personalized response based on previous answers
      let personalizedMessage = conversationFlow[nextStage].botMessage;
      
      // Add personalization based on previous responses
      if (nextStage === 2 && response.toLowerCase().includes('career')) {
        personalizedMessage = personalizedMessage.replace('I love that motivation!', 'I love that career focus!');
      }
      
      addBotMessage(personalizedMessage, conversationFlow[nextStage].suggestions, 1500);
    } else {
      // Conversation complete
      finishOnboarding(updatedProfile);
    }
    
    setCurrentInput('');
  };

  const finishOnboarding = (profile: UserProfile) => {
    const completionMessage = `
🎉 Amazing! I feel like I really know you now, and I'm so excited about your learning journey ahead! 

Based on our conversation, I can see you're ${profile.experience.toLowerCase()}, passionate about ${profile.interests.join(' and ')}, with ${profile.availability.toLowerCase()} to dedicate to learning. Your goal of ${profile.goals.join(' and ')} is totally achievable!

I'm already preparing a personalized learning path just for you, with projects that match your interests and learning style. Ready to see your custom dashboard? 🚀
    `;
    
    addBotMessage(completionMessage, ['Take me to my dashboard!'], 2000);
    
    // In a real app, this would save to Firestore
    setTimeout(() => {
      window.location.href = '/';
    }, 5000);
  };

  const handleSend = () => {
    if (currentInput.trim()) {
      processUserResponse(currentInput);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    processUserResponse(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto max-w-4xl p-4 h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  AI Learning Mentor
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Getting to know you personally...
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Progress: {Math.round(userProfile.completionStatus)}%
              </div>
              <Progress value={userProfile.completionStatus} className="w-32" />
            </div>
          </div>
        </motion.div>

        {/* Chat Messages */}
        <div className="flex-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {message.isBot && (
                    <Avatar className="w-10 h-10 border-2 border-blue-200 dark:border-blue-700">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[80%] ${message.isBot ? 'order-2' : 'order-1'}`}>
                    <Card className={`${
                      message.isBot 
                        ? 'bg-white dark:bg-gray-700 border-blue-200 dark:border-blue-700' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 border-none'
                    } shadow-lg`}>
                      <CardContent className="p-4">
                        <p className={`whitespace-pre-wrap ${
                          message.isBot 
                            ? 'text-gray-800 dark:text-gray-200' 
                            : 'text-white'
                        }`}>
                          {message.text}
                        </p>
                      </CardContent>
                    </Card>
                    
                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap gap-2 mt-3"
                      >
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-700 transition-all duration-200 hover:scale-105"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                  
                  {!message.isBot && (
                    <Avatar className="w-10 h-10 border-2 border-purple-200 dark:border-purple-700">
                      <AvatarImage src={user?.photoURL || ''} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {user?.displayName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start"
              >
                <Avatar className="w-10 h-10 border-2 border-blue-200 dark:border-blue-700">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-white dark:bg-gray-700 border-blue-200 dark:border-blue-700 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex space-x-2">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-blue-500 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-blue-500 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-blue-500 rounded-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  ref={inputRef}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your response here..."
                  className="text-lg p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700"
                  disabled={isTyping}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!currentInput.trim() || isTyping}
                className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
