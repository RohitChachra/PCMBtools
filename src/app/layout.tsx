
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider"; // Import ThemeProvider


// Correctly assign the font variables
const geistSansVariable = GeistSans.variable;
const geistMonoVariable = GeistMono.variable;


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
    // Ensure html and body take full height
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={cn(
          "min-h-screen flex flex-col font-sans antialiased", // Use min-h-screen on body
          geistSansVariable, // Use the variable assigned above
          geistMonoVariable  // Use the variable assigned above
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange // Add here as well
        >
          <Header />
          {/* Added explicit horizontal padding px-4 sm:px-6 lg:px-8 */}
          <main className="flex-grow container py-8 px-4 sm:px-6 lg:px-8">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

