"use client";

import { useState, useRef, useEffect } from 'react';
import { CornerDownLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { aiPoweredOnboarding } from '@/ai/flows/ai-powered-onboarding';
import { useToast } from "@/hooks/use-toast"

interface Message {
  text: string;
  isUser: boolean;
}

export default function OnboardingClient() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Welcome to Project Compass! To get started, what area are you most excited about? (e.g., Web Development, App Development, AI/ML)", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage].map(m => `${m.isUser ? 'User' : 'AI'}: ${m.text}`).join('\n');
      
      const response = await aiPoweredOnboarding({ userMessage: conversationHistory });
      
      if (response.chatbotResponse) {
        const aiMessage: Message = { text: response.chatbotResponse, isUser: false };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error("No response from AI");
      }
    } catch (error) {
      console.error("Error with AI onboarding:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem communicating with our AI mentor. Please try again.",
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex-1 flex flex-col">
      <CardContent className="p-4 flex-1 overflow-y-auto" ref={scrollAreaRef}>
        <div className="space-y-4">
        { messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-3 ${message.isUser ? 'justify-end' : ''}`}>
              {!message.isUser && (
                <Avatar className="border">
                  <AvatarImage src="https://placehold.co/40x40.png" alt="AI Mentor" data-ai-hint="compass logo" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <div className={`rounded-lg p-3 max-w-xl ${message.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-3">
                <Avatar className="border">
                  <AvatarImage src="https://placehold.co/40x40.png" alt="AI Mentor" data-ai-hint="compass logo" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="rounded-lg p-3 max-w-md bg-muted flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            </div>
          )}
        </div>
      </CardContent>
      <div className="p-4 border-t bg-card">
        <form onSubmit={handleSendMessage} className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me about your interests..."
            className="pr-16"
            disabled={isLoading}
            autoFocus
          />
          <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-8" disabled={isLoading || !input.trim()}>
            <CornerDownLeft className="w-4 h-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </Card>
  );
}
