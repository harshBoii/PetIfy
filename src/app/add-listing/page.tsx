'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { PlusCircle, Loader2, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AuthRequired } from "@/components/auth-required";
import React, { useState, useRef } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string().min(2, "Pet name must be at least 2 characters.").max(50),
  type: z.enum(["Dog", "Cat", "Bird", "Rabbit", "Other"]),
  breed: z.string().min(2, "Breed must be at least 2 characters.").max(50),
  age: z.string().min(1, "Age is required."),
  gender: z.enum(["Male", "Female"]),
  location: z.string().min(2, "Location is required."),
  listingType: z.enum(["Adoption", "Sale", "Foster"]),
  price: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500),
  petImage: z.custom<File>()
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
});

export default function AddListingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", type: undefined, breed: "", age: "", gender: undefined,
      location: "", listingType: undefined, price: "", petImage: undefined,
    },
  });

  const listingType = form.watch("listingType");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fieldOnChange: (file: File | undefined) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      fieldOnChange(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    form.setValue("petImage", undefined as any, { shouldValidate: true });
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ title: "Authentication Required", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    toast({ title: "Submitting your listing..." });

    try {
      const formData = new FormData();
      // Append all form values to FormData
      Object.entries(values).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value) {
          formData.append(key, String(value));
        }
      });
      formData.append('ownerId', user.id);

      const response = await fetch('/api/pets', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create listing.');
      }
      
      toast({
        title: "Listing Created!",
        description: `${values.name} is now up for adoption.`,
      });
      router.push('/?listing_success=true');

    } catch (e: any) {
      console.error("Error adding document: ", e);
      toast({
        title: "Submission Failed",
        description: e.message || "There was an error submitting your listing.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthRequired>
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-2">
              <PlusCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl text-primary">Create a New Listing</CardTitle>
            <CardDescription>Fill out the details below to find a new home for your pet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pet Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Buddy" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pet Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Dog">Dog</SelectItem>
                          <SelectItem value="Cat">Cat</SelectItem>
                          <SelectItem value="Bird">Bird</SelectItem>
                          <SelectItem value="Rabbit">Rabbit</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="breed" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breed</FormLabel>
                      <FormControl><Input placeholder="e.g., Golden Retriever" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl><Input placeholder="e.g., 2 years" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a gender" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl><Input placeholder="e.g., Sunnyvale, CA" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="listingType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a listing type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Adoption">Adoption</SelectItem>
                          <SelectItem value="Sale">For Sale</SelectItem>
                          <SelectItem value="Foster">Foster</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  {listingType === 'Sale' && (
                    <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₹)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g., 500" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                  )}
                  <div className="md:col-span-2">
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl><Textarea placeholder="Tell us more about your pet..." className="min-h-[120px]" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                  </div>
                  <div className="md:col-span-2">
                     <FormField
                        control={form.control}
                        name="petImage"
                        render={({ field: { onChange, value, ...rest }}) => (
                        <FormItem>
                            <FormLabel>Pet Image</FormLabel>
                            <FormControl>
                                <Input 
                                    type="file" 
                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                    ref={fileInputRef}
                                    onChange={(e) => handleFileChange(e, onChange)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     {imagePreview && (
                        <div className="relative mt-4 w-48 h-48 border rounded-lg overflow-hidden">
                            <Image src={imagePreview} alt="Pet preview" fill className="object-cover" />
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
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Listing
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AuthRequired>
  );
}
