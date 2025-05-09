
'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectSeparator, SelectGroup } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shapes, Calculator as CalculatorIcon } from 'lucide-react'; // Renamed Calculator to avoid conflict

// --- Geometry Calculation Types and Logic ---

type Shape = 'square' | 'rectangle' | 'triangle' | 'circle' | 'parallelogram' | 'trapezium' | 'rhombus' | 'ellipse' | 'cube' | 'cuboid' | 'sphere' | 'cylinder' | 'cone' | 'hemisphere' | 'pyramid' | 'frustum';

interface ShapeConfig {
    label: string;
    type: '2D' | '3D';
    inputs: { name: string; label: string; unit?: string }[];
    outputs: ('perimeter' | 'area' | 'surfaceArea' | 'volume' | 'slantHeight' | 'lateralSurfaceArea')[];
}

// Define shape configurations based on user list
const shapeConfigs: Record<Shape, ShapeConfig> = {
    // 2D Shapes
    square: { label: 'Square', type: '2D', inputs: [{ name: 'a', label: 'Side Length' }], outputs: ['perimeter', 'area'] },
    rectangle: { label: 'Rectangle', type: '2D', inputs: [{ name: 'l', label: 'Length' }, { name: 'w', label: 'Width' }], outputs: ['perimeter', 'area'] },
    triangle: { label: 'Triangle', type: '2D', inputs: [{ name: 's1', label: 'Side a' }, { name: 's2', label: 'Side b' }, { name: 's3', label: 'Side c'}, {name: 'base', label: 'Base (optional)'}, {name: 'height', label: 'Height (optional)'}], outputs: ['perimeter', 'area'] }, // Can calc area with sides (Heron's) or base/height
    circle: { label: 'Circle', type: '2D', inputs: [{ name: 'r', label: 'Radius' }], outputs: ['perimeter', 'area'] }, // Perimeter = Circumference
    parallelogram: { label: 'Parallelogram', type: '2D', inputs: [{ name: 'b', label: 'Base' }, { name: 'h', label: 'Height'}, { name: 'a', label: 'Side'}], outputs: ['perimeter', 'area'] },
    trapezium: { label: 'Trapezium (Trapezoid)', type: '2D', inputs: [{ name: 'b1', label: 'Base a' }, { name: 'b2', label: 'Base b'}, { name: 's1', label: 'Side c'}, { name: 's2', label: 'Side d'}, { name: 'h', label: 'Height'}], outputs: ['perimeter', 'area'] },
    rhombus: { label: 'Rhombus', type: '2D', inputs: [{ name: 'd1', label: 'Diagonal 1' }, { name: 'd2', label: 'Diagonal 2'}, { name: 'a', label: 'Side'}], outputs: ['perimeter', 'area'] },
    ellipse: { label: 'Ellipse', type: '2D', inputs: [{ name: 'a', label: 'Major Radius' }, { name: 'b', label: 'Minor Radius'}], outputs: ['perimeter', 'area'] }, // Perimeter is approximate

    // 3D Shapes
    cube: { label: 'Cube', type: '3D', inputs: [{ name: 'a', label: 'Side Length' }], outputs: ['surfaceArea', 'volume'] },
    cuboid: { label: 'Cuboid', type: '3D', inputs: [{ name: 'l', label: 'Length' }, { name: 'w', label: 'Width' }, { name: 'h', label: 'Height' }], outputs: ['surfaceArea', 'volume'] },
    sphere: { label: 'Sphere', type: '3D', inputs: [{ name: 'r', label: 'Radius' }], outputs: ['surfaceArea', 'volume'] },
    cylinder: { label: 'Cylinder', type: '3D', inputs: [{ name: 'r', label: 'Radius' }, { name: 'h', label: 'Height' }], outputs: ['surfaceArea', 'volume'] },
    cone: { label: 'Cone', type: '3D', inputs: [{ name: 'r', label: 'Radius' }, { name: 'h', label: 'Height' }], outputs: ['surfaceArea', 'volume', 'slantHeight'] }, // Calculate slant height internally or display? Let's display.
    hemisphere: { label: 'Hemisphere', type: '3D', inputs: [{ name: 'r', label: 'Radius' }], outputs: ['surfaceArea', 'volume'] },
    pyramid: { label: 'Pyramid (Square Base)', type: '3D', inputs: [{ name: 'b', label: 'Base Side' }, { name: 'h', label: 'Height' }], outputs: ['surfaceArea', 'volume'] },
    frustum: { label: 'Frustum of a Cone', type: '3D', inputs: [{ name: 'R', label: 'Larger Radius' }, { name: 'r', label: 'Smaller Radius' }, { name: 'h', label: 'Height' }], outputs: ['slantHeight', 'lateralSurfaceArea', 'surfaceArea', 'volume'] }, // SA = Total Surface Area
};

interface CalculationResult {
    perimeter?: number;
    area?: number;
    surfaceArea?: number; // Total Surface Area
    volume?: number;
    slantHeight?: number;
    lateralSurfaceArea?: number;
}

function calculateGeometry(shape: Shape, inputs: Record<string, number>): CalculationResult | string | null {
    const PI = Math.PI;
    try {
        switch (shape) {
            // --- 2D SHAPES ---
            case 'square': {
                const { a } = inputs;
                if (a <= 0) return "Side length must be positive.";
                return { perimeter: 4 * a, area: a * a };
            }
            case 'rectangle': {
                const { l, w } = inputs;
                if (l <= 0 || w <= 0) return "Length and width must be positive.";
                return { perimeter: 2 * (l + w), area: l * w };
            }
            case 'triangle': {
                const { s1, s2, s3, base, height } = inputs; // s1, s2, s3 are sides a, b, c
                let perimeter: number | undefined = undefined;
                let area: number | undefined = undefined;

                // Check if sides form a valid triangle for perimeter and Heron's area
                if (s1 > 0 && s2 > 0 && s3 > 0) {
                    if (s1 + s2 > s3 && s1 + s3 > s2 && s2 + s3 > s1) {
                        perimeter = s1 + s2 + s3;
                        // Use Heron's formula if base/height aren't validly provided
                        if (!(base > 0 && height > 0)) {
                            const s = perimeter / 2;
                            area = Math.sqrt(s * (s - s1) * (s - s2) * (s - s3));
                        }
                    } else {
                        // Sides don't form a triangle, but maybe base/height are provided
                        if (!(base > 0 && height > 0)) return "Invalid triangle sides provided, and no valid base/height for area calculation.";
                    }
                }

                // Calculate area using base and height if provided and valid
                if (base > 0 && height > 0) {
                    area = 0.5 * base * height;
                     // If perimeter wasn't calculated via sides, try using base if it matches a side
                    if (perimeter === undefined) {
                        if (base === s1 || base === s2 || base === s3) {
                           // Cannot determine perimeter only from base and height
                        }
                    }
                }

                if (perimeter === undefined && area === undefined) return "Insufficient valid inputs (provide 3 sides, or base and height).";
                return { perimeter, area }; // Return whatever could be calculated
            }
            case 'circle': {
                const { r } = inputs;
                if (r <= 0) return "Radius must be positive.";
                return { perimeter: 2 * PI * r, area: PI * r * r }; // Perimeter = Circumference
            }
            case 'parallelogram': {
                const { b, h, a } = inputs; // b = base, h = height, a = side
                if (b <= 0 || h <= 0 || a <= 0) return "Base, height, and side must be positive.";
                return { perimeter: 2 * (a + b), area: b * h };
            }
            case 'trapezium': {
                const { b1, b2, s1, s2, h } = inputs; // b1, b2 are parallel bases; s1, s2 are non-parallel sides
                let area : number | undefined = undefined;
                let perimeter : number | undefined = undefined;

                if (b1 > 0 && b2 > 0 && h > 0) {
                    area = 0.5 * (b1 + b2) * h;
                }
                if (b1 > 0 && b2 > 0 && s1 > 0 && s2 > 0){
                     perimeter = b1 + b2 + s1 + s2;
                }

                if (area === undefined && perimeter === undefined) return "Insufficient valid inputs for calculation.";

                return { perimeter, area };
            }
             case 'rhombus': {
                 const { d1, d2, a } = inputs; // d1, d2 diagonals, a = side
                 let area : number | undefined = undefined;
                 let perimeter : number | undefined = undefined;

                 if (d1 > 0 && d2 > 0) {
                      area = 0.5 * d1 * d2;
                     // Validate consistency if side 'a' is also provided
                      if (a > 0 && Math.abs(a*a - (d1/2)*(d1/2) - (d2/2)*(d2/2)) > 1e-9) {
                          return "Inconsistent inputs: The provided side length does not match the diagonals.";
                      }
                 }
                 if (a > 0) {
                     perimeter = 4 * a;
                     // Validate consistency if diagonals are also provided
                     if (d1 > 0 && d2 > 0 && Math.abs(a*a - (d1/2)*(d1/2) - (d2/2)*(d2/2)) > 1e-9) {
                         return "Inconsistent inputs: The provided side length does not match the diagonals.";
                     }
                 }

                 if (area === undefined && perimeter === undefined) return "Insufficient inputs: Provide diagonals for area and/or side for perimeter.";

                 return { perimeter, area };
             }
            case 'ellipse': {
                const { a, b } = inputs; // a=major radius, b=minor radius
                if (a <= 0 || b <= 0) return "Major and minor radii must be positive.";
                if (b > a) return "Minor radius (b) cannot be greater than major radius (a).";
                const area = PI * a * b;
                // Ramanujan's approximation for circumference (perimeter)
                const h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
                const perimeter = PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
                // Alternative simpler approximation: π[3(a + b) - √((3a + b)(a + 3b))] - check if this is better/simpler
                // const perimeterApprox2 = PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
                return { perimeter, area };
            }

            // --- 3D SHAPES ---
            case 'cube': {
                const { a } = inputs; // a = side length
                if (a <= 0) return "Side length must be positive.";
                return { surfaceArea: 6 * a * a, volume: a * a * a };
            }
            case 'cuboid': {
                const { l, w, h } = inputs;
                if (l <= 0 || w <= 0 || h <= 0) return "Length, width, and height must be positive.";
                return { surfaceArea: 2 * (l * w + l * h + w * h), volume: l * w * h };
            }
            case 'sphere': {
                const { r } = inputs;
                if (r <= 0) return "Radius must be positive.";
                return { surfaceArea: 4 * PI * r * r, volume: (4 / 3) * PI * r * r * r };
            }
            case 'cylinder': {
                const { r, h } = inputs;
                if (r <= 0 || h <= 0) return "Radius and height must be positive.";
                return { surfaceArea: 2 * PI * r * (h + r), volume: PI * r * r * h };
            }
            case 'cone': {
                const { r, h } = inputs;
                if (r <= 0 || h <= 0) return "Radius and height must be positive.";
                const slantHeight = Math.sqrt(r * r + h * h);
                return { surfaceArea: PI * r * (slantHeight + r), volume: (1 / 3) * PI * r * r * h, slantHeight };
            }
             case 'hemisphere': {
                const { r } = inputs;
                if (r <= 0) return "Radius must be positive.";
                return { surfaceArea: 3 * PI * r * r, volume: (2 / 3) * PI * r * r * r };
            }
             case 'pyramid': { // Assuming square base pyramid
                const { b, h } = inputs; // b = base side, h = height
                if (b <= 0 || h <= 0) return "Base side and height must be positive.";
                const slantHeightOfFace = Math.sqrt(h*h + (b/2)*(b/2)); // Slant height of a triangular face
                const surfaceArea = b * b + 2*b*slantHeightOfFace; // Base area + lateral area (2*b*slantHeight)
                return { surfaceArea: surfaceArea, volume: (1 / 3) * b * b * h };
            }
             case 'frustum': { // Frustum of a Cone
                const { R, r, h } = inputs; // R=Larger radius, r=Smaller radius, h=height
                if (R <= 0 || r < 0 || h <= 0) return "Radii must be positive (smaller radius can be 0 for cone).";
                if (r > R) return "Smaller radius (r) cannot be greater than larger radius (R)."
                const slantHeight = Math.sqrt(Math.pow(R - r, 2) + h * h);
                const lateralSurfaceArea = PI * (R + r) * slantHeight;
                const surfaceArea = lateralSurfaceArea + PI * R * R + PI * r * r; // Total Surface Area (TSA)
                const volume = (1 / 3) * PI * h * (R * R + R * r + r * r);
                return { slantHeight, lateralSurfaceArea, surfaceArea, volume };
            }
            default:
                // Should not happen if selectedShape is always valid
                 console.error("Unknown shape selected:", shape);
                return null;
        }
    } catch (error) {
        console.error("Geometry calculation error:", error);
         return "An internal error occurred during calculation.";
    }
}

// --- Component ---

export default function GeometryPage() {
  const { toast } = useToast();

  // --- Geometry State ---
  const [selectedShape, setSelectedShape] = useState<Shape | ''>('');
  const [geometryInputs, setGeometryInputs] = useState<Record<string, string>>({});
  const [geometryResult, setGeometryResult] = useState<CalculationResult | null>(null);
  const [geometryError, setGeometryError] = useState<string | null>(null);


  // --- Geometry Logic ---
  const handleShapeChange = (value: string) => {
      if (value === '') {
          setSelectedShape('');
          setGeometryInputs({});
          setGeometryResult(null);
          setGeometryError(null);
          return;
      }
      const shape = value as Shape;
      setSelectedShape(shape);
      // Reset inputs specific to the new shape
      const config = shapeConfigs[shape];
      const initialInputs = config.inputs.reduce((acc, input) => {
          acc[input.name] = ''; // Initialize all inputs for the new shape as empty
          return acc;
        }, {} as Record<string, string>);
      setGeometryInputs(initialInputs);
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
    let missingRequiredInput = false;
    let parsedFieldCount = 0; // Count how many fields were successfully parsed

    // Special validation logic based on shape
    switch (selectedShape) {
        case 'triangle':
            const hasSides = geometryInputs['s1'] && geometryInputs['s2'] && geometryInputs['s3'];
            const hasBaseHeight = geometryInputs['base'] && geometryInputs['height'];
            if (!hasSides && !hasBaseHeight) {
                setGeometryError("For Triangle, provide either 3 sides (for perimeter & area) OR base and height (for area).");
                missingRequiredInput = true;
            }
            break;
        case 'trapezium':
            const hasAreaInputs = geometryInputs['b1'] && geometryInputs['b2'] && geometryInputs['h'];
            const hasPerimeterInputs = geometryInputs['b1'] && geometryInputs['b2'] && geometryInputs['s1'] && geometryInputs['s2'];
            if (!hasAreaInputs && !hasPerimeterInputs) {
                setGeometryError("For Trapezium, provide bases & height (for area) AND/OR bases & sides (for perimeter).");
                missingRequiredInput = true;
            }
            break;
        case 'rhombus':
            const hasDiagonals = geometryInputs['d1'] && geometryInputs['d2'];
            const hasSide = geometryInputs['a'];
            if (!hasDiagonals && !hasSide) {
                setGeometryError("For Rhombus, provide diagonals (for area) AND/OR side (for perimeter).");
                missingRequiredInput = true;
            }
            break;
        default:
             // Default: check if all mandatory inputs for the shape are provided
            for (const inputField of config.inputs) {
                // Skip optional fields for Triangle if the other set is provided
                if (selectedShape === 'triangle' && (inputField.name === 'base' || inputField.name === 'height') && geometryInputs['s1'] && geometryInputs['s2'] && geometryInputs['s3']) continue;
                if (selectedShape === 'triangle' && (inputField.name === 's1' || inputField.name === 's2' || inputField.name === 's3') && geometryInputs['base'] && geometryInputs['height']) continue;

                const value = geometryInputs[inputField.name];
                // Check if the field is required implicitly (i.e., not optional like triangle base/height/sides)
                const isRequired = !(
                     (selectedShape === 'triangle' && ['s1', 's2', 's3', 'base', 'height'].includes(inputField.name)) ||
                     (selectedShape === 'trapezium' && ['s1', 's2', 'h'].includes(inputField.name)) || // Allow calculating only perimeter or only area
                     (selectedShape === 'rhombus' && ['d1', 'd2', 'a'].includes(inputField.name)) // Allow calculating only perimeter or only area
                 );

                 // Specific check for trapezium: h is always required for area
                 if (selectedShape === 'trapezium' && inputField.name === 'h' && (value === undefined || value.trim() === '')) {
                      // If trying to calculate only perimeter, h is not strictly needed
                      if(!(geometryInputs['b1'] && geometryInputs['b2'] && geometryInputs['s1'] && geometryInputs['s2'])) {
                           // Only error if area *could* have been calculated but h is missing
                           if (geometryInputs['b1'] && geometryInputs['b2']) {
                             setGeometryError(`Missing height (h) required for area calculation.`);
                             missingRequiredInput = true;
                             break;
                           }
                      }
                 } else if (isRequired && (value === undefined || value.trim() === '')) {
                    setGeometryError(`Missing required input: ${inputField.label}.`);
                    missingRequiredInput = true;
                    break; // Stop checking once one is missing
                }
            }
    }


    if (missingRequiredInput) {
        validationError = true;
    } else {
        // Parse provided inputs to numbers, allowing for partial calculations (e.g., only perimeter)
        for (const inputField of config.inputs) {
            const value = geometryInputs[inputField.name];
            if (value !== undefined && value.trim() !== '') {
                const numValue = parseFloat(value);
                // Allow r=0 for frustum->cone, but generally require positive values
                if (isNaN(numValue) || (numValue <= 0 && !(selectedShape === 'frustum' && inputField.name === 'r' && numValue === 0))) {
                    setGeometryError(`Invalid or non-positive input for ${inputField.label}. Please enter a valid positive number (except r=0 for Frustum).`);
                    validationError = true;
                    break;
                }
                numericInputs[inputField.name] = numValue;
                parsedFieldCount++;
            } else {
                // Store NaN for fields that were not provided, but might be needed by some calculations
                numericInputs[inputField.name] = NaN;
            }
        }
    }

     // Ensure at least one calculation is possible with the parsed inputs
     if (!validationError && parsedFieldCount === 0) {
         setGeometryError("No valid inputs provided for calculation.");
         validationError = true;
     }


     if (validationError) {
      return;
    }

    const result = calculateGeometry(selectedShape, numericInputs);

    if (result === null) {
      setGeometryError("Calculation failed. Check inputs (positive values, consistent dimensions, avoid division by zero).");
    } else if (typeof result === 'string') {
        // Handle specific error messages from calculation function
        setGeometryError(result);
    } else {
        // Check if ANY result value is valid before declaring success
        const hasValidResult = Object.values(result).some(val => val !== undefined && !isNaN(val));
        if (hasValidResult) {
             setGeometryResult(result);
             toast({ title: "Calculation Success", description: `Calculated properties for ${config.label}.` });
        } else {
             setGeometryError("Could not calculate any properties with the provided inputs (check for potential issues like division by zero or invalid combinations).");
        }
    }
  };

  const currentShapeConfig = selectedShape ? shapeConfigs[selectedShape] : null;
  const currentResult = geometryResult; // Use a temporary variable for easier access in JSX

  return (
    <>

      <div className="space-y-12">
         <h1 className="text-3xl font-bold text-center">Geometry Calculator</h1>
         <p className="text-muted-foreground text-center">
            Select a shape, enter its dimensions, and calculate its properties.
         </p>

         {/* Geometry Calculator Section */}
         <Card className="shadow-lg rounded-lg max-w-3xl mx-auto">
            <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-primary">
                    <Shapes className="h-6 w-6" />
                    Shape Calculation
                 </CardTitle>
                 <CardDescription>Select a shape and enter its dimensions.</CardDescription>
            </CardHeader>
             <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="shape-select">Select Shape</Label>
                    <Select onValueChange={handleShapeChange} value={selectedShape}>
                        <SelectTrigger id="shape-select" className="w-full sm:w-[320px]">
                            <SelectValue placeholder="Choose a shape..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                             <SelectLabel>2D Shapes</SelectLabel>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="rectangle">Rectangle</SelectItem>
                            <SelectItem value="triangle">Triangle</SelectItem>
                            <SelectItem value="circle">Circle</SelectItem>
                            <SelectItem value="parallelogram">Parallelogram</SelectItem>
                            <SelectItem value="trapezium">Trapezium (Trapezoid)</SelectItem>
                            <SelectItem value="rhombus">Rhombus</SelectItem>
                            <SelectItem value="ellipse">Ellipse</SelectItem>
                            </SelectGroup>
                             <SelectSeparator />
                             <SelectGroup>
                             <SelectLabel>3D Shapes</SelectLabel>
                            <SelectItem value="cube">Cube</SelectItem>
                            <SelectItem value="cuboid">Cuboid</SelectItem>
                            <SelectItem value="sphere">Sphere</SelectItem>
                            <SelectItem value="cylinder">Cylinder</SelectItem>
                            <SelectItem value="cone">Cone</SelectItem>
                            <SelectItem value="hemisphere">Hemisphere</SelectItem>
                            <SelectItem value="pyramid">Pyramid (Square Base)</SelectItem>
                            <SelectItem value="frustum">Frustum of a Cone</SelectItem>
                             </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                 {currentShapeConfig && (
                    <form onSubmit={handleGeometryCalculate} className="space-y-4">
                        <h3 className="text-lg font-medium">Inputs for {currentShapeConfig.label}</h3>
                         {selectedShape === 'triangle' && <p className="text-xs text-muted-foreground">Requires 3 sides (s1,s2,s3) for Perimeter/Heron's Area OR Base and Height for standard Area.</p>}
                         {selectedShape === 'trapezium' && <p className="text-xs text-muted-foreground">Requires parallel bases (b1,b2) & height (h) for Area. Requires all 4 sides (b1,b2,s1,s2) for Perimeter.</p>}
                         {selectedShape === 'rhombus' && <p className="text-xs text-muted-foreground">Requires diagonals (d1,d2) for Area OR side (a) for Perimeter.</p>}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {currentShapeConfig.inputs.map((input) => (
                                <div key={input.name} className="space-y-1">
                                    <Label htmlFor={input.name}>{input.label} {input.unit ? `(${input.unit})` : ''}</Label>
                                    <Input
                                        id={input.name}
                                        name={input.name}
                                        type="number"
                                        step="any" // Allow decimals
                                        value={geometryInputs[input.name] ?? ''}
                                        onChange={handleGeometryInputChange}
                                        placeholder={`Enter ${input.label.toLowerCase()}`}
                                        // 'required' attribute handled by form validation logic
                                        min={input.name === 'r' && selectedShape === 'frustum' ? "0" : undefined} // Allow 0 only for frustum smaller radius
                                        aria-label={`Input for ${input.label}`}
                                        className="text-base sm:text-sm" // Adjust text size for consistency
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
                        <CalculatorIcon className="h-4 w-4" />
                        <AlertTitle>Input/Calculation Error</AlertTitle>
                        <AlertDescription>{geometryError}</AlertDescription>
                    </Alert>
                 )}

                 {currentResult && !geometryError && currentShapeConfig && (
                     <Alert variant="success" className="bg-secondary dark:bg-muted/30">
                        <CalculatorIcon className="h-4 w-4 text-primary" />
                        <AlertTitle className="text-primary">Results for {currentShapeConfig.label}</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                                {currentResult.perimeter !== undefined && !isNaN(currentResult.perimeter) && <li>Perimeter/Circumference: <code className="font-semibold">{currentResult.perimeter.toFixed(4)}</code></li>}
                                {currentResult.area !== undefined && !isNaN(currentResult.area) && <li>Area: <code className="font-semibold">{currentResult.area.toFixed(4)}</code></li>}
                                {currentResult.slantHeight !== undefined && !isNaN(currentResult.slantHeight) && <li>Slant Height (l): <code className="font-semibold">{currentResult.slantHeight.toFixed(4)}</code></li>}
                                {currentResult.lateralSurfaceArea !== undefined && !isNaN(currentResult.lateralSurfaceArea) && <li>Lateral Surface Area: <code className="font-semibold">{currentResult.lateralSurfaceArea.toFixed(4)}</code></li>}
                                {currentResult.surfaceArea !== undefined && !isNaN(currentResult.surfaceArea) && <li>Total Surface Area: <code className="font-semibold">{currentResult.surfaceArea.toFixed(4)}</code></li>}
                                {currentResult.volume !== undefined && !isNaN(currentResult.volume) && <li>Volume: <code className="font-semibold">{currentResult.volume.toFixed(4)}</code></li>}
                            </ul>
                             {/* Conditional Notes */}
                             {selectedShape === 'ellipse' && (currentResult.perimeter !== undefined && !isNaN(currentResult.perimeter)) && <p className="text-xs text-muted-foreground mt-2">Note: Ellipse circumference is an approximation.</p>}
                             {(selectedShape === 'triangle' && (currentResult.perimeter === undefined || isNaN(currentResult.perimeter))) && <p className="text-xs text-muted-foreground mt-2">Note: Perimeter requires all 3 side lengths (s1, s2, s3).</p>}
                             {(selectedShape === 'triangle' && (currentResult.area === undefined || isNaN(currentResult.area))) && <p className="text-xs text-muted-foreground mt-2">Note: Area requires either 3 sides (Heron's formula) or base and height.</p>}
                             {(selectedShape === 'trapezium' && (currentResult.perimeter === undefined || isNaN(currentResult.perimeter))) && <p className="text-xs text-muted-foreground mt-2">Note: Perimeter requires all 4 side lengths (b1, b2, s1, s2).</p>}
                             {(selectedShape === 'trapezium' && (currentResult.area === undefined || isNaN(currentResult.area))) && <p className="text-xs text-muted-foreground mt-2">Note: Area requires parallel bases (b1, b2) and height (h).</p>}
                             {(selectedShape === 'rhombus' && (currentResult.perimeter === undefined || isNaN(currentResult.perimeter))) && <p className="text-xs text-muted-foreground mt-2">Note: Perimeter requires the side length (a).</p>}
                             {(selectedShape === 'rhombus' && (currentResult.area === undefined || isNaN(currentResult.area))) && <p className="text-xs text-muted-foreground mt-2">Note: Area requires both diagonals (d1, d2).</p>}
                        </AlertDescription>
                    </Alert>
                 )}
             </CardContent>
         </Card>
      </div>
    </>
  );
}

