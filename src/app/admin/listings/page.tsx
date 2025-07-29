'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Trash2, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PetLoader } from '@/components/pet-loader';
import type { Pet } from '@/lib/placeholder-data';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminListingsPage() {
    const [listings, setListings] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchListings = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch all pets from the general pets API endpoint
            const response = await fetch('/api/pets');
            if (!response.ok) {
                throw new Error('Failed to fetch listings');
            }
            const data = await response.json();
            // Map MongoDB's _id to id for consistency in the frontend
            const formattedListings = data.pets.map((pet: any) => ({ ...pet, id: pet._id }));
            setListings(formattedListings);
        } catch (error) {
            console.error("Error fetching listings:", error);
            toast({ title: "Error", description: "Could not fetch listings.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    const handleDelete = async (petId: string, petName: string) => {
        setIsDeleting(petId);
        try {
            // Send a DELETE request to the new dynamic API route
            const response = await fetch(`/api/pets/${petId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Server responded with an error during deletion');
            }
            
            toast({
                title: "Listing Deleted",
                description: `The listing for ${petName} has been removed.`,
            });
            // Refresh the list of pets to reflect the change
            await fetchListings();
        } catch (error) {
            console.error("Error deleting document: ", error);
            toast({
                title: "Deletion Failed",
                description: "Could not remove the listing. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Listings</CardTitle>
                <CardDescription>Review and manage all pet listings on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-64 gap-4">
                        <PetLoader />
                        <p className="text-muted-foreground">Loading Listings...</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pet</TableHead>
                                <TableHead>Breed</TableHead>
                                <TableHead>Listing Type</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {listings.map((pet) => (
                                <TableRow key={pet.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Image src={pet.imageUrl} alt={pet.name} width={40} height={40} className="rounded-md object-cover" />
                                            <span className="font-medium">{pet.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{pet.breed}</TableCell>
                                    <TableCell><Badge variant={pet.listingType === 'Stray' ? 'destructive' : 'secondary'}>{pet.listingType}</Badge></TableCell>
                                    <TableCell>
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/pets/${pet.id}`}><Eye className="mr-2 h-4 w-4" />View</Link>
                                                    </DropdownMenuItem>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            onSelect={(e) => e.preventDefault()}
                                                        >
                                                            {isDeleting === pet.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the listing for {pet.name}.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(pet.id, pet.name)}>Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
