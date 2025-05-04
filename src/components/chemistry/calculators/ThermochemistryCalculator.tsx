
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
import { Calculator, Thermometer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Schema for q = mcΔT calculation
const heatTransferSchema = z.object({
  mass: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Mass must be a non-negative number.',
  }),
  specificHeat: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Specific Heat Capacity must be a positive number.',
  }),
  initialTemp: z.string().refine(val => !isNaN(parseFloat(val)), {
    message: 'Initial Temperature must be a number.',
  }),
  finalTemp: z.string().refine(val => !isNaN(parseFloat(val)), {
    message: 'Final Temperature must be a number.',
  }),
});

type HeatTransferFormData = z.infer<typeof heatTransferSchema>;

interface HeatTransferResult {
  heatTransferred: number;
}

export const ThermochemistryCalculator = () => {
  const [result, setResult] = useState<HeatTransferResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors } } = useForm<HeatTransferFormData>({
    resolver: zodResolver(heatTransferSchema),
    defaultValues: {
      mass: '',
      specificHeat: '',
      initialTemp: '',
      finalTemp: '',
    },
  });

  const onSubmit = (data: HeatTransferFormData) => {
    setError(null);
    setResult(null);

    try {
      const mass = parseFloat(data.mass);
      const specificHeat = parseFloat(data.specificHeat);
      const initialTemp = parseFloat(data.initialTemp);
      const finalTemp = parseFloat(data.finalTemp);

      const deltaT = finalTemp - initialTemp;
      const heatTransferred = mass * specificHeat * deltaT;

      setResult({ heatTransferred });

      toast({
        title: "Calculation Success",
        description: `Heat transferred (q) calculated. ${heatTransferred > 0 ? 'Heat absorbed.' : heatTransferred < 0 ? 'Heat released.' : 'No temperature change.'}`
      });

    } catch (err: any) {
      setError(`Calculation failed: ${err.message || 'Unknown error'}`);
      toast({ title: "Calculation Error", description: `Calculation failed: ${err.message}`, variant: "destructive" });
    }
  };

  // Helper to format numbers
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null || isNaN(num)) return 'N/A';
    if (num === 0) return '0';
    if (Math.abs(num) >= 1e6 || (Math.abs(num) <= 1e-4 && num !== 0)) {
      return num.toExponential(4);
    }
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-4">
           Calculate heat transfer using the formula: <code className="bg-muted px-1 py-0.5 rounded font-mono">q = mcΔT</code>.
           Ensure units are consistent (e.g., g, J/g°C, °C).
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mass Input */}
            <div className="space-y-1">
              <Label htmlFor="mass">Mass (m)</Label>
              <Controller
                name="mass"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Input
                      {...field}
                      id="mass"
                      type="number"
                      step="any"
                      min="0"
                      placeholder="e.g., 100"
                      className={cn(errors.mass ? 'border-destructive' : '', 'flex-grow')}
                    />
                    <span className="text-sm text-muted-foreground">g</span>
                  </div>
                )}
              />
              {errors.mass && <p className="text-xs text-destructive">{errors.mass.message}</p>}
            </div>

            {/* Specific Heat Input */}
            <div className="space-y-1">
              <Label htmlFor="specificHeat">Specific Heat (c)</Label>
              <Controller
                name="specificHeat"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Input
                      {...field}
                      id="specificHeat"
                      type="number"
                      step="any"
                      min="0.000001" // Must be positive
                      placeholder="e.g., 4.184 for water"
                      className={cn(errors.specificHeat ? 'border-destructive' : '', 'flex-grow')}
                    />
                     <span className="text-sm text-muted-foreground">J/g°C</span>
                  </div>
                )}
              />
              {errors.specificHeat && <p className="text-xs text-destructive">{errors.specificHeat.message}</p>}
            </div>

            {/* Initial Temperature Input */}
            <div className="space-y-1">
              <Label htmlFor="initialTemp">Initial Temperature (T<sub>initial</sub>)</Label>
              <Controller
                name="initialTemp"
                control={control}
                render={({ field }) => (
                   <div className="flex items-center gap-2">
                      <Input
                        {...field}
                        id="initialTemp"
                        type="number"
                        step="any"
                        placeholder="e.g., 20"
                        className={cn(errors.initialTemp ? 'border-destructive' : '', 'flex-grow')}
                      />
                      <span className="text-sm text-muted-foreground">°C</span>
                   </div>
                )}
              />
              {errors.initialTemp && <p className="text-xs text-destructive">{errors.initialTemp.message}</p>}
            </div>

            {/* Final Temperature Input */}
            <div className="space-y-1">
              <Label htmlFor="finalTemp">Final Temperature (T<sub>final</sub>)</Label>
              <Controller
                name="finalTemp"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                      <Input
                        {...field}
                        id="finalTemp"
                        type="number"
                        step="any"
                        placeholder="e.g., 80"
                        className={cn(errors.finalTemp ? 'border-destructive' : '', 'flex-grow')}
                      />
                      <span className="text-sm text-muted-foreground">°C</span>
                  </div>
                )}
              />
              {errors.finalTemp && <p className="text-xs text-destructive">{errors.finalTemp.message}</p>}
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto">Calculate Heat Transfer (q)</Button>
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
             <Thermometer className="h-4 w-4 text-primary" />
             <AlertTitle className="text-primary">Calculation Result</AlertTitle>
             <AlertDescription>
                <p className="mt-2 text-sm">
                    Heat Transferred (q): <code className="font-semibold">{formatNumber(result.heatTransferred)} J</code>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    ({result.heatTransferred > 0 ? 'Heat Absorbed' : result.heatTransferred < 0 ? 'Heat Released' : 'No Net Heat Transfer'})
                </p>
             </AlertDescription>
          </Alert>
        )}
         {/* Placeholder for future ΔH and unit conversion features */}
         <p className="text-xs text-muted-foreground">Further calculations (ΔH, unit conversions) coming soon.</p>
      </CardFooter>
    </Card>
  );
};
