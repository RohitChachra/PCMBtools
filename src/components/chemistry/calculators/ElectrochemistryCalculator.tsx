
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
import { Calculator, BatteryCharging } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { create, all, type MathJsStatic, type ConfigOptions } from 'mathjs';
import { cn } from '@/lib/utils';

const math = create(all, { number: 'BigNumber', precision: 10 } as ConfigOptions);

// Nernst Equation: E_cell = E°_cell - (0.0592 / n) * log(Q) at 25°C
// Simplified for Q = [products]^p / [reactants]^r
// Assume simple reaction A + B -> C + D for Q calculation for now
// Q = [C]^c * [D]^d / ([A]^a * [B]^b)

const nernstSchema = z.object({
    e0_cell: z.string().refine(v => !isNaN(parseFloat(v)), { message: "E°cell must be a number." }),
    n_electrons: z.string().refine(v => Number.isInteger(Number(v)) && Number(v) > 0, { message: "n must be a positive integer." }),
    // Simplified Q calculation: Provide concentration/pressure for ONE product and ONE reactant
    // A more advanced version would need coefficients and all species concentrations/pressures
    product_conc: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, { message: "Concentration must be positive." }),
    reactant_conc: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, { message: "Concentration must be positive." }),
    // Optional Temperature (default 25°C = 298.15 K)
    // temperature_k: z.string().optional().refine(v => !v || (!isNaN(parseFloat(v)) && parseFloat(v) > 0), { message: "Temperature (K) must be positive." }),
});

type NernstFormData = z.infer<typeof nernstSchema>;

interface NernstResult {
    e_cell: string; // Resulting cell potential
}

const R = 8.314; // J/(mol·K)
const F = 96485; // C/mol (Faraday constant)
const TEMP_K = 298.15; // Standard temp 25°C in Kelvin

export const ElectrochemistryCalculator = () => {
    const [result, setResult] = useState<NernstResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const { control, handleSubmit, formState: { errors } } = useForm<NernstFormData>({
        resolver: zodResolver(nernstSchema),
        defaultValues: { e0_cell: '', n_electrons: '', product_conc: '', reactant_conc: '' },
    });

    const onSubmit = (data: NernstFormData) => {
        setError(null);
        setResult(null);

        try {
            const E0_cell = math.bignumber(data.e0_cell);
            const n = math.bignumber(data.n_electrons);
            const prod_conc = math.bignumber(data.product_conc);
            const react_conc = math.bignumber(data.reactant_conc);

             // Simplified Q = [Product]/[Reactant] (assuming coefficients are 1)
             const Q = math.divide(prod_conc, react_conc);

             if (math.smallerEq(Q, 0)) throw new Error("Reaction Quotient (Q) must be positive.");

             // Using Nernst Equation: E = E° - (RT/nF) * ln(Q)
             // At 25°C (298.15 K), RT/F ≈ 0.0257 V
             // E = E° - (0.0257 / n) * ln(Q)
             // Using log base 10: E = E° - (0.0592 / n) * log10(Q)

             // const factor = math.divide(math.multiply(R, TEMP_K), math.multiply(n, F)); // RT/nF
             // const lnQ = math.log(Q); // Natural log
             // const termToSubtract = math.multiply(factor, lnQ);

            // Using log10 version for simplicity (as shown in many textbooks)
            const log10Q = math.log10(Q);
            const factor_log10 = math.divide(0.05916, n); // Use 0.05916 for more precision
            const termToSubtract_log10 = math.multiply(factor_log10, log10Q);


            const E_cell = math.subtract(E0_cell, termToSubtract_log10);

            setResult({
                e_cell: math.format(E_cell, { notation: 'fixed', precision: 4 })
            });
            toast({ title: "Calculation Success", description: "Cell potential (Ecell) calculated using Nernst equation." });

        } catch (err: any) {
            setError(`Calculation failed: ${err.message}`);
            toast({ title: "Calculation Error", description: `Calculation failed: ${err.message}`, variant: "destructive" });
        }
    };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
         <p className="text-sm text-muted-foreground mb-4">
            Calculate cell potential (E<sub>cell</sub>) using the Nernst equation at 25°C.
            <br />
             Simplified Q = [Product]/[Reactant] (assumes coefficients are 1).
          </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-1">
                <Label htmlFor="e0_cell">Standard Cell Potential (E°<sub>cell</sub>)</Label>
                <Controller name="e0_cell" control={control} render={({ field }) => <Input {...field} id="e0_cell" type="number" step="any" placeholder="Enter E°cell (Volts)" className={cn(errors.e0_cell ? 'border-destructive' : '')}/>} />
                {errors.e0_cell && <p className="text-xs text-destructive">{errors.e0_cell.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="n_electrons">Number of Electrons Transferred (n)</Label>
                <Controller name="n_electrons" control={control} render={({ field }) => <Input {...field} id="n_electrons" type="number" step="1" min="1" placeholder="Enter n" className={cn(errors.n_electrons ? 'border-destructive' : '')}/>} />
                {errors.n_electrons && <p className="text-xs text-destructive">{errors.n_electrons.message}</p>}
              </div>
               <div className="space-y-1">
                <Label htmlFor="product_conc">Product Concentration/Pressure</Label>
                 <Controller name="product_conc" control={control} render={({ field }) => <Input {...field} id="product_conc" type="number" step="any" min="0.000001" placeholder="[Product] or P_Product" className={cn(errors.product_conc ? 'border-destructive' : '')}/>} />
                 {errors.product_conc && <p className="text-xs text-destructive">{errors.product_conc.message}</p>}
              </div>
               <div className="space-y-1">
                <Label htmlFor="reactant_conc">Reactant Concentration/Pressure</Label>
                <Controller name="reactant_conc" control={control} render={({ field }) => <Input {...field} id="reactant_conc" type="number" step="any" min="0.000001" placeholder="[Reactant] or P_Reactant" className={cn(errors.reactant_conc ? 'border-destructive' : '')}/>} />
                 {errors.reactant_conc && <p className="text-xs text-destructive">{errors.reactant_conc.message}</p>}
              </div>
              {/* Optional Temperature Input - Add later if needed */}
          </div>

          <Button type="submit" className="w-full sm:w-auto">Calculate E<sub>cell</sub></Button>
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
             <BatteryCharging className="h-4 w-4 text-primary" />
             <AlertTitle className="text-primary">Calculation Result</AlertTitle>
             <AlertDescription>
                <p className="mt-2 text-sm font-semibold">
                    Cell Potential (E<sub>cell</sub>): {result.e_cell} V
                </p>
                <p className="text-xs text-muted-foreground mt-1">Calculated using Nernst equation at 25°C (298.15 K).</p>
             </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
};

