// app/pet/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { notFound, useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
} from "@/components/ui/alert-dialog"
import {
  Heart,
  MessageSquare,
  Bone,
  Bird,
  Rabbit,
  Trash2,
  Edit,
  Mail,
} from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { Pet } from '@/lib/placeholder-data' // Ensure this type is correct
import { PetLoader } from '@/components/pet-loader'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function PetDetailPage() {
  const params = useParams()
  const petId = typeof params.id === 'string' ? params.id : ''
  const [pet, setPet] = useState<Pet | null>(null)
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<Pet>>({});

  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Function to fetch pet details
  const fetchPetDetails = () => {
    if (!petId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetch(`/api/pets/${petId}`)
      .then(res => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('Failed to fetch pet');
        return res.json();
      })
      .then((data: Pet & { ownerEmail?: string } | null) => {
        if (!data) {
          setPet(null);
          return;
        }
        // Ensure imageUrl is never an empty string, convert to null if it is
        const processedData = {
          ...data,
          imageUrl: data.imageUrl === '' ? null : data.imageUrl,
        };
        setPet(processedData);
        setOwnerEmail(processedData.ownerEmail ?? null);
        setEditFormData(processedData); // Initialize form data with current pet data
      })
      .catch(err => {
        console.error(err);
        toast({
          title: 'Error',
          description: 'Could not load pet details.',
          variant: 'destructive',
        });
      })
      .finally(() => setIsLoading(false));
  };

  // Fetch pet and owner from Mongo API on component mount and petId change
  useEffect(() => {
    fetchPetDetails();
  }, [petId, toast]);

  const handleMessageOwner = () => {
    if (!ownerEmail) {
      toast({ title: 'Owner contact not available.', variant: 'destructive' })
      return
    }
    window.location.href = `mailto:${ownerEmail}?subject=Inquiry about ${pet?.name}`
  }

  const handlePurchaseOrAdoption = () => {
    if (!pet) return
    if (!user) {
      toast({ title: 'Login Required', description: 'You must be logged in to continue.', variant: 'destructive' })
      router.push('/login')
      return
    }
    router.push(`/checkout/${petId}`)
  }

  const handleDeleteListing = async () => {
    if (!pet) return
    try {
      const res = await fetch(`/api/pets/${petId}`, {
        method: 'DELETE',
        headers: {
          // You might need an Authorization header here for your actual API
          // 'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete listing');
      }

      toast({ title: 'Listing Deleted', description: `${pet.name}'s listing removed.` });
      router.push('/');
    } catch (error: any) {
      console.error('Deletion error:', error);
      toast({ title: 'Deletion Failed', description: error.message || 'Could not remove listing.', variant: 'destructive' });
    }
  };

  // Handlers for edit modal
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof Pet, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!pet || !user) return; // Ensure pet and user are available

    try {
      // Basic validation (add more as needed)
      if (!editFormData.name || !editFormData.breed || !editFormData.age || !editFormData.gender || !editFormData.location || !editFormData.description) {
        toast({ title: 'Validation Error', description: 'Please fill in all required fields.', variant: 'destructive' });
        return;
      }

      const res = await fetch(`/api/pets/${petId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(editFormData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update pet listing');
      }

      // Re-fetch pet details to get the most up-to-date data, including any server-side processing
      // This is generally safer than relying on the PUT response data unless your PUT returns the full updated object
      fetchPetDetails();
      setIsEditing(false); // Close the modal
      toast({ title: 'Listing Updated', description: `${editFormData.name || pet.name}'s listing updated successfully.` });
    } catch (error: any) {
      console.error('Update error:', error);
      toast({ title: 'Update Failed', description: error.message || 'Could not update listing.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center">
        <PetLoader />
        <p className="text-muted-foreground">Loading pet details...</p>
      </div>
    )
  }

  if (!pet) {
    notFound()
  }

  const getPetImageHint = (type: Pet['type']) => {
    switch (type) {
      case 'Dog': return 'dog puppy'
      case 'Cat': return 'cat kitten'
      case 'Bird': return 'bird pet'
      case 'Rabbit': return 'rabbit pet'
      default: return 'pet animal'
    }
  }

  // Define a placeholder image path
  const PLACEHOLDER_IMAGE_URL = '/images/placeholder-pet.png'; // Make sure you have this image in your public folder

  const isOwner = user?.uid === pet.ownerId
  const actionText = pet.listingType === 'Sale'
    ? 'Buy Now'
    : pet.listingType === 'Foster'
    ? 'Foster Me'
    : 'Adopt Me'

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Carousel */}
        <div>
          <Carousel className="w-full">
            <CarouselContent>
              {/*
                Removed the fixed [0,1,2].map and only show one item for pet.imageUrl.
                If you truly have multiple images, pet.imageUrl should be pet.images: string[]
                and you'd map over pet.images. For now, showing the primary image only.
              */}
              <CarouselItem>
                <div className="aspect-square relative overflow-hidden rounded-lg border">
                  <Image
                    // Use a fallback to the placeholder if pet.imageUrl is null or an empty string
                    src={pet.imageUrl && pet.imageUrl !== "" ? pet.imageUrl : PLACEHOLDER_IMAGE_URL}
                    alt={`Photo of ${pet.name}`}
                    fill
                    className="object-cover"
                    data-ai-hint={getPetImageHint(pet.type)}
                  />
                </div>
              </CarouselItem>
            </CarouselContent>
            {/* Remove CarouselPrevious/Next if only showing one image, or if Carousel component handles it based on content */}
            {/* <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" /> */}
          </Carousel>
        </div>

        {/* Details Card */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-primary">{pet.name}</h1>
          <p className="text-lg text-muted-foreground">{pet.location}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="py-1 px-3">
              <Bone className="inline-block w-4 h-4 mr-1" />
              {pet.breed}
            </Badge>
            <Badge variant="secondary" className="py-1 px-3">{pet.age}</Badge>
            <Badge variant="secondary" className="py-1 px-3">{pet.gender}</Badge>
          </div>

          <p className="leading-relaxed">{pet.description}</p>

          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {pet.listingType === 'Sale' && pet.price !== undefined && pet.price !== null && ( // Check for undefined and null
                <div className="flex justify-between items-center">
                  <span>Price</span>
                  <span className="text-2xl font-bold">₹{pet.price}</span>
                </div>
              )}

              {isOwner ? (
                <div className="flex gap-3">
                  <Button variant="outline" size="lg" onClick={handleEditClick}>
                    <Edit className="mr-2" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="lg">
                        <Trash2 className="mr-2" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete {pet.name}&apos;s listing.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteListing}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button size="lg" onClick={handlePurchaseOrAdoption}>
                    <Heart className="mr-2" /> {actionText}
                  </Button>
                  <Button size="lg" variant="outline" onClick={handleMessageOwner}>
                    {ownerEmail ? <MessageSquare className="mr-2" /> : <Mail className="mr-2" />}
                    {ownerEmail ? 'Message Owner' : 'Contact Unavailable'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Listing Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit {pet.name}&apos;s Listing</DialogTitle>
            <DialogDescription>
              Make changes to the pet&apos;s details here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editFormData.name || ''}
                onChange={handleEditFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select onValueChange={(value) => handleSelectChange('type', value as Pet['type'])} value={editFormData.type}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select pet type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dog">Dog</SelectItem>
                  <SelectItem value="Cat">Cat</SelectItem>
                  <SelectItem value="Bird">Bird</SelectItem>
                  <SelectItem value="Rabbit">Rabbit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="breed" className="text-right">
                Breed
              </Label>
              <Input
                id="breed"
                value={editFormData.breed || ''}
                onChange={handleEditFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">
                Age
              </Label>
              <Input
                id="age"
                value={editFormData.age || ''}
                onChange={handleEditFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">
                Gender
              </Label>
              <Select onValueChange={(value) => handleSelectChange('gender', value as Pet['gender'])} value={editFormData.gender}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={editFormData.location || ''}
                onChange={handleEditFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={editFormData.description || ''}
                onChange={handleEditFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="listingType" className="text-right">
                Listing Type
              </Label>
              <Select onValueChange={(value) => handleSelectChange('listingType', value as Pet['listingType'])} value={editFormData.listingType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select listing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adoption">Adoption</SelectItem>
                  <SelectItem value="Foster">Foster</SelectItem>
                  <SelectItem value="Sale">Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editFormData.listingType === 'Sale' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price (₹)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={editFormData.price || ''}
                  onChange={handleEditFormChange}
                  className="col-span-3"
                  min="0"
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">
                Image URL
              </Label>
              <Input
                id="imageUrl"
                value={editFormData.imageUrl || ''}
                onChange={handleEditFormChange}
                className="col-span-3"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              {/* Removed <a> tag around the Save Changes button as it's a form submission */}
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}