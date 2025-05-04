
'use client';

import Link from 'next/link';
import { BookOpenText, FlaskConical, Atom, Sigma, Shapes, Calculator, ArrowRightLeft, Microscope, BarChart3 } from 'lucide-react'; // Added Calculator
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu } from 'lucide-react';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import * as React from 'react';

const navItems = [
  {
    trigger: { label: 'Mathematics', icon: Sigma },
    href: '/math',
    subItems: [
      { href: '/math/geometry', title: 'Geometry Calculator', description: 'Calculate properties of 2D/3D shapes.', icon: Shapes },
      { href: '/math/graphing', title: 'Graphing Calculator', description: 'Visualize functions interactively.', icon: Calculator },
      { href: '/math/scientific-calculator', title: 'Scientific Calculator', description: 'Perform complex calculations.', icon: Calculator },
      { href: '/math/statistics', title: 'Statistics Calculator', description: 'Analyze discrete & continuous data.', icon: BarChart3 },
    ],
  },
  {
    trigger: { label: 'Chemistry', icon: FlaskConical },
    href: '/chemistry',
    subItems: [ // Added sub-items for Chemistry
      { href: '/chemistry/compound-explorer', title: 'Compound Explorer', description: 'Search for chemical compounds.', icon: FlaskConical },
      { href: '/chemistry/calculators', title: 'Calculator Hub', description: 'Tools for various chemistry calculations.', icon: Calculator },
    ],
  },
  {
    trigger: { label: 'Physics', icon: Atom },
    href: '/physics',
    subItems: [
        { href: '/physics', title: 'Physics Calculator Hub', description: 'Explore all physics calculators.', icon: Atom },
        { href: '/physics/unit-converter', title: 'Unit Converter', description: 'Convert common physics units.', icon: ArrowRightLeft },
    ],
  },
   {
    trigger: { label: 'Biology', icon: Microscope },
    href: '/biology',
    // No sub-items currently for Biology
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
      <div className="container flex h-16 items-center justify-between px-6 sm:px-10 lg:px-16">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <BookOpenText className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">PCMBtools</span>
        </Link>

        {/* Desktop Navigation with Dropdowns */}
        <NavigationMenu className="hidden md:flex flex-grow justify-start">
          <NavigationMenuList>
            {navItems.map((item) => (
              <NavigationMenuItem key={item.trigger.label}>
                 {item.subItems ? (
                     <>
                         <NavigationMenuTrigger>
                             <Link href={item.href} legacyBehavior passHref>
                                <a className="flex items-center gap-1"> {/* Wrap Link content in an anchor for styling */}
                                    <item.trigger.icon className="h-4 w-4" />
                                    {item.trigger.label}
                                </a>
                             </Link>
                         </NavigationMenuTrigger>
                         <NavigationMenuContent>
                             {/* Dynamically adjust grid columns based on number of items, max 3 */}
                             <ul className={cn("grid gap-3 p-4 md:w-[550px] lg:w-[650px]", `md:grid-cols-${Math.min(item.subItems.length, 3)}`)}>
                              {item.subItems.map((subItem) => (
                                <ListItem
                                  key={subItem.href} // Use href as key if title might repeat
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
                    <Link href={item.href} legacyBehavior passHref>
                        <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "flex items-center gap-1")}>
                             <item.trigger.icon className="h-4 w-4" />
                             {item.trigger.label}
                        </NavigationMenuLink>
                    </Link>
                 )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

         {/* Theme Toggle Button */}
         <div className="hidden md:flex items-center ml-auto">
            <ThemeToggleButton />
         </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2 ml-auto">
           <ThemeToggleButton />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
               <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
               <SheetDescription className="sr-only">Main navigation links for PCMBtools</SheetDescription>
              <div className="grid gap-4 py-6">
                <Link href="/" className="flex items-center gap-2 mb-4 px-2">
                  <BookOpenText className="h-6 w-6 text-primary" />
                  <span className="text-lg font-bold">PCMBtools</span>
                </Link>
                {navItems.map((item) => (
                    <div key={item.trigger.label}>
                      {/* Main section link */}
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 rounded-md p-2 text-lg font-medium hover:bg-accent"
                      >
                        <item.trigger.icon className="h-5 w-5" />
                        {item.trigger.label}
                      </Link>

                      {/* Sub-items if they exist */}
                       {item.subItems && (
                         <div className="pl-8 pt-2 grid gap-2">
                           {item.subItems.map((subItem) => (
                           <Link
                           key={subItem.href} // Use href as key
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
