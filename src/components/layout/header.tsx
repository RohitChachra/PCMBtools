
'use client';

import Link from 'next/link';
import { BookOpenText, FlaskConical, Atom, Sigma, Shapes, Calculator } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"; // Added SheetTitle, SheetDescription
import { Menu } from 'lucide-react';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle, // Keep the import
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import * as React from 'react'; // Import React

const navItems = [
  {
    trigger: { label: 'Mathematics', icon: Sigma },
    href: '/math',
    subItems: [

      { href: '/math/geometry', title: 'Geometry Calculator', description: 'Calculate properties of 2D/3D shapes.', icon: Shapes },
      { href: '/math/graphing', title: 'Graphing Calculator', description: 'Visualize functions interactively.', icon: Calculator },
    ],
  },
  {
    trigger: { label: 'Chemistry', icon: FlaskConical },
    href: '/chemistry',
  },
  {
    trigger: { label: 'Physics', icon: Atom },
    href: '/physics',
  },
];

// Custom ListItem component for dropdowns
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string, icon?: React.ElementType }
>(({ className, title, children, icon: Icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2 text-sm font-medium leading-none">
             {Icon && <Icon className="h-4 w-4" />}
             {title}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6 sm:px-10 lg:px-16"> {/* Maintain padding */}
        <Link href="/" className="flex items-center gap-2 mr-6"> {/* Added margin-right */}
          <BookOpenText className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">PCMBtools</span>
        </Link>

        {/* Desktop Navigation with Dropdowns */}
        <NavigationMenu className="hidden md:flex flex-grow justify-start"> {/* Use NavigationMenu */}
          <NavigationMenuList>
            {navItems.map((item) => (
              <NavigationMenuItem key={item.trigger.label}>
                {item.subItems ? (
                  <>
                    {/* Link wraps the trigger for click navigation */}
                    <Link href={item.href} legacyBehavior passHref>
                     <NavigationMenuTrigger>
                        <item.trigger.icon className="h-4 w-4 mr-1" />
                        {item.trigger.label}
                      </NavigationMenuTrigger>
                    </Link>
                    {/* Dropdown content appears on hover */}
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {item.subItems.map((subItem) => (
                          <ListItem
                            key={subItem.title}
                            title={subItem.title}
                            href={subItem.href}
                            icon={subItem.icon}
                          >
                            {subItem.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  // Non-dropdown items
                  <Link href={item.href} legacyBehavior passHref>
                    {/* Apply static classes matching navigationMenuTriggerStyle's default */}
                    <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                       <item.trigger.icon className="h-4 w-4 mr-1" />
                       {item.trigger.label}
                    </NavigationMenuLink>
                  </Link>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

         {/* Theme Toggle Button - Moved to the right */}
         <div className="hidden md:flex items-center ml-auto"> {/* Use ml-auto to push to the right */}
            <ThemeToggleButton />
         </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2 ml-auto"> {/* Use ml-auto */}
           <ThemeToggleButton />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              {/* Add accessible title and description */}
               <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
               <SheetDescription className="sr-only">Main navigation links for PCMBtools</SheetDescription>
              <div className="grid gap-4 py-6">
                <Link href="/" className="flex items-center gap-2 mb-4 px-2"> {/* Added padding */}
                  <BookOpenText className="h-6 w-6 text-primary" />
                  <span className="text-lg font-bold">PCMBtools</span>
                </Link>
                {navItems.map((item) => (
                    <div key={item.trigger.label}>
                    <Link
                        href={item.href} // Main link for the section header
                        className="flex items-center gap-2 rounded-md p-2 text-lg font-medium hover:bg-accent"

                      >
                        <item.trigger.icon className="h-5 w-5" />
                        {item.trigger.label}
                      </Link>


                       {item.subItems && (
                         <div className="pl-8 pt-2 grid gap-2">
                           {item.subItems.map((subItem) => (
                           <Link
                           key={subItem.href}
                           href={subItem.href}
                           className="flex items-center gap-2 rounded-md p-2 text-base font-medium text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground"

                          >

                            {subItem.icon && <subItem.icon className="h-4 w-4" />}

                            {subItem.title}

                              </Link>
                           ))}
                         </div>
                       )}
                     </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
