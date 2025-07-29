import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Pet } from '@/lib/placeholder-data';
import { Badge } from './ui/badge';
import { MapPin } from 'lucide-react';
import { PawIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

interface PetCardProps {
  pet: Pet;
}

const listingTypeClasses: Record<Pet['listingType'], string> = {
  Adoption: 'border-transparent bg-primary/10 text-primary',
  Sale: 'border-transparent bg-accent/20 text-accent-foreground dark:text-amber-300',
  Foster: 'border-transparent bg-secondary text-secondary-foreground',
  Stray: 'border-transparent bg-destructive/10 text-destructive',
};


const getPetImageHint = (type: Pet['type']) => {
    switch (type) {
        case 'Dog': return 'dog puppy';
        case 'Cat': return 'cat kitten';
        case 'Bird': return 'bird pet';
        case 'Rabbit': return 'rabbit pet';
        default: return 'pet animal';
    }
}

export function PetCard({ pet }: PetCardProps) {
  return (
    <Link href={`/pets/${pet._id}`} className="block group">
      <Card className="w-full overflow-hidden transition-all duration-300 ease-in-out border group-hover:shadow-lg group-hover:border-primary group-hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative h-56 w-full">
            <Image
              src={pet.imageUrl}
              alt={`Photo of ${pet.name}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={getPetImageHint(pet.type)}
            />
            <Badge className={cn("absolute top-3 right-3 font-semibold", listingTypeClasses[pet.listingType])}>
              {pet.listingType}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-xl font-bold font-headline mb-2 text-primary group-hover:text-accent transition-colors">{pet.name}</CardTitle>
          <div className="text-sm text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-2">
              <PawIcon className="w-4 h-4 text-primary/70" />
              <span>{pet.breed}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary/70" />
              <span>{pet.location}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <div className="flex justify-between items-center w-full text-sm text-muted-foreground font-medium">
                <span>{pet.age}</span>
                <span>{pet.gender}</span>
            </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
