'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2, LogIn } from "lucide-react"

// Zod schema for form validation
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(7, { message: "Password must be at least 7 characters." }),
})

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  // Use the custom auth hook
  const { login, user, isLoading, error } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Call the login function from our AuthContext
    const loggedInUser = await login(values.email, values.password);

    if (loggedInUser) {
        toast({
            title: "Login Successful",
            description: "Welcome back!",
        })
        // Redirect on successful login
        router.push('/')
    }
    // Error handling is managed by the useEffect below
  }

  // Show a toast notification when an error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: "Login Failed",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast]);

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);


  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-2">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl text-primary">Welcome Back</CardTitle>
          <CardDescription>Log in to your account to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log In
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
