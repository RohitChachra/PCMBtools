import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"


const geistSans = GeistSans({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = GeistMono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
          geistSans.variable,
          geistMono.variable
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
