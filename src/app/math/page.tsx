
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calculator, Shapes } from 'lucide-react'; // Added Shapes icon

declare global {
  interface Window {
    Desmos: any;
  }
}

// --- Geometry Calculation Types and Logic ---

type Shape = 'square' | 'rectangle' | 'circle' | 'triangle' | 'cube' | 'cuboid' | 'sphere' | 'cylinder' | 'cone';

interface ShapeConfig {
    label: string;
    type: '2D' | '3D';
    inputs: { name: string; label: string; unit?: string }[];
    outputs: ('perimeter' | 'area' | 'surfaceArea' | 'volume')[];
}

const shapeConfigs: Record<Shape, ShapeConfig> = {
    square: { label: 'Square', type: '2D', inputs: [{ name: 's', label: 'Side Length' }], outputs: ['perimeter', 'area'] },
    rectangle: { label: 'Rectangle', type: '2D', inputs: [{ name: 'l', label: 'Length' }, { name: 'w', label: 'Width' }], outputs: ['perimeter', 'area'] },
    circle: { label: 'Circle', type: '2D', inputs: [{ name: 'r', label: 'Radius' }], outputs: ['perimeter', 'area'] }, // Perimeter = Circumference
    triangle: { label: 'Triangle (Base/Height)', type: '2D', inputs: [{ name: 'b', label: 'Base' }, { name: 'h', label: 'Height' } /* Add sides for perimeter? */], outputs: ['area'] }, // Simplified for now
    cube: { label: 'Cube', type: '3D', inputs: [{ name: 's', label: 'Side Length' }], outputs: ['surfaceArea', 'volume'] },
    cuboid: { label: 'Cuboid', type: '3D', inputs: [{ name: 'l', label: 'Length' }, { name: 'w', label: 'Width' }, { name: 'h', label: 'Height' }], outputs: ['surfaceArea', 'volume'] },
    sphere: { label: 'Sphere', type: '3D', inputs: [{ name: 'r', label: 'Radius' }], outputs: ['surfaceArea', 'volume'] },
    cylinder: { label: 'Cylinder', type: '3D', inputs: [{ name: 'r', label: 'Radius' }, { name: 'h', label: 'Height' }], outputs: ['surfaceArea', 'volume'] },
    cone: { label: 'Cone', type: '3D', inputs: [{ name: 'r', label: 'Radius' }, { name: 'h', label: 'Height' }], outputs: ['surfaceArea', 'volume'] },
};

interface CalculationResult {
    perimeter?: number;
    area?: number;
    surfaceArea?: number;
    volume?: number;
}

function calculateGeometry(shape: Shape, inputs: Record<string, number>): CalculationResult | null {
    const PI = Math.PI;
    try {
        switch (shape) {
            case 'square': {
                const { s } = inputs;
                if (s <= 0) return null;
                return { perimeter: 4 * s, area: s * s };
            }
            case 'rectangle': {
                const { l, w } = inputs;
                if (l <= 0 || w <= 0) return null;
                return { perimeter: 2 * (l + w), area: l * w };
            }
            case 'circle': {
                const { r } = inputs;
                if (r <= 0) return null;
                return { perimeter: 2 * PI * r, area: PI * r * r }; // Circumference as perimeter
            }
             case 'triangle': {
                const { b, h } = inputs;
                if (b <= 0 || h <= 0) return null;
                return { area: 0.5 * b * h }; // Perimeter requires side lengths
            }
            case 'cube': {
                const { s } = inputs;
                if (s <= 0) return null;
                return { surfaceArea: 6 * s * s, volume: s * s * s };
            }
            case 'cuboid': {
                const { l, w, h } = inputs;
                if (l <= 0 || w <= 0 || h <= 0) return null;
                return { surfaceArea: 2 * (l * w + l * h + w * h), volume: l * w * h };
            }
            case 'sphere': {
                const { r } = inputs;
                if (r <= 0) return null;
                return { surfaceArea: 4 * PI * r * r, volume: (4 / 3) * PI * r * r * r };
            }
            case 'cylinder': {
                const { r, h } = inputs;
                if (r <= 0 || h <= 0) return null;
                return { surfaceArea: 2 * PI * r * (r + h), volume: PI * r * r * h };
            }
            case 'cone': {
                const { r, h } = inputs;
                if (r <= 0 || h <= 0) return null;
                const l = Math.sqrt(r * r + h * h); // Slant height
                return { surfaceArea: PI * r * (r + l), volume: (1 / 3) * PI * r * r * h };
            }
            default:
                return null;
        }
    } catch (error) {
        console.error("Geometry calculation error:", error);
        return null;
    }
}

// --- Component ---

export default function MathPage() {
  const calculatorRef = useRef<HTMLDivElement>(null);
  const desmosInstanceRef = useRef<any>(null);
  const [expression, setExpression] = useState<string>('y = x^2');
  const [expressions, setExpressions] = useState<{ id: string; latex: string }[]>([]);
  const [isDesmosLoaded, setIsDesmosLoaded] = useState(false);
  const [isGraphVisible, setIsGraphVisible] = useState(false); // State to control graph visibility
  const { toast } = useToast();

  // --- Geometry State ---
  const [selectedShape, setSelectedShape] = useState<Shape | ''>('');
  const [geometryInputs, setGeometryInputs] = useState<Record<string, string>>({});
  const [geometryResult, setGeometryResult] = useState<CalculationResult | null>(null);
  const [geometryError, setGeometryError] = useState<string | null>(null);

  // --- Desmos Logic ---
  useEffect(() => {
    if (isGraphVisible && isDesmosLoaded && calculatorRef.current && !desmosInstanceRef.current) {
      try {
        desmosInstanceRef.current = window.Desmos.GraphingCalculator(calculatorRef.current, {
           keypad: true,
           expressions: true,
           settingsMenu: true, // Enable settings menu for better usability
        });
        // Set initial expression if needed, or maybe clear it
        desmosInstanceRef.current.setBlank(); // Start with a blank graph
        // Or restore previous expressions if you save them
        expressions.forEach(expr => desmosInstanceRef.current.setExpression({ id: expr.id, latex: expr.latex }));

      } catch (error) {
        console.error("Failed to initialize Desmos:", error);
        toast({
          title: "Error",
          description: "Failed to load the graphing calculator. Please refresh the page.",
          variant: "destructive",
        });
      }
    }

    // Cleanup function for Desmos
    return () => {
       // No need to destroy if switching visibility, only on unmount? Let's keep destroy for full cleanup.
       // If the component unmounts completely:
      // if (desmosInstanceRef.current) {
      //   if (typeof desmosInstanceRef.current.destroy === 'function') {
      //      desmosInstanceRef.current.destroy();
      //   }
      //   desmosInstanceRef.current = null;
      // }
    };
  // Re-run when isGraphVisible changes to initialize Desmos when it becomes visible
  }, [isGraphVisible, isDesmosLoaded, toast, expressions]);


  const handleAddExpression = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGraphVisible || !desmosInstanceRef.current) {
        toast({ title: "Error", description: "Calculator is not active.", variant: "destructive" });
        return;
    }
     if (!expression.trim()) {
        toast({ title: "Input Error", description: "Please enter a valid mathematical expression.", variant: "destructive" });
        return;
    }
    try {
        const newId = `expr-${Date.now()}`;
        desmosInstanceRef.current.setExpression({ id: newId, latex: expression });
        setExpressions(prev => [...prev, { id: newId, latex: expression }]);
        setExpression(''); // Clear input after adding
    } catch (error) {
        console.error("Invalid expression:", error);
        toast({ title: "Invalid Expression", description: "Please enter a valid mathematical expression (e.g., y = sin(x), f(x) = x^3 - x).", variant: "destructive" });
    }
  };

   const handleRemoveExpression = (idToRemove: string) => {
    if (!isGraphVisible || !desmosInstanceRef.current) return;
    try {
        desmosInstanceRef.current.removeExpression({ id: idToRemove });
        setExpressions(prev => prev.filter(expr => expr.id !== idToRemove));
    } catch (error) {
        console.error("Failed to remove expression:", error);
        toast({ title: "Error", description: "Could not remove the expression.", variant: "destructive" });
    }
  };

  const toggleGraphVisibility = () => {
    setIsGraphVisible(prev => !prev);
     if (!isGraphVisible && desmosInstanceRef.current) {
         // Optional: Clear expressions when hiding if desired
         // desmosInstanceRef.current.setBlank();
         // setExpressions([]);
     }
  };

  // --- Geometry Logic ---
  const handleShapeChange = (value: string) => {
      const shape = value as Shape;
      setSelectedShape(shape);
      setGeometryInputs({}); // Reset inputs when shape changes
      setGeometryResult(null);
      setGeometryError(null);
  };

  const handleGeometryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGeometryInputs((prev) => ({ ...prev, [name]: value }));
    setGeometryResult(null); // Clear result on input change
    setGeometryError(null);
  };

  const handleGeometryCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setGeometryError(null);
    setGeometryResult(null);

    if (!selectedShape) {
        setGeometryError("Please select a shape first.");
        return;
    }

    const config = shapeConfigs[selectedShape];
    const numericInputs: Record<string, number> = {};
    let validationError = false;

    for (const inputField of config.inputs) {
        const value = geometryInputs[inputField.name];
        if (value === undefined || value.trim() === '' || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
            setGeometryError(`Invalid or non-positive input for ${inputField.label}. Please enter a valid positive number.`);
            validationError = true;
            break;
        }
        numericInputs[inputField.name] = parseFloat(value);
    }

     if (validationError) {
      return;
    }

    const result = calculateGeometry(selectedShape, numericInputs);

    if (result === null) {
      setGeometryError("Calculation failed. Please check your inputs (e.g., ensure values are positive).");
    } else {
      setGeometryResult(result);
      toast({ title: "Calculation Success", description: `Calculated properties for ${config.label}.` });
    }
  };

  const currentShapeConfig = selectedShape ? shapeConfigs[selectedShape] : null;

  return (
    <>
      <Script
        src="https://www.desmos.com/api/v1.8/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
        strategy="lazyOnload" // Load only when needed/visible? Or keep eager for faster graph load on click.
        onLoad={() => {
            console.log("Desmos API script loaded.");
            setIsDesmosLoaded(true);
        }}
        onError={(e) => {
            console.error("Failed to load Desmos API script:", e);
             toast({
                title: "Error Loading Graph",
                description: "Could not load the Desmos graphing script.",
                variant: "destructive",
                duration: 9000,
            });
        }}
      />
      <div className="space-y-12">
         <h1 className="text-3xl font-bold">Mathematics Tools</h1>
         <p className="text-muted-foreground">
            Explore interactive graphing and calculate properties of geometric shapes.
         </p>

         {/* Geometry Calculator Section */}
         <Card>
            <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                    <Shapes className="h-6 w-6 text-primary" />
                    Geometry Calculator
                 </CardTitle>
                 <CardDescription>Calculate perimeter, area, surface area, and volume for various 2D and 3D shapes.</CardDescription>
            </CardHeader>
             <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="shape-select">Select Shape</Label>
                    <Select onValueChange={handleShapeChange} value={selectedShape}>
                        <SelectTrigger id="shape-select" className="w-full sm:w-[280px]">
                            <SelectValue placeholder="Choose a shape..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="square">Square (2D)</SelectItem>
                            <SelectItem value="rectangle">Rectangle (2D)</SelectItem>
                            <SelectItem value="circle">Circle (2D)</SelectItem>
                             <SelectItem value="triangle">Triangle (Area) (2D)</SelectItem>
                            <SelectItem value="cube">Cube (3D)</SelectItem>
                            <SelectItem value="cuboid">Cuboid (3D)</SelectItem>
                            <SelectItem value="sphere">Sphere (3D)</SelectItem>
                            <SelectItem value="cylinder">Cylinder (3D)</SelectItem>
                            <SelectItem value="cone">Cone (3D)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                 {currentShapeConfig && (
                    <form onSubmit={handleGeometryCalculate} className="space-y-4">
                        <h3 className="text-lg font-medium">Inputs for {currentShapeConfig.label}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {currentShapeConfig.inputs.map((input) => (
                                <div key={input.name} className="space-y-1">
                                    <Label htmlFor={input.name}>{input.label} {input.unit ? `(${input.unit})` : ''}</Label>
                                    <Input
                                        id={input.name}
                                        name={input.name}
                                        type="number"
                                        step="any"
                                        value={geometryInputs[input.name] ?? ''}
                                        onChange={handleGeometryInputChange}
                                        placeholder={`Enter ${input.label.toLowerCase()}`}
                                        required
                                        min="0.000001" // Ensure positive value
                                        aria-label={`Input for ${input.label}`}
                                    />
                                </div>
                            ))}
                        </div>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            Calculate Properties
                         </Button>
                    </form>
                 )}

                 {geometryError && (
                    <Alert variant="destructive">
                        <Calculator className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{geometryError}</AlertDescription>
                    </Alert>
                 )}

                 {geometryResult && currentShapeConfig && (
                     <Alert variant="success" className="bg-secondary"> {/* Use success variant */}
                        <Calculator className="h-4 w-4" />
                        <AlertTitle>Results for {currentShapeConfig.label}</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                {geometryResult.perimeter !== undefined && <li>Perimeter/Circumference: {geometryResult.perimeter.toFixed(4)}</li>}
                                {geometryResult.area !== undefined && <li>Area: {geometryResult.area.toFixed(4)}</li>}
                                {geometryResult.surfaceArea !== undefined && <li>Surface Area: {geometryResult.surfaceArea.toFixed(4)}</li>}
                                {geometryResult.volume !== undefined && <li>Volume: {geometryResult.volume.toFixed(4)}</li>}
                            </ul>
                        </AlertDescription>
                    </Alert>
                 )}
             </CardContent>
         </Card>


        {/* Graphing Calculator Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-accent" /> {/* Changed icon */}
                 Interactive Graphing Calculator
              </CardTitle>
              <Button onClick={toggleGraphVisibility} variant="outline">
                {isGraphVisible ? 'Hide Graph' : 'Show Graph'}
              </Button>
            </div>
            <CardDescription>
              {isGraphVisible
                ? "Powered by Desmos API. Enter functions below and see them plotted."
                : "Click 'Show Graph' to load the interactive graphing calculator."}
            </CardDescription>
          </CardHeader>

          {isGraphVisible && (
            <CardContent>
              <form onSubmit={handleAddExpression} className="flex flex-col sm:flex-row gap-2 mb-4">
                 <Input
                    type="text"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    placeholder="e.g., y = x^2 + 1, r = cos(3θ)"
                    className="flex-grow"
                    aria-label="Enter mathematical function"
                 />
                 <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                   Add Graph
                 </Button>
              </form>

              {expressions.length > 0 && (
                <div className="mb-4 space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Current Expressions:</h3>
                    <ul className="list-none p-0 m-0 space-y-1 max-h-40 overflow-y-auto"> {/* Added scroll */}
                        {expressions.map((expr) => (
                            <li key={expr.id} className="flex items-center justify-between bg-muted/50 dark:bg-muted/20 p-2 rounded-md text-sm">
                                <span><code>{expr.latex}</code></span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveExpression(expr.id)}
                                    aria-label={`Remove expression ${expr.latex}`}
                                    className="text-destructive hover:bg-destructive/10" // Destructive variant for remove
                                >
                                    Remove
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
              )}

              <div ref={calculatorRef} style={{ width: '100%', height: '500px' }} className="border rounded-md shadow-inner bg-background dark:bg-muted/10">
                 {!isDesmosLoaded && <div className="flex items-center justify-center h-full text-muted-foreground">Loading Calculator...</div>}
                 {isDesmosLoaded && !desmosInstanceRef.current && <div className="flex items-center justify-center h-full text-muted-foreground">Initializing Graph...</div>}
              </div>

            </CardContent>
          )}
           {isGraphVisible && (
              <CardFooter className="text-xs text-muted-foreground">
                Examples: <code>y = sin(x)</code>, <code>f(x) = x^3 - x</code>, <code>r = cos(3θ)</code>. Use the keypad or type directly.
              </CardFooter>
           )}
        </Card>


      </div>
    </>
  );
}
