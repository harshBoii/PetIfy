'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Image as ImageIcon, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

// Validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Define the shape of the form data
const createPostSchema = z.object({
  content: z.string().min(1, 'Post cannot be empty.').max(500, 'Post is too long.'),
  image: z.custom<File>()
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
});

// Define the props for the component.
// This now correctly expects a function that handles a File object.
interface CreatePostFormProps {
  onCreatePost: (content: string, imageFile?: File) => Promise<void>;
}

export function CreatePostForm({ onCreatePost }: CreatePostFormProps) {
  const { user, profile } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { content: '', image: undefined },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    form.setValue("image", file, { shouldValidate: true });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    form.setValue("image", undefined, { shouldValidate: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (values: z.infer<typeof createPostSchema>) => {
    setIsSubmitting(true);
    await onCreatePost(values.content, values.image);
    form.reset();
    handleRemoveImage();
    setIsSubmitting(false);
  };

  if (!user || !profile) {
    return null; // Or a login prompt
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={user.photoURL ?? undefined} alt={profile.displayName} />
            <AvatarFallback>{profile.displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={`What's on your mind, ${profile.displayName}?`}
                        className="min-h-[80px] w-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {imagePreview && (
                <div className="relative w-full h-60 rounded-lg overflow-hidden border">
                    <Image src={imagePreview} alt="Post preview" fill className="object-cover" />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 rounded-full"
                        onClick={handleRemoveImage}
                        disabled={isSubmitting}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove image</span>
                    </Button>
                </div>
              )}

              <div className="flex justify-between items-center">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-5 w-5 text-primary" />
                  <span className="sr-only">Add image</span>
                </Button>
                <Input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                />
                <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Post
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
