
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sigma, FlaskConical, Atom, Microscope, BookMarked } from 'lucide-react'; // Added BookMarked for Dictionary
import Image from 'next/image';

export default function Home() {
  const features = [
    {
      title: 'Mathematics',
      description: 'Visualize complex functions and calculate geometric properties.',
      href: '/math',
      icon: Sigma,
      imageHint: 'mathematics equations graphs',
      imageSrc: '/mathematics.jpg',
    },
    {
      title: 'Chemistry',
      description: 'Explore molecular structures and properties with PubChem data.',
      href: '/chemistry',
      icon: FlaskConical,
      imageHint: 'chemistry molecules structure',
      imageSrc: '/chemistry.jpg',
    },
    {
      title: 'Physics',
      description: 'Calculate solutions to physics problems across various topics.',
      href: '/physics',
      icon: Atom,
      imageHint: 'physics formulas equations',
      imageSrc: '/physics.jpg',
    },
     {
      title: 'Biology',
      description: 'Explore biological concepts with interactive flashcards.',
      href: '/biology',
      icon: Microscope,
      imageHint: 'biology cell dna microscope',
      imageSrc: '/biology.jpeg',
    },
     { // New Entry for Dictionary
      title: 'Dictionary',
      description: 'Look up word definitions and pronunciations.', // Updated description
      href: '/dictionary',
      icon: BookMarked,
      imageHint: 'dictionary book words',
      imageSrc: 'https://picsum.photos/300/200?random=4', // Placeholder image
    },
  ];

  return (
    <div className="flex flex-col items-center text-center space-y-12">
      <section className="space-y-4 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-primary">
          Welcome to PCMBtools
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Explore the wonders of Math, Chemistry, Physics, Biology, and Language — all in one place. Dive into interactive graphs, molecular structures, scientific calculators, flashcards, and a comprehensive dictionary.
        </p>
      </section>

      {/* Adjusted grid to potentially fit 5 items, may wrap on some screens */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl"> {/* Adjusted to lg:grid-cols-3 */}
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group"> {/* Added group class */}
            <CardHeader className="items-center text-center p-4 bg-secondary rounded-t-lg">
               <div className="relative w-full h-40 mb-4 rounded-md overflow-hidden">
                <Image
                  src={feature.imageSrc}
                  alt={feature.title}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={feature.imageHint}
                  placeholder="empty"
                  className="transition-transform duration-300 group-hover:scale-105" // Added basic hover effect
                />
               </div>
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
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

