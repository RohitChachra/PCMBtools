
'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calculator } from 'lucide-react'; // Use a general calculator icon

// Placeholder components for each calculator category
const MoleConceptCalculator = () => <div className="p-4 border rounded bg-muted text-muted-foreground">Mole Concept Calculator - Coming Soon!</div>;
const ThermochemistryCalculator = () => <div className="p-4 border rounded bg-muted text-muted-foreground">Thermochemistry Calculator - Coming Soon!</div>;
const GasLawsCalculator = () => <div className="p-4 border rounded bg-muted text-muted-foreground">Gas Laws Calculator - Coming Soon!</div>;
const ConcentrationCalculator = () => <div className="p-4 border rounded bg-muted text-muted-foreground">Concentration Calculator - Coming Soon!</div>;
const StoichiometryCalculator = () => <div className="p-4 border rounded bg-muted text-muted-foreground">Stoichiometry Calculator - Coming Soon!</div>;
const PhPohCalculator = () => <div className="p-4 border rounded bg-muted text-muted-foreground">pH & pOH Calculator - Coming Soon!</div>;
const EmpiricalMolecularFormulaCalculator = () => <div className="p-4 border rounded bg-muted text-muted-foreground">Empirical & Molecular Formula Calculator - Coming Soon!</div>;
const ElectrochemistryCalculator = () => <div className="p-4 border rounded bg-muted text-muted-foreground">Electrochemistry Calculator - Coming Soon!</div>;
const ChemicalKineticsCalculator = () => <div className="p-4 border rounded bg-muted text-muted-foreground">Chemical Kinetics Calculator - Coming Soon!</div>;
const EquilibriumConstantCalculator = () => <div className="p-4 border rounded bg-muted text-muted-foreground">Equilibrium Constant Calculator - Coming Soon!</div>;


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
    description: 'Convert between moles, mass, particles, and volume (at STP).',
    component: MoleConceptCalculator,
    icon: Calculator,
  },
  {
    id: 'thermochemistry',
    title: 'Thermochemistry',
    description: 'Calculate heat transfer (q=mcΔT), enthalpy changes, and reaction heat.',
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
    description: 'Calculate Molarity, Molality, Normality, and dilutions (M1V1=M2V2).',
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
    description: "Calculate pH, pOH, [H+], and [OH-].",
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
    description: 'Calculations using the Nernst equation and standard cell potentials.',
    component: ElectrochemistryCalculator,
    icon: Calculator,
  },
  {
    id: 'kinetics',
    title: 'Chemical Kinetics',
    description: 'Calculate reaction rates using rate laws and integrated rate laws (e.g., first-order).',
    component: ChemicalKineticsCalculator,
    icon: Calculator,
  },
   {
    id: 'equilibrium',
    title: 'Equilibrium Constant',
    description: 'Calculate Kc or Kp using equilibrium concentrations or partial pressures.',
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
