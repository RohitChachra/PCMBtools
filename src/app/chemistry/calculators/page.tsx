
'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calculator } from 'lucide-react'; // Use a general calculator icon

// Import the actual calculator components
import { MoleConceptCalculator } from '@/components/chemistry/calculators/MoleConceptCalculator';
import { ThermochemistryCalculator } from '@/components/chemistry/calculators/ThermochemistryCalculator';
import { GasLawsCalculator } from '@/components/chemistry/calculators/GasLawsCalculator';
import { ConcentrationCalculator } from '@/components/chemistry/calculators/ConcentrationCalculator';
import { StoichiometryCalculator } from '@/components/chemistry/calculators/StoichiometryCalculator';
import { PhPohCalculator } from '@/components/chemistry/calculators/PhPohCalculator';
import { EmpiricalMolecularFormulaCalculator } from '@/components/chemistry/calculators/EmpiricalMolecularFormulaCalculator';
import { ElectrochemistryCalculator } from '@/components/chemistry/calculators/ElectrochemistryCalculator';
import { ChemicalKineticsCalculator } from '@/components/chemistry/calculators/ChemicalKineticsCalculator';
import { EquilibriumConstantCalculator } from '@/components/chemistry/calculators/EquilibriumConstantCalculator';

interface CalculatorCategory {
  id: string;
  title: string;
  description: string;
  component: React.FC;
  icon?: React.ElementType;
}

const calculatorCategories: CalculatorCategory[] = [
  {
    id: 'mole_concept',
    title: 'Mole Concept',
    description: 'Convert between moles, mass, particles, and volume (at STP). Enter formula and one quantity.',
    component: MoleConceptCalculator,
    icon: Calculator,
  },
  {
    id: 'thermochemistry',
    title: 'Thermochemistry',
    description: 'Calculate heat transfer (q=mcΔT).', // Removed: Enthalpy changes coming soon.
    component: ThermochemistryCalculator,
    icon: Calculator,
  },
  {
    id: 'gas_laws',
    title: 'Gas Laws',
    description: 'Calculations using Boyle\'s, Charles\', Gay-Lussac\'s, Combined, and Ideal Gas Laws.',
    component: GasLawsCalculator,
    icon: Calculator,
  },
   {
    id: 'concentration',
    title: 'Concentration',
    description: 'Calculate Molarity, Molality, and dilutions (M1V1=M2V2).', // Removed: Normality coming soon.
    component: ConcentrationCalculator,
    icon: Calculator,
  },
   {
    id: 'stoichiometry',
    title: 'Stoichiometry',
    description: 'Calculate reactant/product amounts based on balanced chemical equations.',
    component: StoichiometryCalculator,
    icon: Calculator,
  },
    {
    id: 'ph_poh',
    title: 'pH and pOH',
    description: "Calculate pH, pOH, [H+], and [OH-]. Assumes standard conditions (25°C).", // Updated description slightly
    component: PhPohCalculator,
    icon: Calculator,
  },
   {
    id: 'empirical_molecular',
    title: 'Empirical & Molecular Formula',
    description: 'Determine formulas from percentage composition or mass data.',
    component: EmpiricalMolecularFormulaCalculator,
    icon: Calculator,
  },
    {
    id: 'electrochemistry',
    title: 'Electrochemistry',
    description: 'Calculate cell potential using the Nernst equation (simplified Q).', // Adjusted description slightly
    component: ElectrochemistryCalculator,
    icon: Calculator,
  },
  {
    id: 'kinetics',
    title: 'Chemical Kinetics',
    description: 'Calculate using the first-order integrated rate law or the general rate law.',
    component: ChemicalKineticsCalculator,
    icon: Calculator,
  },
   {
    id: 'equilibrium',
    title: 'Equilibrium Constant (Kc)',
    description: 'Calculate Kc from equilibrium concentrations. Assumes simple A + B <=> C + D structure.', // Updated description
    component: EquilibriumConstantCalculator,
    icon: Calculator,
  },
];

export default function ChemistryCalculatorHubPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Chemistry Calculator Hub</h1>
      <p className="text-muted-foreground">
        A collection of calculators for various chemistry concepts. Select a topic to begin.
      </p>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {calculatorCategories.map((category) => (
          <AccordionItem value={category.id} key={category.id} className="border rounded-lg bg-card shadow-sm">
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                 {category.icon && <category.icon className="h-5 w-5 text-primary" />}
                 {category.title}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-0">
              <p className="text-muted-foreground mb-6">{category.description}</p>
              <category.component />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
