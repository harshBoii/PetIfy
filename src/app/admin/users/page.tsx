'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PetLoader } from '@/components/pet-loader';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Interface for a single pet listing from the API
interface Pet {
    _id: string;
    name: string;
    breed: string;
}

// Interface for the user list
interface UserProfile {
    id: string;
    name: string;
    email: string;
}

// Interface for the detailed user view in the modal
interface DetailedUser extends UserProfile {
    pets: Pet[];
}

export default function ManageUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<DetailedUser | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Fetch all users on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/users');
                if (!response.ok) throw new Error('Failed to fetch users.');
                const usersData = await response.json();
                setUsers(usersData);
            } catch (error: any) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, [toast]);

    // Handle opening the view/edit modal
    const handleViewClick = async (userId: string) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/users/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch user details.');
            const userData = await response.json();
            setSelectedUser({ id: userId, ...userData });
            setIsModalOpen(true);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle deleting a user
    const handleDeleteClick = async (userId: string) => {
        // In a real application, you would use a custom confirmation modal here
        // instead of window.confirm or no confirmation at all.
        try {
            const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user.');
            }
            // Remove user from the list in the UI
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            toast({ title: "Success", description: "User has been deleted." });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };
    
    // Handle form submission from the modal
    const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedUser) return;
        
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: selectedUser.name, email: selectedUser.email }),
            });

            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user.');
            }

            const updatedUserResponse = await response.json();
            // Update the user list with the new data
            setUsers(prevUsers => prevUsers.map(user => 
                user.id === updatedUserResponse.id 
                ? { ...user, name: updatedUserResponse.name, email: updatedUserResponse.email } 
                : user
            ));
            toast({ title: "Success", description: "User profile has been updated." });
            setIsModalOpen(false);
            setSelectedUser(null);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Users</CardTitle>
                    <CardDescription>A list of all the users in your application.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex flex-col justify-center items-center h-64 gap-4">
                            <PetLoader />
                            <p className="text-muted-foreground">Loading Users...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>{user.name?.charAt(0) || <User />}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleViewClick(user.id)} disabled={isSubmitting}>View</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(user.id)}>Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit User Modal */}
            {isModalOpen && selectedUser && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto p-4">
                    <Card className="w-full max-w-2xl relative my-auto">
                        <Button variant="ghost" size="icon" className="absolute top-3 right-3" onClick={() => setIsModalOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                        <CardHeader>
                            <CardTitle>Edit User Profile</CardTitle>
                            <CardDescription>Make changes to the user's profile below.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateUser} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={selectedUser.name}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={selectedUser.email}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                                
                                <div className="pt-4">
                                    <h3 className="font-semibold mb-2 text-sm text-muted-foreground">User's Listings</h3>
                                    <div className="border rounded-lg max-h-60 overflow-y-auto">
                                        {selectedUser.pets && selectedUser.pets.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Pet</TableHead>
                                                        <TableHead>Breed</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedUser.pets.map(pet => (
                                                        <TableRow key={pet._id}>
                                                            <TableCell className="font-medium">{pet.name}</TableCell>
                                                            <TableCell>{pet.breed}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                This user has no active listings.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}
