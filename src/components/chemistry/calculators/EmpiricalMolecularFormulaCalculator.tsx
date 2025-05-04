
'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Calculator, Atom, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { create, all, type MathJsStatic, type ConfigOptions } from 'mathjs';
import { cn } from '@/lib/utils';
import { calculateMolarMass } from '@/lib/chemistry-utils'; // Use your existing molar mass calculator

const math = create(all, { number: 'BigNumber', precision: 10 } as ConfigOptions);

// Common atomic weights (subset for example)
const atomicWeights: { [key: string]: number } = {
    'H': 1.008, 'C': 12.011, 'N': 14.007, 'O': 15.999, 'S': 32.06, 'Cl': 35.45,
    'Na': 22.990, 'Mg': 24.305, 'P': 30.974, 'K': 39.098, 'Ca': 40.078, 'Fe': 55.845,
     // Add more as needed
};


const elementSchema = z.object({
    symbol: z.string().min(1, "Symbol required").refine(s => atomicWeights[s], { message: "Unsupported element" }),
    percentage: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0 && parseFloat(v) <= 100, { message: "Must be > 0 and <= 100" }),
});

const formulaSchema = z.object({
    elements: z.array(elementSchema).min(1, "At least one element required."),
    molecularMass: z.string().optional().refine(v => !v || (!isNaN(parseFloat(v)) && parseFloat(v) > 0), { message: "Molar mass must be positive" })
}).refine(data => {
    const totalPercentage = data.elements.reduce((sum, el) => sum + parseFloat(el.percentage || '0'), 0);
    // Allow small tolerance for floating point issues
    return Math.abs(totalPercentage - 100) < 0.1;
}, {
    message: "Percentages must add up to approximately 100%.",
    path: ['elements'], // Assign error generally to the array
});

type FormulaFormData = z.infer<typeof formulaSchema>;

interface FormulaResults {
    empiricalFormula: string;
    empiricalMass: number;
    molecularFormula?: string;
    ratioN?: number;
}

// Greatest Common Divisor function
function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

export const EmpiricalMolecularFormulaCalculator = () => {
    const [results, setResults] = useState<FormulaResults | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const { control, handleSubmit, formState: { errors } } = useForm<FormulaFormData>({
        resolver: zodResolver(formulaSchema),
        defaultValues: { elements: [{ symbol: '', percentage: '' }], molecularMass: '' },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "elements" });

    const onSubmit = (data: FormulaFormData) => {
        setError(null);
        setResults(null);

        try {
            // Step 1: Assume 100g sample, convert % to grams
            // Step 2: Convert grams to moles for each element
            const moles: { [symbol: string]: math.BigNumber } = {};
            data.elements.forEach(el => {
                const mass = math.bignumber(el.percentage);
                const atomicWeight = math.bignumber(atomicWeights[el.symbol]);
                moles[el.symbol] = math.divide(mass, atomicWeight);
            });

            // Step 3: Find the smallest mole value
            const moleValues = Object.values(moles);
            if (moleValues.length === 0) throw new Error("No elements provided.");
            let smallestMole = moleValues[0];
            moleValues.forEach(m => {
                if (math.smaller(m, smallestMole)) {
                    smallestMole = m;
                }
            });

             if (math.equal(smallestMole, 0)) throw new Error("Cannot divide by zero moles.");


            // Step 4: Divide all mole values by the smallest value to get ratios
            const ratios: { [symbol: string]: number } = {};
            let needsMultiplying = false;
            Object.keys(moles).forEach(symbol => {
                 const ratioNum = math.number(math.divide(moles[symbol], smallestMole));
                 // Check if ratio is close to an integer or simple fraction
                const roundedRatio = Math.round(ratioNum * 100) / 100; // Round to 2 decimal places for checking
                 ratios[symbol] = roundedRatio;
                 // If not close to an integer, may need multiplication later (simplified check)
                 if (Math.abs(roundedRatio - Math.round(roundedRatio)) > 0.1) {
                      needsMultiplying = true;
                 }
            });

            // Step 5: (Simplified) If ratios aren't whole numbers, try multiplying by small integers
            // A more robust solution would handle fractions like 1.33, 1.5, 1.67 etc.
             // This is a basic attempt, may fail for complex ratios
             let multiplier = 1;
             if (needsMultiplying) {
                 for (let m = 2; m <= 4; m++) { // Try multiplying by 2, 3, 4
                     let allIntegers = true;
                     Object.values(ratios).forEach(r => {
                         if (Math.abs((r * m) - Math.round(r * m)) > 0.1) {
                             allIntegers = false;
                         }
                     });
                     if (allIntegers) {
                         multiplier = m;
                         break;
                     }
                 }
             }

            // Step 6: Round to nearest whole number and construct empirical formula
            let empiricalFormula = '';
            const empiricalCounts: { [symbol: string]: number } = {};
            Object.keys(ratios).sort().forEach(symbol => {
                const count = Math.round(ratios[symbol] * multiplier);
                empiricalCounts[symbol] = count;
                empiricalFormula += symbol + (count > 1 ? count : '');
            });

             // Step 7: Calculate empirical formula mass
             let empiricalMass = 0;
              Object.keys(empiricalCounts).forEach(symbol => {
                 empiricalMass += atomicWeights[symbol] * empiricalCounts[symbol];
             });

             const resultData: FormulaResults = {
                 empiricalFormula,
                 empiricalMass: parseFloat(empiricalMass.toFixed(4)) // Format
             };

            // Step 8: Calculate molecular formula if molecular mass is given
            if (data.molecularMass) {
                const molecularMassVal = parseFloat(data.molecularMass);
                const ratioN = Math.round(molecularMassVal / empiricalMass);
                 resultData.ratioN = ratioN;

                if (Math.abs(ratioN - (molecularMassVal / empiricalMass)) > 0.1) { // Check if ratio is reasonably integer
                    setError("Molecular mass is not a likely multiple of the empirical formula mass.");
                     // Still show empirical results
                } else {
                     let molecularFormula = '';
                     Object.keys(empiricalCounts).sort().forEach(symbol => {
                         const count = empiricalCounts[symbol] * ratioN;
                         molecularFormula += symbol + (count > 1 ? count : '');
                     });
                     resultData.molecularFormula = molecularFormula;
                }
            }


            setResults(resultData);
            toast({ title: "Calculation Success", description: "Empirical/Molecular formula determined." });

        } catch (err: any) {
            setError(`Calculation failed: ${err.message}`);
            toast({ title: "Calculation Error", description: `Calculation failed: ${err.message}`, variant: "destructive" });
        }
    };

     // Format numbers
     const formatNumber = (num: number | undefined): string => {
         if (num === undefined || isNaN(num)) return 'N/A';
         return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
     };


  return (
    <Card className="w-full">
      <CardContent className="pt-6">
         <p className="text-sm text-muted-foreground mb-4">
            Enter the percentage composition of each element. Percentages should add up to ~100%. Optionally provide the molar mass of the compound to find the molecular formula.
          </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Element Inputs */}
           <div className="space-y-2">
                <Label>Element Composition (%)</Label>
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <Controller name={`elements.${index}.symbol`} control={control} render={({ field: controllerField }) => <Input {...controllerField} placeholder="Symbol (e.g., C)" className={cn("w-24", errors.elements?.[index]?.symbol ? 'border-destructive' : '')} />} />
                        <Controller name={`elements.${index}.percentage`} control={control} render={({ field: controllerField }) => <Input {...controllerField} type="number" step="any" placeholder="Percentage" className={cn("flex-grow", errors.elements?.[index]?.percentage ? 'border-destructive' : '')} />} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => fields.length > 1 && remove(index)} disabled={fields.length <= 1}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                 ))}
                 {errors.elements?.root?.message && <p className="text-xs text-destructive">{errors.elements.root.message}</p>}
                 {(errors.elements as any)?.message && <p className="text-xs text-destructive">{(errors.elements as any).message}</p>}
                 {/* Display individual field errors if needed */}
                 {fields.map((_, index) => (
                    <React.Fragment key={index}>
                        {errors.elements?.[index]?.symbol && <p className="text-xs text-destructive pl-2">{errors.elements[index]?.symbol?.message}</p>}
                        {errors.elements?.[index]?.percentage && <p className="text-xs text-destructive pl-2">{errors.elements[index]?.percentage?.message}</p>}
                    </React.Fragment>
                 ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ symbol: '', percentage: '' })} className="mt-2">
                     <Plus className="h-4 w-4 mr-1" /> Add Element
                </Button>
           </div>

           {/* Molecular Mass Input (Optional) */}
            <div className="space-y-1">
              <Label htmlFor="molecularMass">Molar Mass (g/mol) - Optional</Label>
              <Controller name="molecularMass" control={control} render={({ field }) => <Input {...field} id="molecularMass" type="number" step="any" min="0.001" placeholder="Enter molar mass if known" className={cn(errors.molecularMass ? 'border-destructive' : '')}/>} />
                {errors.molecularMass && <p className="text-xs text-destructive">{errors.molecularMass.message}</p>}
            </div>


          <Button type="submit" className="w-full sm:w-auto">Calculate Formulas</Button>
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
             <Atom className="h-4 w-4 text-primary" />
             <AlertTitle className="text-primary">Calculation Results</AlertTitle>
             <AlertDescription>
                 <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                    <li>Empirical Formula: <code className="font-semibold">{results.empiricalFormula}</code></li>
                    <li>Empirical Formula Mass: <code className="font-semibold">{formatNumber(results.empiricalMass)} g/mol</code></li>
                    {results.molecularFormula && (
                        <li>Molecular Formula: <code className="font-semibold">{results.molecularFormula}</code></li>
                    )}
                    {results.ratioN !== undefined && (
                         <li>Ratio (Molecular Mass / Empirical Mass): <code className="font-semibold">≈ {results.ratioN}</code></li>
                    )}
                </ul>
             </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
};

