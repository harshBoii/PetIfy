'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { type Post, type CommunityGroup } from '@/lib/placeholder-data'
import { Users, Hash, Loader2, PlusCircle, X } from 'lucide-react'
import { CreatePostForm } from '@/components/create-post-form'
import { PostCard } from '@/components/post-card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import Image from 'next/image'
import { PetLoader } from '@/components/pet-loader'

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const createGroupSchema = z.object({
  name: z.string().min(3, 'Group name must be at least 3 characters.').max(50),
  description: z.string().min(10, 'Description must be at least 10 characters.').max(200),
  image: z.custom<File>()
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
})

export default function CommunityPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [isLoadingGroups, setIsLoadingGroups] = useState(true);
    const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [groupImagePreview, setGroupImagePreview] = useState<string | null>(null);
    const groupFileInputRef = useRef<HTMLInputElement>(null);

    const { toast } = useToast();
    const { user, profile } = useAuth();

    const form = useForm<z.infer<typeof createGroupSchema>>({
        resolver: zodResolver(createGroupSchema),
        defaultValues: { name: '', description: '', image: undefined },
    });

    const fetchCommunityData = useCallback(async () => {
        setIsLoadingPosts(true);
        setIsLoadingGroups(true);
        try {
            const [postsRes, groupsRes] = await Promise.all([
                fetch('/api/posts'),
                fetch('/api/groups')
            ]);

            if (!postsRes.ok) throw new Error('Failed to fetch posts');
            if (!groupsRes.ok) throw new Error('Failed to fetch groups');

            const postsData = await postsRes.json();
            const groupsData = await groupsRes.json();

            setPosts(postsData.posts);
            setGroups(groupsData.groups);

        } catch (error) {
            console.error("Error fetching community data:", error);
            toast({ title: 'Error', description: 'Could not fetch community data.', variant: 'destructive' });
        } finally {
            setIsLoadingPosts(false);
            setIsLoadingGroups(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchCommunityData();
    }, [fetchCommunityData]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fieldOnChange: (file: File | undefined) => void) => {
        const file = event.target.files?.[0];
        if (file) {
            fieldOnChange(file);
            const reader = new FileReader();
            reader.onloadend = () => setGroupImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    const handleRemoveGroupImage = () => {
        setGroupImagePreview(null);
        form.setValue("image", undefined as any, { shouldValidate: true });
        if(groupFileInputRef.current) groupFileInputRef.current.value = "";
    }

    const handleCreatePost = async (content: string, imageFile?: File) => {
        if (!user || !profile) {
            toast({ title: "Login Required", variant: "destructive" });
            return;
        }
        toast({ title: 'Creating post...'});
        try {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('author', profile.displayName);
            formData.append('authorId', user.uid);
            formData.append('authorAvatar', user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.displayName}`);
            if (imageFile) formData.append('image', imageFile);

            const response = await fetch('/api/posts', { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Failed to create post');

            toast({ title: 'Post created!', variant: 'default'});
            await fetchCommunityData(); // Refresh posts
        } catch (error) {
            console.error("Error creating post:", error);
            toast({ title: "Post Failed", variant: "destructive" });
        }
    };

    const handleCreateGroup = async (values: z.infer<typeof createGroupSchema>) => {
        if (!user) {
            toast({ title: "You must be logged in to create a group", variant: "destructive" });
            return;
        }
        setIsSubmittingGroup(true);
        toast({ title: "Creating group..." });
        try {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('description', values.description);
            formData.append('ownerId', user.uid);
            if (values.image) formData.append('image', values.image);

            const response = await fetch('/api/groups', { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Failed to create group');

            toast({ title: 'Group Created!', description: `${values.name} is now live.` });
            form.reset();
            setGroupImagePreview(null);
            setIsCreateGroupOpen(false);
            await fetchCommunityData(); // Refresh groups
        } catch (error) {
            console.error('Error creating group:', error);
            toast({ title: 'Failed to Create Group', variant: 'destructive' });
        } finally {
            setIsSubmittingGroup(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
             <div className="text-center mb-12">
                 <h1 className="text-4xl font-bold font-headline text-primary">Community Feed</h1>
                 <p className="text-muted-foreground mt-1 max-w-2xl mx-auto">
                    Share stories, ask questions, and connect with other pet lovers in our community feed.
                 </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                <div className="lg:col-span-3 space-y-6">
                    <CreatePostForm onCreatePost={handleCreatePost} />
                    {isLoadingPosts ? (
                        <div className="flex flex-col justify-center items-center py-20 gap-4">
                           <PetLoader />
                           <p className="text-muted-foreground">Loading posts...</p>
                       </div>
                    ) : posts.length > 0 ? (
                        posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="text-center py-20 text-muted-foreground bg-card border rounded-lg">
                            <p className="text-lg">No posts yet.</p>
                            <p>Be the first to share something with the community!</p>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-1 space-y-6 lg:sticky top-24">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-headline flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Users className="h-6 w-6 text-primary" />
                                    Community Groups
                                </div>
                                {user && (
                                    <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <PlusCircle className="h-5 w-5 text-primary"/>
                                                <span className="sr-only">Create Group</span>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Create a New Group</DialogTitle>
                                                <DialogDescription>Start a new community for fellow pet lovers.</DialogDescription>
                                            </DialogHeader>
                                            <Form {...form}>
                                                <form onSubmit={form.handleSubmit(handleCreateGroup)} className="space-y-4">
                                                    <FormField control={form.control} name="name" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Group Name</FormLabel>
                                                            <FormControl><Input placeholder="e.g., Corgi Enthusiasts" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name="description" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Description</FormLabel>
                                                            <FormControl><Textarea placeholder="What is your group about?" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name="image" render={({ field: { onChange, value, ...rest } }) => (
                                                        <FormItem>
                                                            <FormLabel>Group Image</FormLabel>
                                                            <FormControl>
                                                                <Input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" ref={groupFileInputRef} onChange={(e) => handleFileChange(e, onChange)} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    {groupImagePreview && (
                                                        <div className="relative mt-4 w-full h-48 border rounded-lg overflow-hidden">
                                                            <Image src={groupImagePreview} alt="Group preview" fill className="object-cover" />
                                                            <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 rounded-full" onClick={handleRemoveGroupImage} disabled={isSubmittingGroup}>
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                    <DialogFooter>
                                                        <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                                                        <Button type="submit" disabled={isSubmittingGroup} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                                            {isSubmittingGroup && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            Create Group
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </Form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                           {isLoadingGroups ? (
                                <div className="space-y-2 text-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted inline-block" /></div>
                           ) : groups.length > 0 ? (
                                <ul className="space-y-1">
                                    {groups.map((group) => (
                                        <li key={group.id}>
                                            <Link href={`/community/${group._id}`} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors cursor-pointer">
                                                <div className="relative h-12 w-12 rounded-md overflow-hidden shrink-0">
                                                    <Image src={group.imageUrl} alt={group.name} fill className="object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{group.name}</p>
                                                    <p className="text-sm text-muted-foreground">{group.members} members</p>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                               </ul>
                           ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No groups yet. Why not create one?</p>
                           )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-headline flex items-center gap-2">
                                <Hash className="h-6 w-6 text-primary" />
                                Trending Tags
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ul className="flex flex-wrap gap-2">
                                {['#dogsofinsta', '#caturday', '#adoptdontshop', '#petcare', '#funnyanimals'].map((tag) => (
                                    <li key={tag}><button className="text-sm text-primary hover:underline">{tag}</button></li>
                                ))}
                           </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
