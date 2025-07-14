
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, Bot, Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function OnboardingClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Start the conversation immediately when component loads
  useEffect(() => {
    if (messages.length === 0) {
      setIsLoading(true);
      fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history: [] }),
      })
      .then(res => res.json())
      .then(data => {
          setMessages([{ role: 'model', content: data.message }]);
      })
      .catch(error => {
          console.error("Failed to get initial onboarding message", error);
          // Fallback welcome message
          setMessages([{ 
            role: 'model', 
            content: "👋 Welcome to your personalized learning journey! I'm your AI mentor, and I'm excited to help you succeed.

To create the perfect learning path for you, let's start simple: **What's your name, and what made you decide to start learning today?**" 
          }]);
      })
      .finally(() => {
          setIsLoading(false);
      });
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newMessages }),
      });
      const data = await res.json();
      
      if (data.message.includes('[DONE]')) {
        // Conversation is over
        const finalMessage = data.message.replace('[DONE]', '').trim();
        setMessages(prev => [...prev, { role: 'model', content: finalMessage }]);
        await saveOnboardingData(newMessages);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: data.message }]);
      }

    } catch (error) {
      console.error("Failed to get response from onboarding API", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveOnboardingData = async (finalHistory: Message[]) => {
    if (!user) return;
    try {
        // First, save the raw history to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            onboardingHistory: finalHistory,
            completedOnboarding: true,
        }, { merge: true });

        // Then, call the new endpoint to process and store in vector DB
        await fetch('/api/onboarding/finalize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user.uid,
                history: finalHistory,
            }),
        });

        // Give a moment for the user to read the final message before redirecting
        setTimeout(() => {
            router.push('/dashboard');
        }, 2000);
    } catch (error) {
        console.error("Error in final onboarding step: ", error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] w-full max-w-3xl mx-auto my-8 bg-card border rounded-lg shadow-lg">
        <div className="p-4 border-b text-center">
            <h1 className="text-2xl font-bold">Your Personal Onboarding</h1>
            <p className="text-muted-foreground">Let's get to know you better.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence>
                {messages.map((msg, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
                    >
                         {msg.role === 'model' && (
                            <Avatar className="w-10 h-10 border">
                                <AvatarFallback><Bot /></AvatarFallback>
                            </Avatar>
                         )}
                        <div className={`max-w-md p-4 rounded-2xl ${
                            msg.role === 'user' 
                                ? 'bg-primary text-primary-foreground rounded-br-none' 
                                : 'bg-muted rounded-bl-none'
                        }`}>
                            <p>{msg.content}</p>
                        </div>
                        {msg.role === 'user' && (
                            <Avatar className="w-10 h-10 border">
                                <AvatarImage src={user?.photoURL || ''} />
                                <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                         )}
                    </motion.div>
                ))}
            </AnimatePresence>
            {isLoading && (
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-4"
                >
                    <Avatar className="w-10 h-10 border">
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div className="max-w-md p-4 rounded-2xl bg-muted rounded-bl-none">
                        <Loader className="animate-spin" />
                    </div>
                </motion.div>
            )}
            <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your response..."
                    className="flex-1"
                    disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                    <Send />
                </Button>
            </form>
        </div>
    </div>
  );
}
