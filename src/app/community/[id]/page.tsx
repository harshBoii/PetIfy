// src/app/community/groups/[id]/page.tsx (or wherever your file is)
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { type CommunityGroup, type ChatMessage } from '@/lib/placeholder-data' // Ensure types are updated
import { Users, Send, ChevronLeft, User, UserPlus } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { PetLoader } from '@/components/pet-loader'

// NOTE: The data types in placeholder-data.ts should be updated to use string for ID
// and Date or string for createdAt, instead of Firestore Timestamp.

export default function GroupChatPage() {
    const params = useParams();
    const groupId = typeof params.id === 'string' ? params.id : '';
    const { toast } = useToast();
    const { user, profile } = useAuth();
    
    const [group, setGroup] = useState<CommunityGroup | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    
    const isMember = group?.memberIds?.includes(user?.id || '');
    const isOwner = group?.ownerId === user?.id;

    const fetchGroupData = useCallback(async () => {
        if (!groupId) return;
        try {
            const response = await fetch(`/api/groups/${groupId}`);
            if (!response.ok) {
                throw new Error('Group not found');
            }
            const data = await response.json();
            // MongoDB uses _id. We'll map it to 'id' for consistency if needed.
            setGroup({ ...data.group, id: data.group._id }); 
            setMessages(data.messages.map((m: any) => ({ ...m, id: m._id })));
        } catch (error) {
            notFound();
        } finally {
            setIsLoading(false);
        }
    }, [groupId]);

    useEffect(() => {
        fetchGroupData();
        
        // Polling to get new messages every 3 seconds
        const interval = setInterval(() => {
            fetchGroupData();
        }, 3000);

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [groupId, fetchGroupData]);

    const handleJoinGroup = async () => {
        if (!user || !group) {
            toast({ title: "You must be logged in to join", variant: "destructive" });
            return;
        }

        setIsJoining(true);
        try {
            const response = await fetch(`/api/groups/${group.id}/join`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            });

            if (!response.ok) throw new Error('Failed to join');

            toast({ title: `Welcome to ${group.name}!`, description: "You have successfully joined the group." });
            // Refresh local state to reflect membership
            setGroup(prev => prev ? { ...prev, memberIds: [...(prev.memberIds || []), user.id], members: (prev.members || 0) + 1 } : null);

        } catch (error) {
            console.error("Error joining group:", error);
            toast({ title: "Failed to join group", variant: "destructive" });
        } finally {
            setIsJoining(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !user || !profile || !group) {
            toast({ title: "You must be logged in to chat", variant: "destructive" });
            return;
        }

        const tempMessageId = Date.now().toString();
        const messageData = {
            user: profile.displayName,
            userId: user.id,
            message: newMessage,
            avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.displayName}`,
        };

        // Optimistic UI update
        setMessages(prev => [...prev, { ...messageData, id: tempMessageId, createdAt: new Date() } as ChatMessage]);
        setNewMessage('');
        
        try {
            const response = await fetch(`/api/groups/${group.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData),
            });

            if (!response.ok) throw new Error('Failed to send message');
            // Optionally, you can refetch messages here to ensure sync
            fetchGroupData();

        } catch (error) {
             console.error("Error sending message:", error);
             toast({ title: "Failed to send message", variant: "destructive" });
             // Revert optimistic update on failure
             setMessages(prev => prev.filter(m => m.id !== tempMessageId));
        }
    }
    
    // ... (The rest of your JSX remains largely the same) ...
    // Make sure to handle the `createdAt` field as a Date string or object in your JSX,
    // not a Firestore Timestamp with a .toDate() method.
    // The rest of the return(...) statement from your original file goes here.
    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 h-[calc(100vh-5rem)]">
                <PetLoader />
                <p className="text-muted-foreground">Loading group chat...</p>
            </div>
        )
    }

    if (!group) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col h-[calc(100vh-5rem)]">
            <div className="mb-6 flex-shrink-0">
                <Button asChild variant="outline">
                    <Link href="/community">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Community
                    </Link>
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 flex-1 min-h-0">
                <div className="lg:col-span-1">
                    <Card className="h-full overflow-y-auto">
                        <CardHeader className="p-0">
                             <div className="relative h-48 w-full">
                                <Image
                                    src={group.imageUrl}
                                    alt={`Image for ${group.name}`}
                                    fill
                                    className="object-cover rounded-t-lg"
                                    data-ai-hint="pets community"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <CardTitle className="font-headline text-2xl mb-2">{group.name}</CardTitle>
                            <div className="flex items-center text-sm text-muted-foreground mb-4">
                                <Users className="h-4 w-4 mr-2 text-primary/70" />
                                {group.members} members
                            </div>
                            <CardDescription>{group.description}</CardDescription>
                            
                            {user && !isMember && !isOwner && (
                                <Button className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleJoinGroup} disabled={isJoining}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    {isJoining ? 'Joining...' : 'Join Group'}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 flex flex-col">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Group Chat</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col p-6 pt-0 min-h-0">
                             <ScrollArea className="flex-1 pr-4 -mr-4 mb-4">
                                <div className="space-y-6">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex items-start gap-3 ${msg.userId === user?.id ? 'justify-end' : ''}`}>
                                            {msg.userId !== user?.id && (
                                                <Avatar className="h-9 w-9 border">
                                                    <AvatarImage src={msg.avatar} alt={msg.user} />
                                                    <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${msg.userId === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                {msg.userId !== user?.id && <p className="font-semibold mb-1">{msg.user}</p>}
                                                <p>{msg.message}</p>
                                            </div>
                                             {msg.userId === user?.id && (
                                                <Avatar className="h-9 w-9 border">
                                                    <AvatarImage src={msg.avatar} alt={msg.user} />
                                                    <AvatarFallback>
                                                        {profile?.displayName?.charAt(0) || <User />}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                            {(isMember || isOwner) ? (
                                <form className="flex gap-2 border-t pt-4" onSubmit={handleSendMessage}>
                                    <Input 
                                      placeholder={user ? "Type your message..." : "Log in to join the chat"}
                                      className="flex-1"
                                      value={newMessage}
                                      onChange={(e) => setNewMessage(e.target.value)}
                                      disabled={!user || isLoading}
                                    />
                                    <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={!newMessage.trim() || !user || isLoading}>
                                        <Send className="h-5 w-5" />
                                        <span className="sr-only">Send</span>
                                    </Button>
                                </form>
                            ) : (
                                <div className="text-center text-muted-foreground border-t pt-6">
                                    <p>You must join the group to participate in the chat.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}