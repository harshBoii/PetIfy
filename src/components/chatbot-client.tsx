'use client';

import { useState } from 'react';
import { Bot, User, CornerDownLeft, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { petCareChatbot } from '@/ai/flows/pet-care-chatbot';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatbotClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await petCareChatbot({ question: input });
      const assistantMessage: Message = { role: 'assistant', content: result.answer };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling petCareChatbot:', error);
      toast({
        title: "Oh no! Something went wrong.",
        description: "There was a problem communicating with the AI assistant. Please try again later.",
        variant: "destructive"
      });
      setMessages((prev) => prev.slice(0, -1)); // Remove the user message if AI fails
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl h-[70vh] flex flex-col shadow-lg border">
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={cn('flex items-start gap-4', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                {message.role === 'assistant' && (
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5"/>
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={cn('max-w-[75%] rounded-lg px-4 py-3 text-sm', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                  <p>{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <Avatar className="h-9 w-9 border">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5"/>
                    </AvatarFallback>
                </Avatar>
                <div className="max-w-[75%] rounded-lg px-4 py-3 bg-muted flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 animate-pulse" />
                  <p className="text-sm animate-pulse">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about pet food, health, or behavior..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <CornerDownLeft className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
