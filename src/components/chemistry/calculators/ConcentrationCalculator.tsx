
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
import { Calculator, Droplet, Beaker } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { create, all, type MathJsStatic, type ConfigOptions } from 'mathjs';
import { cn } from '@/lib/utils';
import { calculateMolarMass } from '@/lib/chemistry-utils'; // Assuming this utility exists

const math = create(all, { number: 'BigNumber', precision: 10 } as ConfigOptions);

// Schemas
const molaritySchema = z.object({
    soluteMoles: z.string().optional(),
    soluteMass: z.string().optional(),
    formula: z.string().optional(), // Required if using mass
    solutionVolumeL: z.string().optional().refine(v => !v || (parseFloat(v) > 0), { message: 'Volume must be positive.' }), // Optional here, checked in submit logic
}).refine(data => (data.soluteMass && !data.formula) ? false : true, {
    message: 'Chemical formula required when using solute mass.', path: ['formula']
}).refine(data => !!data.soluteMoles !== !!data.soluteMass, { // XOR: exactly one of moles or mass must be provided
    message: 'Provide either solute moles OR solute mass (with formula).', path: ['soluteMoles']
});

const molalitySchema = z.object({
    soluteMoles: z.string().optional(),
    soluteMass: z.string().optional(),
    formula: z.string().optional(), // Required if using mass
    solventMassKg: z.string().optional().refine(v => !v || (parseFloat(v) > 0), { message: 'Solvent mass must be positive.' }), // Optional here, checked in submit logic
}).refine(data => (data.soluteMass && !data.formula) ? false : true, {
    message: 'Chemical formula required when using solute mass.', path: ['formula']
}).refine(data => !!data.soluteMoles !== !!data.soluteMass, {
    message: 'Provide either solute moles OR solute mass (with formula).', path: ['soluteMoles']
});


const dilutionSchema = z.object({
    m1: z.string().optional(), v1: z.string().optional(),
    m2: z.string().optional(), v2: z.string().optional(),
}).refine(data => Object.values(data).filter(v => v && v !== '').length === 3, {
    message: 'Provide exactly 3 values for dilution calculation.',
    path: ['m1']
}).refine(data => !data.m1 || parseFloat(data.m1) > 0, { message: "M1 must be positive.", path: ['m1']})
  .refine(data => !data.v1 || parseFloat(data.v1) > 0, { message: "V1 must be positive.", path: ['v1']})
  .refine(data => !data.m2 || parseFloat(data.m2) > 0, { message: "M2 must be positive.", path: ['m2']})
  .refine(data => !data.v2 || parseFloat(data.v2) > 0, { message: "V2 must be positive.", path: ['v2']});


type MolarityFormData = z.infer<typeof molaritySchema>;
type MolalityFormData = z.infer<typeof molalitySchema>;
type DilutionFormData = z.infer<typeof dilutionSchema>;

type CalcType = 'molarity' | 'molality' | 'dilution';

export const ConcentrationCalculator = () => {
    const [calcType, setCalcType] = useState<CalcType>('molarity');
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const molarityForm = useForm<MolarityFormData>({ resolver: zodResolver(molaritySchema), defaultValues: { soluteMoles: '', soluteMass: '', formula: '', solutionVolumeL: '' } });
    const molalityForm = useForm<MolalityFormData>({ resolver: zodResolver(molalitySchema), defaultValues: { soluteMoles: '', soluteMass: '', formula: '', solventMassKg: '' } });
    const dilutionForm = useForm<DilutionFormData>({ resolver: zodResolver(dilutionSchema), defaultValues: { m1: '', v1: '', m2: '', v2: '' } });

    const getForm = (type: CalcType) => {
        switch (type) {
            case 'molarity': return molarityForm;
            case 'molality': return molalityForm;
            case 'dilution': return dilutionForm;
        }
    };

    const onCalculate = (data: any) => {
        setError(null);
        setResult(null);

        try {
            let calculatedValue: string | number | math.BigNumber | null = null;
            let resultLabel = '';
            let resultUnit = '';

            if (calcType === 'molarity') {
                const { soluteMoles, soluteMass, formula, solutionVolumeL } = data as MolarityFormData;

                // Specific check: If using mass/formula, volume is mandatory
                if ((soluteMass || formula) && (!solutionVolumeL || solutionVolumeL.trim() === '' || parseFloat(solutionVolumeL) <= 0)) {
                    throw new Error("Provide a positive Solution Volume (L).");
                }
                // Specific check: If using moles, volume is mandatory
                 if (soluteMoles && (!solutionVolumeL || solutionVolumeL.trim() === '' || parseFloat(solutionVolumeL) <= 0)) {
                     throw new Error("Provide a positive Solution Volume (L).");
                 }


                const V = math.bignumber(solutionVolumeL!); // Can use ! because we checked above
                let n_solute: math.BigNumber;

                if (soluteMoles) {
                    n_solute = math.bignumber(soluteMoles);
                } else { // soluteMass and formula must be present due to schema/checks
                    const molarMass = calculateMolarMass(formula!);
                    if (molarMass === null) throw new Error("Invalid formula or molar mass calculation failed.");
                    n_solute = math.divide(math.bignumber(soluteMass!), math.bignumber(molarMass));
                }

                 if (math.smallerEq(n_solute, 0)) throw new Error("Solute amount must be positive.");
                 // V check is redundant here due to above specific checks, but harmless
                 // if (math.smallerEq(V, 0)) throw new Error("Solution volume must be positive.");


                calculatedValue = math.divide(n_solute, V);
                resultLabel = 'Molarity (M)';
                resultUnit = 'mol/L';

            } else if (calcType === 'molality') {
                const { soluteMoles, soluteMass, formula, solventMassKg } = data as MolalityFormData;

                 // Specific check: If using mass/formula, solvent mass is mandatory
                if ((soluteMass || formula) && (!solventMassKg || solventMassKg.trim() === '' || parseFloat(solventMassKg) <= 0)) {
                    throw new Error("Provide a positive Solvent Mass (kg).");
                }
                 // Specific check: If using moles, solvent mass is mandatory
                 if (soluteMoles && (!solventMassKg || solventMassKg.trim() === '' || parseFloat(solventMassKg) <= 0)) {
                     throw new Error("Provide a positive Solvent Mass (kg).");
                 }

                const solventMass = math.bignumber(solventMassKg!); // Can use ! because we checked above
                let n_solute: math.BigNumber;

                if (soluteMoles) {
                    n_solute = math.bignumber(soluteMoles);
                } else {
                    const molarMass = calculateMolarMass(formula!);
                    if (molarMass === null) throw new Error("Invalid formula or molar mass calculation failed.");
                     n_solute = math.divide(math.bignumber(soluteMass!), math.bignumber(molarMass));
                }

                 if (math.smallerEq(n_solute, 0)) throw new Error("Solute amount must be positive.");
                 // solventMass check is redundant here due to above specific checks
                 // if (math.smallerEq(solventMass, 0)) throw new Error("Solvent mass must be positive.");


                calculatedValue = math.divide(n_solute, solventMass);
                resultLabel = 'Molality (m)';
                resultUnit = 'mol/kg';

            } else if (calcType === 'dilution') {
                const { m1, v1, m2, v2 } = data as DilutionFormData;
                const M1 = m1 ? math.bignumber(m1) : null; const V1 = v1 ? math.bignumber(v1) : null;
                const M2 = m2 ? math.bignumber(m2) : null; const V2 = v2 ? math.bignumber(v2) : null;

                 // Validation for positive values already in Zod schema

                if (!M1) {
                    if (!M2 || !V2 || !V1) throw new Error("Missing required inputs for M1 calculation.");
                    calculatedValue = math.divide(math.multiply(M2, V2), V1);
                    resultLabel = 'Initial Molarity (M₁)'; resultUnit = 'mol/L';
                } else if (!V1) {
                    if (!M2 || !V2 || !M1) throw new Error("Missing required inputs for V1 calculation.");
                    calculatedValue = math.divide(math.multiply(M2, V2), M1);
                    resultLabel = 'Initial Volume (V₁)'; resultUnit = 'L';
                } else if (!M2) {
                     if (!M1 || !V1 || !V2) throw new Error("Missing required inputs for M2 calculation.");
                    calculatedValue = math.divide(math.multiply(M1, V1), V2);
                    resultLabel = 'Final Molarity (M₂)'; resultUnit = 'mol/L';
                } else if (!V2) {
                     if (!M1 || !V1 || !M2) throw new Error("Missing required inputs for V2 calculation.");
                    calculatedValue = math.divide(math.multiply(M1, V1), M2);
                    resultLabel = 'Final Volume (V₂)'; resultUnit = 'L';
                } else {
                     throw new Error("Calculation error in dilution formula."); // Should be caught by Zod refinement
                 }
            }


            if (calculatedValue !== null) {
                 if (math.smallerEq(calculatedValue, 0)) {
                    throw new Error(`Calculated ${resultLabel} must be positive.`);
                 }
                 const formattedResult = math.format(calculatedValue, { notation: 'fixed', precision: 5 }).replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1');
                 setResult(`${resultLabel}: ${formattedResult} ${resultUnit}`);
                 toast({ title: "Calculation Success", description: `Calculated ${resultLabel}.` });
            } else {
                 // This should ideally be caught by Zod or earlier specific checks
                 throw new Error("Could not determine variable to calculate or missing required inputs.");
            }

        } catch (err: any) {
            setError(`Calculation failed: ${err.message}`);
            toast({ title: "Calculation Error", description: `Calculation failed: ${err.message}`, variant: "destructive" });
        }
    };

    const { control, handleSubmit, formState: { errors }, watch } = getForm(calcType);
    const watchMolarityFields = molarityForm.watch(['soluteMoles', 'soluteMass']);
    const watchMolalityFields = molalityForm.watch(['soluteMoles', 'soluteMass']);

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
              <SelectItem value="molarity">Molarity (M = n/V)</SelectItem>
              <SelectItem value="molality">Molality (m = n/kg solvent)</SelectItem>
              <SelectItem value="dilution">Dilution (M₁V₁ = M₂V₂)</SelectItem>
            </SelectContent>
          </Select>
          {calcType !== 'dilution' && <p className="text-xs text-muted-foreground mt-2">Units: Mass (g), Volume (L), Solvent Mass (kg).</p>}
           {calcType === 'dilution' && <p className="text-xs text-muted-foreground mt-2">Ensure M and V units are consistent (e.g., mol/L and L).</p>}
        </div>

        <form onSubmit={handleSubmit(onCalculate)} className="space-y-4">
          {/* Molarity Form */}
          {calcType === 'molarity' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-1">
                <Label htmlFor="soluteMolesMolarity">Solute Moles (n)</Label>
                <Controller name="soluteMoles" control={molarityForm.control} render={({ field }) => <Input {...field} id="soluteMolesMolarity" type="number" step="any" min="0" placeholder="Enter moles" disabled={!!watchMolarityFields[1]} className={cn(errors.soluteMoles ? 'border-destructive' : '')} />} />
                 {/* Display refinement error */}
                {errors.soluteMoles?.type === 'custom' && <p className="text-xs text-destructive">{errors.soluteMoles.message}</p>}
              </div>
               <div className="space-y-1">
                <Label htmlFor="soluteMassMolarity">Solute Mass (m)</Label>
                <Controller name="soluteMass" control={molarityForm.control} render={({ field }) => <Input {...field} id="soluteMassMolarity" type="number" step="any" min="0" placeholder="Enter mass (g)" disabled={!!watchMolarityFields[0]} className={cn(errors.soluteMass ? 'border-destructive' : '')}/>} />
              </div>
                <div className="space-y-1">
                <Label htmlFor="formulaMolarity">Formula (if using mass)</Label>
                <Controller name="formula" control={molarityForm.control} render={({ field }) => <Input {...field} id="formulaMolarity" placeholder="e.g., NaCl" disabled={!!watchMolarityFields[0]} className={cn(errors.formula ? 'border-destructive' : '')}/>} />
                 {errors.formula && <p className="text-xs text-destructive">{errors.formula.message}</p>}
              </div>
               <div className="space-y-1">
                <Label htmlFor="solutionVolumeL">Solution Volume (V)</Label>
                <Controller name="solutionVolumeL" control={molarityForm.control} render={({ field }) => <Input {...field} id="solutionVolumeL" type="number" step="any" min="0.000001" placeholder="Enter volume (L)" className={cn(errors.solutionVolumeL ? 'border-destructive' : '')}/>} />
                 {errors.solutionVolumeL && <p className="text-xs text-destructive">{errors.solutionVolumeL.message}</p>}
              </div>
            </div>
          )}

          {/* Molality Form */}
          {calcType === 'molality' && (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                 <Label htmlFor="soluteMolesMolality">Solute Moles (n)</Label>
                 <Controller name="soluteMoles" control={molalityForm.control} render={({ field }) => <Input {...field} id="soluteMolesMolality" type="number" step="any" min="0" placeholder="Enter moles" disabled={!!watchMolalityFields[1]} className={cn(molalityForm.formState.errors.soluteMoles ? 'border-destructive' : '')} />} />
                  {/* Display refinement error */}
                  {molalityForm.formState.errors.soluteMoles?.type === 'custom' && <p className="text-xs text-destructive">{molalityForm.formState.errors.soluteMoles.message}</p>}
               </div>
                <div className="space-y-1">
                 <Label htmlFor="soluteMassMolality">Solute Mass (m)</Label>
                 <Controller name="soluteMass" control={molalityForm.control} render={({ field }) => <Input {...field} id="soluteMassMolality" type="number" step="any" min="0" placeholder="Enter mass (g)" disabled={!!watchMolalityFields[0]} className={cn(molalityForm.formState.errors.soluteMass ? 'border-destructive' : '')} />} />
               </div>
                 <div className="space-y-1">
                 <Label htmlFor="formulaMolality">Formula (if using mass)</Label>
                 <Controller name="formula" control={molalityForm.control} render={({ field }) => <Input {...field} id="formulaMolality" placeholder="e.g., NaCl" disabled={!!watchMolalityFields[0]} className={cn(molalityForm.formState.errors.formula ? 'border-destructive' : '')}/>} />
                  {molalityForm.formState.errors.formula && <p className="text-xs text-destructive">{molalityForm.formState.errors.formula.message}</p>}
               </div>
                <div className="space-y-1">
                 <Label htmlFor="solventMassKg">Solvent Mass</Label>
                 <Controller name="solventMassKg" control={molalityForm.control} render={({ field }) => <Input {...field} id="solventMassKg" type="number" step="any" min="0.000001" placeholder="Enter mass (kg)" className={cn(molalityForm.formState.errors.solventMassKg ? 'border-destructive' : '')}/>} />
                  {molalityForm.formState.errors.solventMassKg && <p className="text-xs text-destructive">{molalityForm.formState.errors.solventMassKg.message}</p>}
               </div>
             </div>
          )}

          {/* Dilution Form */}
          {calcType === 'dilution' && (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['m1', 'v1', 'm2', 'v2'] as const).map(field => (
                 <div key={field} className="space-y-1">
                   <Label htmlFor={field}>{field.toUpperCase()} ({field.startsWith('m') ? 'Molarity' : 'Volume'})</Label>
                   <Controller
                     name={field}
                     control={dilutionForm.control}
                     render={({ field: controllerField }) => (
                       <Input {...controllerField} id={field} type="number" step="any" min="0.000001" placeholder={`Enter ${field.toUpperCase()}`} className={cn(dilutionForm.formState.errors[field] || dilutionForm.formState.errors.m1?.type === 'custom' ? 'border-destructive' : '')} />
                     )}
                   />
                    {/* Individual field errors */}
                     {dilutionForm.formState.errors[field] && <p className="text-xs text-destructive">{dilutionForm.formState.errors[field]?.message}</p>}
                 </div>
               ))}
                 {/* Refinement error */}
                 {dilutionForm.formState.errors.m1?.type === 'custom' && <p className="text-xs text-destructive col-span-1 sm:col-span-2">{dilutionForm.formState.errors.m1.message}</p>}
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
             <Beaker className="h-4 w-4 text-primary" />
             <AlertTitle className="text-primary">Calculation Result</AlertTitle>
             <AlertDescription>
                <p className="mt-2 text-sm font-semibold">
                    {result}
                </p>
                {calcType === 'dilution' && <p className="text-xs text-muted-foreground mt-1"> Ensure M and V units were consistent in the input.</p>}
             </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
};
