
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, LayoutList, ArrowRight, Database, Loader2 } from "lucide-react"
import Link from "next/link"
import { seedDatabase } from "@/lib/seed"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function AdminDashboardPage() {
    const { toast } = useToast();
    const [isSeeding, setIsSeeding] = useState(false);

    const handleSeed = async () => {
        setIsSeeding(true);
        try {
            const message = await seedDatabase();
            toast({
                title: "Database Seeded!",
                description: message,
            })
        } catch (error) {
            console.error("Error seeding database:", error);
            toast({
                title: "Seeding Failed",
                description: "There was an error populating the database. Check the console for details.",
                variant: "destructive"
            })
        } finally {
            setIsSeeding(false);
        }
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline text-primary">Welcome, Admin!</h1>
                <p className="text-muted-foreground">Here's a quick overview of your platform.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-6 w-6"/> Manage Users</CardTitle>
                        <CardDescription>View, edit, or suspend user accounts.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                       <p className="text-muted-foreground">Oversee all registered users on the platform.</p>
                    </CardContent>
                    <CardContent>
                        <Button asChild>
                            <Link href="/admin/users">View Users <ArrowRight className="ml-2 h-4 w-4"/></Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-6 w-6"/> Manage Groups</CardTitle>
                        <CardDescription>Moderate community groups and content.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <p className="text-muted-foreground">Manage community groups and their discussions.</p>
                    </CardContent>
                     <CardContent>
                        <Button asChild>
                            <Link href="/admin/groups">View Groups <ArrowRight className="ml-2 h-4 w-4"/></Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><LayoutList className="h-6 w-6"/> Manage Listings</CardTitle>
                        <CardDescription>Review and approve new pet listings.</CardDescription>
                    </CardHeader>
                     <CardContent className="flex-1">
                        <p className="text-muted-foreground">Approve, edit, or remove pet listings.</p>
                    </CardContent>
                     <CardContent>
                        <Button asChild>
                            <Link href="/admin/listings">View Listings <ArrowRight className="ml-2 h-4 w-4"/></Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
