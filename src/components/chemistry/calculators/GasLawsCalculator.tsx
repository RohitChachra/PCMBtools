
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
import { Calculator, Thermometer, Scale } from 'lucide-react'; // Example icons
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { create, all, type MathJsStatic, type ConfigOptions } from 'mathjs';
import { cn } from '@/lib/utils';

const math = create(all, { number: 'BigNumber', precision: 10 } as ConfigOptions);

// Schemas for different laws
const idealGasSchema = z.object({
    pressure: z.string().optional(),
    volume: z.string().optional(),
    moles: z.string().optional(),
    temperature: z.string().optional(),
}).refine(data => Object.values(data).filter(v => v && v !== '').length === 3, {
    message: 'Provide exactly 3 values for Ideal Gas Law.',
    path: ['pressure']
});

const combinedGasSchema = z.object({
    p1: z.string().optional(), v1: z.string().optional(), t1: z.string().optional(),
    p2: z.string().optional(), v2: z.string().optional(), t2: z.string().optional(),
}).refine(data => Object.values(data).filter(v => v && v !== '').length === 5, {
    message: 'Provide exactly 5 values for Combined Gas Law.',
    path: ['p1']
});

type IdealGasFormData = z.infer<typeof idealGasSchema>;
type CombinedGasFormData = z.infer<typeof combinedGasSchema>;

type LawType = 'ideal' | 'combined'; // Add 'boyles', 'charles', 'gaylussac' if needed as separate forms

const R = 0.0821; // L·atm/(mol·K) - Common R value, adjust if using different units

export const GasLawsCalculator = () => {
  const [lawType, setLawType] = useState<LawType>('ideal');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const idealForm = useForm<IdealGasFormData>({ resolver: zodResolver(idealGasSchema), defaultValues: { pressure: '', volume: '', moles: '', temperature: '' } });
  const combinedForm = useForm<CombinedGasFormData>({ resolver: zodResolver(combinedGasSchema), defaultValues: { p1: '', v1: '', t1: '', p2: '', v2: '', t2: '' } });

  const getForm = (type: LawType) => type === 'ideal' ? idealForm : combinedForm;

  const onCalculate = (data: IdealGasFormData | CombinedGasFormData) => {
    setError(null);
    setResult(null);

    try {
        let calculatedValue: string | number | null = null;
        let resultLabel = '';

        if (lawType === 'ideal') {
            const { pressure, volume, moles, temperature } = data as IdealGasFormData;
            const P = pressure ? math.bignumber(pressure) : null;
            const V = volume ? math.bignumber(volume) : null;
            const n = moles ? math.bignumber(moles) : null;
            const T = temperature ? math.bignumber(temperature) : null; // Assume Kelvin

             if (T && math.smallerEq(T, 0)) throw new Error("Temperature (T) must be positive Kelvin.");
             if (V && math.smallerEq(V, 0)) throw new Error("Volume (V) must be positive.");
             if (n && math.smallerEq(n, 0)) throw new Error("Moles (n) must be positive.");
             if (P && math.smallerEq(P, 0)) throw new Error("Pressure (P) must be positive.");


            const R_math = math.bignumber(R);

            if (!P) { calculatedValue = math.divide(math.multiply(math.multiply(n!, R_math), T!), V!); resultLabel = 'Pressure (P)'; }
            else if (!V) { calculatedValue = math.divide(math.multiply(math.multiply(n!, R_math), T!), P!); resultLabel = 'Volume (V)'; }
            else if (!n) { calculatedValue = math.divide(math.multiply(P!, V!), math.multiply(R_math, T!)); resultLabel = 'Moles (n)'; }
            else if (!T) { calculatedValue = math.divide(math.multiply(P!, V!), math.multiply(n!, R_math)); resultLabel = 'Temperature (T)'; }

        } else if (lawType === 'combined') {
            const { p1, v1, t1, p2, v2, t2 } = data as CombinedGasFormData;
            const P1 = p1 ? math.bignumber(p1) : null; const V1 = v1 ? math.bignumber(v1) : null; const T1 = t1 ? math.bignumber(t1) : null;
            const P2 = p2 ? math.bignumber(p2) : null; const V2 = v2 ? math.bignumber(v2) : null; const T2 = t2 ? math.bignumber(t2) : null;

             // Validate positive values where applicable (Pressure, Volume, Temperature in K)
             [P1, V1, T1, P2, V2, T2].forEach((val, index) => {
                if (val && math.smallerEq(val, 0)) {
                    const names = ['P1', 'V1', 'T1', 'P2', 'V2', 'T2'];
                    throw new Error(`${names[index]} must be positive.`);
                }
             });


            if (!P1) { calculatedValue = math.divide(math.multiply(math.multiply(P2!, V2!), T1!), math.multiply(V1!, T2!)); resultLabel = 'P1'; }
            else if (!V1) { calculatedValue = math.divide(math.multiply(math.multiply(P2!, V2!), T1!), math.multiply(P1!, T2!)); resultLabel = 'V1'; }
            else if (!T1) { calculatedValue = math.divide(math.multiply(math.multiply(P1!, V1!), T2!), math.multiply(P2!, V2!)); resultLabel = 'T1'; }
            else if (!P2) { calculatedValue = math.divide(math.multiply(math.multiply(P1!, V1!), T2!), math.multiply(V2!, T1!)); resultLabel = 'P2'; }
            else if (!V2) { calculatedValue = math.divide(math.multiply(math.multiply(P1!, V1!), T2!), math.multiply(P2!, T1!)); resultLabel = 'V2'; }
            else if (!T2) { calculatedValue = math.divide(math.multiply(math.multiply(P2!, V2!), T1!), math.multiply(P1!, V1!)); resultLabel = 'T2'; }
        }

        if (calculatedValue !== null) {
            // Check if calculated Temperature (T or T1/T2) is positive Kelvin
            if (resultLabel.includes('T') && math.smallerEq(calculatedValue, 0)) {
                throw new Error("Calculated temperature is non-positive Kelvin, check inputs.");
            }
            const formattedResult = math.format(calculatedValue, { notation: 'fixed', precision: 5 }).replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1');
            setResult(`${resultLabel}: ${formattedResult}`);
            toast({ title: "Calculation Success", description: `Calculated ${resultLabel}.` });
        } else {
            throw new Error("Could not determine variable to calculate.");
        }

    } catch (err: any) {
        setError(`Calculation failed: ${err.message}`);
        toast({ title: "Calculation Error", description: `Calculation failed: ${err.message}`, variant: "destructive" });
    }
  };

  const { control, handleSubmit, formState: { errors } } = getForm(lawType);

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="mb-4">
          <Label htmlFor="law-select">Select Gas Law</Label>
          <Select onValueChange={(value) => setLawType(value as LawType)} value={lawType}>
            <SelectTrigger id="law-select" className="w-full sm:w-[280px]">
              <SelectValue placeholder="Select law..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ideal">Ideal Gas Law (PV = nRT)</SelectItem>
              <SelectItem value="combined">Combined Gas Law (P₁V₁/T₁ = P₂V₂/T₂)</SelectItem>
              {/* Add Boyle's, Charles', Gay-Lussac's later if needed */}
            </SelectContent>
          </Select>
           <p className="text-xs text-muted-foreground mt-2">Units: P (atm), V (L), n (mol), T (K). R ≈ {R} L·atm/(mol·K).</p>
        </div>

        <form onSubmit={handleSubmit(onCalculate)} className="space-y-4">
          {lawType === 'ideal' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ideal Gas Law Inputs */}
              {(['pressure', 'volume', 'moles', 'temperature'] as const).map(field => (
                <div key={field} className="space-y-1">
                  <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                  <Controller
                    name={field}
                    control={idealForm.control}
                    render={({ field: controllerField }) => (
                      <Input {...controllerField} id={field} type="number" step="any" placeholder={`Enter ${field}`} className={cn(idealForm.formState.errors[field] || idealForm.formState.errors.pressure?.type === 'custom' ? 'border-destructive' : '')} />
                    )}
                  />
                </div>
              ))}
                 {idealForm.formState.errors.pressure?.type === 'custom' && <p className="text-xs text-destructive col-span-1 sm:col-span-2">{idealForm.formState.errors.pressure.message}</p>}
            </div>
          )}

          {lawType === 'combined' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Combined Gas Law Inputs */}
               {(['p1', 'v1', 't1', 'p2', 'v2', 't2'] as const).map(field => (
                <div key={field} className="space-y-1">
                  <Label htmlFor={field}>{field.toUpperCase()}</Label>
                  <Controller
                    name={field}
                    control={combinedForm.control}
                    render={({ field: controllerField }) => (
                      <Input {...controllerField} id={field} type="number" step="any" placeholder={`Enter ${field.toUpperCase()}`} className={cn(combinedForm.formState.errors[field] || combinedForm.formState.errors.p1?.type === 'custom' ? 'border-destructive' : '')} />
                    )}
                  />
                </div>
              ))}
                 {combinedForm.formState.errors.p1?.type === 'custom' && <p className="text-xs text-destructive col-span-1 sm:col-span-3">{combinedForm.formState.errors.p1.message}</p>}
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
             <Thermometer className="h-4 w-4 text-primary" /> {/* Use an appropriate icon */}
             <AlertTitle className="text-primary">Calculation Result</AlertTitle>
             <AlertDescription>
                <p className="mt-2 text-sm font-semibold">
                    {result}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Remember to check unit consistency.</p>
             </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
};

