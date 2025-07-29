
// app/home-page-client.tsx
'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PetCard } from '@/components/pet-card'
import type { Pet } from '@/lib/placeholder-data'
import { Search } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { PetLoader } from '@/components/pet-loader'
import { useSearchParams, useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export function HomePageClient() {
  const [allPets, setAllPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [petType, setPetType] = useState('all')
  const [listingType, setListingType] = useState('all')
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  // Show success toast once, then clean URL
  useEffect(() => {
    if (searchParams.get('listing_success') === 'true') {
      toast({
        title: 'Listing Submitted!',
        description: 'Your pet is now listed for the world to see.',
      })
      const url = new URL(window.location.href)
      url.searchParams.delete('listing_success')
      router.replace(url.toString(), { scroll: false })
    }
  }, [searchParams, router, toast])

  // Fetch from your Mongo-backed API
  useEffect(() => {
    setIsLoading(true)
    fetch('/api/pets')
      .then(res => {
        if (!res.ok) throw new Error(`Fetch error: ${res.status}`)
        return res.json()
      })
      .then((data: Pet[] | { pets: Pet[] }) => {
        // Normalize to array
        const pets: Pet[] = Array.isArray(data)
          ? data
          : Array.isArray((data as any).pets)
          ? (data as any).pets
          : []
        setAllPets(pets)
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        toast({
          title: 'Error fetching pets',
          description: 'Could not retrieve pet data. Please try again later.',
          variant: 'destructive',
        })
        setIsLoading(false)
      })
  }, [toast])

  const filteredPets = useMemo(() => {
    return allPets.filter(pet => {
      const matchesSearch =
        !searchTerm ||
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPetType = petType === 'all' || pet.type === petType
      const matchesListingType =
        listingType === 'all' || pet.listingType === listingType
      return matchesSearch && matchesPetType && matchesListingType
    })
  }, [allPets, searchTerm, petType, listingType])

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold font-headline text-primary mb-4 tracking-tight">
          Find Your New Best Friend
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Browse through hundreds of pets from shelters and owners, ready for a
          new home. Your next companion is just a click away.
        </p>
      </section>

      <div className="mb-10 p-6 bg-card rounded-lg shadow-md border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Pet</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name, breed..."
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Pet Type */}
          <div className="space-y-2">
            <Label htmlFor="pet-type">Pet Type</Label>
            <Select value={petType} onValueChange={setPetType}>
              <SelectTrigger id="pet-type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Dog">Dog</SelectItem>
                <SelectItem value="Cat">Cat</SelectItem>
                <SelectItem value="Bird">Bird</SelectItem>
                <SelectItem value="Rabbit">Rabbit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Listing Type */}
          <div className="space-y-2">
            <Label htmlFor="listing-type">Listing Type</Label>
            <Select value={listingType} onValueChange={setListingType}>
              <SelectTrigger id="listing-type">
                <SelectValue placeholder="Adoption & Sale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  Adoption, Sale & Foster
                </SelectItem>
                <SelectItem value="Adoption">Adoption</SelectItem>
                <SelectItem value="Sale">For Sale</SelectItem>
                <SelectItem value="Foster">Foster</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Find Button */}
          <Button
            size="lg"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
          >
            <Search className="mr-2 h-5 w-5" /> Find Pet
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-20 gap-4">
          <PetLoader />
          <p className="text-muted-foreground">Fetching pets...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
          {filteredPets.length > 0 ? (
            filteredPets.map(pet => (
              <PetCard key={pet.id} pet={pet} />
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-muted-foreground bg-muted/50 rounded-lg">
              <p className="text-lg">No pets found matching your criteria.</p>
              <p>Try adjusting your filters or adding a new listing!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

