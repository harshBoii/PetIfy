// File: src/app/chat/[id]/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, ChevronLeft, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { PetLoader } from '@/components/pet-loader'

// ## FIX 1: Simplified the data structures to match your actual API response.
interface ChatMessage {
    sender: string;
    text: string;
}

interface ChatDetails {
    id: string;
    name: string;
    messages: ChatMessage[];
}

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const chatId = typeof params.id === 'string' ? params.id : '';
    const { toast } = useToast();
    
    const [details, setDetails] = useState<ChatDetails | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const fetchChatData = useCallback(async () => {
        if (!chatId) return;
        try {
            const response = await fetch(`/api/chats/${chatId}`);
            if (!response.ok) {
                throw new Error('Chat not found.');
            }
            const data: ChatDetails = await response.json();
            setDetails(data);
        } catch (error) {
            console.error("Error fetching chat data:", error);
            toast({ title: "Error", description: "Could not load chat.", variant: "destructive" });
            notFound();
        } finally {
            setIsLoading(false);
        }
    }, [chatId, toast]);

    useEffect(() => {
        fetchChatData();
    }, [fetchChatData]);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
        }
    }, [details?.messages]); 

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !chatId) return;

        // Note: This is a simplified send function.
        // You may need to adjust the body based on your API's requirements.
        try {
            const response = await fetch(`/api/chats/${chatId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender: 'You', text: newMessage }),
            });

            if (!response.ok) throw new Error('Failed to send message');
            
            setNewMessage('');
            // Refresh data to get the new message from the server
            await fetchChatData();
        } catch (error) {
             console.error("Error sending message:", error);
             toast({ title: "Failed to send message", variant: "destructive" });
        }
    }
    
    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 h-[calc(100vh-5rem)]">
                <PetLoader />
                <p className="text-muted-foreground">Loading your chat...</p>
            </div>
        );
    }

    if (!details) {
        return notFound();
    }
    
    // ## FIX 2: Destructure only the properties that exist: `name` and `messages`.
    const { name, messages } = details;

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col h-[calc(100vh-5rem)]">
            <div className="mb-6 flex-shrink-0">
                <Button variant="outline" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>
            
            {/* ## FIX 3: Simplified the UI to a single chat panel. */}
            <div className="flex-1 min-h-0">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-6 pt-0 min-h-0">
                         <ScrollArea className="flex-1 pr-4 -mr-4 mb-4" viewportRef={scrollAreaRef}>
                            <div className="space-y-6">
                                {messages.map((msg, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <Avatar className="h-9 w-9 border">
                                            <AvatarFallback><User/></AvatarFallback>
                                        </Avatar>
                                        <div className="rounded-lg px-4 py-2 text-sm bg-muted">
                                            <p className="font-semibold">{msg.sender}</p>
                                            <p>{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <form className="flex gap-2 border-t pt-4" onSubmit={handleSendMessage}>
                            <Input 
                                placeholder="Type your message..."
                                className="flex-1"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <Button type="submit" disabled={!newMessage.trim()}>
                                <Send className="h-5 w-5" />
                                <span className="sr-only">Send</span>
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}