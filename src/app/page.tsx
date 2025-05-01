import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sigma, FlaskConical, Atom } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const features = [
    {
      title: 'Mathematics',
      description: 'Visualize complex functions and calculate geometric properties.',
      href: '/math',
      icon: Sigma,
      imageHint: 'mathematics equations graphs', // Updated hint
      imageSrc: '/mathematics.jpg',
    },
    {
      title: 'Chemistry',
      description: 'Explore molecular structures and properties with PubChem data.',
      href: '/chemistry',
      icon: FlaskConical,
      imageHint: 'chemistry molecules structure', // Updated hint
      imageSrc: '/chemistry.jpg',
    },
    {
      title: 'Physics', // Added description
      description: 'Calculate solutions to physics problems across various topics.',
      href: '/physics',
      icon: Atom,
      imageHint: 'physics formulas equations',
      imageSrc: '/physics.jpg', // Placeholder
    },
  ];

  return (
    <div className="flex flex-col items-center text-center space-y-12">
      <section className="space-y-4 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-primary">
          Welcome to SciVerse
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Explore the wonders of Math, Chemistry, and Physics — all in one place. Dive into interactive graphs, molecular structures, and scientific calculators.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="items-center text-center p-4 bg-secondary rounded-t-lg">
               {/* Ensure parent div has relative positioning and overflow hidden */}
               <div className="relative w-full h-40 mb-4 rounded-md overflow-hidden">
                <Image
                  src={feature.imageSrc}
                  alt={feature.title} // Use title for better alt text
                  layout="fill" // Make image fill the container
                  objectFit="cover" // Crop image to cover the container
                  data-ai-hint={feature.imageHint} // Keep AI hint
                />
               </div>
              <CardTitle className="flex items-center justify-center gap-2 text-xl"> {/* Added justify-center */}
                <feature.icon className="h-6 w-6 text-primary" />
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between p-4">
              <p className="text-muted-foreground mb-4 text-sm">{feature.description}</p>
              <Button asChild className="mt-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href={feature.href}>
                  Explore {feature.title}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
