
'use client';

import Link from 'next/link';
import { BookOpenText, FlaskConical, Atom, Microscope, BarChart3, Sigma, Shapes, Calculator, ArrowRightLeft } from 'lucide-react'; // Added Calculator, ArrowRightLeft
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
    subItems: [
      { href: '/chemistry/compound-explorer', title: 'Compound Explorer', description: 'Search for chemical compounds.', icon: FlaskConical },
      { href: '/chemistry/calculators', title: 'Calculator Hub', description: 'Tools for various chemistry calculations.', icon: Calculator },
    ],
  },
  {
    trigger: { label: 'Physics', icon: Atom },
    href: '/physics',
    subItems: [
        { href: '/physics/calculators', title: 'Physics Calculator Hub', description: 'Access calculators for various topics.', icon: Calculator },
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
                 {item.subItems && item.subItems.length > 0 ? (
                     <>
                         {/* Removed asChild, content is now inside the trigger */}
                         <NavigationMenuTrigger className="flex items-center gap-1">
                             <item.trigger.icon className="h-4 w-4" />
                             {item.trigger.label}
                         </NavigationMenuTrigger>
                         <NavigationMenuContent>
                              <ul className={cn("grid gap-3 p-4 md:w-[550px] lg:w-[650px]", `lg:grid-cols-${Math.min(item.subItems.length, 3)}`)}>
                              {item.subItems.map((subItem) => (
                                <ListItem
                                  key={subItem.href}
                                  title={subItem.title}
                                  href={subItem.href}
                                  icon={subItem.icon}
                                >
                                  {subItem.description}
                                </ListItem>
                              ))}
                              {/* Link to the main category page within the content */}
                              <ListItem href={item.href} title={`All ${item.trigger.label}`} icon={item.trigger.icon}>
                                View all {item.trigger.label.toLowerCase()} tools.
                              </ListItem>
                            </ul>
                          </NavigationMenuContent>
                     </>
                 ) : (
                     // Simple link if no sub-items
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
            <SheetContent side="right" className="p-0"> {/* Remove padding from SheetContent */}
              {/* Add visually hidden title and description for accessibility */}
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Mobile navigation menu for PCMBtools.
              </SheetDescription>
              <ScrollArea className="h-full py-6 px-6"> {/* Add ScrollArea and padding here */}
                 <Link href="/" className="flex items-center gap-2 mb-6"> {/* Increased bottom margin */}
                    <BookOpenText className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold">PCMBtools</span>
                 </Link>
                 <Accordion type="single" collapsible className="w-full">
                   {navItems.map((item) => (
                       <div key={item.trigger.label} className="border-b">
                         {item.subItems && item.subItems.length > 0 ? (
                            <AccordionItem value={item.trigger.label} className="border-b-0"> {/* Remove internal border */}
                               <AccordionTrigger className="flex items-center justify-between w-full py-3 text-lg font-medium hover:bg-accent rounded-md px-2 hover:no-underline">
                                    <div className="flex items-center gap-2">
                                        <item.trigger.icon className="h-5 w-5" />
                                        {item.trigger.label}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-1 pb-2 pl-6"> {/* Indent sub-items */}
                                    <div className="grid gap-2">
                                        {/* Link to the main category page */}
                                        <Link
                                          key={`${item.href}-main`}
                                          href={item.href}
                                          className="flex items-center gap-2 rounded-md p-2 text-base font-medium text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground"
                                        >
                                          {/* Optional: Add an icon for 'All' */}
                                          All {item.trigger.label}
                                        </Link>
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
                                </AccordionContent>
                            </AccordionItem>
                         ) : (
                            // Simple link if no sub-items
                            <Link
                                href={item.href}
                                className="flex items-center gap-2 rounded-md px-2 py-3 text-lg font-medium hover:bg-accent"
                            >
                                <item.trigger.icon className="h-5 w-5" />
                                {item.trigger.label}
                            </Link>
                         )}
                       </div>
                   ))}
                 </Accordion>
               </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

