import type {Metadata} from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import { ConditionalHeader } from '@/components/conditional-header';
import { Inter, PT_Sans } from 'next/font/google'

const pt_sans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Petora Connect - Find Your Perfect Pet',
  description: 'A platform to connect pets with loving homes through adoption, fostering, and community.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pt_sans.variable} ${inter.variable} h-full scroll-smooth`}>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <ConditionalHeader />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
