
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shapes, Calculator as CalculatorIcon, Sigma, BarChart3 } from 'lucide-react'; // Added BarChart3 for Stats

export default function MathPage() {
  const mathTools = [
    {
      title: 'Geometry Calculator',
      description: 'Calculate area, perimeter, surface area, and volume for various 2D and 3D shapes.',
      href: '/math/geometry',
      icon: Shapes,
    },
    {
      title: 'Graphing Calculator',
      description: 'Visualize mathematical functions and equations interactively using Desmos.',
      href: '/math/graphing',
      icon: CalculatorIcon, // Renamed import
    },
    {
      title: 'Scientific Calculator',
      description: 'Perform basic and advanced scientific calculations.',
      href: '/math/scientific-calculator',
      icon: Sigma,
    },
    { // New Entry for Statistics Calculator
      title: 'Statistics Calculator',
      description: 'Calculate descriptive statistics for discrete and continuous data sets.',
      href: '/math/statistics',
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Mathematics Tools</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore interactive calculators for geometry, function graphing, scientific calculations, and statistics.
        </p>
      </section>

      {/* Updated grid to accommodate potentially more items - adjust columns as needed */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto"> {/* Changed lg:grid-cols-3 to lg:grid-cols-2 */}
        {mathTools.map((tool) => (
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
