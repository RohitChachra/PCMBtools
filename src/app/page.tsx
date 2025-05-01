import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sigma, FlaskConical, Atom } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const features = [
    {
      title: 'Mathematics',
      description: 'Visualize complex functions with our interactive graphing tool.',
      href: '/math',
      icon: Sigma,
      imageHint: '+ MATHS =',
      imageSrc: '/src/app/chemistry.png', // local or hosted image URL
    },
    {
      title: 'Chemistry',
      description: 'Explore molecular structures and properties with PubChem data.',
      href: '/chemistry',
      icon: FlaskConical,
      imageHint: 'chemistry molecules structure',
      imageSrc: '/src/app/chemistry.png', // replace with your custom chemistry image
    },
    {
      title: 'Physics',
      description: 'Calculate solutions to physics problems across various topics.',
      href: '/physics',
      icon: Atom,
      imageHint: 'physics formulas equations',
      imageSrc: '/src/app/physics.png', // replace with your custom physics image
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
               <div className="relative w-full h-40 mb-4 rounded-md overflow-hidden">
                <Image
                  src={feature.imageSrc}
                  alt={feature.imageHint}
                  layout="fill"
                  objectFit="cover"
                />
               </div>
              <CardTitle className="flex items-center gap-2 text-xl">
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
