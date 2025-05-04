
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
import { Calculator, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { create, all, type MathJsStatic, type ConfigOptions } from 'mathjs';
import { cn } from '@/lib/utils';

const math = create(all, { number: 'BigNumber', precision: 10 } as ConfigOptions);

const phSchema = z.object({
    value: z.string().refine(v => !isNaN(parseFloat(v)), { message: 'Input must be a number.' }),
    inputType: z.enum(['pH', 'pOH', 'H+', 'OH-']),
});

type PhFormData = z.infer<typeof phSchema>;

interface PhResults {
    pH?: string;
    pOH?: string;
    'H+'?: string;
    'OH-'?: string;
}

export const PhPohCalculator = () => {
    const [results, setResults] = useState<PhResults | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const { control, handleSubmit, watch, formState: { errors } } = useForm<PhFormData>({
        resolver: zodResolver(phSchema),
        defaultValues: { value: '', inputType: 'pH' },
    });

    const inputType = watch('inputType');

    const onSubmit = (data: PhFormData) => {
        setError(null);
        setResults(null);

        try {
            const inputValue = math.bignumber(data.value);
            let calculated: PhResults = {};

            switch (data.inputType) {
                case 'pH':
                    if (math.smaller(inputValue, 0) || math.larger(inputValue, 14)) throw new Error("pH must be between 0 and 14.");
                    calculated.pH = math.format(inputValue, { notation: 'fixed', precision: 2 });
                    calculated.pOH = math.format(math.subtract(14, inputValue), { notation: 'fixed', precision: 2 });
                    calculated['H+'] = math.format(math.pow(10, math.unaryMinus(inputValue)), { notation: 'exponential', precision: 3 });
                    calculated['OH-'] = math.format(math.pow(10, math.unaryMinus(calculated.pOH)), { notation: 'exponential', precision: 3 });
                    break;
                case 'pOH':
                     if (math.smaller(inputValue, 0) || math.larger(inputValue, 14)) throw new Error("pOH must be between 0 and 14.");
                    calculated.pOH = math.format(inputValue, { notation: 'fixed', precision: 2 });
                    calculated.pH = math.format(math.subtract(14, inputValue), { notation: 'fixed', precision: 2 });
                     calculated['OH-'] = math.format(math.pow(10, math.unaryMinus(inputValue)), { notation: 'exponential', precision: 3 });
                     calculated['H+'] = math.format(math.pow(10, math.unaryMinus(calculated.pH)), { notation: 'exponential', precision: 3 });
                    break;
                case 'H+':
                     if (math.smallerEq(inputValue, 0)) throw new Error("[H+] concentration must be positive.");
                    calculated['H+'] = math.format(inputValue, { notation: 'exponential', precision: 3 });
                    calculated.pH = math.format(math.unaryMinus(math.log10(inputValue)), { notation: 'fixed', precision: 2 });
                     if (math.smaller(calculated.pH, 0) || math.larger(calculated.pH, 14)) throw new Error("Calculated pH out of range (0-14). Check [H+] input.");
                    calculated.pOH = math.format(math.subtract(14, calculated.pH), { notation: 'fixed', precision: 2 });
                    calculated['OH-'] = math.format(math.pow(10, math.unaryMinus(calculated.pOH)), { notation: 'exponential', precision: 3 });
                    break;
                case 'OH-':
                     if (math.smallerEq(inputValue, 0)) throw new Error("[OH-] concentration must be positive.");
                    calculated['OH-'] = math.format(inputValue, { notation: 'exponential', precision: 3 });
                    calculated.pOH = math.format(math.unaryMinus(math.log10(inputValue)), { notation: 'fixed', precision: 2 });
                     if (math.smaller(calculated.pOH, 0) || math.larger(calculated.pOH, 14)) throw new Error("Calculated pOH out of range (0-14). Check [OH-] input.");
                    calculated.pH = math.format(math.subtract(14, calculated.pOH), { notation: 'fixed', precision: 2 });
                    calculated['H+'] = math.format(math.pow(10, math.unaryMinus(calculated.pH)), { notation: 'exponential', precision: 3 });
                    break;
            }

            setResults(calculated);
            toast({ title: "Calculation Success", description: "pH/pOH values calculated." });

        } catch (err: any) {
            setError(`Calculation failed: ${err.message}`);
            toast({ title: "Calculation Error", description: `Calculation failed: ${err.message}`, variant: "destructive" });
        }
    };

     // Helper function to format display - keeps it simple
     const formatDisplay = (value?: string) => value ?? 'N/A';

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
         <p className="text-sm text-muted-foreground mb-4">
            Enter one value (pH, pOH, [H+], or [OH-]) to calculate the others. Assumes standard conditions (25°C).
          </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
             <div className="space-y-1 flex-grow">
                <Label htmlFor="value">Input Value</Label>
                <Controller name="value" control={control} render={({ field }) => <Input {...field} id="value" type="number" step="any" placeholder="Enter value" className={cn(errors.value ? 'border-destructive' : '')}/>} />
                {errors.value && <p className="text-xs text-destructive">{errors.value.message}</p>}
              </div>
             <div className="space-y-1">
                 <Label htmlFor="inputType">Input Type</Label>
                 <Controller
                    name="inputType"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="inputType" className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pH">pH</SelectItem>
                                <SelectItem value="pOH">pOH</SelectItem>
                                <SelectItem value="H+">[H+] (mol/L)</SelectItem>
                                <SelectItem value="OH-">[OH-] (mol/L)</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                 {errors.inputType && <p className="text-xs text-destructive">{errors.inputType.message}</p>}
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
             <TestTube className="h-4 w-4 text-primary" />
             <AlertTitle className="text-primary">Calculation Results</AlertTitle>
             <AlertDescription>
                <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                    <li>pH: <code className="font-semibold">{formatDisplay(results.pH)}</code></li>
                    <li>pOH: <code className="font-semibold">{formatDisplay(results.pOH)}</code></li>
                    <li>[H<sup>+</sup>]: <code className="font-semibold">{formatDisplay(results['H+'])} mol/L</code></li>
                    <li>[OH<sup>-</sup>]: <code className="font-semibold">{formatDisplay(results['OH-'])} mol/L</code></li>
                </ul>
             </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
};

