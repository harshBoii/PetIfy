'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, User, ShoppingCart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Define the shape of a notification to use in our state
interface Notification {
    _id: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            const fetchNotifications = async () => {
                try {
                    const response = await fetch(`/api/users/${user.id}/notifications`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch notifications');
                    }
                    const data = await response.json();
                    console.log(data)
                    setNotifications(data);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchNotifications();
        }
    }, [user]);

    if (isLoading || isAuthLoading) {
        return <div className="container text-center p-8">Loading notifications...</div>;
    }
    
    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <header className="text-center mb-8">
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
                    <Bell className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-headline text-4xl text-primary">Your Notifications</h1>
                <p className="text-muted-foreground">Recent updates and requests will appear here.</p>
            </header>

            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <Card key={notif._id} className={`p-4 flex items-start gap-4 transition-colors ${!notif.isRead ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'}`}>
                           <Avatar className="h-10 w-10 border mt-1">
                                <AvatarFallback className="bg-primary/20 text-primary">
                                    <ShoppingCart className="h-5 w-5" />
                                </AvatarFallback>
                           </Avatar>
                           <div className="flex-1">
                               <p className="text-sm">{notif.message}</p>
                               <p className="text-xs text-muted-foreground mt-1">
                                   {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                               </p>
                           </div>
                           {!notif.isRead && (
                               <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1" aria-label="Unread"></div>
                           )}
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">You have no new notifications.</p>
                    </div>
                )}
            </div>
        </div>
    );
}