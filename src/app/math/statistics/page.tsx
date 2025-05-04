
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

// Type for chart data points
interface DiscreteChartPoint {
    value: number;
    frequency: number;
}

interface ContinuousChartPoint {
    midpoint: number;
    frequency: number;
    interval: string; // Keep interval for tooltip
}

// Chart configs (using different colors)
const chartConfigDiscreteLine: ChartConfig = {
  frequency: { label: 'Frequency', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

const chartConfigDiscreteBar: ChartConfig = {
  frequency: { label: 'Frequency', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig;

const chartConfigContinuousLine: ChartConfig = {
  frequency: { label: 'Frequency', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

const chartConfigContinuousBar: ChartConfig = {
  frequency: { label: 'Frequency', color: 'hsl(var(--chart-4))' }, // New color for continuous histogram
} satisfies ChartConfig;


export default function StatisticsPage() {
  const [inputType, setInputType] = useState<InputType>('discrete');
  const [discreteDataInput, setDiscreteDataInput] = useState<string>('');
  const [continuousData, setContinuousData] = useState<ContinuousDataRow[]>([
    { id: 1, lower: '', upper: '', frequency: '' },
  ]);
  const [discreteResults, setDiscreteResults] = useState<DiscreteResults | null>(null);
  const [continuousResults, setContinuousResults] = useState<ContinuousResults | null>(null);
  const [discreteChartData, setDiscreteChartData] = useState<DiscreteChartPoint[]>([]);
  const [continuousChartData, setContinuousChartData] = useState<ContinuousChartPoint[]>([]); // For Frequency Polygon
  const [continuousHistogramData, setContinuousHistogramData] = useState<ContinuousChartPoint[]>([]); // For Histogram
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputTypeChange = (value: string) => {
    setInputType(value as InputType);
    setError(null);
    setDiscreteResults(null);
    setContinuousResults(null);
    setDiscreteChartData([]);
    setContinuousChartData([]);
    setContinuousHistogramData([]); // Clear histogram data too
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
        // Format mode nicely: if single value, show it; if multiple, join with comma; if no mode (e.g., [1, 2, 3]), say 'None'
        mode: Array.isArray(calculatedMode) ? (calculatedMode.length > 0 ? calculatedMode.map(m => m.toFixed(4)).join(', ') : 'None') : calculatedMode.toFixed(4),
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
     setContinuousChartData([]);
     setContinuousHistogramData([]);
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
    setContinuousHistogramData([]); // Clear histogram data

    let totalFrequency = 0;
    let sumFx = 0; // Sum of (frequency * midpoint)
    let sumFx2 = 0; // Sum of (frequency * midpoint^2)
    let cumulativeFreq = 0;
    const cumulativeFrequencyTable: { interval: string; cf: number }[] = [];
    const midpoints: number[] = [];
    const frequencies: number[] = [];
    const intervals: string[] = [];
    const chartDataForPolygon: ContinuousChartPoint[] = []; // For the line chart
    const chartDataForHistogram: ContinuousChartPoint[] = []; // For the bar chart

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

        const chartPoint = { midpoint, frequency: freq, interval: intervalLabel };
        chartDataForPolygon.push(chartPoint);
        chartDataForHistogram.push(chartPoint); // Use same point for histogram, XAxis will use interval
    }

    if (totalFrequency === 0) {
        setError('Invalid input: Total frequency cannot be zero.');
        return;
    }

    // Sort chart data by midpoint for the line chart
    chartDataForPolygon.sort((a, b) => a.midpoint - b.midpoint);
    // Histogram data sorting is less critical as bars are discrete, but sorting by interval makes sense
    chartDataForHistogram.sort((a, b) => {
        const aLower = parseFloat(a.interval.split(' - ')[0]);
        const bLower = parseFloat(b.interval.split(' - ')[0]);
        return aLower - bLower;
    });


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
            if (fm === 0) { // Avoid division by zero if median class frequency is 0
                groupedMedian = "Median cannot be determined (frequency is zero in median class).";
            } else {
                groupedMedian = L + ((medianPosition - cfBeforeMedianClass) / fm) * C;
                groupedMedian = groupedMedian.toFixed(4); // Format
            }
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

        if (maxFreq === 0) { // If all frequencies are 0
            groupedMode = "Mode cannot be determined (all frequencies are zero).";
        } else if (modeCounts === 1 || frequencies.length === 1) { // Handle single mode or single class
             const modalClass = continuousData[modalClassIndex];
             const L = parseFloat(modalClass.lower);
             const fm = frequencies[modalClassIndex]; // Frequency of modal class
             const f1 = modalClassIndex > 0 ? frequencies[modalClassIndex - 1] : 0; // Freq before
             const f2 = modalClassIndex < frequencies.length - 1 ? frequencies[modalClassIndex + 1] : 0; // Freq after
             const C = parseFloat(modalClass.upper) - L; // Class width

             const denominator = (fm - f1) + (fm - f2);

             if (denominator === 0) { // Avoid division by zero
                  // Could happen if fm=f1=f2 or if fm=f1 and it's the last class, etc.
                  // A simpler approach might be to just report the modal class interval
                  groupedMode = `Modal class: ${L}-${L+C}`; // Report modal class interval instead
             } else {
                 groupedMode = L + ((fm - f1) / denominator) * C;
                 groupedMode = groupedMode.toFixed(4); // Format
             }
         } else {
             // If multiple classes have the same max frequency, it's multimodal or uniform
             groupedMode = "Multimodal or Uniform";
         }


        // Standard Deviation and Variance
        // Ensure totalFrequency > 1 for sample variance/stddev
        let varianceVal: number | string = 'N/A';
        let stdDevVal: number | string = 'N/A';
        if (totalFrequency > 1) {
            const calculatedVar = (sumFx2 - (sumFx * sumFx) / totalFrequency) / (totalFrequency - 1); // Sample variance
             if (calculatedVar < 0 && Math.abs(calculatedVar) < 1e-9) {
                 // Handle tiny negative values due to floating point errors
                 varianceVal = 0;
                 stdDevVal = 0;
             } else if (calculatedVar < 0) {
                 varianceVal = "Invalid (Negative Variance)";
                 stdDevVal = "Invalid";
             } else {
                varianceVal = calculatedVar.toFixed(4);
                stdDevVal = Math.sqrt(calculatedVar).toFixed(4);
             }
        } else if (totalFrequency === 1) {
             varianceVal = '0.0000'; // Variance/StdDev is 0 for a single data point/group
             stdDevVal = '0.0000';
        }


        setContinuousResults({
            groupedMean: groupedMean.toFixed(4),
            groupedMedian: groupedMedian,
            groupedMode: groupedMode,
            stdDev: stdDevVal,
            variance: varianceVal,
            cumulativeFrequency: cumulativeFrequencyTable,
            totalFrequency: totalFrequency
        });

        setContinuousChartData(chartDataForPolygon); // Set data for frequency polygon
        setContinuousHistogramData(chartDataForHistogram); // Set data for histogram

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
                        <TableCell className="text-right" /> {/* Empty cell for alignment */}
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
             {/* Use divs for vertical stacking on mobile */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                 <div className="sm:col-span-1">
                     <p className="font-medium">Count (n)</p>
                     <p>{discreteResults.count}</p>
                 </div>
                 <div className="sm:col-span-1">
                     <p className="font-medium">Mean</p>
                     <p>{discreteResults.mean}</p>
                 </div>
                 <div className="sm:col-span-1">
                     <p className="font-medium">Median</p>
                     <p>{discreteResults.median}</p>
                 </div>
                 <div className="sm:col-span-1">
                     <p className="font-medium">Mode(s)</p>
                     <p>{discreteResults.mode}</p>
                 </div>
                 <div className="sm:col-span-1">
                     <p className="font-medium">Range</p>
                     <p>{discreteResults.range}</p>
                 </div>
                 <div className="sm:col-span-1">
                     <p className="font-medium">Minimum</p>
                     <p>{discreteResults.min}</p>
                 </div>
                 <div className="sm:col-span-1">
                     <p className="font-medium">Maximum</p>
                     <p>{discreteResults.max}</p>
                 </div>
                 <div className="sm:col-span-1">
                     <p className="font-medium">Variance (Sample)</p>
                     <p>{discreteResults.variance}</p>
                 </div>
                 <div className="sm:col-span-2"> {/* Span full width on small screens if needed */}
                     <p className="font-medium">Standard Deviation (Sample)</p>
                     <p>{discreteResults.stdDev}</p>
                 </div>
             </div>


             {/* Discrete Charts (Line Chart Only) */}
             {discreteChartData.length > 0 && (
                 <div className="mt-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Frequency Distribution (Line)</h3>
                        <ChartContainer config={chartConfigDiscreteLine} className="h-[300px] w-full">
                           <LineChart data={discreteChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                {/* Ensure XAxis treats values as numbers for proper sorting */}
                                <XAxis dataKey="value" type="number" name="Value" domain={['dataMin', 'dataMax']} />
                                <YAxis allowDecimals={false} name="Frequency"/>
                                 {/* Custom Tooltip to show Value and Frequency */}
                                 <RechartsTooltip content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                          <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col">
                                              <span className="text-[0.70rem] uppercase text-muted-foreground">Value</span>
                                              <span className="font-bold text-muted-foreground">{label}</span>
                                            </div>
                                            <div className="flex flex-col">
                                              <span className="text-[0.70rem] uppercase text-muted-foreground">Frequency</span>
                                              <span className="font-bold">{payload[0].value}</span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}/>
                                <Legend />
                                <Line type="monotone" dataKey="frequency" stroke="var(--color-frequency)" strokeWidth={2} dot={true} name="Frequency"/>
                            </LineChart>
                         </ChartContainer>
                     </div>
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
             {/* Statistics Table - Vertical stack on mobile */}
             <div>
                 <h3 className="text-lg font-semibold mb-2">Summary Statistics</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                     <div className="sm:col-span-1">
                         <p className="font-medium">Total Frequency (N)</p>
                         <p>{continuousResults.totalFrequency}</p>
                     </div>
                     <div className="sm:col-span-1">
                         <p className="font-medium">Grouped Mean</p>
                         <p>{continuousResults.groupedMean}</p>
                     </div>
                     <div className="sm:col-span-1">
                         <p className="font-medium">Grouped Median</p>
                         <p>{continuousResults.groupedMedian}</p>
                     </div>
                     <div className="sm:col-span-1">
                         <p className="font-medium">Grouped Mode</p>
                         <p>{continuousResults.groupedMode}</p>
                     </div>
                     <div className="sm:col-span-1">
                         <p className="font-medium">Variance (Sample)</p>
                         <p>{continuousResults.variance}</p>
                     </div>
                     <div className="sm:col-span-1">
                         <p className="font-medium">Standard Deviation (Sample)</p>
                         <p>{continuousResults.stdDev}</p>
                     </div>
                 </div>
             </div>


             {/* Cumulative Frequency Table */}
             <div>
                 <h3 className="text-lg font-semibold mb-2">Cumulative Frequency</h3>
                 {/* Table remains as is, might truncate on very small screens */}
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

              {/* Continuous Charts (Frequency Polygon & Histogram) */}
             {(continuousChartData.length > 0 || continuousHistogramData.length > 0) && (
                 <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Frequency Polygon */}
                    {continuousChartData.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Frequency Polygon</h3>
                          <ChartContainer config={chartConfigContinuousLine} className="h-[300px] w-full">
                            <LineChart data={continuousChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="midpoint" type="number" name="Class Midpoint" domain={['dataMin', 'dataMax']} />
                                <YAxis dataKey="frequency" allowDecimals={false} name="Frequency"/>
                                <RechartsTooltip content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      const pointData = payload[0].payload as ContinuousChartPoint;
                                      return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                          <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col">
                                              <span className="text-[0.70rem] uppercase text-muted-foreground">Interval</span>
                                              <span className="font-bold text-muted-foreground">{pointData.interval}</span>
                                            </div>
                                            <div className="flex flex-col">
                                              <span className="text-[0.70rem] uppercase text-muted-foreground">Midpoint</span>
                                              <span className="font-bold text-muted-foreground">{label}</span>
                                            </div>
                                            <div className="flex flex-col col-span-2">
                                              <span className="text-[0.70rem] uppercase text-muted-foreground">Frequency</span>
                                              <span className="font-bold">{payload[0].value}</span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }} />
                                <Legend />
                                <Line type="monotone" dataKey="frequency" stroke="var(--color-frequency)" strokeWidth={2} dot={true} name="Frequency" />
                            </LineChart>
                          </ChartContainer>
                        </div>
                    )}

                    {/* Histogram */}
                    {continuousHistogramData.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Histogram</h3>
                          <ChartContainer config={chartConfigContinuousBar} className="h-[300px] w-full">
                            {/* Using interval as the category for XAxis */}
                            <BarChart data={continuousHistogramData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barGap={0} /* Set barGap to 0 for histogram */>
                                <CartesianGrid strokeDasharray="3 3" />
                                {/* XAxis displays the interval labels */}
                                <XAxis dataKey="interval" name="Class Interval" angle={-45} textAnchor="end" height={50} interval={0} /* Show all labels */ />
                                <YAxis dataKey="frequency" allowDecimals={false} name="Frequency"/>
                                <RechartsTooltip content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      // Label here is the interval
                                      const pointData = payload[0].payload as ContinuousChartPoint;
                                      return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                          <div className="grid grid-cols-1 gap-1"> {/* Simplified tooltip */}
                                            <div className="flex flex-col">
                                              <span className="text-[0.70rem] uppercase text-muted-foreground">Interval</span>
                                              <span className="font-bold text-muted-foreground">{label}</span>
                                            </div>
                                             <div className="flex flex-col">
                                              <span className="text-[0.70rem] uppercase text-muted-foreground">Midpoint</span>
                                              <span className="font-bold text-muted-foreground">{pointData.midpoint}</span>
                                            </div>
                                            <div className="flex flex-col">
                                              <span className="text-[0.70rem] uppercase text-muted-foreground">Frequency</span>
                                              <span className="font-bold">{payload[0].value}</span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }} />
                                <Legend />
                                {/* Use interval for the bar's key if needed, but dataKey is frequency */}
                                <Bar dataKey="frequency" fill="var(--color-frequency)" name="Frequency" />
                            </BarChart>
                          </ChartContainer>
                        </div>
                    )}
                </div>
             )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
