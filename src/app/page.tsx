
import { Suspense } from 'react';
import { HomePageClient } from './home-page-client';
import { PetLoader } from '@/components/pet-loader';

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center py-20 gap-4">
        <PetLoader />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <HomePageClient />
    </Suspense>
  );
}
