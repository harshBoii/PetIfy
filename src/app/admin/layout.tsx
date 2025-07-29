
'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, LayoutList, Shield, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/listings', label: 'Listings', icon: LayoutList },
    { href: '/admin/groups', label: 'Groups', icon: Users },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-[calc(100vh-5rem)]">
            <aside className="w-64 flex-shrink-0 border-r bg-muted/40 p-4">
                <div className="flex h-full flex-col">
                    <div className="mb-6 flex items-center gap-3 pl-2">
                        <Shield className="h-7 w-7 text-primary" />
                        <h2 className="text-xl font-bold font-headline">Admin Panel</h2>
                    </div>
                    <nav className="flex flex-col gap-2">
                        {adminNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    pathname === item.href && "bg-primary/10 text-primary font-semibold"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="mt-auto">
                         <Link href="/" className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary")}>
                            <Settings className="h-5 w-5" />
                            Return to App
                        </Link>
                    </div>
                </div>
            </aside>
            <main className="flex-1 p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
