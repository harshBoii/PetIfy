
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PawIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Menu, PlusCircle, User, LogOut, LayoutDashboard, Loader2, Database } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


const navItems = [
  { href: '/', label: 'Browse Pets' },
  { href: '/strays', label: 'Stray Adoption' },
  { href: '/community', label: 'Community' },
  { href: '/chatbot', label: 'AI Pet Assistant' },
];


export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile, isAdmin, isLoading } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const closeSheet = () => setIsSheetOpen(false);

  const handleLogout = async () => {
    await signOut(auth);
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
    });
    router.push('/');
  }

  const AuthNav = () => {
    if (isLoading) {
      return <Loader2 className="h-6 w-6 animate-spin" />;
    }

    if (user && profile) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-primary/50">
                    <AvatarImage src={user.photoURL ?? ''} alt={profile.displayName} />
                    <AvatarFallback>{profile.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/add-listing')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Add Listing</span>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={() => router.push('/admin')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return (
        <div className="hidden md:flex items-center space-x-2">
            <Button asChild variant="ghost">
                <Link href="/login">Log In</Link>
            </Button>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/signup">Sign Up</Link>
            </Button>
      </div>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center">
        <Link href="/" className="mr-8 flex items-center space-x-2">
          <PawIcon className="h-8 w-8 text-primary" />
          <span className="font-bold font-headline text-2xl hidden sm:inline-block">Petora Connect</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-base font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors hover:text-primary',
                pathname === item.href ? 'text-primary font-semibold' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-3">
            <AuthNav />
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                <Button variant="ghost" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left">
                <Link href="/" className="mr-6 flex items-center space-x-2 mb-8" onClick={closeSheet}>
                    <PawIcon className="h-8 w-8 text-primary" />
                    <span className="font-bold font-headline text-xl">Petora Connect</span>
                </Link>
                <nav className="flex flex-col space-y-4">
                    {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeSheet}
                        className={cn(
                        'text-lg transition-colors hover:text-primary',
                        pathname === item.href ? 'text-primary font-semibold' : 'text-muted-foreground'
                        )}
                    >
                        {item.label}
                    </Link>
                    ))}
                    <div className="border-t pt-4 mt-2 space-y-2">
                        {user ? (
                            <>
                               <Button asChild variant="ghost" className="w-full justify-start text-lg h-auto py-3" onClick={closeSheet}>
                                    <Link href="/profile"><User className="mr-2 h-5 w-5"/>Profile</Link>
                               </Button>
                               <Button asChild variant="ghost" className="w-full justify-start text-lg h-auto py-3" onClick={closeSheet}>
                                    <Link href="/add-listing"><PlusCircle className="mr-2 h-5 w-5"/>Add Listing</Link>
                               </Button>
                               {isAdmin && (
                                  <Button asChild variant="ghost" className="w-full justify-start text-lg h-auto py-3" onClick={closeSheet}>
                                      <Link href="/admin"><LayoutDashboard className="mr-2 h-5 w-5"/>Admin Panel</Link>
                                  </Button>
                               )}
                               <Button variant="ghost" className="w-full justify-start text-lg h-auto py-3" onClick={() => { closeSheet(); handleLogout(); }}>
                                    <LogOut className="mr-2 h-5 w-5"/>Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button asChild size="lg" className="w-full" onClick={closeSheet}>
                                    <Link href="/login">Log In</Link>
                                </Button>
                                <Button asChild size="lg" variant="outline" className="w-full" onClick={closeSheet}>
                                    <Link href="/signup">Sign Up</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </nav>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
