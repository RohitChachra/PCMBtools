
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectGroup } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft, Thermometer, Scale, Ruler, Clock, Gauge, Zap, Atom, Waves } from 'lucide-react'; // Add relevant icons

// --- Unit Conversion Definitions ---

type UnitCategory = 'Length' | 'Mass' | 'Time' | 'Speed' | 'Force' | 'Energy' | 'Power' | 'Pressure' | 'Temperature' | 'Angle';

interface UnitDefinition {
  label: string; // e.g., 'Meters (m)'
  value: string; // e.g., 'm'
  factor: number; // Conversion factor relative to the base unit
  offset?: number; // Optional offset (for temperature)
}

const conversionFactors: Record<UnitCategory, { baseUnit: string; units: UnitDefinition[]; icon: React.ElementType }> = {
  Length: {
    baseUnit: 'm',
    icon: Ruler,
    units: [
      { label: 'Meters (m)', value: 'm', factor: 1 },
      { label: 'Kilometers (km)', value: 'km', factor: 1000 },
      { label: 'Centimeters (cm)', value: 'cm', factor: 0.01 },
      { label: 'Millimeters (mm)', value: 'mm', factor: 0.001 },
      { label: 'Feet (ft)', value: 'ft', factor: 0.3048 },
      { label: 'Inches (in)', value: 'in', factor: 0.0254 },
      { label: 'Miles (mi)', value: 'mi', factor: 1609.34 },
    ],
  },
  Mass: {
    baseUnit: 'kg',
    icon: Scale,
    units: [
      { label: 'Kilograms (kg)', value: 'kg', factor: 1 },
      { label: 'Grams (g)', value: 'g', factor: 0.001 },
      { label: 'Milligrams (mg)', value: 'mg', factor: 1e-6 },
      { label: 'Pounds (lb)', value: 'lb', factor: 0.453592 },
      { label: 'Ounces (oz)', value: 'oz', factor: 0.0283495 },
    ],
  },
  Time: {
    baseUnit: 's',
    icon: Clock,
    units: [
      { label: 'Seconds (s)', value: 's', factor: 1 },
      { label: 'Milliseconds (ms)', value: 'ms', factor: 0.001 },
      { label: 'Minutes (min)', value: 'min', factor: 60 },
      { label: 'Hours (hr)', value: 'hr', factor: 3600 },
      { label: 'Days (day)', value: 'day', factor: 86400 },
    ],
  },
  Speed: {
    baseUnit: 'm/s',
    icon: Gauge,
    units: [
      { label: 'Meters per second (m/s)', value: 'm/s', factor: 1 },
      { label: 'Kilometers per hour (km/h)', value: 'km/h', factor: 1 / 3.6 },
      { label: 'Miles per hour (mph)', value: 'mph', factor: 0.44704 },
      { label: 'Feet per second (ft/s)', value: 'ft/s', factor: 0.3048 },
    ],
  },
  Force: {
    baseUnit: 'N',
    icon: Atom, // Using Atom icon for force
    units: [
      { label: 'Newtons (N)', value: 'N', factor: 1 },
      { label: 'Kilogram-force (kgf)', value: 'kgf', factor: 9.80665 },
      { label: 'Pound-force (lbf)', value: 'lbf', factor: 4.44822 },
      { label: 'Dynes (dyn)', value: 'dyn', factor: 1e-5 },
    ],
  },
  Energy: {
    baseUnit: 'J',
    icon: Zap, // Using Zap icon for energy/work
    units: [
      { label: 'Joules (J)', value: 'J', factor: 1 },
      { label: 'Kilojoules (kJ)', value: 'kJ', factor: 1000 },
      { label: 'Calories (cal)', value: 'cal', factor: 4.184 },
      { label: 'Kilocalories (kcal)', value: 'kcal', factor: 4184 },
      { label: 'Electronvolts (eV)', value: 'eV', factor: 1.60218e-19 },
      { label: 'British Thermal Units (BTU)', value: 'BTU', factor: 1055.06 },
    ],
  },
   Power: {
    baseUnit: 'W',
    icon: Zap, // Sharing Zap icon with Energy
    units: [
      { label: 'Watts (W)', value: 'W', factor: 1 },
      { label: 'Kilowatts (kW)', value: 'kW', factor: 1000 },
      { label: 'Horsepower (hp)', value: 'hp', factor: 745.7 },
      { label: 'Foot-pounds per second (ft⋅lb/s)', value: 'ft-lb/s', factor: 1.35582 },
    ],
  },
  Pressure: {
    baseUnit: 'Pa',
    icon: Gauge, // Sharing Gauge icon
    units: [
      { label: 'Pascals (Pa)', value: 'Pa', factor: 1 },
      { label: 'Kilopascals (kPa)', value: 'kPa', factor: 1000 },
      { label: 'Atmospheres (atm)', value: 'atm', factor: 101325 },
      { label: 'Bars (bar)', value: 'bar', factor: 100000 },
      { label: 'Pounds per square inch (psi)', value: 'psi', factor: 6894.76 },
      { label: 'Millimeters of mercury (mmHg)', value: 'mmHg', factor: 133.322 },
    ],
  },
  Temperature: {
    baseUnit: 'K', // Kelvin is the base for calculation, though UI might show C/F more prominently
    icon: Thermometer,
    units: [
      { label: 'Celsius (°C)', value: 'C', factor: 1, offset: 273.15 }, // Factor applied when converting TO Kelvin
      { label: 'Fahrenheit (°F)', value: 'F', factor: 5 / 9, offset: 273.15 - (32 * 5 / 9) }, // Factor applied when converting TO Kelvin
      { label: 'Kelvin (K)', value: 'K', factor: 1, offset: 0 },
    ],
  },
    Angle: {
    baseUnit: 'rad',
    icon: Ruler, // Reusing Ruler, could find a better icon
    units: [
      { label: 'Radians (rad)', value: 'rad', factor: 1 },
      { label: 'Degrees (°)', value: 'deg', factor: Math.PI / 180 },
      { label: 'Revolutions (rev)', value: 'rev', factor: 2 * Math.PI },
    ],
  },
};

// --- Conversion Logic ---

function convertUnits(value: number, fromUnitValue: string, toUnitValue: string, category: UnitCategory): number | string {
  if (isNaN(value)) {
    return 'Invalid input';
  }

  const categoryData = conversionFactors[category];
  const fromUnit = categoryData.units.find(u => u.value === fromUnitValue);
  const toUnit = categoryData.units.find(u => u.value === toUnitValue);

  if (!fromUnit || !toUnit) {
    return 'Invalid units selected';
  }

  // Special handling for Temperature
  if (category === 'Temperature') {
    let valueInKelvin: number;

    // Convert fromUnit to Kelvin
    switch (fromUnit.value) {
      case 'C':
        valueInKelvin = value + 273.15;
        break;
      case 'F':
        valueInKelvin = (value - 32) * 5 / 9 + 273.15;
        break;
      case 'K':
        valueInKelvin = value;
        break;
      default:
        return 'Invalid from unit';
    }

     // Check if Kelvin value is physically valid (>= 0)
     if (valueInKelvin < 0) {
        return 'Invalid temperature (below absolute zero)';
     }


    // Convert Kelvin to toUnit
    let result: number;
    switch (toUnit.value) {
      case 'C':
        result = valueInKelvin - 273.15;
        break;
      case 'F':
        result = (valueInKelvin - 273.15) * 9 / 5 + 32;
        break;
      case 'K':
        result = valueInKelvin;
        break;
      default:
        return 'Invalid to unit';
    }
    return result;
  }

  // Standard conversion for other units
  const valueInBaseUnit = value * fromUnit.factor;
  const result = valueInBaseUnit / toUnit.factor;

  return result;
}

// --- Component ---

interface ConverterState {
  inputValue: string;
  fromUnit: string;
  toUnit: string;
  result: string | number | null;
}

export default function UnitConverterPage() {
  const [converters, setConverters] = useState<Record<UnitCategory, ConverterState>>(() => {
    const initialState = {} as Record<UnitCategory, ConverterState>;
    for (const category in conversionFactors) {
        const cat = category as UnitCategory;
        const units = conversionFactors[cat].units;
        initialState[cat] = {
            inputValue: '',
            fromUnit: units[0]?.value || '', // Default to first unit
            toUnit: units[1]?.value || units[0]?.value || '', // Default to second or first unit
            result: null,
        };
    }
    return initialState;
  });

  const handleInputChange = useCallback((category: UnitCategory, value: string) => {
    setConverters(prev => ({
      ...prev,
      [category]: { ...prev[category], inputValue: value, result: null }, // Clear result on input change
    }));
  }, []);

  const handleUnitChange = useCallback((category: UnitCategory, type: 'from' | 'to', value: string) => {
    setConverters(prev => ({
      ...prev,
      [category]: { ...prev[category], [type === 'from' ? 'fromUnit' : 'toUnit']: value, result: null }, // Clear result on unit change
    }));
  }, []);

  const handleConvert = useCallback((category: UnitCategory) => {
    const { inputValue, fromUnit, toUnit } = converters[category];
    const value = parseFloat(inputValue);

    if (inputValue.trim() === '') {
        setConverters(prev => ({ ...prev, [category]: { ...prev[category], result: 'Enter a value' } }));
        return;
    }
    if (isNaN(value)) {
      setConverters(prev => ({ ...prev, [category]: { ...prev[category], result: 'Invalid input' } }));
      return;
    }
    if (!fromUnit || !toUnit) {
       setConverters(prev => ({ ...prev, [category]: { ...prev[category], result: 'Select units' } }));
       return;
    }


    const conversionResult = convertUnits(value, fromUnit, toUnit, category);
    const displayResult = typeof conversionResult === 'number' ? parseFloat(conversionResult.toFixed(6)) : conversionResult; // Format number

    setConverters(prev => ({
      ...prev,
      [category]: { ...prev[category], result: displayResult },
    }));
  }, [converters]);

  const categories = useMemo(() => Object.keys(conversionFactors) as UnitCategory[], []);

  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-bold text-center">Physics Unit Converter</h1>
      <p className="text-muted-foreground text-center max-w-2xl mx-auto">
        Convert between common units used in physics calculations. Select a category, enter a value, choose units, and click convert.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => {
          const categoryData = conversionFactors[category];
          const state = converters[category];
          const CategoryIcon = categoryData.icon;

          return (
            <Card key={category} className="shadow-lg rounded-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                    <CategoryIcon className="h-5 w-5" />
                    {category}
                </CardTitle>
                 <CardDescription>Convert units of {category.toLowerCase()}.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`${category}-value`}>Value</Label>
                  <Input
                    id={`${category}-value`}
                    type="number"
                    step="any"
                    value={state.inputValue}
                    onChange={(e) => handleInputChange(category, e.target.value)}
                    placeholder={`Enter value in ${state.fromUnit}`}
                  />
                </div>

                <div className="grid grid-cols-3 items-end gap-2">
                  <div className="space-y-1 col-span-1">
                    <Label htmlFor={`${category}-from`}>From</Label>
                    <Select
                      value={state.fromUnit}
                      onValueChange={(value) => handleUnitChange(category, 'from', value)}
                    >
                      <SelectTrigger id={`${category}-from`}>
                        <SelectValue placeholder="From Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                            {categoryData.units.map(unit => (
                                <SelectItem key={unit.value} value={unit.value}>
                                    {unit.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                   <div className="col-span-1 flex justify-center pb-2">
                      <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                   </div>


                  <div className="space-y-1 col-span-1">
                    <Label htmlFor={`${category}-to`}>To</Label>
                    <Select
                       value={state.toUnit}
                       onValueChange={(value) => handleUnitChange(category, 'to', value)}
                    >
                      <SelectTrigger id={`${category}-to`}>
                        <SelectValue placeholder="To Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                           {categoryData.units.map(unit => (
                                <SelectItem key={unit.value} value={unit.value}>
                                    {unit.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                    onClick={() => handleConvert(category)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Convert
                </Button>

                {state.result !== null && (
                  <div className="pt-4 text-center">
                    <p className="text-muted-foreground">Result:</p>
                    <p className="text-xl font-semibold text-primary break-words">
                       {typeof state.result === 'number' ? `${state.inputValue || 0} ${state.fromUnit} = ` : ''}
                       <span className="font-bold">{state.result}</span>
                       {typeof state.result === 'number' ? ` ${state.toUnit}` : ''}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
