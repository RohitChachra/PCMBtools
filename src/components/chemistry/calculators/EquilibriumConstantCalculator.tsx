'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Calculator, Scale } from 'lucide-react'; // Use Scale icon
import { useToast } from '@/hooks/use-toast';
import { create, all, type MathJsStatic, type ConfigOptions } from 'mathjs';
import { cn } from '@/lib/utils';

const math = create(all, { number: 'BigNumber', precision: 10 } as ConfigOptions);
const R_GAS_CONST = 0.08206; // Ideal gas constant L·atm/(mol·K) for Kp calculations

// Schema for Kc = [Products]^p / [Reactants]^r
// Simplified for A + B <=> C + D (all coefficients = 1)
const kcSchema = z.object({
    conc_C: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, { message: "Concentration must be non-negative." }),
    conc_D: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, { message: "Concentration must be non-negative." }),
    conc_A: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, { message: "Reactant concentration must be positive." }),
    conc_B: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, { message: "Reactant concentration must be positive." }),
});

type KcFormData = z.infer<typeof kcSchema>;

type CalcType = 'kc'; // Only Kc calculation remains

interface EquilibriumResult {
    type: CalcType;
    value: string;
}

export const EquilibriumConstantCalculator = () => {
    const [result, setResult] = useState<EquilibriumResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    // Only need the form hook for Kc calculation
    const kcForm = useForm<KcFormData>({
        resolver: zodResolver(kcSchema),
        defaultValues: { conc_C: '', conc_D: '', conc_A: '', conc_B: '' },
    });
    const { control, handleSubmit, formState: { errors } } = kcForm;

    const onSubmit = (data: KcFormData) => {
        setError(null);
        setResult(null);

        try {
            const C = math.bignumber(data.conc_C);
            const D = math.bignumber(data.conc_D);
            const A = math.bignumber(data.conc_A);
            const B = math.bignumber(data.conc_B);

            // Kc = ([C] * [D]) / ([A] * [B])
            const numerator = math.multiply(C, D);
            const denominator = math.multiply(A, B);

            if (math.equal(denominator, 0)) {
                throw new Error("Reactant concentrations cannot be zero.");
            }
            const calculatedValue = math.divide(numerator, denominator);
            if (math.smaller(calculatedValue, 0)) {
                throw new Error("Calculated Kc is negative, check inputs.");
            }

            const formattedValue = math.format(calculatedValue, { notation: 'fixed', precision: 4 }).replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1');
            setResult({
                type: 'kc',
                value: formattedValue
            });
            toast({ title: "Calculation Success", description: `Equilibrium constant (Kc) calculated.` });

        } catch (err: any) {
            setError(`Calculation failed: ${err.message}`);
            toast({ title: "Calculation Error", description: `Calculation failed: ${err.message}`, variant: "destructive" });
        }
    };


  return (
    <Card className="w-full">
      <CardContent className="pt-6">
         {/* Removed the Select component for calculation type */}
         <p className="text-sm text-muted-foreground mb-4">
                Calculate K<sub>c</sub> for <code className="font-mono">A + B ⇌ C + D</code>. Enter equilibrium concentrations (mol/L).
         </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             {/* Always render Kc form fields */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-1">
                     <Label htmlFor="conc_C">[C] (Product)</Label>
                     <Controller name="conc_C" control={control} render={({ field }) => <Input {...field} id="conc_C" type="number" step="any" min="0" placeholder="e.g., 0.5 M" className={cn(errors.conc_C ? 'border-destructive' : '')}/>} />
                     {errors.conc_C && <p className="text-xs text-destructive">{errors.conc_C.message}</p>}
                 </div>
                 <div className="space-y-1">
                     <Label htmlFor="conc_D">[D] (Product)</Label>
                     <Controller name="conc_D" control={control} render={({ field }) => <Input {...field} id="conc_D" type="number" step="any" min="0" placeholder="e.g., 0.5 M" className={cn(errors.conc_D ? 'border-destructive' : '')}/>} />
                      {errors.conc_D && <p className="text-xs text-destructive">{errors.conc_D.message}</p>}
                  </div>
                  <div className="space-y-1">
                     <Label htmlFor="conc_A">[A] (Reactant)</Label>
                     <Controller name="conc_A" control={control} render={({ field }) => <Input {...field} id="conc_A" type="number" step="any" min="0.000001" placeholder="e.g., 0.1 M" className={cn(errors.conc_A ? 'border-destructive' : '')}/>} />
                      {errors.conc_A && <p className="text-xs text-destructive">{errors.conc_A.message}</p>}
                  </div>
                  <div className="space-y-1">
                     <Label htmlFor="conc_B">[B] (Reactant)</Label>
                     <Controller name="conc_B" control={control} render={({ field }) => <Input {...field} id="conc_B" type="number" step="any" min="0.000001" placeholder="e.g., 0.1 M" className={cn(errors.conc_B ? 'border-destructive' : '')}/>} />
                      {errors.conc_B && <p className="text-xs text-destructive">{errors.conc_B.message}</p>}
                  </div>
             </div>

            <Button type="submit" className="w-full sm:w-auto">Calculate K<sub>c</sub></Button>
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
             <Scale className="h-4 w-4 text-primary" />
             <AlertTitle className="text-primary">Calculation Result</AlertTitle>
             <AlertDescription>
                <p className="mt-2 text-sm font-semibold">
                   Equilibrium Constant (K<sub>c</sub>): {result.value}
                </p>
                 <p className="text-xs text-muted-foreground mt-1">
                     K<sub>c</sub> is unitless in this context.
                 </p>
             </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
};

