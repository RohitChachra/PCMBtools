import Link from 'next/link';
import { BookOpenText, FlaskConical, Atom, Sigma } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from 'lucide-react';
import { ThemeToggleButton } from '@/components/theme-toggle-button'; // Import the toggle button

export function Header() {
  const navItems = [
    { href: '/math', label: 'Mathematics', icon: Sigma },
    { href: '/chemistry', label: 'Chemistry', icon: FlaskConical },
    { href: '/physics', label: 'Physics', icon: Atom },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BookOpenText className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">SciVerse</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
           <ThemeToggleButton /> {/* Add theme toggle button */}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
           <ThemeToggleButton /> {/* Add theme toggle button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="grid gap-4 py-6">
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <BookOpenText className="h-6 w-6 text-primary" />
                  <span className="text-lg font-bold">SciVerse</span>
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 rounded-md p-2 text-lg font-medium hover:bg-accent"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
