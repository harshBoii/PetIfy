'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Trash2, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PetLoader } from '@/components/pet-loader';
import type { CommunityGroup } from '@/lib/placeholder-data';
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
  AlertDialogTrigger, // Added missing import
} from "@/components/ui/alert-dialog";

export default function AdminGroupsPage() {
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null); // Store ID of group being deleted
    const { toast } = useToast();

    const fetchGroups = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/groups');
            if (!response.ok) {
                throw new Error('Failed to fetch groups');
            }
            const data = await response.json();
            // Ensure MongoDB _id is mapped to id
            const formattedGroups = data.groups.map((group: any) => ({...group, id: group._id}));
            setGroups(formattedGroups);
        } catch (error) {
            console.error("Error fetching groups:", error);
            toast({ title: "Error", description: "Could not fetch groups.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);
    
    const handleDelete = async (groupId: string, groupName: string) => {
        setIsDeleting(groupId);
        try {
            const response = await fetch(`/api/groups/${groupId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Server responded with an error');
            }
            
            toast({
                title: "Group Deleted",
                description: `The group "${groupName}" has been removed.`,
            });
            // Refresh the list of groups after deletion
            await fetchGroups();
        } catch (error) {
            console.error("Error deleting group: ", error);
            toast({
                title: "Deletion Failed",
                description: "Could not remove the group. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Groups</CardTitle>
                <CardDescription>Moderate community groups and content.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-64 gap-4">
                        <PetLoader />
                        <p className="text-muted-foreground">Loading Groups...</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Group</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Members</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groups.map((group) => (
                                <TableRow key={group.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Image src={group.imageUrl} alt={group.name} width={40} height={40} className="rounded-md object-cover" />
                                            <span className="font-medium">{group.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-sm truncate">{group.description}</TableCell>
                                    <TableCell>{group.members}</TableCell>
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
                                                        <Link href={`/community/${group.id}`}><Eye className="mr-2 h-4 w-4" />View</Link>
                                                    </DropdownMenuItem>
                                                     <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            onSelect={(e) => e.preventDefault()} // Prevents dropdown from closing when dialog opens
                                                        >
                                                            {isDeleting === group.id ? (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                            )}
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                             <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the group "{group.name}".
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(group.id, group.name)}>Continue</AlertDialogAction>
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
