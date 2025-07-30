
'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Pet } from '@/lib/placeholder-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Dog, Mail, LogOut } from 'lucide-react';
import { PetCard } from '@/components/pet-card';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { AuthRequired } from '@/components/auth-required';
import { PetLoader } from '@/components/pet-loader';

export default function ProfilePage() {
    const { user, profile, isLoading: isAuthLoading } = useAuth();
    const [userPets, setUserPets] = useState<Pet[]>([]);
    const [isPetsLoading, setIsPetsLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        // Exit if there is no user ID
        if (!user?.id) {
            setIsPetsLoading(false);
            return;
        }

        // Define an async function to fetch pets from the API
        const fetchUserPets = async () => {
            setIsPetsLoading(true);
            try {
                // Fetch pets specifically for the logged-in user via a query parameter
                const response = await fetch(`/api/pets?ownerId=${user.id}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch user listings');
                }

                const data = await response.json();
                // Assuming the API returns an object like { pets: [...] }
                setUserPets(data.pets || []);

            } catch (error) {
                console.error("Error fetching user pets from API:", error);
                setUserPets([]); // Clear pets on error to avoid showing stale data
            } finally {
                setIsPetsLoading(false);
            }
        };

        fetchUserPets();

    }, [user?.id]); // This effect re-runs when the user ID changes

    const handleLogout = async () => {
        await signOut(auth);
        toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
        });
        router.push('/');
    };

    if (isAuthLoading) {
        return (
          <div className="container mx-auto flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4">
            <PetLoader />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        );
    }

    return (
        <AuthRequired>
             <div className="container mx-auto px-4 py-12">
                <Card className="max-w-4xl mx-auto mb-8 shadow-lg">
                    <CardHeader className="flex flex-col sm:flex-row items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-primary">
                            <AvatarImage src={user?.photoURL ?? ''} alt={profile?.displayName} />
                            <AvatarFallback className="text-3xl bg-muted">
                                {profile?.displayName?.charAt(0) || <User />}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center sm:text-left">
                            <CardTitle className="text-3xl font-headline text-primary">{profile?.displayName}</CardTitle>
                            <CardDescription className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                                <Mail className="h-4 w-4" />{user?.email}
                            </CardDescription>
                        </div>
                        <div className="sm:ml-auto">
                            <Button onClick={handleLogout} variant="outline">
                                <LogOut className="mr-2 h-4 w-4"/>
                                Logout
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                <div>
                    <h2 className="text-3xl font-bold font-headline text-primary mb-6 flex items-center gap-3">
                        <Dog className="h-8 w-8"/>
                        Your Listings
                    </h2>
                    {isPetsLoading ? (
                        <div className="flex flex-col justify-center items-center py-20 gap-4">
                            <PetLoader />
                            <p className="text-muted-foreground">Loading your listings...</p>
                        </div>
                    ) : userPets.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userPets.map(pet => (
                                <PetCard key={pet.id || pet._id?.toString()} pet={pet} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-muted-foreground bg-card border rounded-lg">
                            <p className="text-lg">You haven't listed any pets yet.</p>
                            <Button asChild className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                                <a href="/add-listing">Add a Listing</a>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AuthRequired>
    );
}

