'use client';

import { useState, useEffect, useRef, FormEvent } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PetCard } from "@/components/pet-card";
import type { Pet } from "@/lib/placeholder-data"; // Assuming Pet type is defined here
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dog, ShieldAlert, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PetLoader } from "@/components/pet-loader";
import Image from 'next/image';

// Validation constants for file upload
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function StraysPage() {
    const [strayPets, setStrayPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [contact, setContact] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Fetch stray pets from the MongoDB API endpoint
    useEffect(() => {
        const fetchStrays = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/strays'); // API route to fetch strays
                if (!response.ok) {
                    throw new Error('Failed to fetch stray pets data.');
                }
                const data = await response.json();
                setStrayPets(data.pets);
            } catch (error) {
                console.error("Error fetching stray pets:", error);
                toast({
                    title: 'Error',
                    description: 'Could not fetch list of stray pets. Please try again later.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchStrays();
    }, [toast]);

    /**
     * Handles file selection, validation, and preview generation.
     */
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                toast({ title: 'Image is too large (max 5MB).', variant: 'destructive' });
                return;
            }
            if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                toast({ title: 'Invalid image format (JPEG, PNG, WEBP accepted).', variant: 'destructive' });
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    /**
     * Clears the selected image and its preview.
     */
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    /**
     * Handles the submission of the stray report form.
     */
    const handleReportSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!location || !description) {
            toast({
                title: "Missing Information",
                description: "Please provide the location and a description of the animal.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        toast({ title: 'Submitting your report...' });

        try {
            const formData = new FormData();
            formData.append('location', location);
            formData.append('description', description);
            formData.append('reporterContact', contact);
            if (imageFile) {
                formData.append('file', imageFile);
            }

            const response = await fetch('/api/upload', { // Use the existing upload route
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "An unknown error occurred during submission.");
            }

            toast({
                title: "Report Submitted!",
                description: "Thank you for helping. Our rescue team has been alerted.",
            });

            // Reset form fields
            setLocation('');
            setDescription('');
            setContact('');
            handleRemoveImage();

        } catch (error: any) {
            console.error("Error reporting stray:", error);
            toast({
                title: "Submission Failed",
                description: error.message || "There was an error submitting your report. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <section className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">Help a Stray Find a Home</h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Every stray deserves a second chance. Browse pets in need of a loving home or report a stray you've found to our rescue team.
                </p>
            </section>

            <Tabs defaultValue="adopt" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto h-12 text-base">
                    <TabsTrigger value="adopt"><Dog className="mr-2 h-5 w-5" />Adopt a Stray</TabsTrigger>
                    <TabsTrigger value="report"><ShieldAlert className="mr-2 h-5 w-5" />Report a Stray</TabsTrigger>
                </TabsList>
                <TabsContent value="adopt" className="mt-8">
                    {isLoading ? (
                        <div className="flex flex-col justify-center items-center py-20 gap-4">
                            <PetLoader />
                            <p className="text-muted-foreground">Looking for strays...</p>
                        </div>
                    ) : strayPets.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {strayPets.map((pet) => (
                                <PetCard key={pet.id} pet={pet} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-muted-foreground bg-card border rounded-lg">
                            <p className="text-lg">No strays currently listed for adoption.</p>
                            <p>Check back soon, or consider reporting a stray you've found.</p>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="report" className="mt-8">
                    <Card className="max-w-2xl mx-auto shadow-lg">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Report a Found Stray</CardTitle>
                            <CardDescription>Thank you for helping. Please provide as much detail as possible. Our rescue team will be alerted.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-6" onSubmit={handleReportSubmit}>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location Found</Label>
                                    <Input id="location" placeholder="e.g., Corner of Main St & Park Ave" value={location} onChange={e => setLocation(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description of Animal & Condition</Label>
                                    <Textarea id="description" placeholder="e.g., Medium-sized brown dog, looks friendly but scared." value={description} onChange={e => setDescription(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="photo">Upload Photo</Label>
                                    <Input id="photo" type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg, image/webp" />
                                    <p className="text-xs text-muted-foreground">A photo can greatly help in identifying the pet. (Max 5MB)</p>
                                </div>
                                {imagePreview && (
                                    <div className="relative mt-4 w-full h-48 border rounded-lg overflow-hidden">
                                        <Image src={imagePreview} alt="Stray preview" fill className="object-cover" />
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
                                <div className="space-y-2">
                                    <Label htmlFor="contact">Your Contact Info (optional)</Label>
                                    <Input id="contact" placeholder="Your name and phone number/email" value={contact} onChange={e => setContact(e.target.value)} />
                                    <p className="text-xs text-muted-foreground">We will only contact you if we need more information.</p>
                                </div>
                                <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-5 w-5" />}
                                    {isSubmitting ? 'Submitting...' : 'Alert Rescue Team'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
