
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
  title: 'PCMBtools - Explore Math, Chemistry & Physics',
  description: 'Interactive educational platform for Math, Chemistry, and Physics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Ensure html and body take full height
    <html lang="en" suppressHydrationWarning> {/* Removed h-full, added suppressHydrationWarning */}
      <body
        className={cn(
          "min-h-screen flex flex-col font-sans antialiased", // Use min-h-screen on body, removed h-full
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
          {/* Adjusted horizontal padding to increase margins: px-6 sm:px-10 lg:px-16 */}
          <main className="flex-grow container py-8 px-6 sm:px-10 lg:px-16">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

