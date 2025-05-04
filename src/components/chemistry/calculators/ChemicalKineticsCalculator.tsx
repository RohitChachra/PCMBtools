
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
import { Calculator, Timer, Sigma } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { create, all, type MathJsStatic, type ConfigOptions } from 'mathjs';
import { cn } from '@/lib/utils';

const math = create(all, { number: 'BigNumber', precision: 10 } as ConfigOptions);

// Schema for First-Order Integrated Rate Law: ln([A]t) = -kt + ln([A]0)
// Or using log base 10: log([A]t) = -(kt/2.303) + log([A]0)
// Or solving for k: k = (ln([A]0) - ln([A]t)) / t
// Or solving for t: t = (ln([A]0) - ln([A]t)) / k
// Or solving for [A]t: [A]t = [A]0 * e^(-kt)
// Or solving for [A]0: [A]0 = [A]t / e^(-kt) = [A]t * e^(kt)

const firstOrderSchema = z.object({
    initial_conc: z.string().optional(), // [A]0
    final_conc: z.string().optional(),   // [A]t
    rate_constant: z.string().optional(), // k
    time: z.string().optional(),          // t
}).refine(data => Object.values(data).filter(v => v && v !== '').length === 3, {
    message: 'Provide exactly 3 values for First-Order calculation.',
    path: ['initial_conc']
}).refine(data => !data.initial_conc || (parseFloat(data.initial_conc) > 0), { message: "Initial concentration must be positive.", path: ['initial_conc'] })
  .refine(data => !data.final_conc || (parseFloat(data.final_conc) > 0), { message: "Final concentration must be positive.", path: ['final_conc'] })
  .refine(data => !data.rate_constant || (parseFloat(data.rate_constant) > 0), { message: "Rate constant (k) must be positive.", path: ['rate_constant'] })
  .refine(data => !data.time || (parseFloat(data.time) >= 0), { message: "Time (t) must be non-negative.", path: ['time'] })
  .refine(data => !(data.initial_conc && data.final_conc && parseFloat(data.final_conc) > parseFloat(data.initial_conc)), { message: "Final concentration cannot exceed initial concentration for first-order decay.", path: ['final_conc'] });


type FirstOrderFormData = z.infer<typeof firstOrderSchema>;

interface KineticsResult {
    value: string;
    label: string;
    unit: string;
}

export const ChemicalKineticsCalculator = () => {
    const [result, setResult] = useState<KineticsResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const { control, handleSubmit, formState: { errors } } = useForm<FirstOrderFormData>({
        resolver: zodResolver(firstOrderSchema),
        defaultValues: { initial_conc: '', final_conc: '', rate_constant: '', time: '' },
    });

    const onSubmit = (data: FirstOrderFormData) => {
        setError(null);
        setResult(null);

        try {
            const A0 = data.initial_conc ? math.bignumber(data.initial_conc) : null;
            const At = data.final_conc ? math.bignumber(data.final_conc) : null;
            const k = data.rate_constant ? math.bignumber(data.rate_constant) : null;
            const t = data.time ? math.bignumber(data.time) : null;

            let calculatedValue: math.BigNumber | null = null;
            let resultLabel = '';
            let resultUnit = '';

             // ln([A]t) = -kt + ln([A]0)

            if (!A0) { // Solve for [A]0 = [A]t * e^(kt)
                 if (!At || !k || t === null) throw new Error("Missing required inputs to calculate [A]0");
                 calculatedValue = math.multiply(At, math.exp(math.multiply(k, t)));
                 resultLabel = 'Initial Concentration ([A]₀)';
                 resultUnit = 'mol/L'; // Assuming Molarity
            } else if (!At) { // Solve for [A]t = [A]0 * e^(-kt)
                 if (!A0 || !k || t === null) throw new Error("Missing required inputs to calculate [A]t");
                 calculatedValue = math.multiply(A0, math.exp(math.unaryMinus(math.multiply(k, t))));
                resultLabel = 'Final Concentration ([A]t)';
                 resultUnit = 'mol/L';
            } else if (!k) { // Solve for k = (ln([A]0) - ln([A]t)) / t
                 if (!A0 || !At || t === null) throw new Error("Missing required inputs to calculate k");
                 if (math.equal(t, 0)) {
                     // If t=0, A0 should equal At. If they differ, it's inconsistent. If they are equal, k is indeterminate.
                     if (!math.equal(A0, At)) throw new Error("Inconsistent input: Concentrations differ at t=0.");
                     throw new Error("Cannot determine k when t=0 and concentrations are equal.");
                 }
                 if (math.smallerEq(At, 0) || math.smallerEq(A0, 0)) throw new Error("Concentrations must be positive for logarithm.");
                 calculatedValue = math.divide(math.subtract(math.log(A0), math.log(At)), t);
                 resultLabel = 'Rate Constant (k)';
                 resultUnit = '1/s'; // Assuming time is in seconds
            } else if (t === null) { // Solve for t = (ln([A]0) - ln([A]t)) / k
                 if (!A0 || !At || !k) throw new Error("Missing required inputs to calculate t");
                 if (math.equal(k, 0)) throw new Error("Rate constant k cannot be zero.");
                 if (math.smallerEq(At, 0) || math.smallerEq(A0, 0)) throw new Error("Concentrations must be positive for logarithm.");
                 if (math.larger(At, A0)) throw new Error("Final concentration cannot be greater than initial concentration."); // Already covered by schema refine, but good check
                 calculatedValue = math.divide(math.subtract(math.log(A0), math.log(At)), k);
                 resultLabel = 'Time (t)';
                 resultUnit = 's'; // Assuming k's unit implies seconds
            }

            if (calculatedValue !== null) {
                 // Check for non-positive results where applicable
                 if ((resultLabel.includes('Concentration') || resultLabel.includes('Constant')) && math.smallerEq(calculatedValue, 0)) {
                     throw new Error(`Calculated ${resultLabel} must be positive.`);
                 }
                 if (resultLabel.includes('Time') && math.smaller(calculatedValue, 0)) {
                    // This case implies At > A0, which should be caught earlier, but good fallback
                     throw new Error("Calculated time is negative, inconsistent inputs.");
                 }
                 const formattedResult = math.format(calculatedValue, { notation: 'fixed', precision: 5 }).replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1');
                 setResult({ value: formattedResult, label: resultLabel, unit: resultUnit });
                 toast({ title: "Calculation Success", description: `Calculated ${resultLabel}.` });
            } else {
                 throw new Error("Could not determine variable to calculate."); // Should be caught by schema
            }

        } catch (err: any) {
            setError(`Calculation failed: ${err.message}`);
            toast({ title: "Calculation Error", description: `Calculation failed: ${err.message}`, variant: "destructive" });
        }
    };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Use the First-Order Integrated Rate Law: ln([A]<sub>t</sub>) = -kt + ln([A]<sub>0</sub>). Provide any 3 values to calculate the 4th. Ensure units are consistent (e.g., mol/L, s, 1/s).
          </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-1">
                <Label htmlFor="initial_conc">Initial Concentration ([A]₀)</Label>
                <Controller name="initial_conc" control={control} render={({ field }) => <Input {...field} id="initial_conc" type="number" step="any" min="0.000001" placeholder="e.g., 0.1 M" className={cn(errors.initial_conc || errors.root?.message ? 'border-destructive' : '')}/>} />
                {errors.initial_conc && <p className="text-xs text-destructive">{errors.initial_conc.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="final_conc">Final Concentration ([A]<sub>t</sub>)</Label>
                <Controller name="final_conc" control={control} render={({ field }) => <Input {...field} id="final_conc" type="number" step="any" min="0.000001" placeholder="e.g., 0.05 M" className={cn(errors.final_conc || errors.root?.message ? 'border-destructive' : '')}/>} />
                 {errors.final_conc && <p className="text-xs text-destructive">{errors.final_conc.message}</p>}
             </div>
             <div className="space-y-1">
                <Label htmlFor="rate_constant">Rate Constant (k)</Label>
                <Controller name="rate_constant" control={control} render={({ field }) => <Input {...field} id="rate_constant" type="number" step="any" min="0.000001" placeholder="e.g., 0.01 (1/s)" className={cn(errors.rate_constant || errors.root?.message ? 'border-destructive' : '')}/>} />
                 {errors.rate_constant && <p className="text-xs text-destructive">{errors.rate_constant.message}</p>}
             </div>
             <div className="space-y-1">
                <Label htmlFor="time">Time (t)</Label>
                <Controller name="time" control={control} render={({ field }) => <Input {...field} id="time" type="number" step="any" min="0" placeholder="e.g., 60 (s)" className={cn(errors.time || errors.root?.message ? 'border-destructive' : '')}/>} />
                 {errors.time && <p className="text-xs text-destructive">{errors.time.message}</p>}
             </div>
              {errors.root && <p className="text-xs text-destructive col-span-1 sm:col-span-2">{errors.root.message}</p>}
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

        {result && !error && (
          <Alert variant="success" className="w-full">
             <Timer className="h-4 w-4 text-primary" />
             <AlertTitle className="text-primary">Calculation Result</AlertTitle>
             <AlertDescription>
                <p className="mt-2 text-sm font-semibold">
                    {result.label}: {result.value} {result.unit}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Based on first-order kinetics.</p>
             </AlertDescription>
          </Alert>
        )}
         <p className="text-xs text-muted-foreground">Rate law calculations (Rate = k[A]ᵐ[B]ⁿ) coming soon.</p>
      </CardFooter>
    </Card>
  );
};
