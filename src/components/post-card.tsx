'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Post, Comment } from '@/lib/placeholder-data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, User } from 'lucide-react'
import { Separator } from './ui/separator'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Timestamp } from 'firebase/firestore'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/hooks/use-auth'

interface PostCardProps {
    post: Post
}

export function PostCard({ post }: PostCardProps) {
    const { user, profile, isLoading } = useAuth();
    const [isLiked, setIsLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(post.likes?.length || 0)
    const [postComments, setPostComments] = useState<Comment[]>(post.comments || [])
    const [newComment, setNewComment] = useState('')
    const { toast } = useToast()

    useEffect(() => {
        if (user) {
            setIsLiked(post.likes?.includes(user.uid) ?? false);
        } else {
            setIsLiked(false);
        }
        setLikeCount(post.likes?.length ?? 0);
        setPostComments(post.comments ?? []);
    }, [post, user])

    const handleLikeClick = async () => {
        if (!user) {
            toast({ title: "Login to like posts", variant: "destructive"})
            return;
        }

        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked); // Optimistic update
        setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);
        
        try {
            // Get the post ID (could be either id or _id from MongoDB)
            const postId = post.id || (post._id ? post._id.toString() : undefined);
            if (!postId) {
                console.error('No post ID available:', post);
                toast({ title: "Error updating like", description: "Post ID is missing", variant: "destructive"});
                return;
            }
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'like',
                    userId: user.uid
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update like');
            }
        } catch (error) {
            // Revert optimistic update on error
            setIsLiked(!newIsLiked);
            setLikeCount(prev => !newIsLiked ? prev + 1 : prev - 1);
            console.error("Error updating like:", error);
            toast({ title: "Something went wrong.", variant: "destructive"})
        }
    }

    const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (newComment.trim() === '' || !user || !profile) {
            if (!user) toast({ title: "Login to comment", variant: "destructive"})
            return;
        };

        const commentData = {
            author: profile.displayName,
            authorId: user.uid,
            avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.displayName}`,
            text: newComment.trim(),
        };
        
        try {
            // Get the post ID (could be either id or _id from MongoDB)
            const postId = post.id || (post._id ? post._id.toString() : undefined);
            if (!postId) {
                console.error('No post ID available:', post);
                toast({ title: "Error adding comment", description: "Post ID is missing", variant: "destructive"});
                return;
            }
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'comment',
                    userId: user.uid,
                    comment: commentData
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add comment');
            }
            
            // Refresh the post data to get the updated comments
            const updatedPostResponse = await fetch(`/api/posts/${postId}`);
            if (updatedPostResponse.ok) {
                const updatedPost = await updatedPostResponse.json();
                setPostComments(updatedPost.comments || []);
            }
            
            setNewComment('');
        } catch (error) {
            console.error("Error adding comment:", error);
            toast({ title: "Could not add comment.", variant: "destructive"})
        }
    }
    
    const handleShareClick = async () => {
        // Get the post ID (could be either id or _id from MongoDB)
        const postId = post.id || (post._id ? post._id.toString() : undefined);
        if (!postId) {
            console.error('No post ID available for sharing:', post);
            toast({ title: "Error sharing post", description: "Post ID is missing", variant: "destructive"});
            return;
        }
        const postUrl = `${window.location.origin}/community/post/${postId}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Check out this post by ${post.author} on Petora Connect`,
                    text: post.content,
                    url: postUrl,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(postUrl);
                toast({
                    title: "Link Copied!",
                    description: "The post link has been copied to your clipboard.",
                });
            } catch (error) {
                console.error('Failed to copy:', error);
                toast({
                    title: "Oops!",
                    description: "Could not copy the link to your clipboard.",
                    variant: "destructive"
                });
            }
        }
    }

    // FIX: Added a robust helper function to handle multiple date formats
    const normalizeDate = (dateInput: any): Date | null => {
        if (!dateInput) {
            return null;
        }
        // Firebase Timestamp
        if (typeof dateInput.toDate === 'function') {
            return dateInput.toDate();
        }
        // Standard JavaScript Date
        if (dateInput instanceof Date) {
            return dateInput;
        }
        // MongoDB Extended JSON format
        if (dateInput.$date && typeof dateInput.$date === 'string') {
            return new Date(dateInput.$date);
        }
        return null;
    };

    // FIX: Simplified getTimestamp to use the new helper
    const getTimestamp = () => {
        const date = normalizeDate(post.createdAt);
        if (date) {
            return `${formatDistanceToNow(date)} ago`;
        }
        return "Just now";
    }

    const getCommenterAvatar = () => {
        if (!user || !profile) return "";
        return user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.displayName}`;
    }

    const getCommenterInitials = () => {
        if (!profile) return "?";
        return profile.displayName?.charAt(0) || "?";
    }

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="flex flex-row items-start gap-4 p-4">
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={post.authorAvatar} alt={post.author} />
                    <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                    <CardTitle className="text-base">{post.author}</CardTitle>
                    <CardDescription className="text-xs">{getTimestamp()}</CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                    <span className="sr-only">More options</span>
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
                <p className="text-sm">{post.content}</p>
                {post.imageUrl && (
                    <div className="relative aspect-video rounded-md overflow-hidden">
                        <Image 
                            src={post.imageUrl} 
                            alt="Post image" 
                            fill 
                            className="object-cover"
                        />
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4 p-4">
                <div className="flex justify-between w-full text-sm text-muted-foreground">
                    <span>{likeCount} Likes</span>
                    <span>{postComments.length} Comments</span>
                </div>
                <Separator />
                <div className="grid grid-cols-3 w-full gap-2">
                    <Button variant="ghost" onClick={handleLikeClick}>
                        <Heart className={cn("mr-2 h-5 w-5", isLiked && "fill-red-500 text-red-500")} /> Like
                    </Button>
                    <Button variant="ghost" onClick={() => {
                        const inputElement = document.getElementById(`comment-input-${post.id || (post._id ? post._id.toString() : 'new')}`);
                        inputElement?.focus();
                    }}>
                        <MessageCircle className="mr-2 h-5 w-5" /> Comment
                    </Button>
                    <Button variant="ghost" onClick={handleShareClick}>
                        <Share2 className="mr-2 h-5 w-5" /> Share
                    </Button>
                </div>
                <Separator />
                <div className="w-full space-y-4">
                    {/* FIX: Simplified and corrected sorting logic */}
                    {postComments.sort((a, b) => {
                        const dateA = normalizeDate(a.createdAt);
                        const dateB = normalizeDate(b.createdAt);
                        // Sort with oldest first (maintains original logic), handles nulls
                        return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
                    }).map((comment) => (
                        <div key={comment.id} className="flex items-start gap-3">
                            <Avatar className="h-9 w-9 border">
                                <AvatarImage src={comment.avatar} alt={comment.author} />
                                <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="bg-muted rounded-lg px-3 py-2 text-sm w-full">
                                <p className="font-semibold">{comment.author}</p>
                                <p>{comment.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <form className="flex w-full items-center gap-2 pt-2" onSubmit={handleCommentSubmit}>
                     <Avatar className="h-9 w-9 border">
                         <AvatarImage src={getCommenterAvatar()} alt={'User'} />
                         <AvatarFallback>{getCommenterInitials()}</AvatarFallback>
                     </Avatar>
                    <Input 
                      id={`comment-input-${post.id || (post._id ? post._id.toString() : 'new')}`}
                      placeholder="Write a comment..." 
                      className="flex-1"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={!user}
                    />
                    <Button size="icon" variant="ghost" type="submit" disabled={!newComment.trim() || !user}>
                        <Send className="h-5 w-5" />
                        <span className="sr-only">Send comment</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
