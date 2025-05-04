
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter as UiTableFooter, // Renamed to avoid conflict
  TableCaption,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { mean, median, mode, std, variance, max, min } from 'mathjs'; // Removed 'range', added 'max', 'min'
import { Calculator, BarChart3, LineChartIcon, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type InputType = 'discrete' | 'continuous';

interface ContinuousDataRow {
  id: number;
  lower: string;
  upper: string;
  frequency: string;
}

interface DiscreteResults {
  mean: number | string;
  median: number | string;
  mode: number[] | string;
  range: number | string;
  stdDev: number | string;
  variance: number | string;
  count: number;
  max: number | string;
  min: number | string;
}

interface ContinuousResults {
  groupedMean: number | string;
  groupedMedian: number | string;
  groupedMode: number | string;
  stdDev: number | string;
  variance: number | string;
  cumulativeFrequency: { interval: string; cf: number }[];
  totalFrequency: number;
}

const chartConfigDiscrete: ChartConfig = {
    frequency: {
      label: 'Frequency',
      color: 'hsl(var(--chart-1))',
    },
} satisfies ChartConfig;

const chartConfigContinuous: ChartConfig = {
    frequency: {
      label: 'Frequency',
      color: 'hsl(var(--chart-2))',
    },
} satisfies ChartConfig;


export default function StatisticsPage() {
  const [inputType, setInputType] = useState<InputType>('discrete');
  const [discreteDataInput, setDiscreteDataInput] = useState<string>('');
  const [continuousData, setContinuousData] = useState<ContinuousDataRow[]>([
    { id: 1, lower: '', upper: '', frequency: '' },
  ]);
  const [discreteResults, setDiscreteResults] = useState<DiscreteResults | null>(null);
  const [continuousResults, setContinuousResults] = useState<ContinuousResults | null>(null);
  const [discreteChartData, setDiscreteChartData] = useState<any[]>([]);
  const [continuousChartData, setContinuousChartData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputTypeChange = (value: string) => {
    setInputType(value as InputType);
    setError(null);
    setDiscreteResults(null);
    setContinuousResults(null);
    setDiscreteChartData([]);
    setContinuousChartData([]);
    // Optionally clear inputs when switching type
    // setDiscreteDataInput('');
    // setContinuousData([{ id: 1, lower: '', upper: '', frequency: '' }]);
  };

  // --- Discrete Data Logic ---
  const calculateDiscreteStats = useCallback(() => {
    setError(null);
    setDiscreteResults(null);
    setDiscreteChartData([]);

    const values = discreteDataInput
      .split(/[\s,]+/) // Split by spaces or commas
      .map(val => val.trim())
      .filter(val => val !== '')
      .map(Number);

    if (values.some(isNaN)) {
      setError('Invalid input: Please enter only numbers separated by spaces or commas.');
      return;
    }

    if (values.length === 0) {
      setError('Invalid input: Please enter at least one number.');
      return;
    }

    try {
      const sortedValues = [...values].sort((a, b) => a - b);
      const calculatedMean = mean(values);
      const calculatedMedian = median(values);
      const calculatedMode = mode(values); // Can return multiple modes
      const calculatedMax = max(values);
      const calculatedMin = min(values);
      // Correctly calculate statistical range (max - min)
      const calculatedRange = calculatedMax - calculatedMin;
      const calculatedStdDev = std(values, 'unbiased'); // Sample standard deviation
      const calculatedVariance = variance(values, 'unbiased'); // Sample variance


      setDiscreteResults({
        mean: calculatedMean.toFixed(4),
        median: calculatedMedian.toFixed(4),
        mode: Array.isArray(calculatedMode) ? calculatedMode.map(m => m.toFixed(4)).join(', ') : calculatedMode.toFixed(4), // Format mode nicely
        range: calculatedRange.toFixed(4),
        stdDev: calculatedStdDev.toFixed(4),
        variance: calculatedVariance.toFixed(4),
        count: values.length,
        max: calculatedMax.toFixed(4),
        min: calculatedMin.toFixed(4),
      });

      // Prepare chart data (frequency distribution)
      const frequencyMap: { [key: number]: number } = {};
      values.forEach(val => {
        frequencyMap[val] = (frequencyMap[val] || 0) + 1;
      });
      const chartData = Object.entries(frequencyMap)
        .map(([value, frequency]) => ({ value: Number(value), frequency }))
        .sort((a, b) => a.value - b.value); // Sort by value for the line chart
      setDiscreteChartData(chartData);

       toast({ title: "Calculation Success", description: "Discrete statistics calculated." });

    } catch (err: any) {
      console.error('Discrete calculation error:', err);
      setError(`Calculation failed: ${err.message || 'Unknown error'}`);
       toast({ title: "Calculation Error", description: `Calculation failed: ${err.message || 'Unknown error'}`, variant: "destructive" });
    }
  }, [discreteDataInput, toast]);

  // --- Continuous Data Logic ---
  const handleContinuousDataChange = (id: number, field: keyof Omit<ContinuousDataRow, 'id'>, value: string) => {
    setContinuousData(prev =>
      prev.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
     setContinuousResults(null); // Clear results on change
     setError(null);
  };

  const addContinuousRow = () => {
    setContinuousData(prev => [...prev, { id: Date.now(), lower: '', upper: '', frequency: '' }]);
  };

  const removeContinuousRow = (id: number) => {
    setContinuousData(prev => prev.filter(row => row.id !== id));
  };

  const calculateContinuousStats = useCallback(() => {
    setError(null);
    setContinuousResults(null);
    setContinuousChartData([]);

    let totalFrequency = 0;
    let sumFx = 0; // Sum of (frequency * midpoint)
    let sumFx2 = 0; // Sum of (frequency * midpoint^2)
    let cumulativeFreq = 0;
    const cumulativeFrequencyTable: { interval: string; cf: number }[] = [];
    const midpoints: number[] = [];
    const frequencies: number[] = [];
    const intervals: string[] = [];

    let previousUpper = -Infinity; // To check for gaps/overlap

    for (const row of continuousData) {
        const lower = parseFloat(row.lower);
        const upper = parseFloat(row.upper);
        const freq = parseInt(row.frequency, 10);

        if (isNaN(lower) || isNaN(upper) || isNaN(freq)) {
            setError('Invalid input: All fields in the table must be valid numbers.');
            return;
        }
        if (lower >= upper) {
            setError(`Invalid interval: Lower bound (${lower}) must be less than upper bound (${upper}) in row ${row.id}.`);
            return;
        }
        if (freq < 0) {
             setError(`Invalid input: Frequency cannot be negative in row ${row.id}.`);
             return;
        }
         if (lower !== previousUpper && previousUpper !== -Infinity) {
             // Allow slight floating point inaccuracies, but not large gaps/overlaps
            if (Math.abs(lower - previousUpper) > 1e-9) {
                 setError(`Invalid interval structure: Gap or overlap detected between interval ending at ${previousUpper} and interval starting at ${lower}. Intervals must be contiguous.`);
                 return;
            }
         }

         previousUpper = upper; // Update for next iteration's check


        const midpoint = (lower + upper) / 2;
        const intervalLabel = `${lower} - ${upper}`;
        intervals.push(intervalLabel);
        midpoints.push(midpoint);
        frequencies.push(freq);

        totalFrequency += freq;
        sumFx += freq * midpoint;
        sumFx2 += freq * midpoint * midpoint;

        cumulativeFreq += freq;
        cumulativeFrequencyTable.push({ interval: intervalLabel, cf: cumulativeFreq });
    }

    if (totalFrequency === 0) {
        setError('Invalid input: Total frequency cannot be zero.');
        return;
    }

    try {
        const groupedMean = sumFx / totalFrequency;

        // Median Calculation
        const medianPosition = totalFrequency / 2;
        let medianClassIndex = -1;
        let cfBeforeMedianClass = 0;
        for (let i = 0; i < cumulativeFrequencyTable.length; i++) {
            if (cumulativeFrequencyTable[i].cf >= medianPosition) {
                medianClassIndex = i;
                cfBeforeMedianClass = i > 0 ? cumulativeFrequencyTable[i - 1].cf : 0;
                break;
            }
        }

        let groupedMedian: number | string = 'N/A';
        if (medianClassIndex !== -1) {
            const medianClass = continuousData[medianClassIndex];
            const L = parseFloat(medianClass.lower);
            const fm = parseInt(medianClass.frequency, 10);
            const C = parseFloat(medianClass.upper) - L; // Class width
            groupedMedian = L + ((medianPosition - cfBeforeMedianClass) / fm) * C;
             groupedMedian = groupedMedian.toFixed(4); // Format
        }

        // Mode Calculation (using modal class)
        let modalClassIndex = 0;
        let maxFreq = 0;
        for (let i = 0; i < frequencies.length; i++) {
            if (frequencies[i] > maxFreq) {
                maxFreq = frequencies[i];
                modalClassIndex = i;
            }
        }
         // Check for multiple modes or uniform distribution (simplistic check)
        const modeCounts = frequencies.filter(f => f === maxFreq).length;
        let groupedMode: number | string = 'N/A';

        if (modeCounts === 1 || frequencies.length === 1) { // Handle single mode or single class
             const modalClass = continuousData[modalClassIndex];
             const L = parseFloat(modalClass.lower);
             const fm = frequencies[modalClassIndex];
             const f1 = modalClassIndex > 0 ? frequencies[modalClassIndex - 1] : 0; // Freq before
             const f2 = modalClassIndex < frequencies.length - 1 ? frequencies[modalClassIndex + 1] : 0; // Freq after
             const C = parseFloat(modalClass.upper) - L; // Class width

             if (fm + (fm - f1) + (fm - f2) === 0) { // Avoid division by zero if denominator is zero
                  groupedMode = "Mode cannot be determined (division by zero likely)";
             } else {
                  // Check if modal class is first or last, simplifying the formula slightly
                  if (modalClassIndex === 0) {
                    // If first class is modal, technically f1 is 0
                    groupedMode = L + ((fm - 0) / ((fm - 0) + (fm - f2))) * C;
                  } else if (modalClassIndex === frequencies.length - 1) {
                     // If last class is modal, technically f2 is 0
                     groupedMode = L + ((fm - f1) / ((fm - f1) + (fm - 0))) * C;
                  } else {
                      groupedMode = L + ((fm - f1) / ((fm - f1) + (fm - f2))) * C;
                  }
                 groupedMode = groupedMode.toFixed(4); // Format
             }
         } else {
             groupedMode = "Multimodal or Uniform (formula requires single peak)";
         }


        // Standard Deviation and Variance
        const varianceVal = (sumFx2 - (sumFx * sumFx) / totalFrequency) / (totalFrequency - 1); // Sample variance
        const stdDevVal = Math.sqrt(varianceVal);

        setContinuousResults({
            groupedMean: groupedMean.toFixed(4),
            groupedMedian: groupedMedian,
            groupedMode: groupedMode,
            stdDev: stdDevVal.toFixed(4),
            variance: varianceVal.toFixed(4),
            cumulativeFrequency: cumulativeFrequencyTable,
            totalFrequency: totalFrequency
        });

        // Prepare chart data for histogram
        const chartData = continuousData.map((row, index) => ({
            interval: `${row.lower}-${row.upper}`,
            frequency: parseInt(row.frequency, 10) || 0,
        }));
        setContinuousChartData(chartData);

        toast({ title: "Calculation Success", description: "Continuous statistics calculated." });

    } catch (err: any) {
        console.error('Continuous calculation error:', err);
        setError(`Calculation failed: ${err.message || 'Unknown error'}`);
         toast({ title: "Calculation Error", description: `Calculation failed: ${err.message || 'Unknown error'}`, variant: "destructive" });
    }
  }, [continuousData, toast]);


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Statistics Calculator</h1>
      <p className="text-muted-foreground">
        Calculate descriptive statistics for discrete or continuous data.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Input Data Type</CardTitle>
          <CardDescription>Choose the type of data you want to analyze.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleInputTypeChange} value={inputType}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Select data type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="discrete">Discrete Data (List of numbers)</SelectItem>
                <SelectItem value="continuous">Continuous Data (Grouped/Frequency Table)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Discrete Data Input */}
      {inputType === 'discrete' && (
        <Card>
          <CardHeader>
            <CardTitle>Discrete Data Input</CardTitle>
            <CardDescription>Enter numbers separated by spaces or commas (e.g., 5 7 9 10 10 12).</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={discreteDataInput}
              onChange={(e) => setDiscreteDataInput(e.target.value)}
              placeholder="Enter numbers here..."
              rows={4}
              className="mb-4"
            />
            <Button onClick={calculateDiscreteStats}>Calculate Discrete Stats</Button>
          </CardContent>
        </Card>
      )}

      {/* Continuous Data Input */}
      {inputType === 'continuous' && (
        <Card>
          <CardHeader>
            <CardTitle>Continuous Data Input</CardTitle>
            <CardDescription>Enter class intervals and their frequencies. Intervals should be contiguous (e.g., 0-10, 10-20).</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
               <TableCaption>Add or remove rows as needed. Ensure intervals don't overlap or have gaps.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Lower Bound</TableHead>
                  <TableHead>Upper Bound</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {continuousData.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Input
                        type="number"
                        step="any"
                        value={row.lower}
                        onChange={(e) => handleContinuousDataChange(row.id, 'lower', e.target.value)}
                        placeholder="e.g., 0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="any"
                        value={row.upper}
                        onChange={(e) => handleContinuousDataChange(row.id, 'upper', e.target.value)}
                        placeholder="e.g., 10"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0" // Frequency cannot be negative
                        step="1"
                        value={row.frequency}
                        onChange={(e) => handleContinuousDataChange(row.id, 'frequency', e.target.value)}
                        placeholder="e.g., 5"
                      />
                    </TableCell>
                     <TableCell className="text-right">
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => removeContinuousRow(row.id)}
                         disabled={continuousData.length <= 1} // Don't allow removing the last row
                       >
                         <Trash2 className="h-4 w-4 text-destructive" />
                         <span className="sr-only">Remove Row</span>
                       </Button>
                     </TableCell>
                  </TableRow>
                ))}
              </TableBody>
               <UiTableFooter>
                    <TableRow>
                        <TableCell colSpan={3}>
                            <Button variant="outline" size="sm" onClick={addContinuousRow} className="mt-2">
                              <Plus className="h-4 w-4 mr-1" /> Add Row
                            </Button>
                        </TableCell>
                         <TableCell className="text-right"></TableCell> {/* Empty cell for alignment */}
                    </TableRow>
                </UiTableFooter>
            </Table>
            <Button onClick={calculateContinuousStats} className="mt-4">Calculate Continuous Stats</Button>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <Calculator className="h-4 w-4" />
          <AlertTitle>Input/Calculation Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Discrete Results */}
      {discreteResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LineChartIcon className="h-5 w-5 text-primary" />Discrete Data Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Count (n)</TableCell>
                  <TableCell>{discreteResults.count}</TableCell>
                  <TableCell className="font-medium">Mean</TableCell>
                  <TableCell>{discreteResults.mean}</TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell className="font-medium">Median</TableCell>
                  <TableCell>{discreteResults.median}</TableCell>
                  <TableCell className="font-medium">Mode(s)</TableCell>
                  <TableCell>{discreteResults.mode}</TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell className="font-medium">Range</TableCell>
                  <TableCell>{discreteResults.range}</TableCell>
                   <TableCell className="font-medium">Minimum</TableCell>
                  <TableCell>{discreteResults.min}</TableCell>
                </TableRow>
                 <TableRow>
                   <TableCell className="font-medium">Maximum</TableCell>
                  <TableCell>{discreteResults.max}</TableCell>
                  <TableCell className="font-medium">Variance (Sample)</TableCell>
                  <TableCell>{discreteResults.variance}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Standard Deviation (Sample)</TableCell>
                  <TableCell colSpan={3}>{discreteResults.stdDev}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

             {/* Discrete Chart */}
             {discreteChartData.length > 0 && (
                 <div className="mt-6">
                 <h3 className="text-lg font-semibold mb-2">Frequency Distribution</h3>
                  <ChartContainer config={chartConfigDiscrete} className="h-[300px] w-full">
                     <LineChart data={discreteChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="value" name="Value" />
                          <YAxis allowDecimals={false} name="Frequency"/>
                          <RechartsTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line type="monotone" dataKey="frequency" stroke="var(--color-frequency)" strokeWidth={2} dot={true} />
                      </LineChart>
                   </ChartContainer>
                </div>
             )}
          </CardContent>
        </Card>
      )}

      {/* Continuous Results */}
      {continuousResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Continuous Data Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             {/* Statistics Table */}
            <div>
                <h3 className="text-lg font-semibold mb-2">Summary Statistics</h3>
                <Table>
                  <TableBody>
                     <TableRow>
                       <TableCell className="font-medium">Total Frequency (N)</TableCell>
                       <TableCell>{continuousResults.totalFrequency}</TableCell>
                      <TableCell className="font-medium">Grouped Mean</TableCell>
                      <TableCell>{continuousResults.groupedMean}</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell className="font-medium">Grouped Median</TableCell>
                      <TableCell>{continuousResults.groupedMedian}</TableCell>
                      <TableCell className="font-medium">Grouped Mode</TableCell>
                       <TableCell>{continuousResults.groupedMode}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Variance (Sample)</TableCell>
                      <TableCell>{continuousResults.variance}</TableCell>
                       <TableCell className="font-medium">Standard Deviation (Sample)</TableCell>
                       <TableCell>{continuousResults.stdDev}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
            </div>

             {/* Cumulative Frequency Table */}
             <div>
                 <h3 className="text-lg font-semibold mb-2">Cumulative Frequency</h3>
                 <Table>
                     <TableHeader>
                         <TableRow>
                             <TableHead>Class Interval</TableHead>
                             <TableHead className="text-right">Cumulative Frequency</TableHead>
                         </TableRow>
                     </TableHeader>
                     <TableBody>
                         {continuousResults.cumulativeFrequency.map((item, index) => (
                             <TableRow key={index}>
                                 <TableCell>{item.interval}</TableCell>
                                 <TableCell className="text-right">{item.cf}</TableCell>
                             </TableRow>
                         ))}
                     </TableBody>
                 </Table>
             </div>

             {/* Continuous Chart (Histogram) */}
             {continuousChartData.length > 0 && (
                 <div className="mt-6">
                 <h3 className="text-lg font-semibold mb-2">Histogram</h3>
                  <ChartContainer config={chartConfigContinuous} className="h-[300px] w-full">
                    <BarChart data={continuousChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis dataKey="interval" name="Class Interval"/>
                         <YAxis allowDecimals={false} name="Frequency"/>
                         <RechartsTooltip content={<ChartTooltipContent indicator="line" />} />
                         <Legend />
                         <Bar dataKey="frequency" fill="var(--color-frequency)" radius={4} />
                     </BarChart>
                   </ChartContainer>
                </div>
             )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
