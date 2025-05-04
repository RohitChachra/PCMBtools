
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
import { Calculator, Timer, Sigma, Percent } from 'lucide-react'; // Added Percent icon
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Added import
import { create, all, type MathJsStatic, type ConfigOptions } from 'mathjs';
import { cn } from '@/lib/utils';

const math = create(all, { number: 'BigNumber', precision: 10 } as ConfigOptions);

// --- Schemas ---

// Schema 1: First-Order Integrated Rate Law: ln([A]t) = -kt + ln([A]0)
const firstOrderSchema = z.object({
    initial_conc: z.string().optional(), // [A]0
    final_conc: z.string().optional(),   // [A]t
    rate_constant: z.string().optional(), // k
    time: z.string().optional(),          // t
}).refine(data => Object.values(data).filter(v => v && v !== '').length === 3, {
    message: 'Provide exactly 3 values for First-Order calculation.',
    path: ['initial_conc'] // Assign error to one field for context
}).refine(data => !data.initial_conc || (parseFloat(data.initial_conc) > 0), { message: "Initial concentration must be positive.", path: ['initial_conc'] })
  .refine(data => !data.final_conc || (parseFloat(data.final_conc) > 0), { message: "Final concentration must be positive.", path: ['final_conc'] })
  .refine(data => !data.rate_constant || (parseFloat(data.rate_constant) > 0), { message: "Rate constant (k) must be positive.", path: ['rate_constant'] })
  .refine(data => !data.time || (parseFloat(data.time) >= 0), { message: "Time (t) must be non-negative.", path: ['time'] })
  .refine(data => !(data.initial_conc && data.final_conc && parseFloat(data.final_conc) > parseFloat(data.initial_conc)), { message: "Final concentration cannot exceed initial concentration for first-order decay.", path: ['final_conc'] });

type FirstOrderFormData = z.infer<typeof firstOrderSchema>;

// Schema 2: Rate Law: Rate = k[A]ᵐ[B]ⁿ
const rateLawSchema = z.object({
    k_rate: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, { message: "Rate constant (k) must be positive." }),
    conc_A: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, { message: "Concentration [A] must be non-negative." }),
    order_m: z.string().refine(v => !isNaN(parseFloat(v)), { message: "Order (m) must be a number." }), // Order can be 0, fractional, or negative
    conc_B: z.string().optional().refine(v => !v || (!isNaN(parseFloat(v)) && parseFloat(v) >= 0), { message: "Concentration [B] must be non-negative." }), // Optional second reactant
    order_n: z.string().optional().refine(v => !v || !isNaN(parseFloat(v)), { message: "Order (n) must be a number." }), // Optional second order
}).refine(data => !!data.conc_B === !!data.order_n, { // If conc_B is provided, order_n must also be provided, and vice-versa
    message: "Provide both concentration and order for reactant B, or neither.",
    path: ['conc_B'] // Assign error to one field
});

type RateLawFormData = z.infer<typeof rateLawSchema>;

type CalcType = 'firstOrder' | 'rateLaw';

interface KineticsResult {
    value: string;
    label: string;
    unit: string;
}

export const ChemicalKineticsCalculator = () => {
    const [calcType, setCalcType] = useState<CalcType>('firstOrder');
    const [result, setResult] = useState<KineticsResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    // Form hooks for each calculation type
    const firstOrderForm = useForm<FirstOrderFormData>({
        resolver: zodResolver(firstOrderSchema),
        defaultValues: { initial_conc: '', final_conc: '', rate_constant: '', time: '' },
    });

    const rateLawForm = useForm<RateLawFormData>({
        resolver: zodResolver(rateLawSchema),
        defaultValues: { k_rate: '', conc_A: '', order_m: '', conc_B: '', order_n: '' },
    });

    // Get the active form based on calcType
    const activeForm = calcType === 'firstOrder' ? firstOrderForm : rateLawForm;
    const { control, handleSubmit, formState: { errors } } = activeForm;

    const handleCalcTypeChange = (value: CalcType) => {
        setCalcType(value);
        setResult(null); // Clear results and errors when changing type
        setError(null);
        firstOrderForm.reset(); // Reset forms
        rateLawForm.reset();
    };


    const onSubmitFirstOrder = (data: FirstOrderFormData) => {
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

            if (!A0) {
                 if (!At || !k || t === null) throw new Error("Missing required inputs to calculate [A]0");
                 calculatedValue = math.multiply(At, math.exp(math.multiply(k, t)));
                 resultLabel = 'Initial Concentration ([A]₀)';
                 resultUnit = 'mol/L';
            } else if (!At) {
                 if (!A0 || !k || t === null) throw new Error("Missing required inputs to calculate [A]t");
                 calculatedValue = math.multiply(A0, math.exp(math.unaryMinus(math.multiply(k, t))));
                resultLabel = 'Final Concentration ([A]t)';
                 resultUnit = 'mol/L';
            } else if (!k) {
                 if (!A0 || !At || t === null) throw new Error("Missing required inputs to calculate k");
                 if (math.equal(t, 0)) {
                     if (!math.equal(A0, At)) throw new Error("Inconsistent input: Concentrations differ at t=0.");
                     throw new Error("Cannot determine k when t=0 and concentrations are equal.");
                 }
                 if (math.smallerEq(At, 0) || math.smallerEq(A0, 0)) throw new Error("Concentrations must be positive for logarithm.");
                 calculatedValue = math.divide(math.subtract(math.log(A0), math.log(At)), t);
                 resultLabel = 'Rate Constant (k)';
                 resultUnit = '1/s'; // Assuming time is in seconds
            } else if (t === null) {
                 if (!A0 || !At || !k) throw new Error("Missing required inputs to calculate t");
                 if (math.equal(k, 0)) throw new Error("Rate constant k cannot be zero.");
                 if (math.smallerEq(At, 0) || math.smallerEq(A0, 0)) throw new Error("Concentrations must be positive for logarithm.");
                 if (math.larger(At, A0)) throw new Error("Final concentration cannot be greater than initial concentration.");
                 calculatedValue = math.divide(math.subtract(math.log(A0), math.log(At)), k);
                 resultLabel = 'Time (t)';
                 resultUnit = 's'; // Assuming k's unit implies seconds
            }

            if (calculatedValue !== null) {
                 if ((resultLabel.includes('Concentration') || resultLabel.includes('Constant')) && math.smallerEq(calculatedValue, 0)) {
                     throw new Error(`Calculated ${resultLabel} must be positive.`);
                 }
                 if (resultLabel.includes('Time') && math.smaller(calculatedValue, 0)) {
                     throw new Error("Calculated time is negative, inconsistent inputs.");
                 }
                 const formattedResult = math.format(calculatedValue, { notation: 'fixed', precision: 5 }).replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1');
                 setResult({ value: formattedResult, label: resultLabel, unit: resultUnit });
                 toast({ title: "Calculation Success", description: `Calculated ${resultLabel}.` });
            } else {
                 throw new Error("Could not determine variable to calculate.");
            }

        } catch (err: any) {
            setError(`Calculation failed: ${err.message}`);
            toast({ title: "Calculation Error", description: `Calculation failed: ${err.message}`, variant: "destructive" });
        }
    };

    const onSubmitRateLaw = (data: RateLawFormData) => {
         setError(null);
         setResult(null);
         try {
            const k = math.bignumber(data.k_rate);
            const concA = math.bignumber(data.conc_A);
            const orderM = math.bignumber(data.order_m);

             // Validate k and concA explicitly though schema should catch positive numbers
             if (math.smallerEq(k, 0)) throw new Error("Rate constant (k) must be positive.");
             if (math.smaller(concA, 0)) throw new Error("Concentration [A] cannot be negative."); // Allow 0


             // Term for reactant A: [A]^m
             // Handle 0^0 case (often considered 1 in rate laws if reactant is present but doesn't affect rate)
             let termA: math.BigNumber;
              if (math.equal(concA, 0) && math.equal(orderM, 0)) {
                 termA = math.bignumber(1);
              } else if (math.equal(concA, 0) && math.smaller(orderM, 0)) {
                 throw new Error("Cannot calculate rate: Concentration [A] is zero with a negative order (m).");
              } else {
                 termA = math.pow(concA, orderM);
              }


             // Term for reactant B (optional): [B]^n
             let termB = math.bignumber(1); // Default to 1 if B is not included
             if (data.conc_B && data.order_n) {
                 const concB = math.bignumber(data.conc_B);
                 const orderN = math.bignumber(data.order_n);

                 if (math.smaller(concB, 0)) throw new Error("Concentration [B] cannot be negative.");

                  if (math.equal(concB, 0) && math.equal(orderN, 0)) {
                     termB = math.bignumber(1);
                  } else if (math.equal(concB, 0) && math.smaller(orderN, 0)) {
                     throw new Error("Cannot calculate rate: Concentration [B] is zero with a negative order (n).");
                  } else {
                     termB = math.pow(concB, orderN);
                  }
             }

             // Calculate Rate = k * termA * termB
             const calculatedRate = math.multiply(math.multiply(k, termA), termB);

             if (math.smaller(calculatedRate, 0)) {
                 // This shouldn't happen with positive k and non-negative concentrations unless orders are strange, but check anyway.
                 throw new Error("Calculated rate is negative, check inputs.");
             }

             const formattedResult = math.format(calculatedRate, { notation: 'exponential', precision: 4 });
             setResult({ value: formattedResult, label: 'Reaction Rate', unit: 'mol L⁻¹ s⁻¹' }); // Assuming standard units
             toast({ title: "Calculation Success", description: "Reaction rate calculated." });

         } catch (err: any) {
             setError(`Calculation failed: ${err.message}`);
             toast({ title: "Calculation Error", description: `Calculation failed: ${err.message}`, variant: "destructive" });
         }
    };

    // Choose the correct submit handler based on calcType
    const onSubmit = calcType === 'firstOrder' ? handleSubmit(onSubmitFirstOrder) : handleSubmit(onSubmitRateLaw);

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
         <div className="mb-4">
            <Label htmlFor="calc-type-select">Calculation Type</Label>
             <Select onValueChange={(value) => handleCalcTypeChange(value as CalcType)} value={calcType}>
                <SelectTrigger id="calc-type-select" className="w-full sm:w-[280px]">
                  <SelectValue placeholder="Select calculation..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="firstOrder">First-Order Integrated Rate Law</SelectItem>
                  <SelectItem value="rateLaw">Rate Law (Rate = k[A]ᵐ[B]ⁿ)</SelectItem>
                </SelectContent>
              </Select>
         </div>

         {/* Description based on calcType */}
         {calcType === 'firstOrder' && (
             <p className="text-sm text-muted-foreground mb-4">
                 Use the First-Order Integrated Rate Law: ln([A]<sub>t</sub>) = -kt + ln([A]<sub>0</sub>). Provide any 3 values to calculate the 4th. Ensure units are consistent (e.g., mol/L, s, 1/s).
             </p>
         )}
         {calcType === 'rateLaw' && (
             <p className="text-sm text-muted-foreground mb-4">
                 Calculate the initial reaction rate using Rate = k[A]<sup>m</sup>[B]<sup>n</sup>. Provide k, concentrations, and orders (m, n). Assumes standard units (mol L⁻¹ s⁻¹). Reactant B is optional.
             </p>
         )}

        {/* Form rendering based on calcType */}
        <form onSubmit={onSubmit} className="space-y-4">
           {calcType === 'firstOrder' && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-1">
                       <Label htmlFor="initial_conc">Initial Concentration ([A]₀)</Label>
                       <Controller name="initial_conc" control={firstOrderForm.control} render={({ field }) => <Input {...field} id="initial_conc" type="number" step="any" min="0.000001" placeholder="e.g., 0.1 M" className={cn(errors.initial_conc || (errors as any).root?.message ? 'border-destructive' : '')}/>} />
                       {errors.initial_conc && <p className="text-xs text-destructive">{errors.initial_conc.message}</p>}
                   </div>
                   <div className="space-y-1">
                       <Label htmlFor="final_conc">Final Concentration ([A]<sub>t</sub>)</Label>
                       <Controller name="final_conc" control={firstOrderForm.control} render={({ field }) => <Input {...field} id="final_conc" type="number" step="any" min="0.000001" placeholder="e.g., 0.05 M" className={cn(errors.final_conc || (errors as any).root?.message ? 'border-destructive' : '')}/>} />
                       {errors.final_conc && <p className="text-xs text-destructive">{errors.final_conc.message}</p>}
                   </div>
                   <div className="space-y-1">
                       <Label htmlFor="rate_constant">Rate Constant (k)</Label>
                       <Controller name="rate_constant" control={firstOrderForm.control} render={({ field }) => <Input {...field} id="rate_constant" type="number" step="any" min="0.000001" placeholder="e.g., 0.01 (1/s)" className={cn(errors.rate_constant || (errors as any).root?.message ? 'border-destructive' : '')}/>} />
                       {errors.rate_constant && <p className="text-xs text-destructive">{errors.rate_constant.message}</p>}
                   </div>
                   <div className="space-y-1">
                       <Label htmlFor="time">Time (t)</Label>
                       <Controller name="time" control={firstOrderForm.control} render={({ field }) => <Input {...field} id="time" type="number" step="any" min="0" placeholder="e.g., 60 (s)" className={cn(errors.time || (errors as any).root?.message ? 'border-destructive' : '')}/>} />
                       {errors.time && <p className="text-xs text-destructive">{errors.time.message}</p>}
                   </div>
                   {/* Display root refinement error if it exists */}
                   {(errors as any).root && <p className="text-xs text-destructive col-span-1 sm:col-span-2">{(errors as any).root.message}</p>}
               </div>
           )}

           {calcType === 'rateLaw' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <Label htmlFor="k_rate">Rate Constant (k)</Label>
                         <Controller name="k_rate" control={rateLawForm.control} render={({ field }) => <Input {...field} id="k_rate" type="number" step="any" min="0.000001" placeholder="Enter k value" className={cn(errors.k_rate ? 'border-destructive' : '')}/>} />
                         {errors.k_rate && <p className="text-xs text-destructive">{errors.k_rate.message}</p>}
                     </div>
                      <div className="space-y-1">
                         <Label htmlFor="conc_A">Concentration [A]</Label>
                         <Controller name="conc_A" control={rateLawForm.control} render={({ field }) => <Input {...field} id="conc_A" type="number" step="any" min="0" placeholder="e.g., 0.1 M" className={cn(errors.conc_A ? 'border-destructive' : '')}/>} />
                         {errors.conc_A && <p className="text-xs text-destructive">{errors.conc_A.message}</p>}
                     </div>
                      <div className="space-y-1">
                         <Label htmlFor="order_m">Order w.r.t. A (m)</Label>
                         <Controller name="order_m" control={rateLawForm.control} render={({ field }) => <Input {...field} id="order_m" type="number" step="any" placeholder="e.g., 1, 2, 0.5" className={cn(errors.order_m ? 'border-destructive' : '')}/>} />
                         {errors.order_m && <p className="text-xs text-destructive">{errors.order_m.message}</p>}
                     </div>
                     {/* Optional Reactant B Fields */}
                      <div className="space-y-1">
                         <Label htmlFor="conc_B">Concentration [B] (Optional)</Label>
                         <Controller name="conc_B" control={rateLawForm.control} render={({ field }) => <Input {...field} id="conc_B" type="number" step="any" min="0" placeholder="e.g., 0.2 M" className={cn(errors.conc_B ? 'border-destructive' : '')}/>} />
                         {errors.conc_B && <p className="text-xs text-destructive">{errors.conc_B.message}</p>}
                     </div>
                      <div className="space-y-1">
                         <Label htmlFor="order_n">Order w.r.t. B (n) (Optional)</Label>
                         <Controller name="order_n" control={rateLawForm.control} render={({ field }) => <Input {...field} id="order_n" type="number" step="any" placeholder="e.g., 0, 1, 2" className={cn(errors.order_n ? 'border-destructive' : '')}/>} />
                         {errors.order_n && <p className="text-xs text-destructive">{errors.order_n.message}</p>}
                     </div>
                       {/* Display root refinement error if it exists */}
                      {(errors as any).root && <p className="text-xs text-destructive col-span-1 sm:col-span-2">{(errors as any).root.message}</p>}
                 </div>
            )}


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
             {calcType === 'firstOrder' ? <Timer className="h-4 w-4 text-primary" /> : <Percent className="h-4 w-4 text-primary" />}
             <AlertTitle className="text-primary">Calculation Result</AlertTitle>
             <AlertDescription>
                <p className="mt-2 text-sm font-semibold">
                    {result.label}: {result.value} {result.unit}
                </p>
                 <p className="text-xs text-muted-foreground mt-1">
                    {calcType === 'firstOrder' ? 'Based on first-order kinetics.' : 'Calculated reaction rate.'}
                 </p>
             </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
};


    