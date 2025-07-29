import { PawIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Cat, Dog } from 'lucide-react';

interface PetLoaderProps {
  className?: string;
}

export function PetLoader({ className }: PetLoaderProps) {
  return (
    <div className={cn("flex space-x-3 justify-center items-center", className)}>
      <span className="sr-only">Loading...</span>
      <Dog className="h-10 w-10 text-primary animate-bounce [animation-delay:-0.3s]" />
      <Cat className="h-10 w-10 text-primary animate-bounce [animation-delay:-0.15s]" />
      <PawIcon className="h-9 w-9 text-primary animate-bounce" />
    </div>
  );
}
