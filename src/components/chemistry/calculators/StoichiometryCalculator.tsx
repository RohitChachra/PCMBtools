
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Calculator, FlaskConical, Scale as ScaleIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { create, all, type MathJsStatic, type ConfigOptions } from 'mathjs';
import { cn } from '@/lib/utils';
import { calculateMolarMass } from '@/lib/chemistry-utils';
import chemicalEquationBalancer from 'chemical-equation-balancer'; // Use default import

const math = create(all, { number: 'BigNumber', precision: 10 } as ConfigOptions);

const stoichiometrySchema = z.object({
    equation: z.string().min(1, 'Balanced chemical equation is required.'),
    knownSubstance: z.string().min(1, 'Known substance formula is required.'),
    knownQuantity: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, { message: 'Quantity must be positive.' }),
    knownUnit: z.enum(['grams', 'moles']),
    unknownSubstance: z.string().min(1, 'Unknown substance formula is required.'),
    desiredUnit: z.enum(['grams', 'moles']),
});

type StoichiometryFormData = z.infer<typeof stoichiometrySchema>;

interface ParsedEquation {
    reactants: { [formula: string]: number };
    products: { [formula: string]: number };
}

// Simple parser for balanced equations (e.g., "2H2 + O2 -> 2H2O")
// Assumes coefficients are integers and correctly placed. Does not validate balancing.
function parseBalancedEquation(equation: string): ParsedEquation | null {
    try {
        const [reactantsStr, productsStr] = equation.split('->');
        if (!reactantsStr || !productsStr) throw new Error("Invalid equation format (missing '->').");

        const parseSide = (sideStr: string): { [formula: string]: number } => {
            const parts = sideStr.trim().split('+');
            const sideMap: { [formula: string]: number } = {};
            parts.forEach(part => {
                part = part.trim();
                const match = part.match(/^(\d*)?\s*([A-Za-z0-9()]+)$/);
                if (!match) throw new Error(`Invalid term format: "${part}"`);
                const coefficient = parseInt(match[1] || '1', 10);
                const formula = match[2];
                if (isNaN(coefficient) || coefficient <= 0) throw new Error(`Invalid coefficient for ${formula}`);
                if (sideMap[formula]) throw new Error(`Formula ${formula} appears multiple times on the same side.`);
                sideMap[formula] = coefficient;
            });
            return sideMap;
        };

        return {
            reactants: parseSide(reactantsStr),
            products: parseSide(productsStr),
        };
    } catch (error: any) {
        console.error("Equation parsing error:", error.message);
        return null;
    }
}


export const StoichiometryCalculator = () => {
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [balancedEquation, setBalancedEquation] = useState<string>('');
    const { toast } = useToast();

    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<StoichiometryFormData>({
        resolver: zodResolver(stoichiometrySchema),
        defaultValues: { equation: '', knownSubstance: '', knownQuantity: '', knownUnit: 'grams', unknownSubstance: '', desiredUnit: 'grams' },
    });

    const rawEquation = watch('equation');

    // Auto-balance equation effect
    useEffect(() => {
        if (rawEquation && rawEquation.includes('->')) {
            try {
                // Check if equation looks roughly balanced first (sum of coeffs might be equal by chance)
                const parsedRaw = parseBalancedEquation(rawEquation);
                // If parsing fails or looks unbalanced, try balancing
                 // Only attempt balancing if it contains reactants and products separated by '->'
                const balanced = chemicalEquationBalancer.balance(rawEquation);
                if (balanced && typeof balanced === 'string') {
                    setValue('equation', balanced); // Update form value with balanced equation
                    setBalancedEquation(balanced); // Also update state for display/confirmation
                     setError(null); // Clear any previous balancing errors
                } else if (balanced === false) {
                    setError("Failed to balance the equation automatically. Please provide a balanced equation or check the format (e.g., H2 + O2 -> H2O).");
                    setBalancedEquation('');
                }
                 // Handle cases where the balancer might return non-string (though unlikely based on docs)
                 else if(balanced !== rawEquation) {
                      setError("Equation balancer returned an unexpected result. Please provide a balanced equation.");
                      setBalancedEquation('');
                 } else {
                     // If balancer returns the same string, assume it was already balanced or couldn't be balanced further.
                     // Validate the *raw* input in this case during submission.
                     setBalancedEquation(rawEquation); // Keep the raw equation for now
                      setError(null); // Clear error if it looked okay
                 }

            } catch (e: any) {
                setError(`Equation balancing error: ${e.message}. Please provide a balanced equation.`);
                setBalancedEquation('');
            }
        } else {
            // Clear balanced equation if raw input is invalid/incomplete
             setBalancedEquation('');
             if (rawEquation.trim() !== '') { // Only show error if user typed something that's not an equation
                 // setError("Invalid equation format. Use '->' to separate reactants and products.");
             } else {
                 setError(null); // Clear error if input is empty
             }
        }
    }, [rawEquation, setValue]);

    const onSubmit = (data: StoichiometryFormData) => {
        setError(null);
        setResult(null);

        try {
             // Use the potentially auto-balanced equation from state/form for parsing
             const equationToParse = data.equation;
             const parsedEq = parseBalancedEquation(equationToParse);
             if (!parsedEq) {
                 throw new Error("Invalid or unbalanced equation provided. Please ensure it's balanced and correctly formatted (e.g., 2H2 + O2 -> 2H2O).");
             }

            const knownFormula = data.knownSubstance;
            const unknownFormula = data.unknownSubstance;
            const knownQty = math.bignumber(data.knownQuantity);

             // Find coefficients
             const allSubstances = { ...parsedEq.reactants, ...parsedEq.products };
             const knownCoeff = allSubstances[knownFormula];
             const unknownCoeff = allSubstances[unknownFormula];

             if (!knownCoeff) throw new Error(`Known substance "${knownFormula}" not found in the equation.`);
             if (!unknownCoeff) throw new Error(`Unknown substance "${unknownFormula}" not found in the equation.`);

            // Calculate known moles
            let knownMoles: math.BigNumber;
            if (data.knownUnit === 'grams') {
                const knownMolarMass = calculateMolarMass(knownFormula);
                if (!knownMolarMass) throw new Error(`Could not calculate molar mass for known substance: ${knownFormula}`);
                 knownMoles = math.divide(knownQty, math.bignumber(knownMolarMass));
            } else {
                knownMoles = knownQty;
            }

            if (math.smallerEq(knownMoles, 0)) throw new Error("Known quantity must result in positive moles.");


            // Calculate unknown moles using mole ratio
            const unknownMoles = math.multiply(knownMoles, math.divide(math.bignumber(unknownCoeff), math.bignumber(knownCoeff)));

            // Calculate desired quantity
            let finalResult: math.BigNumber;
            let resultUnit = '';
            if (data.desiredUnit === 'grams') {
                const unknownMolarMass = calculateMolarMass(unknownFormula);
                if (!unknownMolarMass) throw new Error(`Could not calculate molar mass for unknown substance: ${unknownFormula}`);
                finalResult = math.multiply(unknownMoles, math.bignumber(unknownMolarMass));
                resultUnit = 'g';
            } else {
                finalResult = unknownMoles;
                resultUnit = 'mol';
            }

             if (math.smallerEq(finalResult, 0)) throw new Error("Calculation resulted in non-positive amount.");

             const formattedResult = math.format(finalResult, { notation: 'fixed', precision: 5 }).replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1');
             setResult(`${formattedResult} ${resultUnit} of ${unknownFormula}`);
            toast({ title: "Calculation Success", description: `Calculated amount of ${unknownFormula}.` });

        } catch (err: any) {
            setError(`Calculation failed: ${err.message}`);
            toast({ title: "Calculation Error", description: `Calculation failed: ${err.message}`, variant: "destructive" });
        }
    };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
         <p className="text-sm text-muted-foreground mb-4">
            Enter a chemical equation (will attempt auto-balancing), the formula and amount (grams or moles) of one substance, and the formula of the substance you want to find.
          </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Equation Input */}
          <div className="space-y-1">
            <Label htmlFor="equation">Balanced Chemical Equation</Label>
            <Controller name="equation" control={control} render={({ field }) => <Input {...field} id="equation" placeholder="e.g., 2H2 + O2 -> 2H2O" className={cn(errors.equation ? 'border-destructive' : '')} />} />
             {balancedEquation && balancedEquation !== rawEquation && (
                <p className="text-xs text-green-600 dark:text-green-400">Auto-balanced: {balancedEquation}</p>
            )}
            {errors.equation && <p className="text-xs text-destructive">{errors.equation.message}</p>}
          </div>

          {/* Known Substance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="knownSubstance">Known Substance Formula</Label>
                <Controller name="knownSubstance" control={control} render={({ field }) => <Input {...field} id="knownSubstance" placeholder="e.g., H2" className={cn(errors.knownSubstance ? 'border-destructive' : '')} />} />
                {errors.knownSubstance && <p className="text-xs text-destructive">{errors.knownSubstance.message}</p>}
            </div>
            <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="knownQuantity">Known Quantity</Label>
                <Controller name="knownQuantity" control={control} render={({ field }) => <Input {...field} id="knownQuantity" type="number" step="any" min="0.000001" placeholder="Enter amount" className={cn(errors.knownQuantity ? 'border-destructive' : '')} />} />
                {errors.knownQuantity && <p className="text-xs text-destructive">{errors.knownQuantity.message}</p>}
            </div>
            <div className="space-y-1 sm:col-span-1">
                 <Label htmlFor="knownUnit">Known Unit</Label>
                 <Controller
                    name="knownUnit"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="knownUnit">
                                <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="grams">Grams (g)</SelectItem>
                                <SelectItem value="moles">Moles (mol)</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
          </div>

            {/* Unknown Substance */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="unknownSubstance">Unknown Substance Formula</Label>
                    <Controller name="unknownSubstance" control={control} render={({ field }) => <Input {...field} id="unknownSubstance" placeholder="e.g., H2O" className={cn(errors.unknownSubstance ? 'border-destructive' : '')} />} />
                    {errors.unknownSubstance && <p className="text-xs text-destructive">{errors.unknownSubstance.message}</p>}
                </div>
                <div className="space-y-1">
                    <Label htmlFor="desiredUnit">Desired Unit for Unknown</Label>
                    <Controller
                        name="desiredUnit"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="desiredUnit">
                                    <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="grams">Grams (g)</SelectItem>
                                    <SelectItem value="moles">Moles (mol)</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
           </div>


          <Button type="submit" className="w-full sm:w-auto">Calculate Stoichiometry</Button>
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

        {result && !error && (
          <Alert variant="success" className="w-full">
             <ScaleIcon className="h-4 w-4 text-primary" />
             <AlertTitle className="text-primary">Calculation Result</AlertTitle>
             <AlertDescription>
                <p className="mt-2 text-sm font-semibold">
                    {result}
                </p>
             </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
};
