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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Added import

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

// Schema for Kp = Kc * (RT)^(Δn)
const kpFromKcSchema = z.object({
    kc: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, { message: "Kc must be non-negative." }),
    temperature_k: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, { message: "Temperature (K) must be positive." }),
    delta_n: z.string().refine(v => !isNaN(parseFloat(v)), { message: "Δn (moles of gas products - moles of gas reactants) must be a number." }),
});

type KcFormData = z.infer<typeof kcSchema>;
type KpFromKcFormData = z.infer<typeof kpFromKcSchema>;

type CalcType = 'kc' | 'kp_from_kc';

interface EquilibriumResult {
    type: CalcType;
    value: string;
}

export const EquilibriumConstantCalculator = () => {
    const [calcType, setCalcType] = useState<CalcType>('kc');
    const [result, setResult] = useState<EquilibriumResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const kcForm = useForm<KcFormData>({
        resolver: zodResolver(kcSchema),
        defaultValues: { conc_C: '', conc_D: '', conc_A: '', conc_B: '' },
    });

    const kpFromKcForm = useForm<KpFromKcFormData>({
        resolver: zodResolver(kpFromKcSchema),
        defaultValues: { kc: '', temperature_k: '', delta_n: '' },
    });

    const { control, handleSubmit, formState: { errors } } = calcType === 'kc' ? kcForm : kpFromKcForm;

    const onSubmit = (data: any) => {
        setError(null);
        setResult(null);

        try {
            let calculatedValue: math.BigNumber | null = null;

            if (calcType === 'kc') {
                const { conc_C, conc_D, conc_A, conc_B } = data as KcFormData;
                const C = math.bignumber(conc_C);
                const D = math.bignumber(conc_D);
                const A = math.bignumber(conc_A);
                const B = math.bignumber(conc_B);

                // Kc = ([C] * [D]) / ([A] * [B])
                const numerator = math.multiply(C, D);
                const denominator = math.multiply(A, B);

                if (math.equal(denominator, 0)) {
                    throw new Error("Reactant concentrations cannot be zero.");
                }
                calculatedValue = math.divide(numerator, denominator);
                if (math.smaller(calculatedValue, 0)) {
                    throw new Error("Calculated Kc is negative, check inputs.");
                }

            } else if (calcType === 'kp_from_kc') {
                const { kc, temperature_k, delta_n } = data as KpFromKcFormData;
                const Kc = math.bignumber(kc);
                const T = math.bignumber(temperature_k);
                const dn = math.bignumber(delta_n);
                const R = math.bignumber(R_GAS_CONST);

                // Kp = Kc * (RT)^(Δn)
                const RT = math.multiply(R, T);
                 if (math.equal(RT, 0) && math.smaller(dn, 0)) {
                     throw new Error("Cannot calculate Kp: RT is zero and Δn is negative (division by zero).");
                 }
                 // Handle 0^0 which is often defined as 1 in this context
                 const RT_pow_dn = (math.equal(RT, 0) && math.equal(dn, 0)) ? math.bignumber(1) : math.pow(RT, dn);

                calculatedValue = math.multiply(Kc, RT_pow_dn);
                 if (math.smaller(calculatedValue, 0)) {
                     throw new Error("Calculated Kp is negative, check inputs.");
                 }
            }

            if (calculatedValue !== null) {
                const formattedValue = math.format(calculatedValue, { notation: 'fixed', precision: 4 }).replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1');
                setResult({
                    type: calcType,
                    value: formattedValue
                });
                toast({ title: "Calculation Success", description: `Equilibrium constant (${calcType.toUpperCase()}) calculated.` });
            } else {
                throw new Error("Unknown calculation type.");
            }

        } catch (err: any) {
            setError(`Calculation failed: ${err.message}`);
            toast({ title: "Calculation Error", description: `Calculation failed: ${err.message}`, variant: "destructive" });
        }
    };

     // Dynamic form rendering based on calcType
    const renderFormFields = () => {
        if (calcType === 'kc') {
            return (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-1">
                         <Label htmlFor="conc_C">[C] (Product)</Label>
                         <Controller name="conc_C" control={kcForm.control} render={({ field }) => <Input {...field} id="conc_C" type="number" step="any" min="0" placeholder="e.g., 0.5 M" className={cn(kcForm.formState.errors.conc_C ? 'border-destructive' : '')}/>} />
                         {kcForm.formState.errors.conc_C && <p className="text-xs text-destructive">{kcForm.formState.errors.conc_C.message}</p>}
                     </div>
                     <div className="space-y-1">
                         <Label htmlFor="conc_D">[D] (Product)</Label>
                         <Controller name="conc_D" control={kcForm.control} render={({ field }) => <Input {...field} id="conc_D" type="number" step="any" min="0" placeholder="e.g., 0.5 M" className={cn(kcForm.formState.errors.conc_D ? 'border-destructive' : '')}/>} />
                          {kcForm.formState.errors.conc_D && <p className="text-xs text-destructive">{kcForm.formState.errors.conc_D.message}</p>}
                      </div>
                      <div className="space-y-1">
                         <Label htmlFor="conc_A">[A] (Reactant)</Label>
                         <Controller name="conc_A" control={kcForm.control} render={({ field }) => <Input {...field} id="conc_A" type="number" step="any" min="0.000001" placeholder="e.g., 0.1 M" className={cn(kcForm.formState.errors.conc_A ? 'border-destructive' : '')}/>} />
                          {kcForm.formState.errors.conc_A && <p className="text-xs text-destructive">{kcForm.formState.errors.conc_A.message}</p>}
                      </div>
                      <div className="space-y-1">
                         <Label htmlFor="conc_B">[B] (Reactant)</Label>
                         <Controller name="conc_B" control={kcForm.control} render={({ field }) => <Input {...field} id="conc_B" type="number" step="any" min="0.000001" placeholder="e.g., 0.1 M" className={cn(kcForm.formState.errors.conc_B ? 'border-destructive' : '')}/>} />
                          {kcForm.formState.errors.conc_B && <p className="text-xs text-destructive">{kcForm.formState.errors.conc_B.message}</p>}
                      </div>
                 </div>
            );
        } else if (calcType === 'kp_from_kc') {
            return (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-1">
                         <Label htmlFor="kc">K<sub>c</sub> Value</Label>
                         <Controller name="kc" control={kpFromKcForm.control} render={({ field }) => <Input {...field} id="kc" type="number" step="any" min="0" placeholder="Enter Kc" className={cn(kpFromKcForm.formState.errors.kc ? 'border-destructive' : '')}/>} />
                         {kpFromKcForm.formState.errors.kc && <p className="text-xs text-destructive">{kpFromKcForm.state.errors.kc.message}</p>}
                     </div>
                     <div className="space-y-1">
                         <Label htmlFor="temperature_k">Temperature (T)</Label>
                          <div className="flex items-center gap-2">
                             <Controller name="temperature_k" control={kpFromKcForm.control} render={({ field }) => <Input {...field} id="temperature_k" type="number" step="any" min="0.01" placeholder="Enter Temp" className={cn(kpFromKcForm.formState.errors.temperature_k ? 'border-destructive' : '', 'flex-grow')}/>} />
                             <span className="text-sm text-muted-foreground">K</span>
                          </div>
                          {kpFromKcForm.formState.errors.temperature_k && <p className="text-xs text-destructive">{kpFromKcForm.formState.errors.temperature_k.message}</p>}
                     </div>
                     <div className="space-y-1 sm:col-span-2">
                         <Label htmlFor="delta_n">Change in Moles of Gas (Δn)</Label>
                         <Controller name="delta_n" control={kpFromKcForm.control} render={({ field }) => <Input {...field} id="delta_n" type="number" step="any" placeholder="Products(g) - Reactants(g)" className={cn(kpFromKcForm.formState.errors.delta_n ? 'border-destructive' : '')}/>} />
                         {kpFromKcForm.formState.errors.delta_n && <p className="text-xs text-destructive">{kpFromKcForm.formState.errors.delta_n.message}</p>}
                          <p className="text-xs text-muted-foreground">Δn = (moles of gaseous products) - (moles of gaseous reactants)</p>
                     </div>
                 </div>
            );
        }
        return null;
    };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="mb-4">
          <Label htmlFor="calc-type-select">Calculation Type</Label>
          <Select onValueChange={(value) => setCalcType(value as CalcType)} value={calcType}>
            <SelectTrigger id="calc-type-select" className="w-full sm:w-[280px]">
              <SelectValue placeholder="Select calculation..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kc">Calculate K<sub>c</sub> from Concentrations</SelectItem>
              <SelectItem value="kp_from_kc">Calculate K<sub>p</sub> from K<sub>c</sub></SelectItem>
            </SelectContent>
          </Select>
        </div>

         {calcType === 'kc' && (
            <p className="text-sm text-muted-foreground mb-4">
                Calculate K<sub>c</sub> for <code className="font-mono">A + B ⇌ C + D</code>. Enter equilibrium concentrations (mol/L).
            </p>
         )}
          {calcType === 'kp_from_kc' && (
            <p className="text-sm text-muted-foreground mb-4">
                Calculate K<sub>p</sub> using <code className="font-mono">K<sub>p</sub> = K<sub>c</sub>(RT)<sup>Δn</sup></code>. Use R ≈ {R_GAS_CONST} L·atm/(mol·K).
            </p>
         )}


        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {renderFormFields()}
            <Button type="submit" className="w-full sm:w-auto">Calculate {calcType.toUpperCase()}</Button>
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
                   {result.type === 'kc' ? 'Equilibrium Constant (Kc): ' : 'Equilibrium Constant (Kp): '} {result.value}
                </p>
                 <p className="text-xs text-muted-foreground mt-1">
                     {result.type === 'kc' ? 'Kc is unitless in this context.' : 'Kp assumes standard pressure units (atm).'}
                 </p>
             </AlertDescription>
          </Alert>
        )}
         {/* Updated note about ICE tables */}
         <p className="text-xs text-muted-foreground">ICE table calculations involve solving algebraic equations based on initial concentrations and the change variable 'x'. This feature is complex and will be added in a future update.</p>
      </CardFooter>
    </Card>
  );
};