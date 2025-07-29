
'use client'

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PetLoader } from "./pet-loader";

interface AuthRequiredProps {
    children: React.ReactNode;
}

export function AuthRequired({ children }: AuthRequiredProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className="container mx-auto flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4">
                <PetLoader />
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }
    
    return <>{children}</>;
}
