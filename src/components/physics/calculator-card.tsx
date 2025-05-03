
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
  allowNegative?: boolean; // Add flag to allow negative inputs explicitly
}

interface CalculatorCardProps {
  title: string;
  description: string;
  inputFields: InputField[];
  formula: string; // e.g., "v = u + at" or "η = (W / Q<sub>H</sub>) * 100"
  calculate: (inputs: Record<string, number>) => number | string | null; // Can return null for errors
  resultLabel: string;
  resultUnit: string;
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

      // Check for negative values where inappropriate (e.g., time, mass)
      // Allow negative values only if explicitly permitted by the field config
      const isNegativeRestricted = ['t', 'm', 'm1', 'm2', 'M'].includes(field.name) || field.label.toLowerCase().includes('time') || field.label.toLowerCase().includes('mass') || field.label.toLowerCase().includes('length') || field.label.toLowerCase().includes('distance') || field.label.toLowerCase().includes('radius');
      if (isNegativeRestricted && !field.allowNegative && numValue < 0) {
          setError(`Invalid input for ${field.label}. Value cannot be negative.`);
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
      if (calculationResult === null || (typeof calculationResult === 'number' && isNaN(calculationResult))) {
          setError("Calculation resulted in an invalid value (e.g., division by zero or inconsistent inputs). Please check your inputs.");
      } else if (typeof calculationResult === 'number') {
          // Check if result represents time or mass and is negative
          const resultIsNegativeRestricted = resultLabel.toLowerCase().includes('time') || resultLabel.toLowerCase().includes('mass');
          if (resultIsNegativeRestricted && calculationResult < 0) {
              setError(`Calculation resulted in a negative ${resultLabel.toLowerCase()}, which is invalid.`);
          } else {
            setResult(calculationResult.toFixed(4));
          }
      } else {
           setResult(calculationResult); // Allow string results (e.g., for efficiency or specific messages)
      }
    } catch (err: any) {
      console.error('Calculation error:', err);
      setError(err.message || 'An unexpected error occurred during calculation.');
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
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
              <Label htmlFor={field.name} className="text-sm sm:text-right">
                {field.label}
              </Label>
              <div className="col-span-1 sm:col-span-2 flex items-center gap-2">
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    step="any" // Allow decimals
                    value={inputValues[field.name]}
                    onChange={handleInputChange}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    required
                    min={!field.allowNegative && (['t', 'm', 'm1', 'm2', 'M'].includes(field.name) || field.label.toLowerCase().includes('time') || field.label.toLowerCase().includes('mass')) ? "0" : undefined} // Set min="0" for non-negative fields
                    className="flex-grow"
                  />
                   <span className="text-sm text-muted-foreground whitespace-nowrap">{field.unit}</span>
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
                <AlertTitle>{resultLabel}</AlertTitle>
                <AlertDescription className="font-semibold text-lg">
                    {result} {resultUnit}
                 </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
