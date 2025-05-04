
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlaskConical, Atom, Calculator } from 'lucide-react';

export default function ChemistryPage() {
  const chemistryTools = [
    {
      title: 'Compound Explorer',
      description: 'Search for chemical compounds by name or formula using the PubChem API.',
      href: '/chemistry/compound-explorer',
      icon: FlaskConical,
    },
    {
      title: 'Chemistry Calculator Hub',
      description: 'Access calculators for mole concept, gas laws, concentration, stoichiometry, and more.',
      href: '/chemistry/calculators',
      icon: Calculator,
    },
  ];

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Chemistry Tools</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore chemical compounds or use various calculators for your chemistry problems.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {chemistryTools.map((tool) => (
          <Card key={tool.title} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="items-center text-center p-6">
              <tool.icon className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-2xl">{tool.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between p-6">
              <CardDescription className="text-muted-foreground mb-6 text-center">
                {tool.description}
              </CardDescription>
              <Button asChild className="mt-auto bg-primary hover:bg-primary/90 text-primary-foreground w-full">
                <Link href={tool.href}>
                  Open {tool.title}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
