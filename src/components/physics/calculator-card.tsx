
import React, { useState, type ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface InputField {
  name: string;
  label: string;
  unit: string;
  defaultValue?: string;
  allowNegative?: boolean; // Flag to allow negative inputs explicitly
}

interface CalculatorCardProps {
  title: string; // Can contain basic HTML like <sub>
  description: string;
  inputFields: InputField[];
  formula: string; // Can contain basic HTML like <sub>
  calculate: (inputs: Record<string, number>) => number | string | null; // Can return string for specific error messages, null for general errors
  resultLabel: string; // Can contain basic HTML like <sub>
  resultUnit: string; // Can contain basic HTML like <sub>
  children?: ReactNode; // For optional additional content or explanations
}

export function CalculatorCard({
  title,
  description,
  inputFields,
  formula,
  calculate,
  resultLabel,
  resultUnit,
  children,
}: CalculatorCardProps) {
  const initialInputValues = inputFields.reduce((acc, field) => {
    acc[field.name] = field.defaultValue ?? '';
    return acc;
  }, {} as Record<string, string>);

  const [inputValues, setInputValues] = useState<Record<string, string>>(initialInputValues);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues((prev) => ({ ...prev, [name]: value }));
    setResult(null); // Clear result when input changes
    setError(null); // Clear error when input changes
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const numericInputs: Record<string, number> = {};
    let validationError = false;

    for (const field of inputFields) {
      const value = inputValues[field.name];
      if (value === '') {
          setError(`Missing input for ${field.label}. Please enter a value.`);
          validationError = true;
          break;
      }
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        setError(`Invalid input for ${field.label}. Please enter a valid number.`);
        validationError = true;
        break;
      }

      // Check for negative inputs where inappropriate (unless explicitly allowed)
      const isNegativeRestricted = !field.allowNegative && (
          field.label.toLowerCase().includes('time') ||
          field.label.toLowerCase().includes('mass') ||
          field.label.toLowerCase().includes('length') ||
          field.label.toLowerCase().includes('distance') ||
          field.label.toLowerCase().includes('radius') ||
          field.label.toLowerCase().includes('frequency') ||
          field.label.toLowerCase().includes('wavelength') ||
          field.label.toLowerCase() === 'absolute temperature (t)' ||
          field.label.toLowerCase().includes('heat input (q<sub>') || // Check for Q_H
          field.label.toLowerCase().includes('volume') || // Volume should be positive
          field.label.toLowerCase().includes('area') || // Area should be positive
          field.label.toLowerCase().includes('density') || // Density usually positive
          field.label.toLowerCase().includes('resistance') // Resistance usually positive
      );

      if (isNegativeRestricted && numValue <= 0) { // Changed to <= 0 for volume, area etc.
          setError(`Invalid input for ${field.label}. Value must be positive.`);
          validationError = true;
          break;
      }

      numericInputs[field.name] = numValue;
    }

    if (validationError) {
      return;
    }

    try {
      const calculationResult = calculate(numericInputs);

      if (typeof calculationResult === 'string') {
          // If calculate function returns a specific string error message
          setError(calculationResult);
      } else if (calculationResult === null || (typeof calculationResult === 'number' && isNaN(calculationResult))) {
          // Handle general calculation errors (null or NaN)
          setError("Calculation resulted in an invalid value (e.g., division by zero or inconsistent inputs). Please check your inputs.");
      } else if (typeof calculationResult === 'number') {
          // Check if result represents a value that shouldn't be negative (like time or mass)
          const resultIsNegativeRestricted =
              resultLabel.toLowerCase().includes('time') ||
              resultLabel.toLowerCase().includes('mass') ||
              resultLabel.toLowerCase().includes('length') ||
              resultLabel.toLowerCase().includes('distance') ||
              resultLabel.toLowerCase().includes('radius') ||
              resultLabel.toLowerCase().includes('frequency') ||
              resultLabel.toLowerCase().includes('wavelength') ||
              resultLabel.toLowerCase().includes('resistance') ||
              resultLabel.toLowerCase().includes('density') ||
              resultLabel.toLowerCase().includes('pressure') && calculationResult < 0 && Math.abs(calculationResult) > 1e-9 || // Pressure is often positive
              resultLabel.toLowerCase().includes('speed'); // Speed is magnitude, non-negative

          // Allow negative Potential Energy and Work
          const allowNegativeResult =
                resultLabel.toLowerCase().includes('potential energy') ||
                resultLabel.toLowerCase().includes('work done');


          if (resultIsNegativeRestricted && !allowNegativeResult && calculationResult < 0 && Math.abs(calculationResult) > 1e-9) {
              setError(`Calculation resulted in a negative ${resultLabel.replace(/<[^>]*>/g, '').toLowerCase()}, which is physically invalid in this context.`);
          } else {
              setResult(calculationResult.toFixed(4));
          }
      } else {
           // Should not happen based on type definition, but good fallback
           setError('An unexpected result type was received from the calculation.');
      }
    } catch (err: any) {
      console.error('Calculation error:', err);
      setError(err.message || 'An unexpected error occurred during calculation.');
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        {/* Use dangerouslySetInnerHTML for CardTitle */}
        <CardTitle className="text-lg" dangerouslySetInnerHTML={{ __html: title }} />
        <CardDescription>{description}</CardDescription>
         {/* Use dangerouslySetInnerHTML to render HTML in the formula */}
         <p className="text-sm text-muted-foreground pt-1">
            Formula: <code
                className="bg-muted px-1 py-0.5 rounded"
                dangerouslySetInnerHTML={{ __html: formula }}
             />
         </p>
      </CardHeader>
      <form onSubmit={handleCalculate}>
        <CardContent className="space-y-4">
          {inputFields.map((field) => (
            <div key={field.name} className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 sm:gap-4">
              {/* Use dangerouslySetInnerHTML for Label */}
              <Label htmlFor={field.name} className="text-sm sm:text-right" dangerouslySetInnerHTML={{ __html: field.label }} />
              <div className="col-span-1 sm:col-span-2 flex items-center gap-2">
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    step="any" // Allow decimals
                    value={inputValues[field.name]}
                    onChange={handleInputChange}
                    placeholder={`Enter ${field.label.replace(/<[^>]*>/g, '').toLowerCase()}`} // Strip HTML for placeholder
                    required
                    // Set min="0" or slightly above zero for restricted fields
                    min={!field.allowNegative && (
                        field.label.toLowerCase().includes('time') ||
                        field.label.toLowerCase().includes('mass') ||
                        field.label.toLowerCase().includes('length') ||
                        field.label.toLowerCase().includes('distance') ||
                        field.label.toLowerCase().includes('radius') ||
                        field.label.toLowerCase().includes('frequency') ||
                        field.label.toLowerCase().includes('wavelength') ||
                        field.label.toLowerCase() === 'absolute temperature (t)' ||
                        field.label.toLowerCase().includes('heat input (q<sub>') ||
                        field.label.toLowerCase().includes('volume') ||
                        field.label.toLowerCase().includes('area') ||
                        field.label.toLowerCase().includes('density') ||
                        field.label.toLowerCase().includes('resistance')
                     ) ? "0" : undefined}
                    className="flex-grow"
                  />
                   {/* Use dangerouslySetInnerHTML for unit */}
                   <span className="text-sm text-muted-foreground whitespace-nowrap" dangerouslySetInnerHTML={{ __html: field.unit }} />
              </div>
            </div>
          ))}
          {children}
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
           <Button type="submit" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
             Calculate
           </Button>

          {error && (
             <Alert variant="destructive" className="w-full">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result !== null && !error && ( // Only show result if there is no error
            <Alert className="w-full bg-secondary">
                <Terminal className="h-4 w-4" />
                {/* Use dangerouslySetInnerHTML for AlertTitle */}
                <AlertTitle dangerouslySetInnerHTML={{ __html: resultLabel }} />
                <AlertDescription className="font-semibold text-lg">
                    {result} <span dangerouslySetInnerHTML={{ __html: resultUnit }}/>
                 </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}

