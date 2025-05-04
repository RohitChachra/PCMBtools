
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Calculator, FlaskConical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { calculateMolarMass } from '@/lib/chemistry-utils'; // Import the new utility function

// Constants
const Avogadro = 6.02214076e23; // particles/mol
const MolarVolumeSTP = 22.4; // L/mol

const moleSchema = z.object({
  formula: z.string().min(1, 'Chemical formula is required.'),
  mass: z.string().optional(),
  moles: z.string().optional(),
  particles: z.string().optional(),
  volume: z.string().optional(),
}).refine(data => {
    // Ensure at least one quantity is provided
    const quantities = [data.mass, data.moles, data.particles, data.volume];
    return quantities.some(q => q !== undefined && q !== '');
}, {
    message: 'Please provide at least one quantity (mass, moles, particles, or volume).',
    path: ['mass'], // Assign error to one field for display, though it applies globally
}).refine(data => {
    // Ensure only one quantity is provided
    const quantities = [data.mass, data.moles, data.particles, data.volume];
    const providedCount = quantities.filter(q => q !== undefined && q !== '').length;
    return providedCount <= 1;
}, {
    message: 'Please provide only one quantity to calculate from.',
    path: ['mass'], // Assign error to one field
});


type MoleFormData = z.infer<typeof moleSchema>;

interface MoleResults {
  molarMass?: number;
  mass?: number;
  moles?: number;
  particles?: number;
  volume?: number;
}

export const MoleConceptCalculator = () => {
  const [results, setResults] = useState<MoleResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<MoleFormData>({
    resolver: zodResolver(moleSchema),
    defaultValues: {
      formula: '',
      mass: '',
      moles: '',
      particles: '',
      volume: '',
    },
  });

  const formula = watch('formula');
  const mass = watch('mass');
  const moles = watch('moles');
  const particles = watch('particles');
  const volume = watch('volume');

  const onSubmit = (data: MoleFormData) => {
    setError(null);
    setResults(null);

    // Use the new utility function
    const molarMass = calculateMolarMass(data.formula);

    if (molarMass === null) {
        setError('Invalid chemical formula or unable to calculate molar mass. Check the formula and ensure elements are supported.');
        toast({ title: "Error", description: "Invalid formula or molar mass calculation failed.", variant: "destructive" });
        return;
    }

    const inputValues = {
      mass: data.mass ? parseFloat(data.mass) : NaN,
      moles: data.moles ? parseFloat(data.moles) : NaN,
      particles: data.particles ? parseFloat(data.particles) : NaN,
      volume: data.volume ? parseFloat(data.volume) : NaN,
    };

    const validInputs = Object.entries(inputValues).filter(([_, v]) => !isNaN(v));

    // Validation should be handled by Zod schema, but double-check just in case
     if (validInputs.length !== 1) {
       // This should ideally be caught by the Zod schema refinements
       setError('Error: Exactly one input quantity (mass, moles, particles, or volume) must be provided.');
       return;
     }

    const [inputType, inputValue] = validInputs[0];

    if (inputValue < 0) {
        setError(`Input value for ${inputType} cannot be negative.`);
        toast({ title: "Input Error", description: `Input value for ${inputType} cannot be negative.`, variant: "destructive" });
        return;
    }


    let calculatedMoles: number | undefined;

    try {
      switch (inputType) {
        case 'mass':
          calculatedMoles = inputValue / molarMass;
          break;
        case 'moles':
          calculatedMoles = inputValue;
          break;
        case 'particles':
          calculatedMoles = inputValue / Avogadro;
          break;
        case 'volume':
           if (inputValue === 0 && calculatedMoles === undefined) {
             calculatedMoles = 0; // Handle 0 volume input correctly
           } else if (inputValue > 0) {
             calculatedMoles = inputValue / MolarVolumeSTP;
           } else {
                // Should have been caught by inputValue < 0 check, but good fallback
               throw new Error('Volume cannot be negative.');
           }
          break;
        default:
          // Should not happen if validation works
          throw new Error('Invalid input type detected.');
      }

      // Check for valid calculated moles
      if (calculatedMoles === undefined || isNaN(calculatedMoles) || calculatedMoles < 0) {
        // If input was 0, moles should be 0. Only throw if it's truly invalid.
        if (!(inputValue === 0 && calculatedMoles === 0)) {
             throw new Error('Calculation resulted in invalid or negative moles.');
        }
      }


      const calculatedMass = calculatedMoles * molarMass;
      const calculatedParticles = calculatedMoles * Avogadro;
      const calculatedVolume = calculatedMoles * MolarVolumeSTP;

      setResults({
        molarMass,
        moles: calculatedMoles,
        mass: calculatedMass,
        particles: calculatedParticles,
        volume: calculatedVolume,
      });

      toast({ title: "Calculation Success", description: "Mole concept values calculated." });

    } catch (err: any) {
      setError(`Calculation failed: ${err.message}`);
      toast({ title: "Calculation Error", description: `Calculation failed: ${err.message}`, variant: "destructive" });
    }
  };

   // Helper to format numbers, especially large or small ones
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null || isNaN(num)) return 'N/A';
    if (num === 0) return '0';
    // Use scientific notation for very large or very small non-zero numbers
    if ((Math.abs(num) >= 1e10 || Math.abs(num) <= 1e-5) && num !== 0) {
      return num.toExponential(4);
    }
    // Use locale string with limited precision for others
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };


  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Formula Input */}
          <div className="space-y-1">
            <Label htmlFor="formula">Chemical Formula</Label>
            <Controller
              name="formula"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="formula"
                  placeholder="e.g., H2O, NaCl, C6H12O6"
                  className={errors.formula ? 'border-destructive' : ''}
                />
              )}
            />
            {errors.formula && <p className="text-xs text-destructive">{errors.formula.message}</p>}
             {/* Display Zod refinement errors */}
             {errors.mass && errors.mass.type === 'custom' && <p className="text-xs text-destructive">{errors.mass.message}</p>}
          </div>

          {/* Quantity Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="mass">Mass (g)</Label>
              <Controller
                name="mass"
                control={control}
                render={({ field }) => (
                  <Input {...field} id="mass" type="number" step="any" min="0" placeholder="Enter mass" disabled={!!moles || !!particles || !!volume} />
                )}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="moles">Moles (mol)</Label>
              <Controller
                name="moles"
                control={control}
                render={({ field }) => (
                  <Input {...field} id="moles" type="number" step="any" min="0" placeholder="Enter moles" disabled={!!mass || !!particles || !!volume} />
                )}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="particles">Particles</Label>
              <Controller
                name="particles"
                control={control}
                render={({ field }) => (
                  <Input {...field} id="particles" type="number" step="any" min="0" placeholder="Enter no. of particles" disabled={!!mass || !!moles || !!volume} />
                )}
              />
               <p className="text-xs text-muted-foreground">Atoms, molecules, ions, etc.</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="volume">Volume (L at STP)</Label>
              <Controller
                name="volume"
                control={control}
                render={({ field }) => (
                  <Input {...field} id="volume" type="number" step="any" min="0" placeholder="Enter volume" disabled={!!mass || !!moles || !!particles} />
                )}
              />
               <p className="text-xs text-muted-foreground">STP = 0°C (273.15 K) and 1 atm</p>
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto">Calculate</Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col items-start space-y-4 pt-4">
        {error && (
          <Alert variant="destructive" className="w-full">
            <Calculator className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && !error && (
          <Alert variant="success" className="w-full">
             <FlaskConical className="h-4 w-4 text-primary" />
             <AlertTitle className="text-primary">Calculation Results for {formula}</AlertTitle>
             <AlertDescription>
                <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                    <li>Molar Mass (M): <code className="font-semibold">{formatNumber(results.molarMass)} g/mol</code></li>
                    <li>Moles (n): <code className="font-semibold">{formatNumber(results.moles)} mol</code></li>
                    <li>Mass (m): <code className="font-semibold">{formatNumber(results.mass)} g</code></li>
                    <li>Particles (N): <code className="font-semibold">{formatNumber(results.particles)} particles</code></li>
                    <li>Volume (V at STP): <code className="font-semibold">{formatNumber(results.volume)} L</code></li>
                </ul>
                 <p className="text-xs text-muted-foreground mt-3">Based on Avogadro's number ≈ {Avogadro.toExponential(4)} particles/mol and Molar Volume ≈ {MolarVolumeSTP} L/mol at STP.</p>
             </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
};
