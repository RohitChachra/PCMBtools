import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"


// Correctly assign the font objects
const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: 'SciVerse - Explore Math, Chemistry & Physics',
  description: 'Interactive educational platform for Math, Chemistry, and Physics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn(
          "h-full flex flex-col font-sans antialiased",
          geistSans.variable, // Use the variable property from the font object
          geistMono.variable  // Use the variable property from the font object
        )}
      >
        <Header />
        <main className="flex-grow container py-8">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
