
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, Bot, Loader, Sparkles, Mic, MicOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function OnboardingClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { user, login } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [sessionId] = useState(() => `obh-${Math.random().toString(36).slice(2)}-${Date.now()}`);

  const MAX_QUESTIONS = 10;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Check authentication on component mount
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Start the conversation if no messages exist
    if (messages.length === 0) {
      startOnboarding();
    }
  }, [user, router]);

  // Initialize speech recognition
  useEffect(() => {
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(prev => transcript);
      };

      recognitionRef.current.onerror = (e: any) => {
        setIsRecording(false);
        toast({ title: 'Microphone error', description: e.error || 'Voice input failed', variant: 'destructive' as any });
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [toast]);

  const toggleRecording = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      toast({ title: 'Voice not supported', description: 'Your browser does not support speech recognition. Please type your response.' });
      return;
    }
    if (isRecording) {
      rec.stop();
      setIsRecording(false);
    } else {
      try {
        setInput('');
        rec.start();
        setIsRecording(true);
      } catch (e) {
        console.error('Speech recognition start failed', e);
        setIsRecording(false);
      }
    }
  };

  const startOnboarding = async () => {
    setIsLoading(true);
    try {
      const isMongoId = /^[a-f0-9]{24}$/i.test(String(user?._id || ''));
      const endpoint = isMongoId ? '/api/onboarding/enhanced' : '/api/onboarding/chat-simple';
  const body = isMongoId ? { history: [], userId: user?._id, sessionId } : { history: [], sessionId } as any;

    const token = localStorage.getItem('token') || '';
    const call = async () => fetch(endpoint, {
        method: 'POST',
        headers: { 
      'Content-Type': 'application/json',
      ...(isMongoId ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      // Retry once if first call fails (DB warm-up)
      let response = await call();
      if (!response.ok) {
        await new Promise(r => setTimeout(r, 400));
        response = await call();
      }

  if (!response.ok) {
        throw new Error('Failed to start onboarding');
      }

  const data = await response.json();
  setMessages([{ role: 'assistant', content: data.message || data.response }]);
    } catch (error) {
      console.error("Failed to start onboarding:", error);
      // Fallback welcome message
      setMessages([{ 
        role: 'assistant', 
  content: `👋 Welcome to your personalized learning journey! I'm your AI mentor, and I'm excited to help you succeed.

To create the perfect learning path for you, let's start simple:
1) What's your name?
2) What made you decide to start learning today?

Tip: Please answer in 1-2 sentences so I can tailor this better.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    // Encourage richer answers
    const wordCount = input.trim().split(/\s+/).length;
    if (wordCount < 5) {
      toast({ title: 'Add more detail', description: 'Please provide a bit more context so we can tailor your path better.' });
    }

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Stop recording if active
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    try {
      // Respect max questions
      const userMessageCount = newMessages.filter(m => m.role === 'user').length;
      if (userMessageCount >= MAX_QUESTIONS) {
        await completeOnboarding(newMessages);
        return;
      }

      const isMongoId = /^[a-f0-9]{24}$/i.test(String(user?._id || ''));
      const endpoint = isMongoId ? '/api/onboarding/enhanced' : '/api/onboarding/chat-simple';
  const body = isMongoId ? { history: newMessages, userId: user?._id, sessionId } : { history: newMessages, sessionId } as any;

    const token2 = localStorage.getItem('token') || '';
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
      ...(isMongoId ? { 'Authorization': `Bearer ${token2}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

  const data = await response.json();
  const text = data.message || data.response || '';
      if (text.includes('[DONE]') || newMessages.filter(m => m.role === 'user').length >= MAX_QUESTIONS) {
        // Conversation is complete
        const finalMessage = text.replace('[DONE]', '').trim();
        setMessages(prev => [...prev, { role: 'assistant', content: finalMessage }]);
        
        // Complete onboarding after a short delay
        setTimeout(async () => {
      await completeOnboarding([...newMessages, { role: 'assistant', content: finalMessage }]);
        }, 2000);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: text || 'Got it! Tell me more...' }]);
      }

    } catch (error) {
      console.error("Failed to get response from onboarding API", error);
      // Fallback to simple flow
      try {
        const token = localStorage.getItem('token') || '';
        const response = await fetch('/api/onboarding/chat-simple', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ history: newMessages })
        });
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } catch (e) {
        console.error('Fallback simple flow also failed:', e);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I’m having trouble processing that right now. Please try again with 1-2 sentences so I can give you better guidance." 
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (finalHistory?: Message[]) => {
    try {
  const token = localStorage.getItem('token') || '';
      const mappedHistory = (finalHistory || messages).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      }));
      const response = await fetch('/api/onboarding/finalize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          userId: user?._id,
          history: mappedHistory,
        }),
      });

      if (response.ok) {
        // Update user in context and storage
        if (user) {
          const updatedUser = { ...user, completedOnboarding: true } as any;
          localStorage.setItem('user', JSON.stringify(updatedUser));
          if (typeof login === 'function') {
            await login(updatedUser, token);
          }
        }
        toast({ title: 'Onboarding complete', description: 'Your personalized dashboard is ready!' });
        router.push('/dashboard');
      } else {
        console.error('Failed to complete onboarding');
        toast({ title: 'Completion failed', description: 'Could not save your onboarding. You can retry.', variant: 'destructive' as any });
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({ title: 'Error', description: 'Something went wrong completing onboarding.', variant: 'destructive' as any });
    }
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto p-4 pt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-3 mb-4"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI-Powered Onboarding
            </h1>
          </motion.div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Let's create your personalized learning experience. I'll ask you a few questions to understand your goals and preferences.
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
        {messages.map((message, index) => (
                <motion.div
          key={`${message.role}-${index}-${message.content.slice(0,10)}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}>
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-purple-500 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Loader className="h-4 w-4 animate-spin text-purple-600" />
                      <span className="text-gray-600 dark:text-gray-400">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2 items-center">
              <Button
                type="button"
                variant={isRecording ? 'destructive' : 'outline'}
                onClick={toggleRecording}
                className="rounded-2xl"
                disabled={isLoading}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your response..."
                className="flex-1 rounded-2xl border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Question {messages.filter(m => m.role === 'user').length + (isLoading ? 1 : 0)} of {MAX_QUESTIONS}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
